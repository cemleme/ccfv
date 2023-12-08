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

        address _router = 0x9527E2d01A3064ef6b50c1Da1C0cC523803BCFF2;
        address _link = 0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06;
        address _token = 0xbFA2ACd33ED6EEc0ed3Cc06bF1ac38d22b36B9e9;
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

    // add this to be excluded from coverage report
    function test() public {}
}
