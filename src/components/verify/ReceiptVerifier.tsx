"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FigureLabel } from "@/components/ui/FigureLabel";
import { RECEIPT_SAMPLES, SAMPLE_CHAIN_STATE } from "@/data/receiptSamples";
import { createMemoryChainReader } from "@/lib/receipt/chain";
import { parseReceiptInput } from "@/lib/receipt/schema";
import { verifyReceipts } from "@/lib/receipt/verify";
import type { VerificationReport } from "@/lib/receipt/types";
import { cn } from "@/lib/cn";
import { CheckList } from "./CheckList";
import { StatusPill } from "./StatusPill";

/** v0 reads a fixture instead of Robinhood Chain; the RPC reader drops in here later. */
const chain = createMemoryChainReader(SAMPLE_CHAIN_STATE);

type State = { report: VerificationReport | null; errors: readonly string[]; busy: boolean };

const IDLE: State = { report: null, errors: [], busy: false };

export function ReceiptVerifier() {
  const [input, setInput] = useState("");
  const [state, setState] = useState<State>(IDLE);

  const run = useCallback(async (text: string) => {
    const parsed = parseReceiptInput(text);
    if (!parsed.ok) {
      setState({ report: null, errors: parsed.errors, busy: false });
      return;
    }
    setState({ report: null, errors: [], busy: true });
    try {
      const report = await verifyReceipts(parsed.receipts, { chain });
      setState({ report, errors: [], busy: false });
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      setState({ report: null, errors: [`Verification could not run: ${reason}`], busy: false });
    }
  }, []);

  const loadSample = (id: string) => {
    const sample = RECEIPT_SAMPLES.find((item) => item.id === id);
    if (sample === undefined) return;
    const text = JSON.stringify(sample.receipts, null, 2);
    setInput(text);
    void run(text);
  };

  return (
    <div className="grid grid-cols-1 border-t border-border lg:grid-cols-2">
      <div className="flex flex-col border-b border-border lg:border-r lg:border-b-0">
        <FigureLabel n={1} />
        <div className="flex flex-col gap-3 px-4 pb-4 md:px-5 md:pb-5">
          <div className="flex flex-wrap gap-1">
            {RECEIPT_SAMPLES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                title={sample.note}
                aria-label={`Load sample: ${sample.label}`}
                onClick={() => loadSample(sample.id)}
                className="hairline label-2xs bg-surface-card px-2 py-1.5 text-fg-muted transition-colors hover:border-fg/28 hover:text-fg"
              >
                {sample.label}
              </button>
            ))}
          </div>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
            rows={16}
            placeholder='Paste a receipt, or a bundle: [{ "v": 1, … }]'
            aria-label="Receipt JSON"
            className="hairline scrollbar-none h-80 w-full resize-none bg-surface-card p-3 font-mono text-2xs leading-140 text-fg placeholder:text-fg/30 focus:border-fg/40 focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <Button onClick={() => void run(input)} disabled={state.busy || input.trim() === ""}>
              {state.busy ? "Verifying" : "Verify"}
            </Button>
            <Button
              variant="ghost"
              arrow={false}
              onClick={() => {
                setInput("");
                setState(IDLE);
              }}
            >
              Clear
            </Button>
            <p className="label-2xs ml-auto text-fg-faint">Runs in this tab</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-border pr-4 md:pr-5">
          <FigureLabel n={2} />
          {state.report !== null && <StatusPill status={state.report.status} />}
        </div>
        {state.errors.length > 0 && (
          <ul className="flex flex-col gap-1 border-b border-border p-4 md:p-5">
            {state.errors.map((error) => (
              <li key={error} className="font-mono text-2xs leading-140 text-chart-5">
                {error}
              </li>
            ))}
          </ul>
        )}
        {state.report === null && state.errors.length === 0 && (
          <p className={cn("p-4 text-sm leading-140 text-fg-muted md:p-5", state.busy && "animate-pulse")}>
            {state.busy ? "Checking…" : "Load a sample or paste a receipt. Five checks run here, in your browser — no request leaves this tab."}
          </p>
        )}
        {state.report?.receipts.map((report, index) => (
          <CheckList key={report.id + index} report={report} index={index} />
        ))}
      </div>
    </div>
  );
}
