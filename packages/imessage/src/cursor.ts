import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

export interface Cursor {
  load(): number | null;
  save(rowid: number): void;
}

const fileSchema = z.object({ rowid: z.number().int().nonnegative() }).strict();

/**
 * The last message row we have handled, kept on disk so a restart neither
 * replays history nor loses its place.
 */
export function createFileCursor(dir: string): Cursor {
  const path = join(dir, "cursor.json");
  let last: number | null = null;

  const load = (): number | null => {
    if (!existsSync(path)) return null;
    let raw: unknown;
    try {
      raw = JSON.parse(readFileSync(path, "utf8"));
    } catch (error) {
      throw new Error(`cursor file ${path} is not JSON; fix or delete it deliberately`, { cause: error });
    }
    const parsed = fileSchema.safeParse(raw);
    if (!parsed.success) throw new Error(`cursor file ${path} is malformed; fix or delete it deliberately`);
    last = parsed.data.rowid;
    return last;
  };

  const save = (rowid: number): void => {
    if (last === null) load();
    if (last !== null && rowid < last) throw new Error(`cursor cannot move backwards (${last} → ${rowid})`);
    mkdirSync(dir, { recursive: true, mode: 0o700 });
    const tmp = `${path}.tmp`;
    writeFileSync(tmp, JSON.stringify({ rowid }), { mode: 0o600 });
    renameSync(tmp, path);
    last = rowid;
  };

  return { load, save };
}
