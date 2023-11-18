// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

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
