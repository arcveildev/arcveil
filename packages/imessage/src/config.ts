import { homedir } from "node:os";
import { join } from "node:path";
import { z } from "zod";

export type Config = Readonly<{
  allow: readonly string[];
  chatDb: string;
  stateDir: string;
  pollMs: number;
}>;

const list = z
  .string({ error: "ARCVEIL_IM_ALLOW is required: the handles allowed to command the agent" })
  .transform((raw) => raw.split(",").map((part) => part.trim()).filter(Boolean))
  .pipe(z.array(z.string()).min(1, "ARCVEIL_IM_ALLOW lists no handles"));

const schema = z.object({
  ARCVEIL_IM_ALLOW: list,
  ARCVEIL_IM_DB: z.string().min(1).default(join(homedir(), "Library/Messages/chat.db")),
  ARCVEIL_IM_STATE: z.string().min(1).default(join(homedir(), ".arcveil/imessage")),
  ARCVEIL_IM_POLL_MS: z.coerce.number().int().min(250).max(60_000).default(1500),
});

export function loadConfig(
  env: Readonly<Record<string, string | undefined>>,
): { ok: true; config: Config } | { ok: false; error: string } {
  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") };
  }
  const e = parsed.data;
  return {
    ok: true,
    config: { allow: e.ARCVEIL_IM_ALLOW, chatDb: e.ARCVEIL_IM_DB, stateDir: e.ARCVEIL_IM_STATE, pollMs: e.ARCVEIL_IM_POLL_MS },
  };
}
