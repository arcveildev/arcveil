/**
 * Screen capture for the proof film, over the Chrome DevTools Protocol.
 *
 *   node scripts/video/capture.mjs
 *
 * CDP rather than `chrome --headless --screenshot` because the frames that
 * matter need interaction: the verifier only shows its verdicts after a sample
 * is loaded and three of its five checks have answered from Arc. Node 22 has a
 * native WebSocket, so this needs no dependencies.
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9333;
const OUT = "docs/social/video/proof/frames";

class Page {
  #ws;
  #id = 0;
  #pending = new Map();

  static async open(wsUrl) {
    const page = new Page();
    page.#ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      page.#ws.addEventListener("open", resolve, { once: true });
      page.#ws.addEventListener("error", reject, { once: true });
    });
    page.#ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      const waiter = page.#pending.get(message.id);
      if (waiter) {
        page.#pending.delete(message.id);
        message.error ? waiter.reject(new Error(message.error.message)) : waiter.resolve(message.result);
      }
    });
    return page;
  }

  send(method, params = {}) {
    const id = ++this.#id;
    this.#ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.#pending.set(id, { resolve, reject }));
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
  "--user-data-dir=/tmp/arcveil-capture",
]);
chrome.on("error", (error) => {
  throw error;
});

// Newer Chrome refuses GET on /json/new: the target endpoints take PUT.
const endpoint = async (path, method = "GET") =>
  (await fetch(`http://127.0.0.1:${PORT}${path}`, { method })).json();

async function waitForChrome() {
  for (let i = 0; i < 40; i += 1) {
    try {
      await endpoint("/json/version");
      return;
    } catch {
      await sleep(250);
    }
  }
  throw new Error("Chrome did not open its debugging port");
}

/** One frame: navigate, optionally act, settle, capture. */
/** Waits for real content, not for a guessed number of seconds. */
async function waitForText(page, needle, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const { result } = await page.send("Runtime.evaluate", {
      expression: `document.body.innerText.includes(${JSON.stringify(needle)})`,
      returnByValue: true,
    });
    if (result.value === true) return;
    await sleep(500);
  }
  throw new Error(`timed out waiting for ${JSON.stringify(needle)}`);
}

async function shot({ name, url, width = 1440, height = 900, scale = 2, act, settle = 1500, waitFor }) {
  const target = await endpoint(`/json/new?${encodeURIComponent("about:blank")}`, "PUT");
  const page = await Page.open(target.webSocketDebuggerUrl);

  await page.send("Page.enable");
  await page.send("Runtime.enable");
  await page.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: scale,
    mobile: false,
  });
  await page.send("Page.navigate", { url });
  if (waitFor) await waitForText(page, waitFor);
  await sleep(settle);

  if (act) {
    await page.send("Runtime.evaluate", { expression: act, awaitPromise: true });
  }

  const { data } = await page.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  mkdirSync(OUT, { recursive: true });
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(data, "base64"));
  console.log(`${name}.png  ${width}x${height} @${scale}x  ${url}`);

  page.close();
  // /json/close answers with plain text, not JSON.
  await fetch(`http://127.0.0.1:${PORT}/json/close/${target.id}`, { method: "PUT" });
}

const ACCOUNT = "0xb1c0983a7b84f38fbaf5f3af92f0fecaa62ce25d";
const ANCHOR_TX = "0xd110e7255737eed92bf59b3df6e656688bc9acf6ed2f33f72ae306f157937bb3";
const REVOKE_TX = "0x78f194852e5f02fce8ba3524daf7eff27bc47daa4c9c32c398d5fec75a461372";

const clickSample = (label) => `
  (async () => {
    const button = [...document.querySelectorAll('button')]
      .find((b) => (b.getAttribute('aria-label') || '').includes(${JSON.stringify(label)}));
    button.click();
    await new Promise((r) => setTimeout(r, 6000));
    document.querySelector('#receipts, main')?.scrollIntoView();
  })()
`;

await waitForChrome();

await shot({ name: "verify-empty", url: "https://arcveil.dev/verify" });
await shot({ name: "verify-pass", url: "https://arcveil.dev/verify", act: clickSample("Clean run"), settle: 2500 });
await shot({ name: "verify-tampered", url: "https://arcveil.dev/verify", act: clickSample("Edited after signing"), settle: 2500 });
await shot({ name: "home", url: "https://arcveil.dev/", settle: 4000 });
// The explorer is a JS app: wait for the record itself to render, not a timer.
await shot({ name: "explorer-account", url: `https://explorer.arc.io/address/${ACCOUNT}`, waitFor: "0xb1C0", settle: 2500 });
await shot({ name: "explorer-anchor", url: `https://explorer.arc.io/tx/${ANCHOR_TX}`, waitFor: "Success", settle: 2500 });
await shot({ name: "explorer-revoke", url: `https://explorer.arc.io/tx/${REVOKE_TX}`, waitFor: "Success", settle: 2500 });

chrome.kill();
console.log("done");
