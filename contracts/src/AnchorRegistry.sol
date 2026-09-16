// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/**
 * @title AnchorRegistry
 * @notice Anchors the budget-commitment chain that receipts advance. Each
 *         receipt carries `counter.prev -> counter.next`; anchoring those
 *         commitments on Arc is what makes a *missing* receipt visible, because
 *         a gap in the chain no longer joins.
 * @dev Holds no funds. Commitments are opaque: they reveal no amount, no asset
 *      and no limit. Anchoring is append-only per account — the same commitment
 *      cannot be re-anchored, so history cannot be quietly rewritten.
 */
contract AnchorRegistry {
    mapping(address account => mapping(bytes32 commitment => uint64 at)) private _anchoredAt;
    mapping(address account => bytes32 commitment) private _head;

    error EmptyCommitment();
    error AlreadyAnchored(address account, bytes32 commitment);

    event Anchored(
        address indexed account, bytes32 indexed commitment, bytes32 indexed previous, uint64 at
    );

    /// @notice Anchors the caller's latest budget commitment.
    function anchor(bytes32 commitment) external {
        if (commitment == bytes32(0)) revert EmptyCommitment();
        if (_anchoredAt[msg.sender][commitment] != 0) {
            revert AlreadyAnchored(msg.sender, commitment);
        }

        bytes32 previous = _head[msg.sender];
        _anchoredAt[msg.sender][commitment] = uint64(block.timestamp);
        _head[msg.sender] = commitment;

        emit Anchored(msg.sender, commitment, previous, uint64(block.timestamp));
    }

    /// @notice The question the verifier actually asks.
    function isAnchored(address account, bytes32 commitment) external view returns (bool) {
        return _anchoredAt[account][commitment] != 0;
    }

    function anchoredAt(address account, bytes32 commitment) external view returns (uint64) {
        return _anchoredAt[account][commitment];
    }

    /// @notice The most recent commitment this account anchored.
    function head(address account) external view returns (bytes32) {
        return _head[account];
    }
}
