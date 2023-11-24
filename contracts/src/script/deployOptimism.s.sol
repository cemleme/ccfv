// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../CCFVNodeWithoutFunctions.sol";

contract MyScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        address _masterAddress = 0x21D06F85824b59E357c4fda5e2B9b8D014152A4B;

        address _router = 0xEB52E9Ae4A9Fb37172978642d4C141ef53876f26;
        address _link = 0xdc2CC710e42857672E7907CF474a69B63B93089f;
        address _token = 0xaBfE9D11A2f1D61990D1d253EC98B5Da00304F16;
        uint256 _minFundsToBridge = 1;

        CCFVNodeWithoutFunctions node = new CCFVNodeWithoutFunctions(
            _router,
            _link,
            _token,
            _masterAddress,
            _minFundsToBridge
        );

        console.log(address(node));

        vm.stopBroadcast();
    }
}
