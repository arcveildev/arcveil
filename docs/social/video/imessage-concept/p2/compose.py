"""P2 test: pin the chat UI onto the green screen of a locked-off plate.

The plate's camera does not move, so the screen is one fixed rectangle: find
it in the first frame, draw the UI at exactly that size, lay it under the
plate, and key the green out of the plate so the hand passes over the UI.

    python3 compose.py plate.mp4 out.mp4 [--tap S --tap-len S --card-y F]

--tap/--tap-len darken the receipt card while the finger is down; --card-y
puts the card where the plate's finger lands.
"""

from __future__ import annotations

import argparse
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

SF = "/System/Library/Fonts/SFNS.ttf"
SF_MONO = "/System/Library/Fonts/SFNSMono.ttf"

BLUE = (10, 132, 255)
GREY = (233, 233, 235)
INK = (17, 17, 17)
MUTED = (138, 138, 142)
NAVY = (27, 49, 88)
MINT = (133, 237, 117)
PAGE = (255, 255, 255)
HAIRLINE = (222, 222, 226)

SUPERSAMPLE = 3
OUT_ASPECT = (4, 5)


def font(size: float, weight: str = "Regular", mono: bool = False) -> ImageFont.FreeTypeFont:
    f = ImageFont.truetype(SF_MONO if mono else SF, max(1, round(size)))
    try:
        f.set_variation_by_name(weight)
    except (OSError, ValueError):
        pass
    return f


def run(*args: str) -> str:
    result = subprocess.run(args, capture_output=True, text=True)
    if result.returncode != 0:
        sys.exit(f"{args[0]} failed:\n{result.stderr[-2000:]}")
    return result.stdout


def screen_rect(frame: Path) -> tuple[int, int, int, int, tuple[int, int, int]]:
    """Bounding box of the chroma-green pixels, and their median colour."""
    img = Image.open(frame).convert("RGB")
    w, h = img.size
    px = img.load()
    xs, ys, greens = [], [], []
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            r, g, b = px[x, y]
            if g > 170 and r < 130 and b < 130:
                xs.append(x)
                ys.append(y)
                greens.append((r, g, b))
    if len(xs) < 1000:
        sys.exit("no green screen found in the first frame")
    greens.sort(key=lambda c: c[1])
    return min(xs), min(ys), max(xs) + 1, max(ys) + 1, greens[len(greens) // 2]


def bubble(draw: ImageDraw.ImageDraw, box, fill, radius) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill)


