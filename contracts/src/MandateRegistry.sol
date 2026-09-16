// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/**
 * @title MandateRegistry
 * @notice Publishes commitments to mandates on Arc. The terms of a mandate —
 *         which assets, which limits, which hours — never appear here: only a
 *         hash of them does. Anyone can check that a receipt was evaluated
 *         against a mandate that was live at that epoch; nobody can read what
 *         the mandate said.
 * @dev Holds no funds and grants no authority over any. Once written, a
 *      commitment can never be changed, only revoked — otherwise terms could be
 *      rewritten after receipts had already been issued against them, and every
 *      receipt ever issued would become unfalsifiable.
 */
contract MandateRegistry {
    struct Mandate {
        bytes32 commitment;
        uint64 registeredAt;
        /// @dev 0 means live.
        uint64 revokedAt;
    }

    mapping(address account => mapping(uint64 epoch => Mandate)) private _mandates;

    error EmptyCommitment();
    error AlreadyRegistered(address account, uint64 epoch);
    error NotRegistered(address account, uint64 epoch);
    error AlreadyRevoked(address account, uint64 epoch);

    event MandateRegistered(
        address indexed account, uint64 indexed epoch, bytes32 indexed commitment, uint64 at
    );
    event MandateRevoked(address indexed account, uint64 indexed epoch, uint64 at);

    /// @notice Publishes the commitment for one epoch of the caller's mandate.
    function register(uint64 epoch, bytes32 commitment) external {
        if (commitment == bytes32(0)) revert EmptyCommitment();

        Mandate storage mandate = _mandates[msg.sender][epoch];
        if (mandate.commitment != bytes32(0)) revert AlreadyRegistered(msg.sender, epoch);

        mandate.commitment = commitment;
        mandate.registeredAt = uint64(block.timestamp);

        emit MandateRegistered(msg.sender, epoch, commitment, uint64(block.timestamp));
    }

    /// @notice Ends an epoch. Receipts issued before this remain checkable and remain true.
    function revoke(uint64 epoch) external {
        Mandate storage mandate = _mandates[msg.sender][epoch];
        if (mandate.commitment == bytes32(0)) revert NotRegistered(msg.sender, epoch);
        if (mandate.revokedAt != 0) revert AlreadyRevoked(msg.sender, epoch);

        mandate.revokedAt = uint64(block.timestamp);

        emit MandateRevoked(msg.sender, epoch, uint64(block.timestamp));
    }

    function mandateOf(address account, uint64 epoch) external view returns (Mandate memory) {
        return _mandates[account][epoch];
    }

    /// @notice The question the verifier actually asks.
    function isLive(address account, uint64 epoch, bytes32 commitment) external view returns (bool) {
        Mandate storage mandate = _mandates[account][epoch];
        return mandate.commitment != bytes32(0) && mandate.commitment == commitment
            && mandate.revokedAt == 0;
    }
}
