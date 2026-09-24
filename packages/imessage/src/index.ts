import { setTimeout as sleep } from "node:timers/promises";
import { openChatDb, type ChatDb } from "./chat-db";
import { loadConfig } from "./config";
import { createFileCursor } from "./cursor";
import { createAllowlist } from "./handle";
import { tick, type Log } from "./loop";
import { createAppleScriptSink } from "./send";

const BATCH = 50;
const MAX_ECHO = 500;

// Phase 0 only proves the pipe: read a message, answer it. No money moves.
const echo = (text: string): string => `echo: ${text.slice(0, MAX_ECHO)}`;

const log: Log = (event, detail) => console.log(JSON.stringify({ at: new Date().toISOString(), event, ...detail }));

function open(path: string): ChatDb {
  try {
    return openChatDb(path);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/authorization denied|not permitted|unable to open/i.test(message)) {
      console.error(
        `Cannot read ${path}.\n` +
          "Give the app running this (Terminal, iTerm, or your editor) Full Disk Access in\n" +
          "System Settings → Privacy & Security → Full Disk Access, then restart it.",
      );
    } else {
      console.error(`Cannot open ${path}: ${message}`);
    }
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const loaded = loadConfig(process.env);
  if (!loaded.ok) {
    console.error(loaded.error);
    process.exit(1);
  }
  const { config } = loaded;

  const chat = open(config.chatDb);
  const cursor = createFileCursor(config.stateDir);

  // First run: start after everything already in the database, never replay it.
  let at = cursor.load() ?? chat.latestRowid();
  cursor.save(at);
  log("listening", { from: at, allowed: config.allow.length });

  const controller = new AbortController();
  for (const signal of ["SIGINT", "SIGTERM"] as const) process.once(signal, () => controller.abort());

  const deps = {
    source: chat,
    sink: createAppleScriptSink(),
    cursor,
    isAllowed: createAllowlist(config.allow),
    reply: echo,
    log,
    batch: BATCH,
  };

  while (!controller.signal.aborted) {
    try {
      at = await tick(deps, at);
    } catch (error) {
      log("tick failed", { error: error instanceof Error ? error.message : String(error) });
    }
    await sleep(config.pollMs, undefined, { signal: controller.signal }).catch(() => {});
  }

  chat.close();
  log("stopped", { at });
}

void main();
