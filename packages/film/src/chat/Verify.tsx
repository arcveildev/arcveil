import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

/**
 * The real /verify page, captured at 390 CSS px and 3x after it checked the
 * "Clean run" sample against Arc mainnet (docs/social/video/imessage-concept/
 * verify/capture.mjs). Nothing in the page is redrawn: this only scrolls it,
 * under a phone status bar and the browser's address bar.
 */
const SRC = staticFile("chat/verify-mobile.png");
const CSS_WIDTH = 390;
const SCREEN = 1080 / CSS_WIDTH; // display px per CSS px

// Where the page's own sticky header ends, and where the check rows begin, in CSS px.
const HEADER_CSS = 62;
const RESULTS_CSS = 900;

const CHROME = 58 * SCREEN; // status bar + address bar
const IOS = "-apple-system, 'SF Pro Text', system-ui, sans-serif";

export const Verify = () => {
  const frame = useCurrentFrame();
  const scroll = interpolate(frame, [22, 82], [0, RESULTS_CSS], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.45, 0, 0.2, 1),
  });

  return (
    <AbsoluteFill style={{ background: "#0e0e0e", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: CHROME, left: 0, width: 1080, transform: `translateY(${-scroll * SCREEN}px)` }}>
        <Img src={SRC} style={{ width: 1080, display: "block" }} />
      </div>
      {/* The site's header is sticky; a flat capture only has it at the top, so it is pinned here. */}
      <div style={{ position: "absolute", top: CHROME, left: 0, width: 1080, height: HEADER_CSS * SCREEN, overflow: "hidden" }}>
        <Img src={SRC} style={{ width: 1080, display: "block" }} />
      </div>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: CHROME, background: "#1c1c1e", display: "flex", flexDirection: "column" }}>
        <div style={{ height: 32 * SCREEN, display: "flex", alignItems: "center", padding: `0 ${30 * SCREEN}px`, color: "#fff", fontFamily: IOS, fontWeight: 600, fontSize: 16 * SCREEN }}>
          9:41
        </div>
        <div style={{ margin: `0 ${14 * SCREEN}px`, height: 22 * SCREEN, borderRadius: 11 * SCREEN, background: "#2c2c2e", display: "grid", placeItems: "center", color: "#f2f2f7", fontFamily: IOS, fontSize: 14 * SCREEN }}>
          arcveil.dev
        </div>
      </div>
    </AbsoluteFill>
  );
};
