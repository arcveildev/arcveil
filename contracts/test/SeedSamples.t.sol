// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {SeedSamples} from "../script/SeedSamples.s.sol";
import {MandateRegistry} from "../src/MandateRegistry.sol";
import {AnchorRegistry} from "../src/AnchorRegistry.sol";

contract SeedSamplesTest is Test {
    SeedSamples private seeder;
    MandateRegistry private mandates;
    AnchorRegistry private anchors;

    function setUp() public {
        seeder = new SeedSamples();
        mandates = new MandateRegistry();
        anchors = new AnchorRegistry();
    }

    function demo() private view returns (SeedSamples.Demo memory) {
        bytes32[] memory counters = new bytes32[](2);
        counters[0] = keccak256("counter 0");
        counters[1] = keccak256("counter 1");
        // The seeder calls the registries, so it is the account the samples belong to.
        return
            SeedSamples.Demo({account: address(seeder), epoch: 1, commitment: keccak256("terms"), counters: counters});
    }

    function test_seedPublishesTheMandateAndEveryAnchor() public {
        SeedSamples.Demo memory d = demo();
        seeder.seed(mandates, anchors, d);

        assertTrue(mandates.isLive(d.account, d.epoch, d.commitment));
        assertTrue(anchors.isAnchored(d.account, d.counters[0]));
        assertTrue(anchors.isAnchored(d.account, d.counters[1]));
        assertEq(anchors.head(d.account), d.counters[1]);
    }

    /// A re-run after a partial failure must not revert on what already landed.
    function test_seedIsIdempotent() public {
        SeedSamples.Demo memory d = demo();
        seeder.seed(mandates, anchors, d);
        seeder.seed(mandates, anchors, d);

        assertTrue(mandates.isLive(d.account, d.epoch, d.commitment));
        assertTrue(anchors.isAnchored(d.account, d.counters[1]));
    }

    function test_seedResumesAfterAPartialRun() public {
        SeedSamples.Demo memory d = demo();

        vm.prank(address(seeder));
        anchors.anchor(d.counters[0]);

        seeder.seed(mandates, anchors, d);

        assertTrue(mandates.isLive(d.account, d.epoch, d.commitment));
        assertTrue(anchors.isAnchored(d.account, d.counters[1]));
    }

    function test_requireSenderAcceptsTheOwner() public view {
        seeder.requireSender(address(0xA11CE), address(0xA11CE));
    }

    /// Regression: this check used to read msg.sender inside a broadcast, which
    /// is the script's caller rather than the signing wallet — Foundry refuses it.
    function test_requireSenderRejectsAnyoneElse() public {
        vm.expectRevert(abi.encodeWithSelector(SeedSamples.WrongSender.selector, address(0xA11CE), address(0xB0B)));
        seeder.requireSender(address(0xA11CE), address(0xB0B));
    }

    function test_readDemoMatchesTheGeneratedFile() public view {
        SeedSamples.Demo memory d = seeder.readDemo();
        assertTrue(d.commitment != bytes32(0), "commitment missing");
        assertEq(d.counters.length, 4, "expected four budget commitments");
        assertGt(uint256(d.epoch), 0, "epoch must be set");
    }
}
