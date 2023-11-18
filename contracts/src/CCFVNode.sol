// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {AutomationCompatible} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.0/token/ERC20/IERC20.sol";
import {Packer} from "./Packer.sol";
import {Strings} from "./Strings.sol";
import {Errors} from "./Errors.sol";

contract CCFVNode is OwnerIsCreator, FunctionsClient, AutomationCompatible {
    using FunctionsRequest for FunctionsRequest.Request;

    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;
    uint64 public subscriptionId;

    //Callback gas limit
    uint32 gasLimit = 300000;
    bytes32 donID;

    // Event to log responses
    event Response(
        bytes32 indexed requestId,
        string character,
        bytes response,
        bytes err
    );

    // Event emitted when a message is sent to another chain.
    event MessageSent(
        bytes32 indexed messageId, // The unique ID of the CCIP message.
        uint64 indexed destinationChainSelector, // The chain selector of the destination chain.
        address receiver, // The address of the receiver on the destination chain.
        address token, // The token address that was transferred.
        uint256 tokenAmount, // The token amount that was transferred.
        address feeToken, // the token address used to pay CCIP fees.
        uint256 fees // The fees paid for sending the message.
    );

    // Mapping to keep track of allowlisted destination chains.
    mapping(uint64 => bool) public allowlistedDestinationChains;

    IERC20 private s_linkToken;
    IERC20 public fundingToken;
    IRouterClient router;
    address public routerAddress;
    address public masterAddress;
    string public masterAddressString;
    uint64 public destinationChain;
    uint256 public totalDonation;
    uint256 public fundsWaiting;
    uint256 public votesWaiting;
    uint256 public minFundsToBridge;

    uint256 public lastBridge;
    uint256 public bridgeInterval = 1 minutes; // recommended 1 week/month on mainnet

    uint256 public lastCursorUpdate;
    uint256 public cursorUpdateInterval = 1 minutes; // recommended 1 days on mainnet
    uint256 public proposalCursorLeft; //active proposalid
    uint256 public proposalCursorRight; //inactive proposalid
    mapping(uint256 proposalId => uint256 voteCount) public proposalTotalVotes;
    uint256[] public proposalIdsWithWaitingVotes;
    mapping(uint256 proposalId => uint256 voteCount)
        public proposalVotesWaiting;

    mapping(address user => uint256 voteCount) public userVotePower;
    mapping(address user => mapping(uint256 proposalId => bool))
        public userVoted;

    constructor(
        address _router,
        address _link,
        address _token,
        address _masterAddress,
        address _functionsRouter,
        bytes32 _functionsDonID,
        uint64 _subscriptionId,
        uint256 _minFundsToBridge
    ) FunctionsClient(_functionsRouter) {
        s_linkToken = IERC20(_link);
        fundingToken = IERC20(_token);
        router = IRouterClient(_router);
        masterAddress = _masterAddress;
        masterAddressString = Strings.toHexString(_masterAddress);
        donID = _functionsDonID;
        subscriptionId = _subscriptionId;
        minFundsToBridge = _minFundsToBridge;

        //ETHEREUM SEPOLIA
        destinationChain = 16015286601757825753;
    }

    //USER FUNCTIONS

    function provideFund(uint256 amount) external {
        fundingToken.transferFrom(msg.sender, address(this), amount);
        userVotePower[msg.sender] += amount;
        fundsWaiting += amount;
        totalDonation += amount;
    }

    function voteForProposal(uint256 _proposalId) external {
        if (userVoted[msg.sender][_proposalId]) revert Errors.AlreadyVoted();
        if (userVotePower[msg.sender] == 0) revert Errors.NoVotePower();
        if (_proposalId < proposalCursorLeft) revert Errors.ProposalIsClosed();
        if (_proposalId >= proposalCursorRight)
            revert Errors.NoProposalOnThisId();

        proposalTotalVotes[_proposalId] += userVotePower[msg.sender];
        if (proposalVotesWaiting[_proposalId] == 0)
            proposalIdsWithWaitingVotes.push(_proposalId);
        proposalVotesWaiting[_proposalId] += userVotePower[msg.sender];
        votesWaiting += userVotePower[msg.sender];
        userVoted[msg.sender][_proposalId] = true;
    }

    function getStats(
        address user
    )
        external
        view
        returns (
            uint256 lifetimeFunds,
            uint256 userFunds,
            uint256 fundsToBridge,
            uint256 votesToBridge,
            uint256 proposalNonce,
            bool canUpdateProposalNonce,
            uint256[] memory proposalsWaitingUpdate
        )
    {
        lifetimeFunds = totalDonation;
        userFunds = userVotePower[user];
        fundsToBridge = fundsWaiting;
        votesToBridge = votesWaiting;
        proposalNonce = proposalCursorRight;
        canUpdateProposalNonce =
            block.timestamp >= lastCursorUpdate + cursorUpdateInterval;
        proposalsWaitingUpdate = proposalsWaitingUpdate;
    }

    //AUTOMATION FUNCTIONS

    function checkUpkeep(
        bytes calldata /* checkData */
    ) external view override returns (bool upkeepNeeded, bytes memory) {
        upkeepNeeded =
            (block.timestamp >= lastBridge + bridgeInterval) &&
            (proposalIdsWithWaitingVotes.length > 0 ||
                fundsWaiting >= minFundsToBridge);
    }

    function performUpkeep(bytes calldata) external override {
        bridgeFundsAndVotes();
    }

    //CCIP FUNCTIONS TO PACK AND BRIDGE

    function bridgeFundsAndVotes() public returns (bytes32 messageId) {
        if (
            proposalIdsWithWaitingVotes.length == 0 &&
            fundsWaiting < minFundsToBridge
        ) revert Errors.NoVotesOrNotEnoughFundsToBridge();

        if (block.timestamp < lastBridge + bridgeInterval)
            revert Errors.BridgeRecentlyRan();

        uint256 _amount = fundsWaiting;
        fundsWaiting = 0;
        votesWaiting = 0;

        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            _amount
        );

        // Get the fee to send the CCIP message
        uint256 fees = router.getFee(destinationChain, evm2AnyMessage);

        if (fees > s_linkToken.balanceOf(address(this))) {
            convertTokenToLink(fees);
            revert Errors.NotEnoughBalance(
                s_linkToken.balanceOf(address(this)),
                fees
            );
        }

        // approve the Router to transfer LINK tokens on contract's behalf. It will spend the fees in LINK
        s_linkToken.approve(address(router), fees);

        // approve the Router to spend tokens on contract's behalf. It will spend the amount of the given token
        fundingToken.approve(address(router), _amount);

        // Send the message through the router and store the returned message ID
        messageId = router.ccipSend(destinationChain, evm2AnyMessage);

        //Reset waiting vote data
        for (uint i = 0; i < proposalIdsWithWaitingVotes.length; i++) {
            uint256 _propId = proposalIdsWithWaitingVotes[i];
            delete proposalVotesWaiting[_propId];
        }
        delete proposalIdsWithWaitingVotes;

        // Emit an event with message details
        emit MessageSent(
            messageId,
            destinationChain,
            masterAddress,
            address(fundingToken),
            _amount,
            address(s_linkToken),
            fees
        );

        // Return the message ID
        return messageId;
    }

    //to be implemented on mainnet using uniswap router
    //whenever the contract cant cover CCIP fees, contract swaps partial funding token to LINK
    function convertTokenToLink(uint256 fees) internal {}

    function _packVotes() internal view returns (bytes memory encoded) {
        uint256 numProposals = proposalIdsWithWaitingVotes.length;

        encoded = new bytes(4 + numProposals * (4 + 16)); // 4 bytes for uint32 and 16 bytes for uint128

        bytes memory proposalCount = abi.encodePacked(uint32(numProposals));

        uint offset = 0;
        for (uint j = 0; j < 4; j++) {
            encoded[offset++] = proposalCount[j];
        }

        for (uint i = 0; i < numProposals; i++) {
            uint256 _proposalId = proposalIdsWithWaitingVotes[i];
            bytes memory encodedProposalId = abi.encodePacked(
                uint32(_proposalId)
            );
            bytes memory encodedVoteCount = abi.encodePacked(
                uint128(proposalVotesWaiting[_proposalId])
            );

            for (uint j = 0; j < 4; j++) {
                encoded[offset++] = encodedProposalId[j];
            }

            for (uint j = 0; j < 16; j++) {
                encoded[offset++] = encodedVoteCount[j];
            }
        }
    }

    function _buildCCIPMessage(
        uint256 _amount
    ) internal view returns (Client.EVM2AnyMessage memory) {
        // Set the token amounts
        Client.EVMTokenAmount[]
            memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: address(fundingToken),
            amount: _amount
        });
        // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
        return
            Client.EVM2AnyMessage({
                receiver: abi.encode(masterAddress), // ABI-encoded receiver address
                data: _packVotes(),
                tokenAmounts: tokenAmounts, // The amount and type of token being transferred
                extraArgs: Client._argsToBytes(
                    // Additional arguments, setting gas limit and non-strict sequencing mode
                    Client.EVMExtraArgsV1({gasLimit: 2_000_000, strict: false})
                ),
                // Set the feeToken to a feeTokenAddress, indicating specific asset will be used for fees
                feeToken: address(s_linkToken)
            });
    }

    //CHAINLINK FUNCTIONS

    function updateProposalCursors() external returns (bytes32 requestId) {
        if (block.timestamp < lastCursorUpdate + cursorUpdateInterval)
            revert Errors.CursorsRecentlyUpdated();

        FunctionsRequest.Request memory req;

        string[] memory args = new string[](1);
        args[0] = masterAddressString;
        req.setArgs(args);

        string memory source = "const masterContract = args[0];"
        "const response = await Functions.makeHttpRequest({"
        "url: 'https://ethereum-sepolia.publicnode.com',"
        "method: 'POST',"
        "data: {"
        "id: 1,"
        "jsonrpc: '2.0',"
        "method: 'eth_call',"
        "params: ["
        "{"
        "to: `${masterContract}`,"
        "data: '0xd932f6b4'"
        "},"
        "'latest'"
        "]"
        "}"
        "});"
        "const val = parseInt(response.data.result, 16) ?? 0;"
        "return Functions.encodeUint256(val);";

        req.initializeRequestForInlineJavaScript(source); // Initialize the request with JS code

        // Send the request and store the request ID
        s_lastRequestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donID
        );

        lastCursorUpdate = block.timestamp;

        return s_lastRequestId;
    }

    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (s_lastRequestId != requestId) {
            revert Errors.UnexpectedRequestID(requestId); // Check if request IDs match
        }
        // Update the contract's state variables with the response and any errors
        s_lastResponse = response;
        s_lastError = err;
        uint256 packed = abi.decode(response, (uint256));

        (uint128 _cursorLeft, uint128 _cursorRight) = Packer.unpackCursors(
            packed
        );
        if (_cursorLeft > proposalCursorLeft) proposalCursorLeft = _cursorLeft;
        if (_cursorRight > proposalCursorRight)
            proposalCursorRight = _cursorRight;
    }
}
