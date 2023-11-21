// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../CCFVMaster.sol";

contract MyScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        address _router = 0xD0daae2231E9CB96b94C8512223533293C3693Bf;
        address _token = 0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05;
        address _priceFeedLinkEth = 0x42585eD362B3f1BCa95c640FdFf35Ef899212734;
        int256 _proposalCreationPrice = 1;

        CCFVMaster node = new CCFVMaster(
            _router,
            _token,
            _priceFeedLinkEth,
            _proposalCreationPrice
        );

        console.log(address(node));

        vm.stopBroadcast();
    }
}
