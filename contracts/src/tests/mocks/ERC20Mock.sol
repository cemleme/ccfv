// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.0/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {
    constructor() ERC20("ERC20Mock", "E20M") {
        _mint(msg.sender, 10 ** 18);
    }

    function mint(address account, uint256 amount) external {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) external {
        _burn(account, amount);
    }

    // add this to be excluded from coverage report
    function test() public {}
}
