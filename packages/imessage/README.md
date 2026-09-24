# @arcveil/imessage

Talk to your Arcveil agent over iMessage.

iMessage has no bot API, so this runs on a Mac signed in to Messages: it reads
new messages from Messages' own database, and answers through AppleScript. It
is a relay for a demo, not a product; an iMessage app extension is the durable
path.

**Phase 0 — the pipe.** It echoes what the allowed sender writes. No keys, no
chain, no money.

## Run it

1. Sign the Mac in to Messages with an Apple ID made for Arcveil, not your own.
2. Give the terminal you run this from **Full Disk Access** (System Settings →
   Privacy & Security). Without it `~/Library/Messages/chat.db` cannot be read.
3. Start it with your own number as the only allowed sender:

   ```bash
   ARCVEIL_IM_ALLOW="+6281234567890" pnpm --filter @arcveil/imessage start
   ```

   The first time it sends, macOS asks whether the terminal may control
   Messages. Allow it.
4. From your phone, message the Arcveil Apple ID. It answers `echo: …`.

| Variable | Default | |
|---|---|---|
| `ARCVEIL_IM_ALLOW` | — | Comma-separated handles (E.164 or email) allowed to command it. Required. |
| `ARCVEIL_IM_DB` | `~/Library/Messages/chat.db` | |
| `ARCVEIL_IM_STATE` | `~/.arcveil/imessage` | Where the cursor lives. |
| `ARCVEIL_IM_POLL_MS` | `1500` | 250–60000. |

## What it will and will not do

- Only messages from an allowed handle get an answer. Everyone else is logged
  and ignored — anyone can message an Apple ID.
- A first run starts after the newest message already in the database; it never
  answers history.
- The database is opened read-only.
- The cursor is saved **before** each reply. A crash can drop a reply; it cannot
  send one twice. When replies start moving money, that order is what keeps a
  restart from paying someone again.
- Text reaches AppleScript as arguments, never spliced into the script.
