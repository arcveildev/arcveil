import type { MessageSource } from "./chat-db";
import type { Allowlist } from "./handle";
import type { MessageSink } from "./send";

export type Log = (event: string, detail?: Readonly<Record<string, unknown>>) => void;

export type Deps = Readonly<{
  source: MessageSource;
  sink: MessageSink;
  cursor: { save(rowid: number): void };
  isAllowed: Allowlist;
  /** What to answer, or null for nothing. */
  reply: (text: string) => string | null;
  log: Log;
  batch: number;
}>;

/**
 * Handle every message after `from` and return the new cursor.
 *
 * The cursor is saved before each reply goes out. A crash between the two
 * drops that reply; it never sends it twice. For an echo that is a small
 * price. Once replies move money it is the only acceptable order.
 */
export async function tick(deps: Deps, from: number): Promise<number> {
  let at = from;
  for (const message of deps.source.since(from, deps.batch)) {
    deps.cursor.save(message.rowid);
    at = message.rowid;

    if (message.fromMe || message.text === null || message.sender === null) continue;
    if (!deps.isAllowed(message.sender)) {
      deps.log("ignored", { rowid: message.rowid, reason: "sender not allowed" });
      continue;
    }

    const answer = deps.reply(message.text);
    if (answer === null) continue;

    try {
      await deps.sink.send(message.sender, answer);
      deps.log("replied", { rowid: message.rowid });
    } catch (error) {
      deps.log("send failed", { rowid: message.rowid, error: error instanceof Error ? error.message : String(error) });
    }
  }
  return at;
}
