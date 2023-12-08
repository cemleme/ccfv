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

        address _router = 0xA8C0c11bf64AF62CDCA6f93D3769B88BdD7cb93D;
        address _link = 0xD886E2286Fd1073df82462ea1822119600Af80b6;
        address _token = 0xbf9036529123DE264bFA0FC7362fE25B650D4B16;
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
