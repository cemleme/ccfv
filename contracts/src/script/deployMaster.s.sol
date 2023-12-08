// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../CCFVMaster.sol";
import {HelperConfig} from "./helperConfig.s.sol";

contract DeployMaster is Script {
    function run() external returns (CCFVMaster) {
        HelperConfig helperConfig = new HelperConfig();

        if (block.chainid != 31337) {
            uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
            vm.startBroadcast(deployerPrivateKey);
        } else {
            vm.startBroadcast();
        }

        (
            address router,
            address token,
            address priceFeed,
            int256 proposalCreationPrice
        ) = helperConfig.activeMasterNetworkConfig();

        CCFVMaster master = new CCFVMaster(
            router,
            token,
            priceFeed,
            proposalCreationPrice
        );

        vm.stopBroadcast();

        return master;
    }

    // add this to be excluded from coverage report
    function test() public {}
}
