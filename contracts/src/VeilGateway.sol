// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@oz/interfaces/IERC20.sol";
import {SafeERC20} from "@oz/token/ERC20/utils/SafeERC20.sol";

import {Constants} from "contracts/lib/Constants.sol";
import {ProofLib} from "contracts/lib/ProofLib.sol";
import {IEntrypoint} from "interfaces/IEntrypoint.sol";
import {IPrivacyPool} from "interfaces/IPrivacyPool.sol";

/// @dev The one function of Circle's MessageTransmitterV2 this gateway needs.
interface IMessageTransmitterV2 {
    function receiveMessage(bytes calldata message, bytes calldata attestation) external returns (bool);
}

/**
 * @title VeilGateway
 * @notice Turns one CCTP burn on any supported chain into one shielded deposit
 *         on Arc. The burn names this gateway as both `mintRecipient` and
 *         `destinationCaller`, and carries the deposit's precommitment in
 *         `hookData`; this contract mints the USDC and puts it straight into
 *         the Privacy Pool, in the same transaction.
 *
 * @dev Holds no funds between transactions and has no owner, no pause and no
 *      sweep — nothing here can move a user's money anywhere except into the
 *      pool or back to the refund address the burn named.
 *
 *      **It never reverts after the mint.** Once `receiveMessage` succeeds the
 *      CCTP message is consumed and cannot be replayed, so a revert past that
 *      point would burn the USDC on the source chain and mint it nowhere. Every
 *      failure after that — malformed hook, dead pool, deposit below the
 *      minimum, duplicate commitment — degrades to a plain transfer to the
 *      refund address. A bridge that loses privacy is a bad day; a bridge that
 *      loses funds is the end of the product.
 *
 *      What this does *not* hide: the burn on the source chain names the
 *      sender, the amount and this gateway, and the deposit on Arc is public.
 *      Only the later withdrawal is unlinkable, and only against the anonymity
 *      set the pool has at that moment.
 */
