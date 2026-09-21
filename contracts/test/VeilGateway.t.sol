// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@oz/interfaces/IERC20.sol";
import {ERC1967Proxy} from "@oz/proxy/ERC1967/ERC1967Proxy.sol";
import {Test} from "forge-std/Test.sol";

import {Entrypoint} from "contracts/Entrypoint.sol";
import {ProofLib} from "contracts/lib/ProofLib.sol";
import {PrivacyPoolComplex} from "contracts/implementations/PrivacyPoolComplex.sol";
import {CommitmentVerifier} from "contracts/verifiers/CommitmentVerifier.sol";
import {WithdrawalVerifier} from "contracts/verifiers/WithdrawalVerifier.sol";
import {IEntrypoint} from "interfaces/IEntrypoint.sol";
import {IPrivacyPool} from "interfaces/IPrivacyPool.sol";

import {IMessageTransmitterV2, VeilGateway} from "../src/VeilGateway.sol";
import {ArcUsdcStub} from "./stubs/ArcUsdcStub.sol";

/// @dev The attester controls on Circle's live MessageTransmitterV2.
interface IAttesterAdmin {
    function attesterManager() external view returns (address);
    function enableAttester(address attester) external;
    function setSignatureThreshold(uint256 threshold) external;
}

/**
 * @notice Runs against a fork of Arc mainnet, so the CCTP contracts under test
 *         are the real ones. The only thing faked is who Circle's attester is:
 *         the test takes over the attester set, which proves nothing about
 *         Circle's signing and everything about our message parsing — that the
 *         offsets, the handler check and the mint path are right.
 *
 * @dev Skipped when `arc` cannot be reached, so an offline `forge test` stays green.
 */
