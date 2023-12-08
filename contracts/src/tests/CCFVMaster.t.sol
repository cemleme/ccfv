pragma solidity 0.8.19;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import {CCFVNode} from "../CCFVNode.sol";
import {CCFVMaster} from "../CCFVMaster.sol";
import {Packer} from "../Packer.sol";
import {DeployMaster} from "../script/deployMaster.s.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.0/token/ERC20/IERC20.sol";

contract CCFVMasterTest is Test {
    DeployMaster deployMaster;
    CCFVMaster master;
    uint256 constant FUNDING_AMOUNT = 1000;

    function setUp() public {
        deployMaster = new DeployMaster();
        master = deployMaster.run();
    }

    function test_owner() public {
        assertEq(master.owner(), msg.sender);
    }

    function test_proposalCreationCost() public {
        int256 cost = master.getProposalCost();
        assertGt(cost, 1);
    }

    function testFailAddProposalWithoutBalance() public {
        uint256 cost = uint256(master.getProposalCost());
        master.createProposal{value: cost}(address(0), 100, "", "");
    }

    modifier funded() {
        IERC20 token = master.fundingToken();

        vm.startPrank(msg.sender);

        token.approve(address(master), 100000000);
        master.provideFund(FUNDING_AMOUNT);

        vm.stopPrank();
        _;
    }

    modifier haveProposal() {
        vm.startPrank(msg.sender);
        uint256 cost = uint256(master.getProposalCost());
        master.createProposal{value: cost}(address(1), 100, "", "");
        vm.stopPrank();
        _;
    }

    function testProvideFund() public funded {
        assertEq(master.totalFund(), FUNDING_AMOUNT);
    }

    function testAddProposal() public funded haveProposal {
        assertEq(master.proposalCursorRight(), 1);
    }

    function testGetStats() public funded {
        (
            uint256 lifetimeFunds,
            uint256 currentFunds,
            uint256 userFunds
        ) = master.getStats(msg.sender);
        assertEq(lifetimeFunds, 1000);
        assertEq(currentFunds, 1000);
        assertEq(userFunds, 1000);
    }

    function testGetProposal() public funded haveProposal {
        (CCFVMaster.Proposal memory proposal, uint256 requiredVote) = master
            .getProposal(0);
        assertEq(proposal.amount, 100);
        assertEq(proposal.target, address(1));
        assertEq(requiredVote, 700);
    }

    function testFailVoteForProposal() public funded haveProposal {
        master.voteForProposal(0);
    }

    function testVoteForProposal() public funded haveProposal {
        vm.prank(msg.sender);
        master.voteForProposal(0);
        (CCFVMaster.Proposal memory proposal, ) = master.getProposal(0);
        assertEq(proposal.votesApproved, FUNDING_AMOUNT);
    }

    function testQueueProposal() public funded haveProposal {
        vm.prank(msg.sender);
        master.voteForProposal(0);
        skip(1 days);
        master.queueProposal(0);
    }

    function testFailProcessProposal() public funded haveProposal {
        vm.prank(msg.sender);
        master.voteForProposal(0);
        skip(1 days);
        master.queueProposal(0);
        master.processQueuedProposal(0);
    }

    function testProcessProposal() public funded haveProposal {
        vm.prank(msg.sender);
        master.voteForProposal(0);
        skip(1 days);
        master.queueProposal(0);
        skip(1 days);
        master.processQueuedProposal(0);
    }

    function testAllowlistSourceChain() public {
        vm.prank(msg.sender);
        master.allowlistSourceChain(1, true);
        assertEq(master.allowlistedSourceChains(1), true);
    }

    function testAllowlistSender() public {
        vm.prank(msg.sender);
        master.allowlistSender(address(1), true);
        assertEq(master.allowlistedSenders(address(1)), true);
    }

    function testGetCursors() public funded haveProposal {
        uint256 cursors = master.getCursors();
        assertEq(cursors, 1);
        skip(3 days);
        master.closeFailedProposal(0);
        cursors = master.getCursors();
        (uint128 left, uint128 right) = Packer.unpackCursors(cursors);
        assertEq(left, 1);
        assertEq(right, 1);
    }
}
