/** @type {import("./fable").BuildScript} */
export default async ({ project, text, rect, media, path, frame, row, column, icon }) => {
  const p = await project({ dir: ".", size: "1920x1080", fps: 30, background: "#ffffff" });
  const NAVY = "#1b3158", MINT = "#85ed75", MINTD = "#1f9d4c", MUTE = "#5c6a86", LINE = "#e3e8f1", W = 1920, H = 1080;
  const SANS = "Manrope", MONO = "DM Mono";
  const T = { 1: [0, 5.76], 2: [5.76, 6.05], 3: [11.81, 2.65], 4: [14.46, 7.97], 5: [22.43, 4.12], 6: [26.55, 7.9], 7: [34.45, 4.53], 8: [38.98, 7.3] };
  const FILM = 46.28;

  // ---- helpers ----------------------------------------------------------
  const fade = (dur) => ({ enter: { from: { opacity: 0 }, duration: 0.35 }, exit: { to: { opacity: 0 }, duration: 0.3, anchor: "end" } });
  const wordIn = (at) => ({ by: "word", from: { opacity: 0, y: 16 }, at, duration: 0.5, overlap: 0.35, easing: "house" });
  // a headline line: segments [[text, color?]...] laid out in a row so an accent word keeps its colour
  const TW = {"700|81|AI agents are starting": 847.0, "700|81|to spend on their own.": 874.0, "700|81|But every agent that": 804.0, "700|81|can spend can": 563.0, "700|81|see.": 165.0, "700|81|A": 55.0, "700|81|privacy": 289.0, "700|81|layer for": 325.0, "700|81|agent payments.": 665.0, "700|81|Every action leaves": 758.0, "700|81|a": 47.0, "700|81|receipt.": 308.0, "700|96|One mandate.": 659.0, "700|96|Zero keys.": 486.0, "700|96|Settled on": 489.0, "700|96|Arc.": 187.0, "700|123|$": 78.0, "700|123|ARCVEIL": 507.0, "500|33|The first privacy layer for agents, built on": 629.0, "500|33|Arc.": 59.0};
  const tw = (t, size, weight, family, ls = 0) => { const base = family === MONO ? t.length * size * 0.6 : TW[`${weight}|${size}|${t}`]; if (base == null) throw new Error("no width for " + t); return Math.ceil(base + ls * t.length + 6); };
  const line = (segs, size, at, opts = {}) => { const { gap: g, ...rest } = opts; const weight = rest.fontWeight || 700; const ls = rest.letterSpacing ?? -size * 0.02; const gp = g ?? size * 0.26;
    const ws = segs.map(([t]) => tw(t, size, weight, SANS, ls)); const total = ws.reduce((a, b) => a + b, 0) + gp * (segs.length - 1);
    return frame({ layout: "row", width: total, height: "hug", gap: gp, align: "end" }, segs.map(([t, c], i) => text(t, { fontFamily: SANS, fontSize: size, fontWeight: weight, letterSpacing: ls, lineHeight: 1.1, color: c || NAVY, motion: wordIn(at), width: ws[i], ...rest }))); };
  const head = (lines, size, at0 = 0.15) => frame({ layout: "column", width: "hug", height: "hug", gap: size * 0.12 }, lines.map((l, i) => line(l, size, at0 + i * 0.32)));
  const sub = (t, at, o = {}) => text(t, { fontFamily: SANS, fontSize: 33, fontWeight: 500, lineHeight: 1.4, color: MUTE, width: 730, motion: wordIn(at), ...o });
  const mono = (t, size, color, o = {}) => text(t, { fontFamily: MONO, fontSize: size, fontWeight: o.w || 400, letterSpacing: o.ls ?? 0, color, width: tw(t, size, o.w || 400, MONO, o.ls ?? 0), ...o });
  const pill = (t, at, solid = false) => row({ gap: 13, align: "center", fill: solid ? NAVY : "#eef7ec", radius: 99, padding: { top: 11, bottom: 11, left: 25, right: 25 },
      animate: [{ property: "opacity", from: 0, to: 1, at, duration: 0.3 }, { property: "scale", from: 0.9, to: 1, at, duration: 0.4, easing: "house" }] },
    [...(solid ? [] : [rect({ width: 13, height: 13, radius: 7, fill: MINTD })]),
     mono(t, solid ? 22 : 20, solid ? "#ffffff" : NAVY, solid ? { w: 500 } : { ls: 2.8 })]);
  const check = (size = 31) => frame({ layout: "none", width: size, height: size }, [
    rect({ width: size, height: size, radius: size / 2, fill: MINTD }),
    icon("check", { x: size * 0.2, y: size * 0.2, size: size * 0.6, color: "#ffffff", strokeWidth: 3.2 })]);
  const K = 0.5523;
  const mark = (s, color = NAVY) => frame({ layout: "none", width: 28 * s, height: 24 * s }, [
    path({ width: 28 * s, height: 24 * s, fill: color, d: [
      `M ${3 * s} ${10.5 * s}`, `C ${3 * s} ${(10.5 - 11 * K) * s} ${(14 - 11 * K) * s} ${-0.5 * s} ${14 * s} ${-0.5 * s}`,
      `C ${(14 + 11 * K) * s} ${-0.5 * s} ${25 * s} ${(10.5 - 11 * K) * s} ${25 * s} ${10.5 * s}`, `L ${19 * s} ${10.5 * s}`,
      `C ${19 * s} ${(10.5 - 5 * K) * s} ${(14 + 5 * K) * s} ${5.5 * s} ${14 * s} ${5.5 * s}`,
      `C ${(14 - 5 * K) * s} ${5.5 * s} ${9 * s} ${(10.5 - 5 * K) * s} ${9 * s} ${10.5 * s}`, "Z"].join(" ") }),
    rect({ x: 3 * s, y: 14 * s, width: 6 * s, height: 9 * s, fill: color }),
    rect({ x: 19 * s, y: 14 * s, width: 6 * s, height: 9 * s, fill: color }),
    rect({ x: 0, y: 11.25 * s, width: 28 * s, height: 2 * s, fill: MINT })]);
  const wordmark = (size) => mono("ARCVEIL", size, NAVY, { w: 500, ls: size * 0.14 });
  const wash = () => rect({ width: W, height: H, fill: { kind: "radial", stops: [{ offset: 0, color: "#dfe7f3" }, { offset: 0.65, color: "#ffffff" }, { offset: 1, color: "#ffffff" }] }, x: 0, y: 0 });
  const plate = (h) => media({ file: h, x: 0, y: 0, width: W, height: H, fit: "cover", animate: [{ property: "opacity", from: 0, to: 1, at: 0, duration: 0.45 }] });
  const shot = (n, nodes) => p.compose(nodes, { at: T[n][0], dur: T[n][1], name: `shot${n}` });
  const block = (x, y, w, children, dur) => frame({ layout: "column", x, y, width: w, height: "hug", gap: 0, motion: fade(dur) }, children);
  const gap = (h) => rect({ width: 1, height: h, fill: "#ffffff", opacity: 0 });

  // ---- assets -----------------------------------------------------------
  const vo = await p.add("media/vo-master.mp3");
  const P = {}; for (const n of [1, 2, 5, 6, 7, 8]) P[n] = await p.add(`media/p${n}.mp4`);
  p.cut(vo, { from: 0, dur: FILM, at: 0 });

  // ---- 1 · agents spend --------------------------------------------------
  shot(1, [plate(P[1]), block(115, 238, 883, [
    mono("THE AGENT ECONOMY", 23, MINTD, { ls: 4, motion: wordIn(0.1) }), gap(23),
    head([[["AI agents are starting"]], [["to spend on their own."]]], 81, 0.3)], T[1][1])]);

  // ---- 2 · can see -------------------------------------------------------
  shot(2, [plate(P[2]), block(115, 238, 883, [
    head([[["But every agent that"]], [["can spend can"], ["see.", MINTD]]], 81, 0.2), gap(31),
    mono("Balances · keys · history", 29, MUTE, { motion: wordIn(1.1) })], T[2][1])]);

  // ---- 3 · logo reveal ---------------------------------------------------
  shot(3, [frame({ layout: "row", x: (W - 100 - 27 - 360) / 2, y: (H - 86) / 2, width: "hug", height: "hug", gap: 27, align: "center", motion: fade() }, [
    frame({ layout: "none", width: 100, height: 86, clip: true, reveal: { from: "bottom", duration: 0.55, easing: "house" } }, [mark(100 / 28)]),
    frame({ layout: "none", width: 360, height: 70, motion: { enter: { from: { opacity: 0, x: -20 }, duration: 0.5, at: 0.45 } } }, [wordmark(65)])])]);

  // ---- 4 · privacy layer + ledger -----------------------------------------
  const rowsData = [["AGENT", "intent{ asset, ratio }", "reduce A by 30%"], ["ENCLAVE", "redact", "amount resolved · never returned"],
    ["ARCVEIL", "mandate check", "allowlist · cap · window · hours"], ["ARC", "settle", "USDC gas · chain 5042"]];
  const lrow = ([who, main, small], i) => frame({ layout: "row", width: 691, height: "hug", gap: 19, align: "center", padding: { top: 19, bottom: 19, left: 23, right: 23 },
      background: i === 2 ? "#f1f8ef" : "#ffffff", radius: 17, shadow: { y: 6, blur: 18, color: "rgba(27,49,88,0.08)" },
      motion: { enter: { from: { opacity: 0, y: 18 }, duration: 0.45, at: 0.9 + i * 0.95, easing: "house" } } }, [
    frame({ layout: "none", width: 106, height: 22 }, [mono(who, 18, MUTE, { ls: 2.5 })]),
    frame({ layout: "column", width: 470, height: "hug", gap: 4 }, [mono(main, 26, NAVY, { w: 500 }), mono(small, 19, MUTE)]),
    frame({ layout: "none", width: 31, height: 31, motion: { enter: { from: { scale: 0 }, duration: 0.45, at: 1.35 + i * 0.95, easing: { kind: "overshoot", amount: 2.2 } } } }, [check(31)])]);
  shot(4, [wash(),
    frame({ layout: "row", x: 115, y: 119, width: 330, height: "hug", gap: 15, align: "center", motion: fade() }, [mark(46 / 28), wordmark(29)]),
    block(115, 280, 845, [head([[["A"], ["privacy", MINTD], ["layer for"]], [["agent payments."]]], 81, 0.2), gap(31),
      sub("A mandate instead of your keys. The agent acts in ratios, the enclave resolves amounts, Arc settles in USDC.", 1.0)], T[4][1]),
    frame({ layout: "column", x: 1114, y: 238, width: 691, height: "hug", gap: 17, motion: fade() }, [...rowsData.map(lrow),
      frame({ layout: "none", width: 691, height: 52 }, [pill("Receipt sealed · 5 of 5 checks", 5.0, true)])])]);

  // ---- 5 · one mandate ---------------------------------------------------
  shot(5, [plate(P[5]), block(115, 238, 883, [head([[["One mandate."]], [["Zero keys."]], [["Settled on"], ["Arc.", MINTD]]], 96, 0.2)], T[5][1])]);

  // ---- 6 · receipt -------------------------------------------------------
  shot(6, [plate(P[6]), block(115, 238, 883, [
    head([[["Every action leaves"]], [["a"], ["receipt.", MINTD]]], 81, 0.2), gap(31),
    sub("Verifiable by anyone. Readable by no one.", 1.2), gap(38),
    frame({ layout: "column", width: 560, height: "hug", gap: 13, padding: { top: 21, bottom: 21, left: 25, right: 25 }, background: "#ffffff", radius: 17,
        shadow: { y: 6, blur: 18, color: "rgba(27,49,88,0.08)" }, motion: { enter: { from: { opacity: 0, y: 18 }, duration: 0.45, at: 3.2, easing: "house" } } }, [
      mono("swap · 02:14 · mandate respected", 24, NAVY, { w: 500 }),
      frame({ layout: "row", width: 170, height: 26, gap: 10 }, [0, 1, 2, 3, 4].map((i) => frame({ layout: "none", width: 26, height: 26, motion: { enter: { from: { scale: 0 }, duration: 0.4, at: 3.7 + i * 0.22, easing: { kind: "overshoot", amount: 2 } } } }, [check(26)]))),
      mono("~1.1 KB · verified in-browser", 20, MUTE)])], T[6][1])]);

  // ---- 7 · $ARCVEIL dev burnt ---------------------------------------------
  shot(7, [plate(P[7]), block(883, 216, 922, [
    frame({ layout: "none", width: 400, height: 46 }, [pill("DEV BURNT · ON ARC", 0.2)]), gap(24),
    line([["$", MINTD], ["ARCVEIL"]], 123, 0.5, { letterSpacing: -3.7, gap: 6 }), gap(22),
    sub("The dev allocation is gone for good. Burn tx on Arc.", 1.3, { width: 820 }), gap(35),
    frame({ layout: "row", width: "hug", height: "hug", gap: 12, align: "center", motion: { enter: { from: { opacity: 0, y: 14 }, duration: 0.45, at: 2.3, easing: "house" } } }, [
      ...["Dev supply", "Burn tx", "0"].flatMap((t, i) => [
        frame({ layout: "row", width: [190, 150, 70][i], height: "hug", background: i === 2 ? NAVY : "#ffffff", radius: 12, padding: { top: 12, bottom: 12, left: 21, right: 21 }, shadow: { y: 3, blur: 10, color: "rgba(27,49,88,0.10)" } },
          [text(t, { fontFamily: SANS, fontSize: 24, fontWeight: 600, width: [148, 108, 28][i], align: "center", color: i === 2 ? "#ffffff" : NAVY })]),
        ...(i < 2 ? [frame({ layout: "none", width: 46, height: 14 }, [rect({ x: 0, y: 7, width: 46, height: 1, fill: "#b9c3d6" }), rect({ x: 38, y: 0, width: 14, height: 14, radius: 7, fill: MINTD })])] : [])])])], T[7][1])]);

  // ---- 8 · end card ------------------------------------------------------
  shot(8, [plate(P[8]),
    frame({ layout: "column", x: 0, y: 300, width: W, height: "hug", gap: 26, align: "center", motion: fade() }, [
      frame({ layout: "none", width: 115, height: 99, motion: { enter: { from: { opacity: 0, y: 16 }, duration: 0.5, at: 0.2, easing: "house" } } }, [mark(115 / 28)]),
      frame({ layout: "none", width: 420, height: 72, motion: { enter: { from: { opacity: 0 }, duration: 0.5, at: 0.5 } } }, [wordmark(65)]),
      line([["The first privacy layer for agents, built on"], ["Arc.", MINTD]], 33, 0.9, { fontWeight: 500, color: MUTE, letterSpacing: 0 }),
      gap(6), frame({ layout: "none", width: 260, height: 46 }, [pill("LIVE ON ARC", 1.6)]),
      mono("arcveil.dev", 25, MUTE, { motion: wordIn(2.0), align: "center" })])]);

  const times = process.env.HF_FRAMES ? process.env.HF_FRAMES.split(",").map(Number) : [];
  for (const t of times) await p.frame(t, `renders/f${t}.png`);
  if (process.env.HF_RENDER) await p.render("renders/arcveil-live-on-arc.mp4", { bitrate: 12_000_000 });
};
