// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;
import {Script} from "forge-std/Script.sol";
import {MockV3Aggregator} from "../tests/mocks/MockV3Aggregator.sol";
import {ERC20Mock} from "../tests/mocks/ERC20Mock.sol";

contract HelperConfig is Script {
    MasterNetworkConfig public activeMasterNetworkConfig;
    NodeNetworkConfig public activeNodeNetworkConfig;

    struct MasterNetworkConfig {
        address router;
        address token;
        address priceFeed;
        int256 proposalCreationPrice;
    }

    struct NodeNetworkConfig {
        address router;
        address link;
        address token;
        address masterAddress;
        address functionsRouter;
        bytes32 functionsDonID;
        uint64 subscriptionId;
        uint256 minFundsToBridge;
    }

    constructor() {
        if (block.chainid == 11155111)
            activeMasterNetworkConfig = getSepoliaMasterConfig();
        else {
            activeMasterNetworkConfig = getAnvilMasterConfig();
            activeNodeNetworkConfig = getAnvilNodeConfig();
        }
    }

    function getSepoliaMasterConfig()
        public
        pure
        returns (MasterNetworkConfig memory config)
    {
        config = MasterNetworkConfig({
            router: 0xD0daae2231E9CB96b94C8512223533293C3693Bf,
            token: 0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05,
            priceFeed: 0x42585eD362B3f1BCa95c640FdFf35Ef899212734,
            proposalCreationPrice: 1
        });
    }

    function getAnvilMasterConfig()
        public
        returns (MasterNetworkConfig memory config)
    {
        if (activeMasterNetworkConfig.priceFeed != address(0))
            return activeMasterNetworkConfig;

        uint8 decimals = 8;
        int initialPrice = 10000;

        vm.startBroadcast();
        MockV3Aggregator priceFeed = new MockV3Aggregator(
            decimals,
            initialPrice
        );
        ERC20Mock token = new ERC20Mock();
        vm.stopBroadcast();

        config = MasterNetworkConfig({
            router: address(1),
            token: address(token),
            priceFeed: address(priceFeed),
            proposalCreationPrice: 1
        });
    }

    function getAnvilNodeConfig()
        public
        returns (NodeNetworkConfig memory config)
    {
        vm.startBroadcast();
        ERC20Mock token = new ERC20Mock();
        vm.stopBroadcast();

        config = NodeNetworkConfig({
            router: address(1),
            link: address(2),
            token: address(token),
            masterAddress: address(3),
            functionsRouter: address(1),
            functionsDonID: bytes32(""),
            subscriptionId: 1,
            minFundsToBridge: 1
        });
    }

    // add this to be excluded from coverage report
    function test() public {}
}
