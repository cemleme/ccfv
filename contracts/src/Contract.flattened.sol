// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract AutomationBase {
  error OnlySimulatedBackend();

  /**
   * @notice method that allows it to be simulated via eth_call by checking that
   * the sender is the zero address.
   */
  function preventExecution() internal view {
    if (tx.origin != address(0)) {
      revert OnlySimulatedBackend();
    }
  }

  /**
   * @notice modifier that allows it to be simulated via eth_call by checking
   * that the sender is the zero address.
   */
  modifier cannotExecute() {
    preventExecution();
    _;
  }
}

interface AutomationCompatibleInterface {
  /**
   * @notice method that is simulated by the keepers to see if any work actually
   * needs to be performed. This method does does not actually need to be
   * executable, and since it is only ever simulated it can consume lots of gas.
   * @dev To ensure that it is never called, you may want to add the
   * cannotExecute modifier from KeeperBase to your implementation of this
   * method.
   * @param checkData specified in the upkeep registration so it is always the
   * same for a registered upkeep. This can easily be broken down into specific
   * arguments using `abi.decode`, so multiple upkeeps can be registered on the
   * same contract and easily differentiated by the contract.
   * @return upkeepNeeded boolean to indicate whether the keeper should call
   * performUpkeep or not.
   * @return performData bytes that the keeper should call performUpkeep with, if
   * upkeep is needed. If you would like to encode data to decode later, try
   * `abi.encode`.
   */
  function checkUpkeep(bytes calldata checkData) external returns (bool upkeepNeeded, bytes memory performData);

  /**
   * @notice method that is actually executed by the keepers, via the registry.
   * The data returned by the checkUpkeep simulation will be passed into
   * this method to actually be executed.
   * @dev The input to this method should not be trusted, and the caller of the
   * method should not even be restricted to any single registry. Anyone should
   * be able call it, and the input should be validated, there is no guarantee
   * that the data passed in is the performData returned from checkUpkeep. This
   * could happen due to malicious keepers, racing keepers, or simply a state
   * change while the performUpkeep transaction is waiting for confirmation.
   * Always validate the data passed in.
   * @param performData is the data which was passed back from the checkData
   * simulation. If it is encoded, it can easily be decoded into other types by
   * calling `abi.decode`. This data should not be trusted, and should be
   * validated against the contract's current state.
   */
  function performUpkeep(bytes calldata performData) external;
}

abstract contract AutomationCompatible is AutomationBase, AutomationCompatibleInterface {}

interface AggregatorV3Interface {
  function decimals() external view returns (uint8);

  function description() external view returns (string memory);

  function version() external view returns (uint256);

  function getRoundData(
    uint80 _roundId
  ) external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound);

  function latestRoundData()
    external
    view
    returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound);
}

// End consumer library.
library Client {
  struct EVMTokenAmount {
    address token; // token address on the local chain.
    uint256 amount; // Amount of tokens.
  }

  struct Any2EVMMessage {
    bytes32 messageId; // MessageId corresponding to ccipSend on source.
    uint64 sourceChainSelector; // Source chain selector.
    bytes sender; // abi.decode(sender) if coming from an EVM chain.
    bytes data; // payload sent in original message.
    EVMTokenAmount[] destTokenAmounts; // Tokens and their amounts in their destination chain representation.
  }

  // If extraArgs is empty bytes, the default is 200k gas limit and strict = false.
  struct EVM2AnyMessage {
    bytes receiver; // abi.encode(receiver address) for dest EVM chains
    bytes data; // Data payload
    EVMTokenAmount[] tokenAmounts; // Token transfers
    address feeToken; // Address of feeToken. address(0) means you will send msg.value.
    bytes extraArgs; // Populate this with _argsToBytes(EVMExtraArgsV1)
  }

  // extraArgs will evolve to support new features
  // bytes4(keccak256("CCIP EVMExtraArgsV1"));
  bytes4 public constant EVM_EXTRA_ARGS_V1_TAG = 0x97a657c9;
  struct EVMExtraArgsV1 {
    uint256 gasLimit; // ATTENTION!!! MAX GAS LIMIT 4M FOR BETA TESTING
    bool strict; // See strict sequencing details below.
  }

  function _argsToBytes(EVMExtraArgsV1 memory extraArgs) internal pure returns (bytes memory bts) {
    return abi.encodeWithSelector(EVM_EXTRA_ARGS_V1_TAG, extraArgs);
  }
}

interface IRouterClient {
  error UnsupportedDestinationChain(uint64 destChainSelector);
  error InsufficientFeeTokenAmount();
  error InvalidMsgValue();

  /// @notice Checks if the given chain ID is supported for sending/receiving.
  /// @param chainSelector The chain to check.
  /// @return supported is true if it is supported, false if not.
  function isChainSupported(uint64 chainSelector) external view returns (bool supported);

  /// @notice Gets a list of all supported tokens which can be sent or received
  /// to/from a given chain id.
  /// @param chainSelector The chainSelector.
  /// @return tokens The addresses of all tokens that are supported.
  function getSupportedTokens(uint64 chainSelector) external view returns (address[] memory tokens);

