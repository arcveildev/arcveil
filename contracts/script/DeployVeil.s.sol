// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@oz/interfaces/IERC20.sol";
import {ERC1967Proxy} from "@oz/proxy/ERC1967/ERC1967Proxy.sol";
import {Script, console2} from "forge-std/Script.sol";

import {Entrypoint} from "contracts/Entrypoint.sol";
import {PrivacyPoolComplex} from "contracts/implementations/PrivacyPoolComplex.sol";
import {CommitmentVerifier} from "contracts/verifiers/CommitmentVerifier.sol";
import {WithdrawalVerifier} from "contracts/verifiers/WithdrawalVerifier.sol";
import {IEntrypoint} from "interfaces/IEntrypoint.sol";
import {IPrivacyPool} from "interfaces/IPrivacyPool.sol";

import {IMessageTransmitterV2, VeilGateway} from "../src/VeilGateway.sol";

/**
 * @notice Deploys the private bridge: the Privacy Pool protocol for USDC on
 *         Arc, plus the gateway that turns a CCTP burn into a deposit in it.
 *
 * @dev The deployer takes OWNER_ROLE only long enough to register the pool,
 *      then hands it to `VEIL_OWNER` and renounces its own. Leave `VEIL_OWNER`
 *      unset and the role stays with the deployer, which is a single key that
 *      can upgrade the Entrypoint — acceptable on testnet, never on mainnet.
 *
 *   POSTMAN=0x… VEIL_OWNER=0x… \
 *     forge script script/DeployVeil.s.sol --rpc-url arc_testnet --account arcveil-deployer --broadcast
 *
 * Gas on Arc is paid in USDC, so the deployer needs a USDC balance on the
 * network being deployed to.
 */
contract DeployVeil is Script {
    /// @dev Same on every mainnet CCTP domain; Arc's testnet uses the testnet set.
    address private constant TOKEN_MESSENGER_MAINNET = 0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d;
    address private constant TRANSMITTER_MAINNET = 0x81D40F21F12A8F0E3252Bccb954D722d4c464B64;
    address private constant TOKEN_MESSENGER_TESTNET = 0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA;
    address private constant TRANSMITTER_TESTNET = 0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275;

    /// @dev USDC's ERC-20 face on Arc. Six decimals; the native balance has eighteen.
    IERC20 private constant USDC = IERC20(0x3600000000000000000000000000000000000000);

    uint256 private constant ARC_MAINNET = 5042;
    uint256 private constant ARC_TESTNET = 5_042_002;

    bytes32 private constant OWNER_ROLE = keccak256("OWNER_ROLE");

    /**
     * @dev A deposit below this cannot be made at all. It is a privacy control,
     *      not a business one: dust deposits are individually identifiable, so
     *      they would weaken the anonymity set for everyone rather than join it.
     */
    uint256 private constant MINIMUM_DEPOSIT = 10e6;
    /// @dev No fee is taken on deposit. The pool is not a business yet.
    uint256 private constant VETTING_FEE_BPS = 0;
    /// @dev The ceiling a relayer may charge, not the price. 1% of the withdrawal.
    uint256 private constant MAX_RELAY_FEE_BPS = 100;

    function run() external {
        (address transmitter, address tokenMessenger) = _cctp();

        address postman = vm.envAddress("POSTMAN");
        address handover = vm.envOr("VEIL_OWNER", address(0));
        address deployer = msg.sender;

        vm.startBroadcast();

        Entrypoint entrypoint = Entrypoint(
            payable(address(
                    new ERC1967Proxy(
                        address(new Entrypoint()), abi.encodeCall(Entrypoint.initialize, (deployer, postman))
                    )
                ))
        );

        PrivacyPoolComplex pool = new PrivacyPoolComplex(
            address(entrypoint), address(new WithdrawalVerifier()), address(new CommitmentVerifier()), address(USDC)
        );

        entrypoint.registerPool(USDC, IPrivacyPool(address(pool)), MINIMUM_DEPOSIT, VETTING_FEE_BPS, MAX_RELAY_FEE_BPS);

        VeilGateway gateway =
            new VeilGateway(IMessageTransmitterV2(transmitter), tokenMessenger, IEntrypoint(address(entrypoint)), USDC);

        if (handover != address(0)) {
            entrypoint.grantRole(OWNER_ROLE, handover);
            entrypoint.renounceRole(OWNER_ROLE, deployer);
        }

        vm.stopBroadcast();

        console2.log("chain id        ", block.chainid);
        console2.log("Entrypoint      ", address(entrypoint));
        console2.log("PrivacyPool     ", address(pool));
        console2.log("VeilGateway     ", address(gateway));
        console2.log("scope           ", pool.SCOPE());
        console2.log("");
        console2.log("owner           ", handover == address(0) ? deployer : handover);
        console2.log("postman         ", postman);
        console2.log("");
        console2.log("Put these in src/data/site.ts -> ARC.veil");

        if (handover == address(0)) {
            console2.log("");
            console2.log("WARNING: OWNER_ROLE is a single key and can upgrade the Entrypoint.");
            console2.log("Set VEIL_OWNER before deploying anything that holds real money.");
        }
    }

    function _cctp() private view returns (address transmitter, address tokenMessenger) {
        if (block.chainid == ARC_MAINNET) return (TRANSMITTER_MAINNET, TOKEN_MESSENGER_MAINNET);
        if (block.chainid == ARC_TESTNET) return (TRANSMITTER_TESTNET, TOKEN_MESSENGER_TESTNET);
        revert("DeployVeil: not an Arc network");
    }
}
