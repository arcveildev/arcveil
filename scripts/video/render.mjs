/**
 * Renders each beat to a PNG sequence with headless Chrome, then leaves the
 * assembly to ffmpeg. Text beats are drawn in HTML at the site's own type, so
 * the film and the product cannot drift apart; screen beats reuse the captures
 * in frames/.
 *
 *   node scripts/video/render.mjs
 */
import { spawn } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
import { BEATS } from "./beats.mjs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9334;
const OUT = "docs/social/video/proof/seq";
const W = 1920;
const H = 1080;
const FPS = 30;

const NAVY = "#0e0e0e";
const INK = "#f3f4f2";
const MINT = "#85ed75";
const ROSE = "#fb7185";
const DIM = "rgba(243,244,242,0.45)";

const shell = (body, extra = "") => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:${W}px;height:${H}px;background:${NAVY};color:${INK};
       font-family:Geist,system-ui,sans-serif;overflow:hidden;
       display:flex;align-items:center;justify-content:center}
  .wrap{width:1640px}
  .eyebrow{font-family:"Geist Mono",monospace;font-size:26px;letter-spacing:.14em;
           text-transform:uppercase;color:${DIM};margin-bottom:28px}
  .title{font-size:74px;line-height:1.16;letter-spacing:-.01em}
  .mono{font-family:"Geist Mono",monospace}
  .dim{color:${DIM}}
  .mint{color:${MINT}}
  .rose{color:${ROSE}}
  .rule{height:1px;background:rgba(243,244,242,0.12);margin:36px 0}
  .step{opacity:0;transform:translateY(6px)}
  .step.on{opacity:1;transform:none}
  ${extra}
</style></head><body><div class="wrap">${body}</div></body></html>`;

const mark = `<svg width="46" height="40" viewBox="0 0 28 24" fill="none">
  <path d="M3.1 10.5A11 11 0 0 1 24.9 10.5L18.77 10.5A5 5 0 0 0 9.23 10.5Z" fill="${INK}"/>
  <rect x="3" y="14" width="6" height="9" fill="${INK}"/>
  <rect x="19" y="14" width="6" height="9" fill="${INK}"/>
  <rect y="11.25" width="28" height="2" fill="${MINT}"/></svg>`;

const on = (i, step) => (i < step ? "step on" : "step");

function html(beat, step) {
  switch (beat.kind) {
    case "title":
      return shell(
        `<div>${beat.lines
          .map((l, i) => `<p class="title ${on(i, step)}" style="margin-bottom:18px">${l}</p>`)
          .join("")}</div>`,
      );
    case "facts":
      return shell(`
        <div>
          <p class="eyebrow">${beat.eyebrow}</p>
          ${beat.rows
            .map(
              (r, i) => `<div class="${on(i, step)}" style="display:flex;justify-content:space-between;
                 align-items:baseline;padding:22px 0;border-bottom:1px solid rgba(243,244,242,.1)">
                 <span style="font-size:38px">${r[0]}</span>
                 <span class="mono dim" style="font-size:30px">${r[1]}</span></div>`,
            )
            .join("")}
          <p class="mono dim ${on(beat.rows.length, step)}" style="font-size:26px;margin-top:32px">${beat.note}</p>
        </div>`);
    case "terminal":
      return shell(`
        <div>
          <p class="title" style="font-size:52px;margin-bottom:44px">${beat.title}</p>
          <div style="border:1px solid rgba(243,244,242,.12);background:#161616;padding:40px 44px">
            ${beat.lines
              .map((l, i) => {
                const cls = { cmd: "", out: "dim", dim: "dim", ok: "mint", bad: "rose" }[l.t];
                const prefix = l.t === "cmd" ? `<span class="mint">$</span> ` : "";
                return `<p class="mono ${cls} ${on(i, step)}" style="font-size:31px;line-height:1.85;
                        white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${prefix}${l.v}</p>`;
              })
              .join("")}
          </div>
        </div>`);
    case "refusal": {
      const bytes = beat.revert.match(/.{1,64}/g) ?? [];
      return shell(`
        <div>
          <p class="title" style="font-size:54px;margin-bottom:38px">${beat.title}</p>
          <p class="mono dim ${on(0, step)}" style="font-size:29px;margin-bottom:32px">${beat.command}</p>
          <div class="${on(1, step)}" style="border:1px solid rgba(251,113,133,.35);background:rgba(251,113,133,.06);padding:32px 36px">
            ${bytes.map((b) => `<p class="mono rose" style="font-size:30px;line-height:1.7;letter-spacing:.03em">${b}</p>`).join("")}
          </div>
          <p class="mono rose ${on(2, step)}" style="font-size:38px;margin-top:34px">${beat.decoded}</p>
          <p class="title ${on(3, step)}" style="font-size:56px;margin-top:48px">${beat.line}</p>
        </div>`);
    }
    case "end":
      return shell(`
        <div style="text-align:center">
          <div class="${on(0, step)}" style="display:flex;justify-content:center;align-items:center;gap:18px;margin-bottom:40px">
            ${mark}<span class="mono" style="font-size:46px;letter-spacing:.18em">ARCVEIL</span>
          </div>
          <p class="title ${on(1, step)}" style="font-size:56px;margin-bottom:38px">${beat.line}</p>
          <p class="mono mint ${on(2, step)}" style="font-size:36px;letter-spacing:.1em">${beat.url}</p>
          <div class="rule ${on(3, step)}" style="width:420px;margin:44px auto"></div>
          <p class="mono dim ${on(3, step)}" style="font-size:26px;letter-spacing:.08em">${beat.honest}</p>
        </div>`);
    default:
      throw new Error(`unknown beat kind: ${beat.kind}`);
  }
}

function steps(beat) {
  if (beat.kind === "terminal") return beat.lines.length;
  if (beat.kind === "facts") return beat.rows.length + 1;
  if (beat.kind === "title") return beat.lines.length;
  if (beat.kind === "refusal") return 4;
  return 4;
}

// ---- Chrome -----------------------------------------------------------------

class Page {
  #ws;
  #id = 0;
  #pending = new Map();
  static async open(url) {
    const page = new Page();
    page.#ws = new WebSocket(url);
    await new Promise((res, rej) => {
      page.#ws.addEventListener("open", res, { once: true });
      page.#ws.addEventListener("error", rej, { once: true });
    });
    page.#ws.addEventListener("message", (e) => {
      const m = JSON.parse(e.data);
      const w = page.#pending.get(m.id);
      if (w) {
        page.#pending.delete(m.id);
        m.error ? w.reject(new Error(m.error.message)) : w.resolve(m.result);
      }
    });
    return page;
  }
  send(method, params = {}) {
    const id = ++this.#id;
    this.#ws.send(JSON.stringify({ id, method, params }));
    return new Promise((res, rej) => this.#pending.set(id, { resolve: res, reject: rej }));
  }
  close() {
    this.#ws.close();
  }
}

const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`,
  "--headless=new",
  "--hide-scrollbars",
  "--force-color-profile=srgb",
  "--disable-gpu",
  "--no-first-run",
  "--user-data-dir=/tmp/arcveil-render",
]);

