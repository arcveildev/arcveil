// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test, console2} from "forge-std/Test.sol";
import {PoseidonT3} from "poseidon/PoseidonT3.sol";
import {PoseidonT4} from "poseidon/PoseidonT4.sol";

/**
 * @notice Prints the Poseidon hashes the pool computes, so the TypeScript side
 *         can be checked against them rather than assumed to agree.
 * @dev A commitment hashed differently off-chain than on-chain produces a note
 *      whose funds cannot be withdrawn — silent, total, and only discovered
 *      with real money in the pool. `packages/bridge/src/note.test.ts` asserts
 *      the same vectors.
 */
contract PoseidonVectorsTest is Test {
    function test_printVectors() public pure {
        console2.log("T3(1,2)            ", PoseidonT3.hash([uint256(1), uint256(2)]));
        console2.log("T3(0,0)            ", PoseidonT3.hash([uint256(0), uint256(0)]));
        console2.log("T4(1,2,3)          ", PoseidonT4.hash([uint256(1), uint256(2), uint256(3)]));
        console2.log(
            "T3(nullifier,secret)", PoseidonT3.hash([uint256(0x1111111111111111), uint256(0x2222222222222222)])
        );
        console2.log(
            "T4(25e6,label,pre)  ",
            PoseidonT4.hash(
                [
                    uint256(25_000_000),
                    uint256(0x3333333333333333),
                    PoseidonT3.hash([uint256(0x1111111111111111), uint256(0x2222222222222222)])
                ]
            )
        );
    }
}
