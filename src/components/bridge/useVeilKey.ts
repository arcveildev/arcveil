"use client";

import { veilKeyTypedData } from "@arcveil/bridge";
import { useCallback, useState } from "react";
import { useSignTypedData } from "wagmi";

import { veilArcChain } from "@/lib/veilNetwork";

/**
 * The one signature every note is derived from.
 *
 * It lives in React state and nowhere else: not localStorage, not a cookie,
 * not a server. Reloading the page asks for it again, which is the cost of not
 * keeping a copy of something that can spend every deposit derived from it.
 *
 * The typed data says that out loud, in the message the wallet renders, so a
 * person is told what they are signing by the thing asking them to sign it.
 */
export type VeilKey = {
  readonly signature: `0x${string}` | null;
  readonly signing: boolean;
  readonly error: string | null;
  readonly sign: () => Promise<`0x${string}` | null>;
  readonly forget: () => void;
};

export function useVeilKey(gateway: `0x${string}` | null): VeilKey {
  const { signTypedDataAsync } = useSignTypedData();
  const [signature, setSignature] = useState<`0x${string}` | null>(null);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sign = useCallback(async () => {
    if (!gateway) {
      setError("The signature is bound to the gateway's address, which does not exist yet.");
      return null;
    }

    setSigning(true);
    setError(null);
    try {
      const produced = await signTypedDataAsync(veilKeyTypedData(veilArcChain().id, gateway));
      setSignature(produced);
      return produced;
    } catch (cause) {
      // A refused signature is a choice, not a fault; say so without alarm.
      setError(cause instanceof Error && /reject|denied/i.test(cause.message) ? "Signature refused." : "Could not sign.");
      return null;
    } finally {
      setSigning(false);
    }
  }, [gateway, signTypedDataAsync]);

  const forget = useCallback(() => {
    setSignature(null);
    setError(null);
  }, []);

  return { signature, signing, error, sign, forget };
}
