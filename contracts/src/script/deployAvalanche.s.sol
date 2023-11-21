// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../CCFVNode.sol";

contract MyScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        address _masterAddress = 0xdf60767905e385351d6FBfe66F1b86d1c2ee1F1e;

        address _router = 0x554472a2720E5E7D5D3C817529aBA05EEd5F82D8;
        address _link = 0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846;
        address _token = 0xD21341536c5cF5EB1bcb58f6723cE26e8D8E90e4;
        address _functionsRouter = 0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0;
        bytes32 _functionsDonID = 0x66756e2d6176616c616e6368652d66756a692d31000000000000000000000000;
        uint64 _subscriptionId = 656;
        uint256 _minFundsToBridge = 1;

        CCFVNode node = new CCFVNode(
            _router,
            _link,
            _token,
            _masterAddress,
            _functionsRouter,
            _functionsDonID,
            _subscriptionId,
            _minFundsToBridge
        );

        console.log(address(node));

        vm.stopBroadcast();
    }
}
