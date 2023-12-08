// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../CCFVNode.sol";
import {HelperConfig} from "./helperConfig.s.sol";

contract DeployNode is Script {
    function run() external returns (CCFVNode) {
        HelperConfig helperConfig = new HelperConfig();

        if (block.chainid != 31337) {
            uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
            vm.startBroadcast(deployerPrivateKey);
        } else {
            vm.startBroadcast();
        }

        (
            address router,
            address link,
            address token,
            address masterAddress,
            address functionsRouter,
            bytes32 functionsDonID,
            uint64 subscriptionId,
            uint256 minFundsToBridge
        ) = helperConfig.activeNodeNetworkConfig();

        CCFVNode node = new CCFVNode(
            router,
            link,
            token,
            masterAddress,
            functionsRouter,
            functionsDonID,
            subscriptionId,
            minFundsToBridge
        );

        vm.stopBroadcast();

        return node;
    }

    // add this to be excluded from coverage report
    function test() public {}
}
