// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {ArcveilAccount} from "../src/ArcveilAccount.sol";
import {MandateRegistry} from "../src/MandateRegistry.sol";

/**
 * Deploys one 2-of-3 account.
 *
 *   DEVICE=0x.. COSIGNER=0x.. RECOVERY=0x.. MANDATE_REGISTRY=0x.. \
 *   MANDATE_TERMS=$'assets: USDC only\nper action: 250 USDC' \
 *     forge script script/DeployAccount.s.sol --rpc-url arc --account <name> --sender 0x.. --broadcast
 *
 * The account publishes its own first mandate in the same transaction, which is
 * the only moment it can: every later call is gated on a mandate already being
 * live, so the call that published the first one could never pass that gate.
 *
 * ENTRY_POINT defaults to the canonical v0.7 singleton, which is deployed on
 * Arc. The three keys must be three different addresses the constructor
 * enforces that, because a repeated one is 2-of-2 wearing a 2-of-3 label.
 */
contract DeployAccount is Script {
    address constant ENTRY_POINT_V07 = 0x0000000071727De22E5E9d8BAf0edAc6f37da032;

    error Missing(string variable);

    /// @dev vm.envAddress fails with a parser dump that says nothing about which
    ///      variable was wrong; this says which one, and what it wanted.
    function requireAddress(string memory name) internal view returns (address value) {
        value = vm.envOr(name, address(0));
        if (value == address(0)) revert Missing(name);
    }

    function run() external {
        address entryPoint = vm.envOr("ENTRY_POINT", ENTRY_POINT_V07);
        MandateRegistry registry = MandateRegistry(requireAddress("MANDATE_REGISTRY"));
        address device = requireAddress("DEVICE");
        address cosigner = requireAddress("COSIGNER");
        address recovery = requireAddress("RECOVERY");

        // The account registers this itself, at birth. Keep the terms you hash:
        // the chain stores only the commitment, and without the text you can
        // prove the mandate was live but never show what it said.
        string memory terms = vm.envOr("MANDATE_TERMS", string(""));
        if (bytes(terms).length == 0) revert Missing("MANDATE_TERMS");
        uint64 epoch = uint64(vm.envOr("EPOCH", uint256(1)));
        bytes32 commitment = keccak256(bytes(terms));

        vm.startBroadcast();
        ArcveilAccount account = new ArcveilAccount(entryPoint, registry, device, cosigner, recovery, epoch, commitment);
        vm.stopBroadcast();

        console2.log("ArcveilAccount ", address(account));
        console2.log("entryPoint     ", entryPoint);
        console2.log("epoch          ", epoch);
        console2.logBytes32(commitment);
        console2.log("mandate live:  ", registry.isLive(address(account), epoch, commitment));
    }
}