contract VeilGatewayForkTest is Test {
    // Live on Arc mainnet, chain 5042.
    address private constant TOKEN_MESSENGER = 0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d;
    address private constant TRANSMITTER = 0x81D40F21F12A8F0E3252Bccb954D722d4c464B64;
    IERC20 private constant USDC = IERC20(0x3600000000000000000000000000000000000000);

    uint32 private constant ETHEREUM_DOMAIN = 0;
    uint32 private constant ARC_DOMAIN = 26;
    uint32 private constant MESSAGE_VERSION = 1;
    uint32 private constant FINALITY_STANDARD = 2000;
    /// @dev USDC on Ethereum — what a burn from domain 0 names as its `burnToken`.
    bytes32 private constant ETHEREUM_USDC = bytes32(uint256(uint160(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48)));

    uint256 private constant SNARK_SCALAR_FIELD =
        21_888_242_871_839_275_222_246_405_745_257_275_088_548_364_400_416_034_343_698_204_186_575_808_495_617;

    /// @dev Pinned so the run is reproducible and Foundry's RPC cache can serve it.
    uint256 private constant ARC_FORK_BLOCK = 21_800_000;

    uint256 private constant ONE_USDC = 1e6;
    uint256 private constant MIN_DEPOSIT = 1e6;

    uint256 private attesterPk = 0xA77E57E4;

    address private owner = address(0x000000000000000000000000000000000000beE1);
    address private postman = address(0x9057);
    address private depositor = address(0xD3905);
    address private refund = address(0xFEED);

    Entrypoint private entrypoint;
    PrivacyPoolComplex private pool;
    VeilGateway private gateway;

    event Veiled(uint256 indexed commitment, uint256 value, address indexed refund);
    event Refunded(address indexed refund, uint256 value, bytes reason);

    function setUp() public {
        try vm.createSelectFork("arc", ARC_FORK_BLOCK) {}
        catch {
            vm.skip(true);
        }

        _stubUsdc();
        _deployProtocol();
        _takeOverAttesters();
    }

    /*//////////////////////////////////////////////////////////////
                            THE HAPPY PATH
    //////////////////////////////////////////////////////////////*/

    function test_relayPutsTheBridgedUsdcStraightIntoThePool() public {
        uint256 amount = 25 * ONE_USDC;
        uint256 precommitment = _fieldElement("precommitment");

        uint256 poolBefore = USDC.balanceOf(address(pool));

        vm.recordLogs();
        uint256 commitment = _relay(amount, precommitment, refund, address(gateway), address(gateway));

        assertGt(commitment, 0, "no commitment returned");
        assertEq(USDC.balanceOf(address(pool)) - poolBefore, amount, "pool did not receive the full amount");
        assertEq(USDC.balanceOf(address(gateway)), 0, "gateway kept funds");
        assertEq(gateway.refundOf(commitment), refund, "refund address not recorded");
    }

    function test_relayIsPermissionless() public {
        // A stranger submits someone else's attested message and gains nothing.
        vm.prank(address(0xBEEF));
        uint256 commitment = _relay(5 * ONE_USDC, _fieldElement("other"), refund, address(gateway), address(gateway));

        assertGt(commitment, 0);
        assertEq(USDC.balanceOf(address(0xBEEF)), 0, "submitter was paid");
    }

    function test_theSameMessageCannotBeRelayedTwice() public {
        bytes32 nonce = keccak256("nonce-replay");
        bytes memory message = _burnMessage(
            nonce, 3 * ONE_USDC, address(gateway), address(gateway), abi.encode(_fieldElement("a"), refund)
        );
        bytes memory attestation = _attest(message);

        gateway.relay(message, attestation);

        vm.expectRevert(bytes("Nonce already used"));
        gateway.relay(message, attestation);
    }

    /*//////////////////////////////////////////////////////////////
                    REFUSED BEFORE ANYTHING IS MINTED
    //////////////////////////////////////////////////////////////*/

    function test_refusesAMessageMintingToSomeoneElse() public {
        bytes memory message = _burnMessage(
            keccak256("elsewhere"), ONE_USDC, address(0xBAD), address(gateway), abi.encode(_fieldElement("a"), refund)
        );

        vm.expectRevert(VeilGateway.NotForThisGateway.selector);
        gateway.relay(message, _attest(message));
    }

    function test_refusesAMessageAnyoneElseCouldHaveDelivered() public {
        bytes memory message = _burnMessage(
            keccak256("opencaller"),
            ONE_USDC,
            address(gateway),
            address(0), // destinationCaller unset: anyone could strand these funds
            abi.encode(_fieldElement("a"), refund)
        );

        vm.expectRevert(VeilGateway.NotForThisGateway.selector);
        gateway.relay(message, _attest(message));
    }

    function test_refusesATruncatedMessage() public {
        vm.expectRevert(VeilGateway.MalformedMessage.selector);
        gateway.relay(new bytes(100), hex"");
    }

    /*//////////////////////////////////////////////////////////////
                  AFTER THE MINT: REFUND, NEVER REVERT
    //////////////////////////////////////////////////////////////*/

    function test_aMalformedHookRefundsTheSourceSenderInsteadOfLosingTheFunds() public {
        uint256 amount = 7 * ONE_USDC;
        bytes memory message = _burnMessage(keccak256("badhook"), amount, address(gateway), address(gateway), hex"1234");

        uint256 commitment = gateway.relay(message, _attest(message));

        assertEq(commitment, 0, "a commitment was created from a malformed hook");
        // The hook could not be read, so the refund address falls back to the
        // address that sent the burn on the source chain.
        assertEq(USDC.balanceOf(depositor), amount, "source sender was not refunded");
        assertEq(USDC.balanceOf(address(gateway)), 0, "gateway kept funds");
    }

    function test_aDepositBelowTheMinimumRefundsRatherThanReverts() public {
        uint256 amount = MIN_DEPOSIT - 1;
        bytes memory message = _burnMessage(
            keccak256("dust"), amount, address(gateway), address(gateway), abi.encode(_fieldElement("a"), refund)
        );

        uint256 commitment = gateway.relay(message, _attest(message));

        assertEq(commitment, 0, "dust was deposited");
        assertEq(USDC.balanceOf(refund), amount, "refund address was not paid");
    }

    function test_aPrecommitmentOutsideTheFieldRefunds() public {
        uint256 amount = 2 * ONE_USDC;
        bytes memory message = _burnMessage(
            keccak256("outoffield"), amount, address(gateway), address(gateway), abi.encode(SNARK_SCALAR_FIELD, refund)
        );

        uint256 commitment = gateway.relay(message, _attest(message));

        assertEq(commitment, 0);
        assertEq(USDC.balanceOf(depositor), amount, "source sender was not refunded");
    }

    function test_aDeadPoolRefunds() public {
        vm.prank(owner);
        entrypoint.windDownPool(IPrivacyPool(address(pool)));

        uint256 amount = 4 * ONE_USDC;
        bytes memory message = _burnMessage(
            keccak256("deadpool"), amount, address(gateway), address(gateway), abi.encode(_fieldElement("a"), refund)
        );

        uint256 commitment = gateway.relay(message, _attest(message));

        assertEq(commitment, 0);
        assertEq(USDC.balanceOf(refund), amount, "refund address was not paid");
    }

    /*//////////////////////////////////////////////////////////////
                              THE HATCH
    //////////////////////////////////////////////////////////////*/

    function test_onlyABridgedCommitmentCanBeRagequit() public {
        // The gateway knows nothing about this commitment, so it refuses before
        // spending any gas on a proof.
        vm.expectRevert(abi.encodeWithSelector(VeilGateway.UnknownCommitment.selector, uint256(1)));
        gateway.ragequit(_emptyRagequitProof(1));
    }

    /*//////////////////////////////////////////////////////////////
                              HARNESS
    //////////////////////////////////////////////////////////////*/

    function _deployProtocol() private {
        Entrypoint implementation = new Entrypoint();
        entrypoint = Entrypoint(
            payable(address(
                    new ERC1967Proxy(address(implementation), abi.encodeCall(Entrypoint.initialize, (owner, postman)))
                ))
        );

        pool = new PrivacyPoolComplex(
            address(entrypoint), address(new WithdrawalVerifier()), address(new CommitmentVerifier()), address(USDC)
        );

        vm.prank(owner);
        entrypoint.registerPool(USDC, IPrivacyPool(address(pool)), MIN_DEPOSIT, 0, 1000);

        gateway = new VeilGateway(
            IMessageTransmitterV2(TRANSMITTER), TOKEN_MESSENGER, IEntrypoint(address(entrypoint)), USDC
        );
    }

    /**
     * @dev Replaces Arc's USDC with a plain ERC-20 of the same shape. See
     *      `ArcUsdcStub` for why, and for what that costs this test.
     */
    function _stubUsdc() private {
        vm.etch(address(USDC), address(new ArcUsdcStub()).code);
        vm.label(address(USDC), "ArcUsdcStub");
    }

    /// @dev Swaps Circle's attesters for one this test holds the key to.
    function _takeOverAttesters() private {
        IAttesterAdmin transmitter = IAttesterAdmin(TRANSMITTER);
        address manager = transmitter.attesterManager();

        vm.startPrank(manager);
        transmitter.enableAttester(vm.addr(attesterPk));
        transmitter.setSignatureThreshold(1);
        vm.stopPrank();
    }

    function _relay(uint256 amount, uint256 precommitment, address refundTo, address mintTo, address caller)
        private
        returns (uint256)
    {
        bytes memory message = _burnMessage(
            keccak256(abi.encode(amount, precommitment, refundTo)),
            amount,
            mintTo,
            caller,
            abi.encode(precommitment, refundTo)
        );
        return gateway.relay(message, _attest(message));
    }

    /**
     * @dev Builds the exact bytes Circle's Iris would return: a MessageV2
     *      header wrapping a BurnMessageV2 body. Written out field by field on
     *      purpose — if an offset in VeilGateway ever drifts from the protocol,
     *      this is where it shows up.
     */
    function _burnMessage(
        bytes32 nonce,
        uint256 amount,
        address mintRecipient,
        address destinationCaller,
        bytes memory hookData
    ) private view returns (bytes memory) {
        bytes memory body = abi.encodePacked(
            MESSAGE_VERSION,
            ETHEREUM_USDC,
            bytes32(uint256(uint160(mintRecipient))),
            amount,
            bytes32(uint256(uint160(depositor))), // messageSender, on the source chain
            uint256(0), // maxFee
            uint256(0), // feeExecuted
            uint256(0), // expirationBlock
            hookData
        );

        return abi.encodePacked(
            MESSAGE_VERSION,
            ETHEREUM_DOMAIN,
            ARC_DOMAIN,
            nonce,
            bytes32(uint256(uint160(TOKEN_MESSENGER))), // sender: the remote TokenMessenger
            bytes32(uint256(uint160(TOKEN_MESSENGER))), // recipient: the local handler
            bytes32(uint256(uint160(destinationCaller))),
            FINALITY_STANDARD,
            FINALITY_STANDARD,
            body
        );
    }

    function _attest(bytes memory message) private view returns (bytes memory) {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(attesterPk, keccak256(message));
        return abi.encodePacked(r, s, v);
    }

    function _fieldElement(string memory seed) private pure returns (uint256) {
        return uint256(keccak256(bytes(seed))) % SNARK_SCALAR_FIELD;
    }

    function _emptyRagequitProof(uint256 commitment) private pure returns (ProofLib.RagequitProof memory proof) {
        proof.pubSignals[0] = commitment;
    }
}
