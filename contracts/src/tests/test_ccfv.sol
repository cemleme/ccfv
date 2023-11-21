pragma solidity 0.8.19;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import {CCFVNode} from "../CCFVNode.sol";
import {CCFVMaster} from "../CCFVMaster.sol";
import {Packer} from "../Packer.sol";

contract ContractBTest is Test {
    CCFVNode nodeContract;
    CCFVMaster master;

    // function setUp() public {
    //     nodeContract = new CCFVNode(
    //         address(0),
    //         address(0),
    //         address(0),
    //         address(0),
    //         address(0),
    //         "", 656
    //     );

    //     master = new CCFVMaster(address(0), address(0), address(0), 50);
    // }

    // function test_addProposal() public {
    //     master.createProposal(address(0), 100);
    // }

    // function test_canPackAndUnpackCursors() public {
    //     uint256 _left = 5;
    //     uint256 _right = 10;
    //     uint256 packed = Packer.packCursors(_left, _right);
    //     console.log(packed);
    //     (uint128 left, uint128 right) = Packer.unpackCursors(packed);
    //     console.log(left);
    //     console.log(right);

    //     assertEq(_left, left);
    //     assertEq(_right, right);
    // }

    function bytesToHexString(
        bytes memory data
    ) public pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(data.length * 2);
        for (uint i = 0; i < data.length; i++) {
            str[i * 2] = alphabet[uint(uint8(data[i] >> 4))];
            str[1 + i * 2] = alphabet[uint(uint8(data[i] & 0x0f))];
        }
        return string(str);
    }

    // function test_decode() public {
    //     bytes memory encoded = abi.encodePacked(uint32(2));
    //     uint32 numProposals = (uint32(uint8(encoded[3]))) +
    //         (uint32(uint8(encoded[2])) << 8) +
    //         (uint32(uint8(encoded[1])) << 16) +
    //         (uint32(uint8(encoded[0])) << 24);

    //     console.log("Num proposals: %s", numProposals);
    // }

    // function test_receiveTest() public {
    //     //         bytes32 messageId; // MessageId corresponding to ccipSend on source.
    //     // uint64 sourceChainSelector; // Source chain selector.
    //     // bytes sender; // abi.decode(sender) if coming from an EVM chain.
    //     // bytes data; // payload sent in original message.
    //     // EVMTokenAmount[] destTokenAmounts;

    //     Client.Any2EVMMessage memory msgcem;
    //     uint256 numProposals = 2;

    //     bytes memory encoded = new bytes(4 + numProposals * (4 + 16)); // 4 bytes for uint32 and 16 bytes for uint128

    //     bytes memory proposalCount = abi.encodePacked(uint32(numProposals));

    //     uint offset = 0;
    //     for (uint j = 0; j < 4; j++) {
    //         // Copy uint32 encoded data
    //         encoded[offset++] = proposalCount[j];
    //     }

    //     for (uint i = 0; i < numProposals; i++) {
    //         bytes memory encodedProposalId = abi.encodePacked(uint32(5 + i));
    //         bytes memory encodedVoteCount = abi.encodePacked(uint128(10000 + i * 5000));

    //         for (uint j = 0; j < 4; j++) {
    //             // Copy uint32 encoded data
    //             encoded[offset++] = encodedProposalId[j];
    //         }

    //         for (uint j = 0; j < 16; j++) {
    //             // Copy uint128 encoded data
    //             encoded[offset++] = encodedVoteCount[j];
    //         }
    //     }

    //     msgcem.sender = abi.encode(
    //         "0x0bF8eD3f9357bFea8226C4e5a4D2Bae6dA22637e"
    //     );
    //     msgcem.data = encoded;
    //     receiver.receiveTest(msgcem);
    // }
}
