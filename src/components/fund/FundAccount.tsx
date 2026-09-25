"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createOnrampKit, type OnrampEventEnvelope } from "@circle-fin/onramp-kit";
import { Button } from "@/components/ui/Button";
import { FigureLabel } from "@/components/ui/FigureLabel";
import { ONRAMP } from "@/data/onramp";
import { ARC } from "@/data/site";
import { fundingMessage } from "@/lib/fundingMessage";
import { SignStep } from "./SignStep";

type Widget = { close: () => void };
type Phase = { kind: "sign" } | { kind: "minting" } | { kind: "open" } | { kind: "error"; message: string };

const now = () => new Date().toISOString();

/**
 * Funds an Arcveil account through Circle's Onramp. The page never names a
 * destination: the Worker takes it from the signature it verified, so the
 * widget can only ever pay into the account a member signed for.
 */
export function FundAccount() {
  const [account, setAccount] = useState<string>(ARC.account ?? "");
  // Empty until the member asks for the message: the five-minute window starts
  // when they mean to sign, and nothing time-dependent is rendered on the server.
  const [issuedAt, setIssuedAt] = useState<string>("");
  const [signature, setSignature] = useState("");
  const [phase, setPhase] = useState<Phase>({ kind: "sign" });
  const [events, setEvents] = useState<readonly string[]>([]);
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<Widget | null>(null);

  useEffect(() => () => widget.current?.close(), []);

  let message = "";
  let invalidAccount = false;
  if (issuedAt !== "") {
    try {
      message = fundingMessage({ account, chainId: ARC.chainId, issuedAt });
    } catch {
      invalidAccount = true;
    }
  }

  const log = useCallback((line: string) => setEvents((prev) => [...prev, `${new Date().toLocaleTimeString()}  ${line}`]), []);

  const open = async () => {
    if (ONRAMP.sessionUrl === null || container.current === null) return;
    widget.current?.close();
    setPhase({ kind: "minting" });
    try {
      const response = await fetch(ONRAMP.sessionUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ account, issuedAt, signature }),
      });
      const body = (await response.json()) as { error?: string } & Record<string, unknown>;
      if (!response.ok) throw new Error(body.error ?? `The Worker answered ${response.status}.`);

      const kit = createOnrampKit({ widgetBaseUrl: ONRAMP.widgetBaseUrl });
      widget.current = kit.mountIframe({
        session: body as Parameters<typeof kit.mountIframe>[0]["session"],
        container: container.current,
        onAnyEvent: (envelope: OnrampEventEnvelope) => log(`${envelope.event} · ${envelope.code}`),
        onSessionExpired: () => {
          setPhase({ kind: "error", message: "The session expired. Sign a fresh message to open another." });
          setSignature("");
          setIssuedAt(now());
        },
      });
      setPhase({ kind: "open" });
      log(`session opened · pays into ${account}`);
    } catch (error) {
      setPhase({ kind: "error", message: error instanceof Error ? error.message : String(error) });
    }
  };

  const ready = ONRAMP.sessionUrl !== null && message !== "" && /^0x[0-9a-fA-F]{130}$/.test(signature);

  return (
    <div className="grid grid-cols-1 border-t border-border lg:grid-cols-2">
      <div className="flex flex-col border-b border-border lg:border-r lg:border-b-0">
        <FigureLabel n={1} />
        <div className="flex flex-col gap-4 px-4 pb-5 md:px-5">
          <label className="flex flex-col gap-1.5">
            <span className="label-2xs text-fg-muted">Arcveil account to fund</span>
            <input
              value={account}
              onChange={(event) => {
                setAccount(event.target.value.trim());
                setSignature("");
              }}
              spellCheck={false}
              className="hairline bg-surface-card p-3 font-mono text-2xs text-fg focus:border-fg/40 focus:outline-none"
            />
          </label>
          {invalidAccount ? (
            <p className="font-mono text-2xs text-chart-5">That is not an address.</p>
          ) : message === "" ? (
            <Button variant="ghost" arrow={false} className="hairline" onClick={() => setIssuedAt(now())}>
              Write the message
            </Button>
          ) : (
            <SignStep
              message={message}
              signature={signature}
              onSignature={setSignature}
              onRefresh={() => {
                setIssuedAt(now());
                setSignature("");
              }}
            />
          )}
          <div className="flex items-center gap-2">
            <Button onClick={() => void open()} disabled={!ready || phase.kind === "minting"}>
              {phase.kind === "minting" ? "Opening" : "Open onramp"}
            </Button>
            <p className="label-2xs ml-auto text-fg-faint">Membership read on Arc {ARC.chainId}</p>
          </div>
          {ONRAMP.sessionUrl === null && (
            <p className="font-mono text-2xs leading-140 text-fg-muted">The funding service is not configured on this build.</p>
          )}
          {phase.kind === "error" && <p className="font-mono text-2xs leading-140 text-chart-5">{phase.message}</p>}
        </div>
      </div>

      <div className="flex flex-col">
        <FigureLabel n={2} />
        <div ref={container} className="h-[720px] w-full border-y border-border bg-surface-card" />
        <ul className="flex min-h-24 flex-col gap-1 p-4 md:p-5">
          {events.length === 0 ? (
            <li className="text-sm leading-140 text-fg-muted">
              Sign, then open. The widget runs on Circle&apos;s origin; card details never touch this page.
            </li>
          ) : (
            events.map((line, index) => (
              <li key={index} className="font-mono text-2xs leading-140 text-fg-muted">
                {line}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