  /// @param destinationChainSelector The destination chainSelector
  /// @param message The cross-chain CCIP message including data and/or tokens
  /// @return fee returns guaranteed execution fee for the specified message
  /// delivery to destination chain
  /// @dev returns 0 fee on invalid message.
  function getFee(
    uint64 destinationChainSelector,
    Client.EVM2AnyMessage memory message
  ) external view returns (uint256 fee);

  /// @notice Request a message to be sent to the destination chain
  /// @param destinationChainSelector The destination chain ID
  /// @param message The cross-chain CCIP message including data and/or tokens
  /// @return messageId The message ID
  /// @dev Note if msg.value is larger than the required fee (from getFee) we accept
  /// the overpayment with no refund.
  function ccipSend(
    uint64 destinationChainSelector,
    Client.EVM2AnyMessage calldata message
  ) external payable returns (bytes32);
}

interface OwnableInterface {
  function owner() external returns (address);

  function transferOwnership(address recipient) external;

  function acceptOwnership() external;
}

/**
 * @title The ConfirmedOwner contract
 * @notice A contract with helpers for basic contract ownership.
 */
contract ConfirmedOwnerWithProposal is OwnableInterface {
  address private s_owner;
  address private s_pendingOwner;

  event OwnershipTransferRequested(address indexed from, address indexed to);
  event OwnershipTransferred(address indexed from, address indexed to);

  constructor(address newOwner, address pendingOwner) {
    require(newOwner != address(0), "Cannot set owner to zero");

    s_owner = newOwner;
    if (pendingOwner != address(0)) {
      _transferOwnership(pendingOwner);
    }
  }

  /**
   * @notice Allows an owner to begin transferring ownership to a new address,
   * pending.
   */
  function transferOwnership(address to) public override onlyOwner {
    _transferOwnership(to);
  }

  /**
   * @notice Allows an ownership transfer to be completed by the recipient.
   */
  function acceptOwnership() external override {
    require(msg.sender == s_pendingOwner, "Must be proposed owner");

    address oldOwner = s_owner;
    s_owner = msg.sender;
    s_pendingOwner = address(0);

    emit OwnershipTransferred(oldOwner, msg.sender);
  }

  /**
   * @notice Get the current owner
   */
  function owner() public view override returns (address) {
    return s_owner;
  }

  /**
   * @notice validate, transfer ownership, and emit relevant events
   */
  function _transferOwnership(address to) private {
    require(to != msg.sender, "Cannot transfer to self");

    s_pendingOwner = to;

    emit OwnershipTransferRequested(s_owner, to);
  }

  /**
   * @notice validate access
   */
  function _validateOwnership() internal view {
    require(msg.sender == s_owner, "Only callable by owner");
  }

  /**
   * @notice Reverts if called by anyone other than the contract owner.
   */
  modifier onlyOwner() {
    _validateOwnership();
    _;
  }
}

/**
 * @title The ConfirmedOwner contract
 * @notice A contract with helpers for basic contract ownership.
 */
contract ConfirmedOwner is ConfirmedOwnerWithProposal {
  constructor(address newOwner) ConfirmedOwnerWithProposal(newOwner, address(0)) {}
}

/// @title The OwnerIsCreator contract
/// @notice A contract with helpers for basic contract ownership.
contract OwnerIsCreator is ConfirmedOwner {
  constructor() ConfirmedOwner(msg.sender) {}
}

/// @notice Application contracts that intend to receive messages from
/// the router should implement this interface.
interface IAny2EVMMessageReceiver {
  /// @notice Called by the Router to deliver a message.
  /// If this reverts, any token transfers also revert. The message
  /// will move to a FAILED state and become available for manual execution.
  /// @param message CCIP Message
  /// @dev Note ensure you check the msg.sender is the OffRampRouter
  function ccipReceive(Client.Any2EVMMessage calldata message) external;
}

// OpenZeppelin Contracts v4.4.1 (utils/introspection/IERC165.sol)

/**
 * @dev Interface of the ERC165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[EIP].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
  /**
    * @dev Returns true if this contract implements the interface defined by
    * `interfaceId`. See the corresponding
    * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
    * to learn more about how these ids are created.
    *
    * This function call must use less than 30 000 gas.
    */
  function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

/// @title CCIPReceiver - Base contract for CCIP applications that can receive messages.
abstract contract CCIPReceiver is IAny2EVMMessageReceiver, IERC165 {
  address private immutable i_router;

  constructor(address router) {
    if (router == address(0)) revert InvalidRouter(address(0));
    i_router = router;
  }

  /// @notice IERC165 supports an interfaceId
  /// @param interfaceId The interfaceId to check
  /// @return true if the interfaceId is supported
  function supportsInterface(bytes4 interfaceId) public pure override returns (bool) {
    return interfaceId == type(IAny2EVMMessageReceiver).interfaceId || interfaceId == type(IERC165).interfaceId;
  }

  /// @inheritdoc IAny2EVMMessageReceiver
  function ccipReceive(Client.Any2EVMMessage calldata message) external override onlyRouter {
    _ccipReceive(message);
  }

  /// @notice Override this function in your implementation.
  /// @param message Any2EVMMessage
  function _ccipReceive(Client.Any2EVMMessage memory message) internal virtual;

  /////////////////////////////////////////////////////////////////////
  // Plumbing
  /////////////////////////////////////////////////////////////////////

  /// @notice Return the current router
  /// @return i_router address
  function getRouter() public view returns (address) {
    return address(i_router);
  }

  error InvalidRouter(address router);

  /// @dev only calls from the set router are accepted.
  modifier onlyRouter() {
    if (msg.sender != address(i_router)) revert InvalidRouter(msg.sender);
    _;
  }
}

