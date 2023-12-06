// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {AutomationCompatible} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.0/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "./ReentrancyGuard.sol";
import {Packer} from "./Packer.sol";
import {Errors} from "./Errors.sol";

/// @title - A simple messenger contract for transferring/receiving tokens and data across chains.
contract CCFVMaster is CCIPReceiver, OwnerIsCreator, AutomationCompatible, ReentrancyGuard {
    // Event emitted when a message is received from another chain.
    event MessageReceived(
        bytes32 indexed messageId, // The unique ID of the CCIP message.
        uint64 indexed sourceChainSelector, // The chain selector of the source chain.
        address sender, // The address of the sender from the source chain.
        string text, // The text that was received.
        address token, // The token address that was transferred.
        uint256 tokenAmount // The token amount that was transferred.
    );

    event ProposalCreated(
        uint256 proposalId,
        address creator,
        address target,
        uint256 amount,
        string title,
        string description
    );

    event VotedFor(
        uint256 indexed proposalId,
        address indexed user,
        uint256 votePower
    );

    event ProvidedFund(address indexed user, uint256 amount);

    bytes32 private s_lastReceivedMessageId; // Store the last received messageId.
    address private s_lastReceivedTokenAddress; // Store the last received token address.
    uint256 private s_lastReceivedTokenAmount; // Store the last received amount.
    string private s_lastReceivedText; // Store the last received text.

    // Mapping to keep track of allowlisted source chains.
    mapping(uint64 => bool) public allowlistedSourceChains;

    // Mapping to keep track of allowlisted senders.
    mapping(address => bool) public allowlistedSenders;

    IERC20 public fundingToken;

    struct Proposal {
        uint256 id;
        address creator;
        address target;
        uint256 amount;
        uint256 votesApproved;
        uint32 startTimestamp;
        uint32 closeTimestamp;
        bool success;
        bool onQueue;
    }

    uint256 public proposalCursorLeft; //active proposalid
    uint256 public proposalCursorRight; //inactive proposalid
    uint256 public totalFund;
    uint256 public remainingFund;
    uint256 public proposalDuration = 1 days; //recommended 1 month on mainnet
    uint256 public queuePeriod = 1 days; //recommended 1 week on mainnet
    uint256 public requiredProposalPercentage = 70;
    int256 public proposalCreationPrice; //to be divided by 100

    mapping(uint256 proposalId => Proposal) public proposals;
    mapping(address user => uint256 voteCount) public userVotePower;
    mapping(address user => mapping(uint256 proposalId => bool))
        public userVoted;

    //chainlink price feeds
    AggregatorV3Interface internal priceFeed;

    constructor(
        address _router,
        address _token,
        address _feedLinkEth,
        int256 _proposalCreationPrice
    ) CCIPReceiver(_router) {
        fundingToken = IERC20(_token);

        //ALLOW FUJI - ARBITRIUM GOERLI -  MUMBAI - BNB TESTNET - OPTIMISM GOERLI - BASE GOERLI
        allowlistedSourceChains[14767482510784806043] = true;
        allowlistedSourceChains[6101244977088475029] = true;
        allowlistedSourceChains[12532609583862916517] = true;
        allowlistedSourceChains[13264668187771770619] = true;
        allowlistedSourceChains[2664363617261496610] = true;
        allowlistedSourceChains[5790810961207155433] = true;

        //LINK/ETH price feed
        priceFeed = AggregatorV3Interface(_feedLinkEth);
        proposalCreationPrice = _proposalCreationPrice;
    }

    /// @dev Modifier that checks if the chain with the given sourceChainSelector is allowlisted and if the sender is allowlisted.
    /// @param _sourceChainSelector The selector of the destination chain.
    /// @param _sender The address of the sender.
    modifier onlyAllowlisted(uint64 _sourceChainSelector, address _sender) {
        if (!allowlistedSourceChains[_sourceChainSelector])
            revert Errors.SourceChainNotAllowed(_sourceChainSelector);
        if (!allowlistedSenders[_sender])
            revert Errors.SenderNotAllowed(_sender);
        _;
    }

    // USER FUNCTIONS
    function getStats(
        address user
    )
        external
        view
        returns (uint256 lifetimeFunds, uint256 currentFunds, uint256 userFunds)
    {
        lifetimeFunds = totalFund;
        currentFunds = remainingFund;
        userFunds = userVotePower[user];
    }

    function getProposal(
        uint256 _proposalId
    ) external view returns (Proposal memory proposal, uint256 requiredVote) {
        proposal = proposals[_proposalId];
        requiredVote = (totalFund * requiredProposalPercentage) / 100;
    }

    function getProposals(
        uint256 offset,
        uint256 size
    ) external view returns (Proposal[] memory) {
        uint length = (proposalCursorRight < size || size == 0)
            ? proposalCursorRight
            : size;
        Proposal[] memory multiProposal = new Proposal[](length);

        for (uint256 i = 0; i < length; i++) {
            multiProposal[i] = proposals[proposalCursorRight - 1 - offset - i];
        }

        return (multiProposal);
    }

    function getProposalCost() external view returns (int256 cost) {
        (, int answer, , , ) = priceFeed.latestRoundData();
        cost = (answer * proposalCreationPrice) / 100;
    }

    function createProposal(
        address receiver,
        uint256 amount,
        string memory title,
        string memory description
    ) external payable {
        if (fundingToken.balanceOf(address(this)) < amount)
            revert Errors.NotEnoughBalanceForProposal();

        (, int answer, , , ) = priceFeed.latestRoundData();

        int256 cost = (answer * proposalCreationPrice) / 100;

        if (msg.value < uint256(cost))
            revert Errors.NotEnoughPayableToCoverCost();

        Proposal storage proposal = proposals[proposalCursorRight];

        proposal.id = proposalCursorRight;
        proposal.creator = msg.sender;
        proposal.target = receiver;
        proposal.amount = amount;
        proposal.startTimestamp = uint32(block.timestamp);
        proposal.closeTimestamp = uint32(block.timestamp + proposalDuration);

        proposalCursorRight++;

        emit ProposalCreated(
            proposal.id,
            msg.sender,
            receiver,
            amount,
            title,
            description
        );
    }

    function provideFund(uint256 amount) external {
        fundingToken.transferFrom(msg.sender, address(this), amount);
        userVotePower[msg.sender] += amount;
        totalFund += amount;
        remainingFund += amount;

        emit ProvidedFund(msg.sender, amount);
    }

    //update left cursor to a proposal that is closed + 1;
    function updateLeftCursor(uint256 _proposalId) public {
        if (_proposalId < proposalCursorLeft) revert Errors.ProposalIsClosed();
        if (_proposalId >= proposalCursorRight)
            revert Errors.NoProposalOnThisId();
        if (block.timestamp > proposals[_proposalId].closeTimestamp)
            revert Errors.ProposalIsOngoing();

        proposalCursorLeft = _proposalId + 1;
    }

    function getLeftCursorToUpdate()
        public
        view
        returns (bool update, uint256 cursor)
    {
        if (block.timestamp > proposals[proposalCursorLeft].closeTimestamp) {
            update = false;
        } else {
            update = true;
            cursor = proposalCursorLeft + 1;
            while (
                block.timestamp > proposals[cursor].closeTimestamp &&
                cursor < proposalCursorRight
            ) {
                cursor++;
            }
            cursor--;
        }
    }

    //AUTOMATION FUNCTIONS

    function checkUpkeep(
        bytes calldata /* checkData */
    ) external view override returns (bool upkeepNeeded, bytes memory performData) {
        (upkeepNeeded, ) = getLeftCursorToUpdate();
        performData = "";
    }

    function performUpkeep(bytes calldata) external override {
        (, uint256 cursor) = getLeftCursorToUpdate();
        updateLeftCursor(cursor);
    }

    function getCursors() external view returns (uint256 packed) {
        packed = Packer.packCursors(proposalCursorLeft, proposalCursorRight);
    }

    function voteForProposal(uint256 _proposalId) external {
        if (userVoted[msg.sender][_proposalId]) revert Errors.AlreadyVoted();
        if (userVotePower[msg.sender] == 0) revert Errors.NoVotePower();
        if (_proposalId < proposalCursorLeft) revert Errors.ProposalIsClosed();
        if (_proposalId >= proposalCursorRight)
            revert Errors.NoProposalOnThisId();
        if (proposals[_proposalId].success)
            revert Errors.ProposalAlreadySucceeded();
        if (block.timestamp > proposals[_proposalId].closeTimestamp)
            revert Errors.ProposalIsClosed();

        proposals[_proposalId].votesApproved += userVotePower[msg.sender];
        userVoted[msg.sender][_proposalId] = true;

        emit VotedFor(_proposalId, msg.sender, userVotePower[msg.sender]);
    }

    function queueProposal(uint256 _proposalId) external {
        if (proposals[_proposalId].success)
            revert Errors.ProposalAlreadySucceeded();

        if (_proposalId >= proposalCursorRight)
            revert Errors.NoProposalOnThisId();

        if (
            proposals[_proposalId].votesApproved <
            (totalFund * requiredProposalPercentage) / 100
        ) revert Errors.NotEnoughVotesToQueue();

        proposals[_proposalId].onQueue = true;
        proposals[_proposalId].success = true;
    }

    function closeFailedProposal(uint256 _proposalId) external {
        if (_proposalId < proposalCursorLeft) revert Errors.ProposalIsClosed();

        if (block.timestamp > proposals[_proposalId].closeTimestamp)
            revert Errors.ProposalIsOngoing();

        if (proposals[_proposalId].success)
            revert Errors.ProposalAlreadySucceeded();

        if (_proposalId >= proposalCursorRight)
            revert Errors.NoProposalOnThisId();

        if (
            proposals[_proposalId].votesApproved >
            (totalFund * requiredProposalPercentage) / 100
        ) revert Errors.ProposalSucceeded();

        proposalCursorLeft = _proposalId + 1;
    }

    function processQueuedProposal(uint256 _proposalId) external nonReentrant {
        if (!proposals[_proposalId].onQueue) revert Errors.ProposalNotOnQueue();
        if (
            block.timestamp <
            proposals[_proposalId].closeTimestamp + queuePeriod
        ) revert Errors.ProposalIsOnQueuePeriod();
        if (
            fundingToken.balanceOf(address(this)) <
            proposals[_proposalId].amount
        ) revert Errors.NotEnoughBalanceForProposal();

        proposals[_proposalId].onQueue = false;
        remainingFund -= proposals[_proposalId].amount;
        fundingToken.transfer(
            proposals[_proposalId].target,
            proposals[_proposalId].amount
        );
    }

    // CCIP FUNCTIONS

    function allowlistSourceChain(
        uint64 _sourceChainSelector,
        bool allowed
    ) external onlyOwner {
        allowlistedSourceChains[_sourceChainSelector] = allowed;
    }

    function allowlistSender(address _sender, bool allowed) external onlyOwner {
        allowlistedSenders[_sender] = allowed;
    }

    function getLastReceivedMessageDetails()
        public
        view
        returns (
            bytes32 messageId,
            string memory text,
            address tokenAddress,
            uint256 tokenAmount
        )
    {
        return (
            s_lastReceivedMessageId,
            s_lastReceivedText,
            s_lastReceivedTokenAddress,
            s_lastReceivedTokenAmount
        );
    }

    function _unpackVotes(bytes memory message) internal {
        uint32 numProposals = uint32(Packer.decodeint(message, 0, 4));
        uint offset = 4;
        for (uint256 i = 0; i < numProposals; i++) {
            uint32 proposalId = uint32(Packer.decodeint(message, offset, 4));
            offset += 4; // uint32 is 4 bytes

            uint128 voteCount = uint128(Packer.decodeint(message, offset, 16));
            offset += 16; // uint128 is 16 bytes

            if (block.timestamp < proposals[proposalId].closeTimestamp)
                proposals[proposalId].votesApproved += voteCount;
        }
    }

    /// handle a received message
    function _ccipReceive(
        Client.Any2EVMMessage memory any2EvmMessage
    )
        internal
        override
        onlyAllowlisted(
            any2EvmMessage.sourceChainSelector,
            abi.decode(any2EvmMessage.sender, (address))
        )
    {
        s_lastReceivedMessageId = any2EvmMessage.messageId; // fetch the messageId

        _unpackVotes(any2EvmMessage.data);
        //s_lastReceivedText = abi.decode(any2EvmMessage.data, (string)); // abi-decoding of the sent text
        s_lastReceivedTokenAddress = any2EvmMessage.destTokenAmounts[0].token;
        s_lastReceivedTokenAmount = any2EvmMessage.destTokenAmounts[0].amount;

        totalFund += s_lastReceivedTokenAmount;
        remainingFund += s_lastReceivedTokenAmount;

        // emit MessageReceived(
        //     any2EvmMessage.messageId,
        //     any2EvmMessage.sourceChainSelector, // fetch the source chain identifier (aka selector)
        //     abi.decode(any2EvmMessage.sender, (address)), // abi-decoding of the sender address,
        //     abi.decode(any2EvmMessage.data, (string)),
        //     any2EvmMessage.destTokenAmounts[0].token,
        //     any2EvmMessage.destTokenAmounts[0].amount
        // );
    }
}
