"use client";

import { useMemo } from "react";

import { veilConfig } from "@/lib/veilConfig";
import { DepositPanel } from "./DepositPanel";
import { NotDeployed } from "./NotDeployed";
import { PoolStrip } from "./PoolStrip";
import { ProvePanel } from "./ProvePanel";
import { usePool } from "./usePool";
import { useVeilKey } from "./useVeilKey";
import { WithdrawPanel } from "./WithdrawPanel";

/**
 * Holds the two things both halves of the bridge need: the veil key, and the
 * pool as this browser sees it.
 *
 * They live here rather than in each panel so that signing once is enough, and
 * so a deposit refreshes the list a withdrawal reads from.
 *
 * While nothing is deployed the page shows what is missing and keeps the one
 * part that works — proving — alive, because a proof built here is the claim
 * this whole thing rests on and it should be possible to check it before
 * trusting anyone with money.
 */
export function BridgeApp() {
  const state = useMemo(() => veilConfig(), []);
  const config = state.ready ? state.config : null;

  const veilKey = useVeilKey(config?.gateway ?? null);
  const pool = usePool(config, veilKey.signature);

  return (
    <>
      <PoolStrip pool={pool} ready={state.ready} />
      <div className="grid grid-cols-1 border-t border-border lg:grid-cols-3">
        <div className="border-b border-border lg:border-r lg:border-b-0">
          <DepositPanel
            config={config}
            veilKey={veilKey}
            nextIndex={pool.nextIndex}
            onDeposited={pool.refresh}
          />
        </div>
        <div className="border-b border-border lg:border-r lg:border-b-0">
          {state.ready ? (
            <WithdrawPanel
              config={config}
              veilKey={veilKey}
              state={pool.state}
              owned={pool.owned}
              nextIndex={pool.nextIndex}
              onWithdrawn={pool.refresh}
            />
          ) : (
            <NotDeployed />
          )}
        </div>
        <ProvePanel />
      </div>
    </>
  );
}
