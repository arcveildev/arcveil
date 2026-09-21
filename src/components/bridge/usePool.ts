"use client";

import { findOwned, nextNoteIndex, readPoolState, type OwnedDeposit, type PoolState } from "@arcveil/bridge";
import { useCallback, useEffect, useState } from "react";

import { arcClient, type VeilConfig } from "@/lib/veilConfig";

/**
 * The pool, as this browser sees it.
 *
 * Every read is a public log query against Arc. It reveals which pool is being
 * read and nothing about who is reading: the matching of deposits to notes
 * happens here, locally, against values only the veil key can derive. Nobody is
 * asked "which of these is mine".
 *
 * @dev `loading` is derived rather than set. Writing it at the top of the
 *      effect would be a synchronous setState inside an effect, which React
 *      turns into a cascading render; comparing the token of the last settled
 *      read against the current one says the same thing without the extra pass.
 */

export type PoolView = {
  readonly state: PoolState | null;
  readonly owned: readonly OwnedDeposit[];
  /** The first note index this key has never used, so a new deposit never reuses one. */
  readonly nextIndex: number;
  readonly loading: boolean;
  readonly error: string | null;
  readonly refresh: () => void;
};

type Settled = {
  readonly token: string;
  readonly state: PoolState | null;
  readonly error: string | null;
};

const NOTHING: Settled = { token: "", state: null, error: null };

export function usePool(config: VeilConfig | null, signature: `0x${string}` | null): PoolView {
  const [settled, setSettled] = useState<Settled>(NOTHING);
  const [nonce, setNonce] = useState(0);

  const token = `${config?.pool ?? "none"}:${nonce}`;

  const refresh = useCallback(() => setNonce((value) => value + 1), []);

  useEffect(() => {
    if (!config) return;

    let cancelled = false;

    readPoolState(arcClient(), config.pool, { fromBlock: config.fromBlock })
      .then((state) => {
        if (!cancelled) setSettled({ token, state, error: null });
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        // A gap in the logs is not a hiccup: the tree built from them would
        // have a root the pool has never held, so say what happened.
        setSettled({
          token,
          state: null,
          error: cause instanceof Error ? cause.message : "Could not read the pool.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [config, token]);

  const owned = settled.state && signature ? findOwned(settled.state, signature) : [];

  return {
    state: settled.state,
    owned,
    nextIndex: nextNoteIndex(owned),
    loading: config !== null && settled.token !== token,
    error: settled.error,
    refresh,
  };
}