const api = async (path, method = "GET") =>
  (await fetch(`http://127.0.0.1:${PORT}${path}`, { method })).json();

for (let i = 0; i < 40; i += 1) {
  try {
    await api("/json/version");
    break;
  } catch {
    await sleep(250);
  }
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const target = await api(`/json/new?${encodeURIComponent("about:blank")}`, "PUT");
const page = await Page.open(target.webSocketDebuggerUrl);
await page.send("Page.enable");
await page.send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });

let frame = 0;
const manifest = [];

for (const beat of BEATS) {
  const total = steps(beat);
  const dir = `${OUT}/${beat.id}`;
  mkdirSync(dir, { recursive: true });

  for (let step = 1; step <= total; step += 1) {
    const file = `/tmp/beat-${beat.id}-${step}.html`;
    writeFileSync(file, html(beat, step));
    await page.send("Page.navigate", { url: `file://${file}` });
    await sleep(step === 1 ? 1200 : 420);
    const { data } = await page.send("Page.captureScreenshot", { format: "png" });
    // Each reveal holds for a few frames; the last one holds for the beat.
    const repeat = step === total ? Math.round(beat.hold * FPS) : Math.round(0.42 * FPS);
    for (let r = 0; r < repeat; r += 1) {
      writeFileSync(`${dir}/${String(frame).padStart(5, "0")}.png`, Buffer.from(data, "base64"));
      frame += 1;
    }
  }
  manifest.push({ id: beat.id, frames: frame });
  console.log(`${beat.id}  ${total} reveals  → frame ${frame}`);
}

writeFileSync(`${OUT}/manifest.json`, `${JSON.stringify({ fps: FPS, frames: frame, manifest }, null, 2)}\n`);
page.close();
chrome.kill();
console.log(`total ${frame} frames = ${(frame / FPS).toFixed(1)}s`);
