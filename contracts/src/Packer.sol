// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

library Packer {
    function packCursors(uint256 cursorLeft, uint256 cursorRight) public pure returns (uint256 packed) {
        packed = (cursorLeft << 128) | uint128(cursorRight);
    }

    function unpackCursors(
        uint256 packed
    ) public pure returns (uint128 left, uint128 right) {
        return (uint128(packed >> 128), uint128(packed));
    }

    function decodeint(
        bytes memory _bytes,
        uint _start,
        uint _length
    ) public pure returns (uint val) {
        for (uint256 i = 0; i < _length; i++) {
            val += (uint(uint8(_bytes[_start + _length - 1 - i])) << (8 * i));
        }
    }
}