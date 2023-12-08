pragma solidity 0.8.19;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import {CCFVNode} from "../CCFVNode.sol";
import {Packer} from "../Packer.sol";
import {DeployNode} from "../script/deployNode.s.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.0/token/ERC20/IERC20.sol";

contract CCFVNodeTest is Test {
    DeployNode deployNode;
    CCFVNode node;

    function setUp() public {
        deployNode = new DeployNode();
        node = deployNode.run();
    }

    function test_owner() public {
        assertEq(node.owner(), msg.sender);
    }

    function testProvideFund() public {
        IERC20 token = node.fundingToken();

        vm.startPrank(msg.sender);

        token.approve(address(node), 100000000);
        node.provideFund(1000);

        vm.stopPrank();
    }

    function testGetStats() public {
        testProvideFund();

        (
            uint256 lifetimeFunds,
            uint256 userFunds,
            uint256 fundsToBridge,
            uint256 votesToBridge,
            uint256 proposalNonce,
            bool canUpdateProposalNonce,
            uint256[] memory proposalsWaitingUpdate
        ) = node.getStats(msg.sender);

        assertEq(lifetimeFunds, 1000);
        assertEq(fundsToBridge, 1000);
        assertEq(votesToBridge, 0);
        assertEq(userFunds, 1000);
        assertEq(proposalNonce, 0);
        assertEq(canUpdateProposalNonce, false);
        assertEq(proposalsWaitingUpdate.length, 0);
    }
}