// OpenZeppelin Contracts (last updated v4.6.0) (token/ERC20/IERC20.sol)

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
  /**
   * @dev Emitted when `value` tokens are moved from one account (`from`) to
   * another (`to`).
   *
   * Note that `value` may be zero.
   */
  event Transfer(address indexed from, address indexed to, uint256 value);

  /**
   * @dev Emitted when the allowance of a `spender` for an `owner` is set by
   * a call to {approve}. `value` is the new allowance.
   */
  event Approval(address indexed owner, address indexed spender, uint256 value);

  /**
   * @dev Returns the amount of tokens in existence.
   */
  function totalSupply() external view returns (uint256);

  /**
   * @dev Returns the amount of tokens owned by `account`.
   */
  function balanceOf(address account) external view returns (uint256);

  /**
   * @dev Moves `amount` tokens from the caller's account to `to`.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   * Emits a {Transfer} event.
   */
  function transfer(address to, uint256 amount) external returns (bool);

  /**
   * @dev Returns the remaining number of tokens that `spender` will be
   * allowed to spend on behalf of `owner` through {transferFrom}. This is
   * zero by default.
   *
   * This value changes when {approve} or {transferFrom} are called.
   */
  function allowance(address owner, address spender) external view returns (uint256);

  /**
   * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   * IMPORTANT: Beware that changing an allowance with this method brings the risk
   * that someone may use both the old and the new allowance by unfortunate
   * transaction ordering. One possible solution to mitigate this race
   * condition is to first reduce the spender's allowance to 0 and set the
   * desired value afterwards:
   * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
   *
   * Emits an {Approval} event.
   */
  function approve(address spender, uint256 amount) external returns (bool);

  /**
   * @dev Moves `amount` tokens from `from` to `to` using the
   * allowance mechanism. `amount` is then deducted from the caller's
   * allowance.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   * Emits a {Transfer} event.
   */
  function transferFrom(
    address from,
    address to,
    uint256 amount
  ) external returns (bool);
}

library Packer {
    function packCursors(uint256 cursorLeft, uint256 cursorRight) public pure returns (uint256 packed) {
        packed = (cursorLeft << 128) | uint128(cursorRight);
    }

    function unpackCursors(
        uint256 packed
    ) public pure returns (uint128 left, uint128 right) {
        return (uint128(packed >> 128), uint128(packed));
    }

    function decodeint(
        bytes memory _bytes,
        uint _start,
        uint _length
    ) public pure returns (uint val) {
        for (uint256 i = 0; i < _length; i++) {
            val += (uint(uint8(_bytes[_start + _length - 1 - i])) << (8 * i));
        }
    }
}

library Errors {
    // Custom errors to provide more descriptive revert messages.
    error SourceChainNotAllowed(uint64 sourceChainSelector); // Used when the source chain has not been allowlisted by the contract owner.
    error SenderNotAllowed(address sender); // Used when the sender has not been allowlisted by the contract owner.

    // Custom errors to provide more descriptive revert messages.
    error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees); // Used to make sure contract has enough balance to cover the fees.
    error NothingToWithdraw(); // Used when trying to withdraw Ether but there's nothing to withdraw.
    error FailedToWithdrawEth(address owner, address target, uint256 value); // Used when the withdrawal of Ether fails.
    error DestinationChainNotAllowed(uint64 destinationChainSelector); // Used when the destination chain has not been allowlisted by the contract owner.

    // Custom error type
    error UnexpectedRequestID(bytes32 requestId);

    error AlreadyVoted();
    error NoVotePower();
    error ProposalIsClosed();
    error ProposalIsOngoing();
    error NoProposalOnThisId();
    error ProposalAlreadySucceeded();
    error ProposalSucceeded();
    error NotEnoughVotesToQueue();
    error CursorsRecentlyUpdated();
    error BridgeRecentlyRan();
    error NoVotesOrNotEnoughFundsToBridge();
    error ProposalNotOnQueue();
    error ProposalIsOnQueuePeriod();
    error NotEnoughBalanceForProposal();
    error NotEnoughPayableToCoverCost();
}

/// @title - A simple messenger contract for transferring/receiving tokens and data across chains.
contract CCFVMaster is CCIPReceiver, OwnerIsCreator, AutomationCompatible {
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
    ) external view override returns (bool upkeepNeeded, bytes memory) {
        (upkeepNeeded, ) = getLeftCursorToUpdate();
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

    function processQueuedProposal(uint256 _proposalId) external {
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
