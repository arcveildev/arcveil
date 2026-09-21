// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test, console2} from "forge-std/Test.sol";
import {InternalLeanIMT, LeanIMTData} from "lean-imt/InternalLeanIMT.sol";

/**
 * @notice Prints LeanIMT roots from the library the pool inserts into, so the
 *         TypeScript that builds the same trees off-chain can be checked
 *         against them.
 * @dev The state tree decides which commitments exist and the ASP tree decides
 *      which labels are spendable. A root computed differently off-chain than
 *      on-chain makes every proof fail — which is the safe failure, but it
 *      fails after the user has waited for a 17 MB proving key.
 */
contract LeanImtVectorsTest is Test {
    using InternalLeanIMT for LeanIMTData;

    LeanIMTData private tree;

    function test_printRoots() public {
        uint256[5] memory leaves = [uint256(1), 2, 3, 4, 5];
        for (uint256 i; i < leaves.length; ++i) {
            tree._insert(leaves[i]);
            console2.log("after leaf", leaves[i], tree._root());
        }
    }
}
