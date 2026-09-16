// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {ArcveilAccount} from "../src/ArcveilAccount.sol";
import {MandateRegistry} from "../src/MandateRegistry.sol";

contract Target {
    uint256 public seen;
    bool private failing;

    function ping(uint256 value) external payable returns (uint256) {
        if (failing) revert("target says no");
        seen = value;
        return value * 2;
    }

    function setFailing(bool v) external {
        failing = v;
    }
}

contract ArcveilAccountTest is Test {
    ArcveilAccount private account;
    MandateRegistry private registry;
    Target private target;

    address private entryPoint = address(0xEEEE);

    uint256 private deviceKey = 0xA1;
    uint256 private cosignerKey = 0xB2;
    uint256 private recoveryKey = 0xC3;
    uint256 private strangerKey = 0xD4;

    uint64 private constant EPOCH = 1;
    bytes32 private constant MANDATE = keccak256("mandate terms");

    function setUp() public {
        registry = new MandateRegistry();
        target = new Target();
        account =
            new ArcveilAccount(entryPoint, registry, vm.addr(deviceKey), vm.addr(cosignerKey), vm.addr(recoveryKey));

        vm.prank(address(account));
        registry.register(EPOCH, MANDATE);

        vm.deal(address(account), 10 ether);
    }

    function call_(uint256 value) private view returns (ArcveilAccount.Call memory) {
        return ArcveilAccount.Call({to: address(target), value: value, data: abi.encodeCall(Target.ping, (42))});
    }

    function sign(uint256 key, ArcveilAccount.Call memory c, uint64 deadline, uint64 epoch, bytes32 mandate)
        private
        view
        returns (bytes memory)
    {
        bytes32 digest = account.intentDigest(c, account.nonce(), deadline, epoch, mandate);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(key, digest);
        return abi.encodePacked(r, s, v);
    }

    function exec(uint256 keyA, uint256 keyB) private returns (bytes memory) {
        ArcveilAccount.Call memory c = call_(0);
        uint64 deadline = uint64(block.timestamp + 1 hours);
        return account.execute(
            c,
            deadline,
            EPOCH,
            MANDATE,
            sign(keyA, c, deadline, EPOCH, MANDATE),
            sign(keyB, c, deadline, EPOCH, MANDATE)
        );
    }

    // ---------------------------------------------------------- construction

    function test_refusesAZeroMember() public {
        address dev = vm.addr(deviceKey);
        address rec = vm.addr(recoveryKey);
        vm.expectRevert(ArcveilAccount.ZeroAddress.selector);
        new ArcveilAccount(entryPoint, registry, dev, address(0), rec);
    }

    function test_refusesAZeroRegistry() public {
        address dev = vm.addr(deviceKey);
        address cos = vm.addr(cosignerKey);
        address rec = vm.addr(recoveryKey);
        vm.expectRevert(ArcveilAccount.ZeroAddress.selector);
        new ArcveilAccount(entryPoint, MandateRegistry(address(0)), dev, cos, rec);
    }

    /// Repeating a key is 2-of-2 wearing a 2-of-3 label.
    function test_refusesARepeatedKey() public {
        address dev = vm.addr(deviceKey);
        address rec = vm.addr(recoveryKey);
        vm.expectRevert(ArcveilAccount.KeysMustDiffer.selector);
        new ArcveilAccount(entryPoint, registry, dev, dev, rec);
    }

    // ------------------------------------------------------------ the pairs

    function test_deviceAndCosignerExecute() public {
        bytes memory out = exec(deviceKey, cosignerKey);
        assertEq(abi.decode(out, (uint256)), 84);
        assertEq(target.seen(), 42);
        assertEq(account.nonce(), 1);
    }

    /// The claim that the co-signer is refusable, not custodial: funds move without it.
    function test_deviceAndRecoveryExecuteWithoutTheCosigner() public {
        exec(deviceKey, recoveryKey);
        assertEq(target.seen(), 42);
    }

    /// And the claim that a lost device is survivable.
    function test_cosignerAndRecoveryExecuteWithoutTheDevice() public {
        exec(cosignerKey, recoveryKey);
        assertEq(target.seen(), 42);
    }

    function test_valueIsForwarded() public {
        ArcveilAccount.Call memory c = call_(1 ether);
        uint64 deadline = uint64(block.timestamp + 1 hours);
        account.execute(
            c,
            deadline,
            EPOCH,
            MANDATE,
            sign(deviceKey, c, deadline, EPOCH, MANDATE),
            sign(cosignerKey, c, deadline, EPOCH, MANDATE)
        );
        assertEq(address(target).balance, 1 ether);
    }

    // --------------------------------------------------------- what it refuses

    function test_oneKeyTwiceIsNotTwoKeys() public {
        ArcveilAccount.Call memory c = call_(0);
        uint64 deadline = uint64(block.timestamp + 1 hours);
        bytes memory sig = sign(deviceKey, c, deadline, EPOCH, MANDATE);
        vm.expectRevert(abi.encodeWithSelector(ArcveilAccount.DuplicateSigner.selector, vm.addr(deviceKey)));
        account.execute(c, deadline, EPOCH, MANDATE, sig, sig);
    }

    function test_strangerIsRefused() public {
        ArcveilAccount.Call memory c = call_(0);
        uint64 deadline = uint64(block.timestamp + 1 hours);
        bytes memory a = sign(deviceKey, c, deadline, EPOCH, MANDATE);
        bytes memory b = sign(strangerKey, c, deadline, EPOCH, MANDATE);

        vm.expectRevert(abi.encodeWithSelector(ArcveilAccount.NotAMember.selector, vm.addr(strangerKey)));
        account.execute(c, deadline, EPOCH, MANDATE, a, b);
    }

    function test_signaturesDoNotReplay() public {
        ArcveilAccount.Call memory c = call_(0);
        uint64 deadline = uint64(block.timestamp + 1 hours);
        bytes memory a = sign(deviceKey, c, deadline, EPOCH, MANDATE);
        bytes memory b = sign(cosignerKey, c, deadline, EPOCH, MANDATE);

        account.execute(c, deadline, EPOCH, MANDATE, a, b);

        // The nonce moved, so the same pair no longer recovers to members.
        vm.expectRevert();
        account.execute(c, deadline, EPOCH, MANDATE, a, b);
    }

    function test_expiredIntentIsRefused() public {
        ArcveilAccount.Call memory c = call_(0);
        // forge-lint: disable-next-line(environment-read-across-mutation)
        uint64 deadline = uint64(block.timestamp + 1 hours);
        bytes memory a = sign(deviceKey, c, deadline, EPOCH, MANDATE);
        bytes memory b = sign(cosignerKey, c, deadline, EPOCH, MANDATE);

        vm.warp(deadline + 1);
        vm.expectRevert(abi.encodeWithSelector(ArcveilAccount.Expired.selector, deadline));
        account.execute(c, deadline, EPOCH, MANDATE, a, b);
    }

    /// The whole thesis on chain: revoke, and the agent stops — no policy engine involved.
    function test_revokedMandateStopsExecution() public {
        ArcveilAccount.Call memory c = call_(0);
        uint64 deadline = uint64(block.timestamp + 1 hours);
        bytes memory a = sign(deviceKey, c, deadline, EPOCH, MANDATE);
        bytes memory b = sign(cosignerKey, c, deadline, EPOCH, MANDATE);

        vm.prank(address(account));
        registry.revoke(EPOCH);

        vm.expectRevert(abi.encodeWithSelector(ArcveilAccount.MandateNotLive.selector, EPOCH, MANDATE));
        account.execute(c, deadline, EPOCH, MANDATE, a, b);
    }

    function test_unregisteredMandateIsRefused() public {
        bytes32 other = keccak256("never published");
        ArcveilAccount.Call memory c = call_(0);
        uint64 deadline = uint64(block.timestamp + 1 hours);
        bytes memory a = sign(deviceKey, c, deadline, EPOCH, other);
        bytes memory b = sign(cosignerKey, c, deadline, EPOCH, other);

        vm.expectRevert(abi.encodeWithSelector(ArcveilAccount.MandateNotLive.selector, EPOCH, other));
        account.execute(c, deadline, EPOCH, other, a, b);
    }

    function test_malformedSignatureIsRefused() public {
        ArcveilAccount.Call memory c = call_(0);
        uint64 deadline = uint64(block.timestamp + 1 hours);
        bytes memory a = sign(deviceKey, c, deadline, EPOCH, MANDATE);

        vm.expectRevert(ArcveilAccount.MalformedSignature.selector);
        account.execute(c, deadline, EPOCH, MANDATE, a, hex"1234");
    }

    function test_targetRevertBubbles() public {
        ArcveilAccount.Call memory c = call_(0);
        uint64 deadline = uint64(block.timestamp + 1 hours);
        bytes memory a = sign(deviceKey, c, deadline, EPOCH, MANDATE);
        bytes memory b = sign(cosignerKey, c, deadline, EPOCH, MANDATE);

        target.setFailing(true);
        vm.expectRevert(
            abi.encodeWithSelector(
                ArcveilAccount.CallReverted.selector, abi.encodeWithSignature("Error(string)", "target says no")
            )
        );
        account.execute(c, deadline, EPOCH, MANDATE, a, b);
    }

    // -------------------------------------------------------------- ERC-4337

    function test_validateUserOpAcceptsTwoMembers() public {
        bytes32 opHash = keccak256("user op");
        bytes32 digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", opHash));
        (uint8 v1, bytes32 r1, bytes32 s1) = vm.sign(deviceKey, digest);
        (uint8 v2, bytes32 r2, bytes32 s2) = vm.sign(cosignerKey, digest);

        vm.prank(entryPoint);
        uint256 result =
            account.validateUserOp(opHash, abi.encode(abi.encodePacked(r1, s1, v1), abi.encodePacked(r2, s2, v2)), 0);
        assertEq(result, 0);
    }

    function test_validateUserOpRejectsAStranger() public {
        bytes32 opHash = keccak256("user op");
        bytes32 digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", opHash));
        (uint8 v1, bytes32 r1, bytes32 s1) = vm.sign(deviceKey, digest);
        (uint8 v2, bytes32 r2, bytes32 s2) = vm.sign(strangerKey, digest);

        vm.prank(entryPoint);
        uint256 result =
            account.validateUserOp(opHash, abi.encode(abi.encodePacked(r1, s1, v1), abi.encodePacked(r2, s2, v2)), 0);
        assertEq(result, 1, "must fail validation, not revert");
    }

    function test_validateUserOpPaysThePrefund() public {
        bytes32 opHash = keccak256("user op");
        bytes32 digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", opHash));
        (uint8 v1, bytes32 r1, bytes32 s1) = vm.sign(deviceKey, digest);
        (uint8 v2, bytes32 r2, bytes32 s2) = vm.sign(cosignerKey, digest);

        uint256 before = entryPoint.balance;
        vm.prank(entryPoint);
        account.validateUserOp(opHash, abi.encode(abi.encodePacked(r1, s1, v1), abi.encodePacked(r2, s2, v2)), 1 ether);
        assertEq(entryPoint.balance - before, 1 ether);
    }

    function test_onlyTheEntryPointMayUseItsPaths() public {
        vm.expectRevert(ArcveilAccount.NotEntryPoint.selector);
        account.validateUserOp(keccak256("x"), abi.encode(bytes(""), bytes("")), 0);

        vm.expectRevert(ArcveilAccount.NotEntryPoint.selector);
        account.executeFromEntryPoint(call_(0), EPOCH, MANDATE);
    }

    function test_entryPointPathStillChecksTheMandate() public {
        vm.prank(address(account));
        registry.revoke(EPOCH);

        vm.prank(entryPoint);
        vm.expectRevert(abi.encodeWithSelector(ArcveilAccount.MandateNotLive.selector, EPOCH, MANDATE));
        account.executeFromEntryPoint(call_(0), EPOCH, MANDATE);
    }

    /**
     * The same fixture is asserted in packages/sdk/src/account.test.ts. Both
     * sides must agree on this digest: if the typehash, the domain or the field
     * order drifts on either side, one of the two suites fails — which is the
     * only way a signing seam like this ever announces itself. It would
     * otherwise surface as "signature invalid" against a live account.
     */
    function test_digestMatchesTheSdk() public {
        address fixedAccount =
            address(uint160(uint256(bytes32(hex"acacacacacacacacacacacacacacacacacacacacacacacacacacacacacacacac"))));
        vm.etch(fixedAccount, address(account).code);
        vm.chainId(5042);

        ArcveilAccount.Call memory c =
            ArcveilAccount.Call({to: 0x7A7a7A7a7a7a7a7A7a7a7a7A7a7A7A7A7A7A7a7A, value: 1 ether, data: hex"deadbeef"});

        bytes32 digest = ArcveilAccount(payable(fixedAccount))
            .intentDigest(
                c,
                3,
                1789600000,
                1,
                bytes32(uint256(0x4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d))
            );

        assertEq(digest, 0x883a1593ae07a432f4b909e2ed822cba681df6b2cb71d946344d762fb4b55255);
    }

    function testFuzz_onlyMembersAreMembers(uint256 key) public view {
        key = bound(key, 1, type(uint128).max);
        address who = vm.addr(key);
        bool expected = who == vm.addr(deviceKey) || who == vm.addr(cosignerKey) || who == vm.addr(recoveryKey);
        assertEq(account.isMember(who), expected);
    }
}
