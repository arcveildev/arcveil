// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {MandateRegistry} from "../src/MandateRegistry.sol";
import {AnchorRegistry} from "../src/AnchorRegistry.sol";

/**
 * Publishes the demo mandate and its budget commitments, so the samples on
 * /verify resolve against Arc instead of reporting unknown.
 *
 *   ARC_SAMPLE_ACCOUNT=0xYourDeployer pnpm gen:receipts   # writes demo/mandate.json
 *   MANDATE_REGISTRY=0x.. ANCHOR_REGISTRY=0x.. \
 *     forge script script/SeedSamples.s.sol --rpc-url arc --account <name> --broadcast
 *
 * The caller must be the account named in demo/mandate.json: both registries
 * key everything by msg.sender, so seeding from another wallet would publish a
 * mandate nobody's receipts refer to.
 */
contract SeedSamples is Script {
    struct Demo {
        address account;
        uint64 epoch;
        bytes32 commitment;
        bytes32[] counters;
    }

    error WrongSender(address expected, address actual);

    function run() external {
        Demo memory demo = readDemo();
        MandateRegistry mandates = MandateRegistry(vm.envAddress("MANDATE_REGISTRY"));
        AnchorRegistry anchors = AnchorRegistry(vm.envAddress("ANCHOR_REGISTRY"));

        vm.startBroadcast();
        if (msg.sender != demo.account) revert WrongSender(demo.account, msg.sender);
        seed(mandates, anchors, demo);
        vm.stopBroadcast();

        console2.log("mandate live:", mandates.isLive(demo.account, demo.epoch, demo.commitment));
        console2.log("anchors:", demo.counters.length);
    }

    /// @dev Separated from run() so it can be tested without broadcasting, and
    ///      idempotent so a re-run after a partial failure is safe.
    function seed(MandateRegistry mandates, AnchorRegistry anchors, Demo memory demo) public {
        if (mandates.mandateOf(demo.account, demo.epoch).commitment == bytes32(0)) {
            mandates.register(demo.epoch, demo.commitment);
        }
        for (uint256 i = 0; i < demo.counters.length; i++) {
            if (!anchors.isAnchored(demo.account, demo.counters[i])) {
                anchors.anchor(demo.counters[i]);
            }
        }
    }

    function readDemo() public view returns (Demo memory) {
        string memory json = vm.readFile("demo/mandate.json");
        return Demo({
            account: vm.parseJsonAddress(json, ".account"),
            epoch: uint64(vm.parseJsonUint(json, ".epoch")),
            commitment: vm.parseJsonBytes32(json, ".commitment"),
            counters: vm.parseJsonBytes32Array(json, ".counters")
        });
    }
}
