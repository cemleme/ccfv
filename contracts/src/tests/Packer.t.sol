pragma solidity 0.8.19;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import {Packer} from "../Packer.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";

contract PackerTest is Test {
    function setUp() public {}

    function test_canPackAndUnpackCursors() public {
        uint256 _left = 5;
        uint256 _right = 10;
        uint256 packed = Packer.packCursors(_left, _right);
        (uint128 left, uint128 right) = Packer.unpackCursors(packed);
        assertEq(_left, left);
        assertEq(_right, right);
    }

    function test_decode() public {
        bytes memory proposalCount = abi.encodePacked(uint32(4));
        uint32 numProposals = uint32(Packer.decodeint(proposalCount, 0, 4));
        assertEq(numProposals, 4);
    }
}