def draw_ui(w: int, h: int, pressed: bool, card_y: float) -> Image.Image:
    """The thread, anchored so the receipt card's centre sits at card_y (0-1 of screen height)."""
    s = SUPERSAMPLE
    W, H = w * s, h * s
    u = W / 100  # one unit = 1% of screen width
    img = Image.new("RGB", (W, H), PAGE)
    d = ImageDraw.Draw(img)

    # Status bar sits beside the notch, which the plate itself draws on top.
    d.text((10 * u, 4.6 * u), "9:41", font=font(4.2 * u, "Semibold"), fill=INK)

    # Header: avatar with the arch, contact name, hairline.
    cx, cy, r = W / 2, 19 * u, 6 * u
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=NAVY)
    stroke = round(1.3 * u)
    d.arc((cx - 2.2 * u, cy - 2.6 * u, cx + 2.2 * u, cy + 1.8 * u), 180, 360, fill=PAGE, width=stroke)
    for side in (-1, 1):
        x = cx + side * (2.2 * u - stroke / 2)
        d.line((x, cy - 0.4 * u, x, cy + 2.8 * u), fill=PAGE, width=stroke)
    d.text((cx, 29 * u), "Arcveil", font=font(3.6 * u, "Semibold"), fill=INK, anchor="mt")
    d.line((0, 35.5 * u, W, 35.5 * u), fill=HAIRLINE, width=max(1, round(0.25 * u)))

    body = font(4.4 * u)
    pad_x, pad_y, rad, line_h = 3.6 * u, 2.4 * u, 4.6 * u, 5.6 * u
    left, right = 4 * u, W - 4 * u

    # Built upward from the card, so the thread lands where the finger does.
    card_h = 17 * u
    card_top = card_y * H - card_h / 2
    card = (left, card_top, W * 0.78, card_top + card_h)

    lines = ["Sent 20 USDC to Sam.", "Inside your mandate."]
    reply_h = len(lines) * line_h + 2 * pad_y
    reply_top = card_top - 2.2 * u - reply_h
    you_h = line_h + 2 * pad_y
    you_top = reply_top - 3.4 * u - you_h

    d.text((W / 2, you_top - 7 * u), "Today 9:41", font=font(3.2 * u), fill=MUTED, anchor="mt")

    text = "send 20 to sam for lunch"
    tw = d.textlength(text, font=body)
    bubble(d, (right - tw - 2 * pad_x, you_top, right, you_top + you_h), BLUE, rad)
    d.text((right - tw - pad_x, you_top + pad_y), text, font=body, fill=PAGE)

    tw = max(d.textlength(t, font=body) for t in lines)
    bubble(d, (left, reply_top, left + tw + 2 * pad_x, reply_top + reply_h), GREY, rad)
    for i, t in enumerate(lines):
        d.text((left + pad_x, reply_top + pad_y + i * line_h), t, font=body, fill=INK)

    d.rounded_rectangle(card, radius=3.4 * u, fill=(214, 216, 222) if pressed else (243, 244, 246))
    d.rounded_rectangle((card[0], card[1], card[0] + 1.6 * u, card[3]), radius=0.8 * u, fill=MINT)
    d.text((left + 5 * u, card_top + 3.6 * u), "Receipt · 5 checks", font=font(4.2 * u, "Semibold"), fill=INK)
    d.text((left + 5 * u, card_top + 10.2 * u), "arcveil.dev/verify", font=font(3.4 * u, mono=True), fill=MUTED)

    # Compose field at the bottom.
    field_top = H - 17 * u
    d.rounded_rectangle((left, field_top, right, field_top + 9.5 * u), radius=4.75 * u, outline=HAIRLINE, width=round(0.35 * u))
    d.text((left + 4 * u, field_top + 4.75 * u), "Message", font=font(4 * u), fill=MUTED, anchor="lm")

    return img.resize((w, h), Image.LANCZOS)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("plate", type=Path)
    ap.add_argument("out", type=Path)
    ap.add_argument("--tap", type=float, default=None, help="second the finger lands")
    ap.add_argument("--tap-len", type=float, default=0.35, help="seconds it stays down")
    ap.add_argument("--card-y", type=float, default=0.45, help="card centre, 0-1 of screen height")
    a = ap.parse_args()

    with tempfile.TemporaryDirectory() as tmp:
        t = Path(tmp)
        run("ffmpeg", "-v", "error", "-y", "-i", str(a.plate), "-frames:v", "1", str(t / "f0.png"))
        x0, y0, x1, y1, green = screen_rect(t / "f0.png")
        # Even edges: an odd width against 4:2:0 chroma leaves a one-pixel seam.
        x0, y0 = x0 - x0 % 2, y0 - y0 % 2
        w, h = (x1 - x0 + 1) // 2 * 2, (y1 - y0 + 1) // 2 * 2
        draw_ui(w, h, pressed=False, card_y=a.card_y).save(t / "ui.png")
        draw_ui(w, h, pressed=True, card_y=a.card_y).save(t / "ui_pressed.png")
        print(f"screen {w}x{h} at {x0},{y0}; key colour #{green[0]:02x}{green[1]:02x}{green[2]:02x}", flush=True)

        pw, ph = (int(v) for v in run(
            "ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
            "-of", "csv=p=0", str(a.plate)).strip().split(","))
        duration = run("ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(a.plate)).strip()
        cw = pw
        ch = min(ph, round(pw * OUT_ASPECT[1] / OUT_ASPECT[0]) // 2 * 2)
        key = f"0x{green[0]:02x}{green[1]:02x}{green[2]:02x}"

        tap = ""
        if a.tap is not None:
            tap = f"[ui1][2:v]overlay={x0}:{y0}:shortest=1:format=rgb:enable='between(t,{a.tap},{a.tap + a.tap_len})'[ui2];"
        graph = (
            f"[0:v]format=rgba,split[a][b];"
            f"[a][1:v]overlay={x0}:{y0}:shortest=1:format=rgb[ui1];"
            + (tap or "[ui1]null[ui2];")
            # Key only inside the screen: the mint saucer is green enough to be eaten otherwise.
            + f"[b]crop={w}:{h}:{x0}:{y0},colorkey={key}:0.28:0.06,despill=type=green:mix=0.6:expand=0.1[fg];"
            f"[ui2][fg]overlay={x0}:{y0}:format=rgb,crop={cw}:{ch},format=yuv420p[v]"
        )
        run("ffmpeg", "-v", "error", "-y", "-i", str(a.plate),
            "-loop", "1", "-i", str(t / "ui.png"), "-loop", "1", "-i", str(t / "ui_pressed.png"),
            "-filter_complex", graph, "-map", "[v]", "-t", duration,
            "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-movflags", "+faststart", str(a.out))
    print(f"wrote {a.out}")


if __name__ == "__main__":
    main()
