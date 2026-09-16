// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {MandateRegistry} from "../src/MandateRegistry.sol";
import {AnchorRegistry} from "../src/AnchorRegistry.sol";

/**
 * Deploys both registries. Neither holds funds nor gains authority over any.
 *
 *   forge script script/Deploy.s.sol --rpc-url arc_testnet --account <name> --broadcast
 *   forge script script/Deploy.s.sol --rpc-url arc      --account <name> --broadcast
 *
 * `--account` reads a keystore you created with `cast wallet import`; the key
 * never appears in a file, an env var, or this repository.
 */
contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        MandateRegistry mandates = new MandateRegistry();
        AnchorRegistry anchors = new AnchorRegistry();

        vm.stopBroadcast();

        console2.log("chain id          ", block.chainid);
        console2.log("MandateRegistry   ", address(mandates));
        console2.log("AnchorRegistry    ", address(anchors));
        console2.log("");
        console2.log("Put these in src/data/site.ts -> ARC.mandateRegistry / ARC.anchorRegistry");
    }
}
