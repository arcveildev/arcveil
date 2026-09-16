// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {ArcveilAccount} from "../src/ArcveilAccount.sol";
import {MandateRegistry} from "../src/MandateRegistry.sol";

/**
 * Deploys one 2-of-3 account.
 *
 *   DEVICE=0x.. COSIGNER=0x.. RECOVERY=0x.. MANDATE_REGISTRY=0x.. \
 *     forge script script/DeployAccount.s.sol --rpc-url arc --account <name> --sender 0x.. --broadcast
 *
 * ENTRY_POINT defaults to the canonical v0.7 singleton, which is deployed on
 * Arc. The three keys must be three different addresses the constructor
 * enforces that, because a repeated one is 2-of-2 wearing a 2-of-3 label.
 */
contract DeployAccount is Script {
    address constant ENTRY_POINT_V07 = 0x0000000071727De22E5E9d8BAf0edAc6f37da032;

    function run() external {
        address entryPoint = vm.envOr("ENTRY_POINT", ENTRY_POINT_V07);
        MandateRegistry registry = MandateRegistry(vm.envAddress("MANDATE_REGISTRY"));
        address device = vm.envAddress("DEVICE");
        address cosigner = vm.envAddress("COSIGNER");
        address recovery = vm.envAddress("RECOVERY");

        vm.startBroadcast();
        ArcveilAccount account = new ArcveilAccount(entryPoint, registry, device, cosigner, recovery);
        vm.stopBroadcast();

        console2.log("ArcveilAccount ", address(account));
        console2.log("entryPoint     ", entryPoint);
        console2.log("");
        console2.log("Next: register a mandate FROM THE ACCOUNT, not from your wallet --");
        console2.log("the registry keys by msg.sender, and execution is gated on the");
        console2.log("account's own mandate being live.");
    }
}
