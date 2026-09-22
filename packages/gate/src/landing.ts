/**
 * What a browser gets at the root.
 *
 * The gate is an API and every route it serves is behind a bearer token, so a
 * person who types the hostname in was always going to be refused. Refusing
 * them with a JSON 401 reads as a broken deployment; this reads as a closed
 * door, which is what it is.
 *
 * It is static on purpose. It loads no clauses, names no checks, and buys no
 * inference, so it cannot 503 when the mandate is misconfigured and cannot
 * leak anything the authorised `GET /` is careful about. Everything on it is
 * already published in the repository and on arcveil.dev.
 */

/** Only a browser gets the page. Anything asking for JSON keeps the API it had. */
export const wantsPage = (request: Request): boolean =>
  (request.headers.get("accept") ?? "").includes("text/html");

/**
 * The root answers two different things at one URL, and this one is cacheable,
 * so it has to say what it varied on. Without it a cache that stored the page
 * can hand it to a caller that asked for JSON — and CORS may already have put
 * `origin` here, which we keep rather than overwrite.
 */
const vary = (headers: Readonly<Record<string, string>>): string => {
  const existing = headers.vary ?? headers.Vary;
  return existing === undefined ? "accept" : `${existing}, accept`;
};

/** Mirrors the `prime-dark` preset in src/theme/presets.css — the site's default. */
const STYLE = `
:root {
  --surface: #0e0e0e;
  --surface-card: #161616;
  --line: #202020;
  --fg: #ffffff;
  --fg-muted: rgba(255, 255, 255, 0.5);
  --fg-subtle: rgba(255, 255, 255, 0.3);
  --accent: #85ed75;
  --mono: ui-monospace, SFMono-Regular, Menlo, "Cascadia Mono", monospace;
  --sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  color-scheme: dark;
}
* { box-sizing: border-box; margin: 0; }
body {
  background: var(--surface);
  color: var(--fg);
  font-family: var(--sans);
  -webkit-font-smoothing: antialiased;
  line-height: 1.4;
  padding: 24px 16px 64px;
}
main { max-width: 720px; margin: 0 auto; border: 1px solid var(--line); }
section { padding: 20px 20px; border-bottom: 1px solid var(--line); }
section:last-child { border-bottom: 0; }
.bar { display: flex; justify-content: space-between; gap: 16px; }
.label {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--fg-muted);
}
.label.on { color: var(--accent); }
h1 { font-size: 28px; letter-spacing: -0.01em; font-weight: 500; margin-bottom: 8px; }
.tagline { font-size: 15px; color: var(--fg); margin-bottom: 12px; }
p { font-size: 13px; color: var(--fg-muted); max-width: 60ch; }
p + p { margin-top: 10px; }
dl { display: grid; grid-template-columns: max-content 1fr; gap: 6px 20px; margin-top: 12px; }
dt, dd { font-family: var(--mono); font-size: 12px; }
dt { color: var(--accent); white-space: nowrap; }
dd { color: var(--fg-muted); }
pre {
  margin-top: 12px;
  padding: 14px;
  background: var(--surface-card);
  border: 1px solid var(--line);
  overflow-x: auto;
  white-space: pre-wrap;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--fg);
  line-height: 1.6;
}
nav { display: flex; flex-wrap: wrap; gap: 4px 16px; }
a { color: var(--fg-muted); text-decoration: none; border-bottom: 1px solid var(--line); }
a:hover { color: var(--accent); border-bottom-color: var(--accent); }
.faint { color: var(--fg-subtle); font-size: 11px; margin-top: 12px; }
@media (max-width: 520px) {
  h1 { font-size: 24px; }
  dl { grid-template-columns: 1fr; gap: 2px 0; }
  dt { margin-top: 8px; }
}
`;

const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gate · Arcveil</title>
<meta name="description" content="The Arcveil policy gate. It holds a mandate's semantic clauses and answers allow or deny. Every route is behind a bearer token.">
<link rel="icon" href="https://arcveil.dev/icon.svg">
<style>${STYLE}</style>
</head>
<body>
<main>
  <section class="bar">
    <span class="label">Arcveil / gate</span>
    <span class="label on">Token required</span>
  </section>

  <section>
    <h1>Gate.</h1>
    <p class="tagline">An endpoint for agents, not a page for people.</p>
    <p>
      It holds a mandate's semantic clauses, puts one proposed action to the judge —
      Cloudflare's <code>typesafe/jev</code>, behind a Workers AI binding — and answers
      allow or deny. It never answers how close the call was: a caller that can watch a
      score move can walk a threshold until it finds the edge, and the thresholds are the
      mandate.
    </p>
    <p>
      Every route is behind a bearer token. One evaluation is one paid inference, so an
      open endpoint is an open wallet.
    </p>
  </section>

  <section>
    <span class="label">Routes</span>
    <dl>
      <dt>GET /</dt><dd>the check names and the clause commitment</dd>
      <dt>POST /evaluate</dt><dd>{ state } &rarr; { allow, checks, failed, judge }</dd>
      <dt>POST /select</dt><dd>{ task, candidates } &rarr; { chosen, checks, failed, judge }</dd>
    </dl>
  </section>

  <section>
    <span class="label">Calling it</span>
<pre>curl -s https://gate.arcveil.dev/evaluate \\
  -H "authorization: Bearer $GATE_TOKEN" \\
  -H "content-type: application/json" \\
  -d '{"state":"Swap 30% of the A position"}'</pre>
    <p class="faint">
      Without that header the answer is 401. That is not the gate failing — that is the gate.
    </p>
  </section>

  <section>
    <nav class="label">
      <a href="https://arcveil.dev">arcveil.dev</a>
      <a href="https://arcveil.dev/gate">The semantic gate</a>
      <a href="https://arcveil.dev/docs">Docs</a>
      <a href="https://github.com/arcveildev/arcveil">Source</a>
    </nav>
  </section>
</main>
</body>
</html>
`;

/**
 * Served before the bearer check, so it is the one thing here a stranger can
 * read. No script, nothing fetched but the site's own icon, and nothing on it
 * that a threshold could be solved from — hence the flat `default-src 'none'`.
 */
export const page = (headers: Readonly<Record<string, string>> = {}): Response =>
  new Response(PAGE, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=600",
      "content-security-policy":
        "default-src 'none'; style-src 'unsafe-inline'; img-src https://arcveil.dev; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
      ...headers,
      vary: vary(headers),
    },
  });
