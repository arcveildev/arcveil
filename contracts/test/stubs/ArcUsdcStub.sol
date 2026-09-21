// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/**
 * @notice Stands in for Arc's USDC at `0x3600…0000` during fork tests.
 * @dev On Arc the ERC-20 is a 6-decimal view over the chain's 18-decimal native
 *      balance, and every mint and transfer is delegated to a precompile at
 *      `0x1800…0000`. A precompile is not bytecode, so a fork has nothing to
 *      fetch and the call dies with `OpcodeNotFound`. Reproducing it with
 *      `vm.deal` does not work either: cheatcode balance writes are not
 *      journalled, so they survive a revert and the refund path loses its funds.
 *
 *      So the token is replaced and the bridge is not. Everything this test
 *      exists to check — the message offsets, the handler, the destination
 *      caller, the mint recipient — still runs against Circle's real
 *      MessageTransmitterV2 and TokenMessengerV2 on a fork of Arc. What is not
 *      covered here is Arc's own USDC: the mint path consults a compliance
 *      precompile, and every path routes through one whose code is not readable
 *      from outside. Neither can run on a fork, so neither is tested.
 *
 *      Storage is mappings only, so nothing collides with whatever the proxy
 *      being etched over had in its low slots.
 */
contract ArcUsdcStub {
    mapping(address account => uint256 amount) public balanceOf;
    mapping(address owner => mapping(address spender => uint256 amount)) public allowance;

    uint8 public constant decimals = 6;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /// @dev Open on purpose: the only caller in these tests is Circle's TokenMinterV2.
    function mint(address to, uint256 amount) external returns (bool) {
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
        return true;
    }

    function burn(uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "ERC20: burn amount exceeds balance");
        balanceOf[msg.sender] -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _move(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= amount, "ERC20: insufficient allowance");
        if (allowed != type(uint256).max) allowance[from][msg.sender] = allowed - amount;
        _move(from, to, amount);
        return true;
    }

    function _move(address from, address to, uint256 amount) private {
        require(balanceOf[from] >= amount, "ERC20: transfer amount exceeds balance");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }
}
