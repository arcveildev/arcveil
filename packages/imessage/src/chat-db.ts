import { DatabaseSync } from "node:sqlite";
import { fromAppleTime } from "./apple-time";
import { decodeAttributedBody } from "./attributed-body";

export type InboundMessage = Readonly<{
  rowid: number;
  guid: string;
  /** The other party's handle; for our own messages, who they went to. */
  sender: string | null;
  text: string | null;
  sentAt: Date;
  fromMe: boolean;
}>;

export interface MessageSource {
  since(rowid: number, limit: number): readonly InboundMessage[];
}

export interface ChatDb extends MessageSource {
  latestRowid(): number;
  close(): void;
}

type Row = {
  rowid: number | bigint;
  guid: string;
  text: string | null;
  attributedBody: Uint8Array | null;
  date: number | bigint | null;
  is_from_me: number | bigint;
  sender: string | null;
};

// associated_message_type is non-zero for tapbacks and other reactions.
const SINCE = `
  SELECT m.ROWID AS rowid, m.guid, m.text, m.attributedBody, m.date, m.is_from_me, h.id AS sender
  FROM message m LEFT JOIN handle h ON h.ROWID = m.handle_id
  WHERE m.ROWID > ? AND COALESCE(m.associated_message_type, 0) = 0
  ORDER BY m.ROWID ASC
  LIMIT ?`;

const LATEST = "SELECT COALESCE(MAX(ROWID), 0) AS rowid FROM message";

/** Messages' own database, opened read-only. We never write to it. */
export function openChatDb(path: string): ChatDb {
  const db = new DatabaseSync(path, { readOnly: true });
  const since = db.prepare(SINCE);
  // Nanosecond dates are past 2^53; read integers as bigint rather than throw.
  since.setReadBigInts(true);
  const latest = db.prepare(LATEST);

  return {
    latestRowid: () => Number((latest.get() as { rowid: number | bigint }).rowid),
    since: (rowid, limit) => (since.all(rowid, limit) as Row[]).map(toInbound),
    close: () => db.close(),
  };
}

function toInbound(row: Row): InboundMessage {
  const text = row.text ?? (row.attributedBody ? decodeAttributedBody(row.attributedBody) : null);
  return {
    rowid: Number(row.rowid),
    guid: row.guid,
    sender: row.sender,
    text: text && text.trim() !== "" ? text : null,
    sentAt: fromAppleTime(row.date ?? 0),
    fromMe: Number(row.is_from_me) === 1,
  };
}
