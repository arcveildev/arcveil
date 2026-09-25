// Capture the real /verify page, at phone size, after it has checked the
// "Clean run" sample against Arc mainnet. Beat 4 of the iMessage film shows
// this image; nothing in it is redrawn.
//
//   node capture.mjs [http://localhost:3000/verify] [out.png]
//
// Uses the Google Chrome already on this Mac over the DevTools protocol, so
// nothing is installed.

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const URL_ = process.argv[2] ?? "http://localhost:3000/verify";
const OUT = process.argv[3] ?? new URL("./verify-mobile.png", import.meta.url).pathname;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9333;
const WIDTH = 390;
const SCALE = 3;
const CHECK_TIMEOUT_MS = 30_000;

const profile = mkdtempSync(join(tmpdir(), "arcveil-capture-"));
const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  "--hide-scrollbars",
  "--no-first-run",
  "about:blank",
]);

async function devtools() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" });
      if (res.ok) return (await res.json()).webSocketDebuggerUrl;
    } catch {
      // not up yet
    }
    await sleep(200);
  }
  throw new Error("Chrome did not open its DevTools port");
}

function client(url) {
  const ws = new WebSocket(url);
  let id = 0;
  const pending = new Map();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    const waiter = pending.get(msg.id);
    if (!waiter) return;
    pending.delete(msg.id);
    if (msg.error) waiter.reject(new Error(msg.error.message));
    else waiter.resolve(msg.result);
  };
  const ready = new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const n = ++id;
      pending.set(n, { resolve, reject });
      ws.send(JSON.stringify({ id: n, method, params }));
    });
  return { ready, send, close: () => ws.close() };
}

async function evaluate(cdp, expression) {
  const { result, exceptionDetails } = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (exceptionDetails) throw new Error(exceptionDetails.text);
  return result.value;
}

async function main() {
  const cdp = client(await devtools());
  await cdp.ready;
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: WIDTH, height: 844, deviceScaleFactor: SCALE, mobile: true });
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });
  await cdp.send("Page.enable");
  await cdp.send("Page.navigate", { url: URL_ });

  const started = Date.now();
  const until = async (expression, what) => {
    while (!(await evaluate(cdp, expression))) {
      if (Date.now() - started > CHECK_TIMEOUT_MS) throw new Error(`timed out waiting for ${what}`);
      await sleep(250);
    }
  };

  await until(`!!document.querySelector('[aria-label="Load sample: Clean run"]')`, "the sample button");
  await evaluate(cdp, `document.querySelector('[aria-label="Load sample: Clean run"]').click()`);
  await until(`document.body.innerText.includes("RECEIPT 1") && !document.body.innerText.includes("Checking…")`, "the checks");

  // Every check must have passed against the chain; a capture of anything else is not this beat.
  const verdicts = await evaluate(cdp, `(() => {
    const t = document.querySelector("main").innerText;
    const block = t.slice(t.indexOf("RECEIPT 1"), t.indexOf("RECEIPT 2"));
    return { pass: (block.match(/PASS/g) || []).length, fail: /FAIL|UNKNOWN/.test(block) };
  })()`);
  if (verdicts.fail || verdicts.pass < 6) throw new Error(`receipt 1 did not pass cleanly: ${JSON.stringify(verdicts)}`);

  // Floating chrome that is not the page: the dev-only Next badge and the
  // design-preset switcher. Neither is part of what a receipt check shows.
  await evaluate(cdp, `(() => {
    const style = document.createElement("style");
    style.textContent = "nextjs-portal{display:none!important}";
    document.head.appendChild(style);
    const toggle = document.querySelector('[aria-label="Toggle design presets"]');
    if (toggle) toggle.closest(".fixed").style.display = "none";
  })()`);

  await sleep(600); // let the result transition settle
  const { height } = await evaluate(cdp, `({ height: document.documentElement.scrollHeight })`);
  const shot = await cdp.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: WIDTH, height, scale: 1 },
  });
  writeFileSync(OUT, Buffer.from(shot.data, "base64"));

  const marks = await evaluate(cdp, `(() => {
    const find = (text) => [...document.querySelectorAll("main *")].find((el) => el.childElementCount === 0 && el.textContent.trim() === text);
    const y = (el) => el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : null;
    const leaf = (re) => [...document.querySelectorAll("main *")].find((el) => el.childElementCount === 0 && re.test(el.textContent.trim()));
    return { verify: y(leaf(/^Verify\.?$/)), fig2: y(leaf(/^Fig\.? ?2$/i)), receipt1: y(leaf(/Receipt 1/i)), settlement: y(find("Settlement")), receipt2: y(leaf(/Receipt 2/i)) };
  })()`);
  console.log(JSON.stringify({ out: OUT, cssHeight: height, scale: SCALE, marks }));
  cdp.close();
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => {
    chrome.kill();
    rmSync(profile, { recursive: true, force: true });
  });
