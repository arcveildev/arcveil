// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {AnchorRegistry} from "../src/AnchorRegistry.sol";

contract AnchorRegistryTest is Test {
    AnchorRegistry private registry;

    address private alice = address(0xA11CE);
    address private bob = address(0xB0B);
    bytes32 private constant FIRST = keccak256("counter 1");
    bytes32 private constant SECOND = keccak256("counter 2");

    event Anchored(
        address indexed account, bytes32 indexed commitment, bytes32 indexed previous, uint64 at
    );

    function setUp() public {
        registry = new AnchorRegistry();
    }

    function test_anchorRecordsAndAdvancesHead() public {
        vm.startPrank(alice);
        registry.anchor(FIRST);
        registry.anchor(SECOND);
        vm.stopPrank();

        assertTrue(registry.isAnchored(alice, FIRST));
        assertTrue(registry.isAnchored(alice, SECOND));
        assertEq(registry.head(alice), SECOND);
        assertEq(registry.anchoredAt(alice, FIRST), uint64(block.timestamp));
    }

    function test_anchorEmitsWithThePreviousHead() public {
        vm.prank(alice);
        registry.anchor(FIRST);

        vm.expectEmit(true, true, true, true);
        emit Anchored(alice, SECOND, FIRST, uint64(block.timestamp));
        vm.prank(alice);
        registry.anchor(SECOND);
    }

    function test_cannotAnchorEmpty() public {
        vm.expectRevert(AnchorRegistry.EmptyCommitment.selector);
        vm.prank(alice);
        registry.anchor(bytes32(0));
    }

    /// Re-anchoring would let a chain fork quietly, which is the one thing anchoring exists to prevent.
    function test_cannotReanchorTheSameCommitment() public {
        vm.startPrank(alice);
        registry.anchor(FIRST);
        vm.expectRevert(abi.encodeWithSelector(AnchorRegistry.AlreadyAnchored.selector, alice, FIRST));
        registry.anchor(FIRST);
        vm.stopPrank();
    }

    function test_accountsAreIsolated() public {
        vm.prank(alice);
        registry.anchor(FIRST);

        assertFalse(registry.isAnchored(bob, FIRST));
        assertEq(registry.head(bob), bytes32(0));

        vm.prank(bob);
        registry.anchor(FIRST);
        assertTrue(registry.isAnchored(bob, FIRST));
    }

    function test_unanchoredIsReportedAsSuch() public view {
        assertFalse(registry.isAnchored(alice, FIRST));
        assertEq(registry.anchoredAt(alice, FIRST), 0);
    }
}