contract VeilGateway {
    using SafeERC20 for IERC20;
    using ProofLib for ProofLib.RagequitProof;

    /*//////////////////////////////////////////////////////////////
                        CCTP V2 WIRE FORMAT
    //////////////////////////////////////////////////////////////*/

    // Offsets into the message header, from circlefin/evm-cctp-contracts
    // src/messages/v2/MessageV2.sol. They are fixed by the protocol; a version
    // bump would change them, which is why `_MESSAGE_VERSION` is checked.
    uint256 private constant _VERSION_INDEX = 0;
    /// @dev The message *handler*, which for a token transfer is TokenMessengerV2 — not the payee.
    uint256 private constant _RECIPIENT_INDEX = 76;
    uint256 private constant _DESTINATION_CALLER_INDEX = 108;
    uint256 private constant _MESSAGE_BODY_INDEX = 148;

    // Offsets into the burn message body, from src/messages/v2/BurnMessageV2.sol.
    /// @dev The payee: where TokenMessengerV2 actually mints the USDC.
    uint256 private constant _MINT_RECIPIENT_INDEX = 36;
    uint256 private constant _MESSAGE_SENDER_INDEX = 100;
    uint256 private constant _HOOK_DATA_INDEX = 228;

    uint32 private constant _MESSAGE_VERSION = 1;

    /// @notice The hook a burn must carry: `abi.encode(uint256 precommitment, address refund)`.
    uint256 private constant _HOOK_LENGTH = 64;

    /*//////////////////////////////////////////////////////////////
                              IMMUTABLES
    //////////////////////////////////////////////////////////////*/

    /// @notice Circle's MessageTransmitterV2 on this chain.
    IMessageTransmitterV2 public immutable TRANSMITTER;
    /// @notice Circle's TokenMessengerV2 on this chain — the only handler whose mints this gateway trusts.
    address public immutable TOKEN_MESSENGER;
    /// @notice The Privacy Pool entrypoint that owns the pool registry.
    IEntrypoint public immutable ENTRYPOINT;
    /// @notice USDC's ERC-20 face on Arc — 6 decimals, not the 18-decimal native balance.
    IERC20 public immutable USDC;

    /*//////////////////////////////////////////////////////////////
                                STATE
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Where a deposit's funds go if it is ever ragequit.
     * @dev The pool records *this contract* as the depositor, so only this
     *      contract can ragequit a bridged commitment. Without this mapping a
     *      deposit whose label never enters an ASP root would be unspendable
     *      forever. The refund address is public, but it says nothing about
     *      which withdrawal the commitment eventually funds.
     */
    mapping(uint256 commitment => address refund) public refundOf;

    /*//////////////////////////////////////////////////////////////
                           ERRORS AND EVENTS
    //////////////////////////////////////////////////////////////*/

    error ZeroAddress();
    error MalformedMessage();
    error UnsupportedVersion(uint32 version);
    /// @dev Raised before the mint, so the message stays unconsumed and replayable.
    error NotForThisGateway();
    error NothingMinted();
    error NoPoolForUsdc();
    error UnknownCommitment(uint256 commitment);

    /// @notice A bridged deposit landed in the pool.
    event Veiled(uint256 indexed commitment, uint256 value, address indexed refund);
    /// @notice The deposit could not be made, so the USDC went to the refund address instead.
    event Refunded(address indexed refund, uint256 value, bytes reason);
    /// @notice A bridged deposit was pulled back out without ever being spent privately.
    event Ragequit(uint256 indexed commitment, address indexed refund, uint256 value);

    constructor(IMessageTransmitterV2 transmitter, address tokenMessenger, IEntrypoint entrypoint, IERC20 usdc) {
        if (
            address(transmitter) == address(0) || tokenMessenger == address(0) || address(entrypoint) == address(0)
                || address(usdc) == address(0)
        ) revert ZeroAddress();

        TRANSMITTER = transmitter;
        TOKEN_MESSENGER = tokenMessenger;
        ENTRYPOINT = entrypoint;
        USDC = usdc;
    }

    /*//////////////////////////////////////////////////////////////
                                BRIDGE
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Mints a CCTP transfer addressed to this gateway and deposits it
     *         into the Privacy Pool under the precommitment the burn carried.
     * @dev Permissionless on purpose: the attestation is the authority, so a
     *      relayer, the depositor, or a stranger can submit it. Whoever submits
     *      pays the gas and gains nothing else.
     * @param message The CCTP message, as Iris returned it.
     * @param attestation Circle's signature over that message.
     * @return commitment The commitment inserted into the pool, or zero if the
     *         funds were refunded instead.
     */
    function relay(bytes calldata message, bytes calldata attestation) external returns (uint256 commitment) {
        // Everything in this block reverts *before* the mint, so a rejected
        // message is untouched and can be submitted again.
        if (message.length < _MESSAGE_BODY_INDEX + _HOOK_DATA_INDEX) revert MalformedMessage();

        uint32 version = _uint32At(message, _VERSION_INDEX);
        if (version != _MESSAGE_VERSION) revert UnsupportedVersion(version);

        bytes32 self = bytes32(uint256(uint160(address(this))));
        // The header's recipient is the *handler*. Only TokenMessengerV2 mints
        // USDC, so any other handler means this is not a burn message at all.
        if (_bytes32At(message, _RECIPIENT_INDEX) != bytes32(uint256(uint160(TOKEN_MESSENGER)))) {
            revert NotForThisGateway();
        }
        // Without this the message could be delivered by anyone straight to
        // `receiveMessage`, minting to this gateway with no deposit behind it.
        if (_bytes32At(message, _DESTINATION_CALLER_INDEX) != self) revert NotForThisGateway();

        // The burn message's `burnToken` is the *source* chain's USDC address,
        // which has nothing to say about Arc's, so it is not checked here. What
        // arrived is settled below, by measuring this contract's USDC balance.
        uint256 body = _MESSAGE_BODY_INDEX;
        // The payee, which is what actually decides where the money lands.
        if (_bytes32At(message, body + _MINT_RECIPIENT_INDEX) != self) revert NotForThisGateway();

        address sender = address(uint160(uint256(_bytes32At(message, body + _MESSAGE_SENDER_INDEX))));
        (uint256 precommitment, address refund) = _readHook(message[body + _HOOK_DATA_INDEX:], sender);

        // Measured, not taken from the message: Circle deducts `feeExecuted`
        // from the amount, so what arrives is less than what was burnt.
        uint256 before = USDC.balanceOf(address(this));
        if (!TRANSMITTER.receiveMessage(message, attestation)) revert NothingMinted();
        uint256 value = USDC.balanceOf(address(this)) - before;
        if (value == 0) revert NothingMinted();

        // ---- past this line the mint has happened; do not revert ----

        if (precommitment == 0) {
            return _refund(refund, value, abi.encodeWithSelector(MalformedMessage.selector));
        }

        USDC.forceApprove(address(ENTRYPOINT), value);
        try ENTRYPOINT.deposit(USDC, value, precommitment) returns (uint256 newCommitment) {
            refundOf[newCommitment] = refund;
            // The commitment only exists once the deposit returns, so this log
            // cannot be written any earlier. USDC is the only token in play and
            // it does not call back.
            // forge-lint: disable-next-line(reentrancy-events)
            emit Veiled(newCommitment, value, refund);
            return newCommitment;
        } catch (bytes memory reason) {
            USDC.forceApprove(address(ENTRYPOINT), 0);
            return _refund(refund, value, reason);
        }
    }

    /*//////////////////////////////////////////////////////////////
                             ESCAPE HATCH
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Pulls a bridged deposit back out publicly, to the refund address
     *         the burn named, without ever revealing its secrets to anyone.
     * @dev The proof is the authorisation — only the holder of the commitment's
     *      secrets can produce one. This exists so that a deposit the ASP never
     *      includes is still recoverable; it forfeits privacy, which is the
     *      price of the escape hatch, not a flaw in it.
     */
    function ragequit(ProofLib.RagequitProof memory proof) external {
        uint256 commitment = proof.commitmentHash();
        address refund = refundOf[commitment];
        if (refund == address(0)) revert UnknownCommitment(commitment);

        // forge-lint: disable-next-line(unused-return)
        (IPrivacyPool pool,,,) = ENTRYPOINT.assetConfig(USDC);
        if (address(pool) == address(0)) revert NoPoolForUsdc();

        delete refundOf[commitment];

        uint256 before = USDC.balanceOf(address(this));
        pool.ragequit(proof);
        uint256 value = USDC.balanceOf(address(this)) - before;

        // Logged before the transfer, so a reverting transfer takes the log
        // with it. It cannot be logged any earlier than this: `value` is only
        // known once the pool has pushed the funds. USDC does not call back.
        // forge-lint: disable-next-line(reentrancy-events)
        emit Ragequit(commitment, refund, value);
        USDC.safeTransfer(refund, value);
    }

    /*//////////////////////////////////////////////////////////////
                              INTERNALS
    //////////////////////////////////////////////////////////////*/

    function _refund(address refund, uint256 value, bytes memory reason) private returns (uint256) {
        // Reached only after the mint, hence the warning; logged before the
        // transfer so that a reverting transfer leaves no log behind.
        // forge-lint: disable-next-line(reentrancy-events)
        emit Refunded(refund, value, reason);
        USDC.safeTransfer(refund, value);
        return 0;
    }

    /**
     * @dev Reads `abi.encode(uint256 precommitment, address refund)`. Returns a
     *      zero precommitment for anything it cannot read, which sends the
     *      caller down the refund path instead of reverting on them.
     */
    function _readHook(bytes calldata hookData, address sender)
        private
        pure
        returns (uint256 precommitment, address refund)
    {
        refund = sender;
        if (hookData.length != _HOOK_LENGTH) return (0, refund);

        uint256 claimed = uint256(_bytes32At(hookData, 0));
        // A precommitment outside the scalar field can never be a valid field
        // element, so the pool would reject it — catch it here and refund.
        if (claimed == 0 || claimed >= Constants.SNARK_SCALAR_FIELD) return (0, refund);

        bytes32 refundWord = _bytes32At(hookData, 32);
        address named = address(uint160(uint256(refundWord)));
        // Reject a dirty upper half rather than silently truncating it.
        if (uint256(refundWord) >> 160 != 0) return (0, refund);
        if (named != address(0)) refund = named;

        precommitment = claimed;
    }

    function _bytes32At(bytes calldata data, uint256 offset) private pure returns (bytes32 word) {
        assembly ("memory-safe") {
            word := calldataload(add(data.offset, offset))
        }
    }

    /// @dev Reads the leading 4 bytes at `offset`. The shift makes the width
    ///      exact, so there is nothing left to truncate.
    function _uint32At(bytes calldata data, uint256 offset) private pure returns (uint32 value) {
        assembly ("memory-safe") {
            value := shr(224, calldataload(add(data.offset, offset)))
        }
    }
}
