// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {MandateRegistry} from "../src/MandateRegistry.sol";

contract MandateRegistryTest is Test {
    MandateRegistry private registry;

    address private alice = address(0xA11CE);
    address private bob = address(0xB0B);
    bytes32 private constant COMMITMENT = keccak256("mandate terms");
    bytes32 private constant OTHER = keccak256("other terms");

    event MandateRegistered(address indexed account, uint64 indexed epoch, bytes32 indexed commitment, uint64 at);
    event MandateRevoked(address indexed account, uint64 indexed epoch, uint64 at);

    function setUp() public {
        registry = new MandateRegistry();
    }

    function test_registerStoresTheCommitment() public {
        vm.prank(alice);
        registry.register(7, COMMITMENT);

        MandateRegistry.Mandate memory mandate = registry.mandateOf(alice, 7);
        assertEq(mandate.commitment, COMMITMENT);
        assertEq(mandate.revokedAt, 0);
        assertTrue(registry.isLive(alice, 7, COMMITMENT));
    }

    function test_registerEmits() public {
        vm.expectEmit(true, true, true, true);
        emit MandateRegistered(alice, 7, COMMITMENT, uint64(block.timestamp));
        vm.prank(alice);
        registry.register(7, COMMITMENT);
    }

    /// The property the whole format rests on: terms cannot be rewritten later.
    function test_cannotOverwriteAnEpoch() public {
        vm.startPrank(alice);
        registry.register(7, COMMITMENT);
        vm.expectRevert(abi.encodeWithSelector(MandateRegistry.AlreadyRegistered.selector, alice, 7));
        registry.register(7, OTHER);
        vm.stopPrank();
    }

    function test_cannotRegisterEmptyCommitment() public {
        vm.expectRevert(MandateRegistry.EmptyCommitment.selector);
        vm.prank(alice);
        registry.register(7, bytes32(0));
    }

    function test_revokeMarksTheEpochAndKillsIsLive() public {
        vm.startPrank(alice);
        registry.register(7, COMMITMENT);
        registry.revoke(7);
        vm.stopPrank();

        assertEq(registry.mandateOf(alice, 7).revokedAt, uint64(block.timestamp));
        assertFalse(registry.isLive(alice, 7, COMMITMENT));
        // The commitment itself survives, so receipts issued earlier stay checkable.
        assertEq(registry.mandateOf(alice, 7).commitment, COMMITMENT);
    }

    function test_cannotRevokeUnregistered() public {
        vm.expectRevert(abi.encodeWithSelector(MandateRegistry.NotRegistered.selector, alice, 7));
        vm.prank(alice);
        registry.revoke(7);
    }

    function test_cannotRevokeTwice() public {
        vm.startPrank(alice);
        registry.register(7, COMMITMENT);
        registry.revoke(7);
        vm.expectRevert(abi.encodeWithSelector(MandateRegistry.AlreadyRevoked.selector, alice, 7));
        registry.revoke(7);
        vm.stopPrank();
    }

    function test_isLiveRejectsAnotherCommitment() public {
        vm.prank(alice);
        registry.register(7, COMMITMENT);
        assertFalse(registry.isLive(alice, 7, OTHER));
    }

    function test_accountsAreIsolated() public {
        vm.prank(alice);
        registry.register(7, COMMITMENT);
        assertFalse(registry.isLive(bob, 7, COMMITMENT));
        assertEq(registry.mandateOf(bob, 7).commitment, bytes32(0));
    }

    function test_epochsAreIndependent() public {
        vm.startPrank(alice);
        registry.register(7, COMMITMENT);
        registry.register(8, OTHER);
        registry.revoke(7);
        vm.stopPrank();

        assertFalse(registry.isLive(alice, 7, COMMITMENT));
        assertTrue(registry.isLive(alice, 8, OTHER));
    }

    function testFuzz_onlyTheRegisteringAccountCanRevoke(address stranger) public {
        vm.assume(stranger != alice);
        vm.prank(alice);
        registry.register(7, COMMITMENT);

        vm.expectRevert(abi.encodeWithSelector(MandateRegistry.NotRegistered.selector, stranger, 7));
        vm.prank(stranger);
        registry.revoke(7);

        assertTrue(registry.isLive(alice, 7, COMMITMENT));
    }
}
