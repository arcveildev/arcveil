// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test, console2} from "forge-std/Test.sol";

import {Constants} from "contracts/lib/Constants.sol";
import {IEntrypoint} from "interfaces/IEntrypoint.sol";
import {IPrivacyPool} from "interfaces/IPrivacyPool.sol";

/**
 * @notice Prints the `context` signal the pool recomputes for a withdrawal, so
 *         the TypeScript that binds a proof to one can be checked against it.
 * @dev `context` is what stops a relayer redirecting a withdrawal or raising
 *      its own fee. Computed differently off-chain, every proof is refused —
 *      and the refusal would look like a bad proof rather than a bad encoding.
 */
contract ContextVectorsTest is Test {
    function test_printContext() public pure {
        IEntrypoint.RelayData memory relay = IEntrypoint.RelayData({
            recipient: 0x00000000000000000000000000000000000000A1,
            feeRecipient: 0x00000000000000000000000000000000000000b2,
            relayFeeBPS: 25
        });

        IPrivacyPool.Withdrawal memory withdrawal =
            IPrivacyPool.Withdrawal({processooor: 0x00000000000000000000000000000000000000C3, data: abi.encode(relay)});

        console2.log("relayData   ", vm.toString(withdrawal.data));
        console2.log(
            "context     ", uint256(keccak256(abi.encode(withdrawal, uint256(777)))) % Constants.SNARK_SCALAR_FIELD
        );
    }
}
