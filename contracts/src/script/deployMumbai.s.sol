// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../CCFVNode.sol";

contract MyScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        address _masterAddress = 0x6f4322e5b90B2A62f53Bbfb4AE346292EB8e7F1D;

        address _router = 0x70499c328e1E2a3c41108bd3730F6670a44595D1;
        address _link = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB;
        address _token = 0xf1E3A5842EeEF51F2967b3F05D45DD4f4205FF40;
        address _functionsRouter = 0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C;
        bytes32 _functionsDonID = 0x66756e2d706f6c79676f6e2d6d756d6261692d31000000000000000000000000;
        uint64 _subscriptionId = 843;
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
