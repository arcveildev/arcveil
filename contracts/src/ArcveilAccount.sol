// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {MandateRegistry} from "./MandateRegistry.sol";

/**
 * @title ArcveilAccount
 * @notice A 2-of-3 account: a device key, a policy co-signer, and a recovery
 *         key. Any two of the three authorise a call, which is what makes the
 *         co-signer refusable rather than custodial — it can decline to sign,
 *         but device + recovery move funds without it, and it can never move
 *         them alone.
 * @dev Every execution is gated on the mandate being live in the registry, so a
 *      revoked mandate stops the agent on chain and not merely in a policy
 *      engine that we happen to run.
 *
 *      The gate lives in execution, never in validation: ERC-4337 forbids an
 *      unstaked account from reading another contract's storage while a bundler
 *      simulates, and reading the registry there would get this account
 *      throttled or banned. Validation checks signatures; execution checks the
 *      mandate.
 */
contract ArcveilAccount {
    struct Call {
        address to;
        uint256 value;
        bytes data;
    }

    address public immutable entryPoint;
    MandateRegistry public immutable mandates;

    /// @notice Shard A — the key on your device.
    address public immutable device;
    /// @notice Shard B — the policy co-signer. Refusable, never sufficient.
    address public immutable cosigner;
    /// @notice Shard C — recovery, held behind a passkey.
    address public immutable recovery;

    /// @notice Replay counter for the direct path. The EntryPoint keeps its own.
    uint256 public nonce;

    bytes32 private constant INTENT_TYPEHASH = keccak256(
        "Intent(address to,uint256 value,bytes data,uint256 nonce,uint64 deadline,uint64 epoch,bytes32 mandate)"
    );
    bytes32 private constant DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

    uint256 private constant SIG_VALIDATION_FAILED = 1;
    /// @dev Upper half of the curve order; rejecting it removes signature malleability.
    uint256 private constant HALF_N = 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0;

    error ZeroAddress();
    error KeysMustDiffer();
    error NotEntryPoint();
    error NotAMember(address signer);
    error DuplicateSigner(address signer);
    error Expired(uint64 deadline);
    error MandateNotLive(uint64 epoch, bytes32 commitment);
    error MalformedSignature();
    error CallReverted(bytes reason);

    event Executed(address indexed to, uint256 value, uint64 indexed epoch, bytes32 indexed mandate);

    constructor(address entryPoint_, MandateRegistry mandates_, address device_, address cosigner_, address recovery_) {
        // A zero member would quietly turn 2-of-3 into 2-of-2, and a repeated one
        // does the same. Both are unrecoverable once the account holds anything.
        // forge-lint: disable-next-line(missing-zero-check)
        if (entryPoint_ == address(0) || address(mandates_) == address(0)) revert ZeroAddress();
        // forge-lint: disable-next-line(missing-zero-check)
        if (device_ == address(0) || cosigner_ == address(0) || recovery_ == address(0)) revert ZeroAddress();
        if (device_ == cosigner_ || device_ == recovery_ || cosigner_ == recovery_) revert KeysMustDiffer();

        entryPoint = entryPoint_;
        mandates = mandates_;
        device = device_;
        cosigner = cosigner_;
        recovery = recovery_;
    }

    receive() external payable {}

    // ---------------------------------------------------------------- direct

    /**
     * @notice Executes a call authorised by any two of the three keys.
     * @dev The signed intent covers the mandate it is claimed under, so a
     *      signature for one mandate cannot be replayed against another.
     */
    function execute(
        Call calldata call,
        uint64 deadline,
        uint64 epoch,
        bytes32 mandate,
        bytes calldata first,
        bytes calldata second
    ) external returns (bytes memory result) {
        // Deadlines here are minutes or hours; the seconds a validator could nudge
        // block.timestamp by cannot change whether an intent is still wanted.
        // forge-lint: disable-next-line(block-timestamp)
        if (block.timestamp > deadline) revert Expired(deadline);

        bytes32 digest = intentDigest(call, nonce, deadline, epoch, mandate);
        requireTwoOfThree(digest, first, second);

        nonce += 1;
        result = run(call, epoch, mandate);
    }

    // -------------------------------------------------------------- ERC-4337

    /// @notice ERC-4337 validation: signatures only, per the simulation rules.
    function validateUserOp(bytes32 userOpHash, bytes calldata signature, uint256 missingAccountFunds)
        external
        returns (uint256 validationData)
    {
        if (msg.sender != entryPoint) revert NotEntryPoint();

        (bytes memory first, bytes memory second) = abi.decode(signature, (bytes, bytes));
        validationData = checkTwoOfThree(toEthSignedMessage(userOpHash), first, second) ? 0 : SIG_VALIDATION_FAILED;

        if (missingAccountFunds != 0) {
            // Failure is the EntryPoint's to handle; it reverts the operation itself.
            (bool paid,) = payable(msg.sender).call{value: missingAccountFunds}("");
            paid;
        }
    }

    /// @notice The EntryPoint's execution path. The mandate is checked here.
    function executeFromEntryPoint(Call calldata call, uint64 epoch, bytes32 mandate) external returns (bytes memory) {
        if (msg.sender != entryPoint) revert NotEntryPoint();
        return run(call, epoch, mandate);
    }

    // ---------------------------------------------------------------- shared

    function run(Call calldata call, uint64 epoch, bytes32 mandate) private returns (bytes memory) {
        if (!mandates.isLive(address(this), epoch, mandate)) revert MandateNotLive(epoch, mandate);

        // Emitted before the untrusted call, not after: a reentrant target could
        // otherwise reorder or interleave the log that off-chain consumers read.
        // If the call reverts the whole transaction does, so the log never
        // survives a failure either way. The only external call before this
        // point is a view on our own registry, whose address is immutable.
        // forge-lint: disable-next-line(reentrancy-events)
        emit Executed(call.to, call.value, epoch, mandate);

        // forge-lint: disable-next-line(arbitrary-send-eth)
        (bool ok, bytes memory returned) = call.to.call{value: call.value}(call.data);
        if (!ok) revert CallReverted(returned);

        return returned;
    }

    function requireTwoOfThree(bytes32 digest, bytes calldata first, bytes calldata second) private view {
        address a = recoverSigner(digest, first);
        address b = recoverSigner(digest, second);

        if (!isMember(a)) revert NotAMember(a);
        if (!isMember(b)) revert NotAMember(b);
        if (a == b) revert DuplicateSigner(a);
    }

    function checkTwoOfThree(bytes32 digest, bytes memory first, bytes memory second) private view returns (bool) {
        address a = recoverMemory(digest, first);
        address b = recoverMemory(digest, second);
        return isMember(a) && isMember(b) && a != b;
    }

    function isMember(address who) public view returns (bool) {
        return who == device || who == cosigner || who == recovery;
    }

    function domainSeparator() public view returns (bytes32) {
        return
            keccak256(abi.encode(DOMAIN_TYPEHASH, keccak256("Arcveil"), keccak256("1"), block.chainid, address(this)));
    }

    function intentDigest(Call calldata call, uint256 nonce_, uint64 deadline, uint64 epoch, bytes32 mandate)
        public
        view
        returns (bytes32)
    {
        bytes32 structHash = keccak256(
            abi.encode(INTENT_TYPEHASH, call.to, call.value, keccak256(call.data), nonce_, deadline, epoch, mandate)
        );
        return keccak256(abi.encodePacked("\x19\x01", domainSeparator(), structHash));
    }

    function recoverSigner(bytes32 digest, bytes calldata signature) private pure returns (address) {
        if (signature.length != 65) revert MalformedSignature();
        return recoverMemory(digest, signature);
    }

    function recoverMemory(bytes32 digest, bytes memory signature) private pure returns (address signer) {
        if (signature.length != 65) revert MalformedSignature();

        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly ("memory-safe") {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }
        // Reject the mirrored signature, so one authorisation has one encoding.
        if (uint256(s) > HALF_N) revert MalformedSignature();
        if (v != 27 && v != 28) revert MalformedSignature();

        signer = ecrecover(digest, v, r, s);
        if (signer == address(0)) revert MalformedSignature();
    }

    function toEthSignedMessage(bytes32 hash) private pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }
}
