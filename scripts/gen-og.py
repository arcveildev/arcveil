#!/usr/bin/env python3
"""Composes public/og.png — the social card — from the hero still.

    python3 scripts/gen-og.py

Kept as a script rather than a one-off so the card can be regenerated when the
headline or the hero art changes. Text is measured and wrapped, so a longer line
cannot silently run off the edge.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "public/backgrounds/hero-veil.webp"
OUT = ROOT / "public/og.png"

W, H = 1200, 630
MARGIN = 72
ACCENT = (133, 237, 117)
WHITE = (255, 255, 255)

SANS = "/System/Library/Fonts/SFNS.ttf"
MONO = "/System/Library/Fonts/SFNSMono.ttf"

TITLE = "Agents that can spend. Never see. Never exceed."
SUBTITLE = "A mandate instead of your keys — and a receipt for every action."
FOOTER = "ARC · CHAIN 5042 · arcveil.dev"


def wrap(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, width: int) -> list[str]:
    lines: list[str] = []
    line = ""
    for word in text.split():
        candidate = f"{line} {word}".strip()
        if draw.textlength(candidate, font=font) <= width or not line:
            line = candidate
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def background() -> Image.Image:
    art = Image.open(SOURCE).convert("RGB")
    scale = max(W / art.width, H / art.height)
    art = art.resize((round(art.width * scale), round(art.height * scale)), Image.LANCZOS)
    art = art.crop((0, 0, W, H))

    # Flat knock-down, then a left-to-right scrim so the copy sits on darkness
    # and the art keeps its depth on the right.
    card = Image.blend(art, Image.new("RGB", (W, H), (14, 14, 14)), 0.45)
    scrim = Image.new("L", (W, 1))
    for x in range(W):
        t = x / (W - 1)
        scrim.putpixel((x, 0), int(255 * max(0.0, 0.95 - 1.15 * t)))
    scrim = scrim.resize((W, H))
    return Image.composite(Image.new("RGB", (W, H), (14, 14, 14)), card, scrim)


def draw_mark(card: Image.Image, x: int, y: int, size: int) -> None:
    """The logo: a parabolic arch cut by a band of light, drawn at 28x24 scale."""
    s = size / 24
    layer = Image.new("RGBA", card.size, (0, 0, 0, 0))
    pen = ImageDraw.Draw(layer)

    cx, cy = x + 14 * s, y + 12 * s
    outer, inner = 11 * s, 5 * s
    pen.pieslice([cx - outer, cy - outer, cx + outer, cy + outer], 180, 360, fill=WHITE + (255,))
    pen.pieslice([cx - inner, cy - inner, cx + inner, cy + inner], 180, 360, fill=(0, 0, 0, 0))
    pen.rectangle([x + 3 * s, y + 14 * s, x + 9 * s, y + 23 * s], fill=WHITE + (255,))
    pen.rectangle([x + 19 * s, y + 14 * s, x + 25 * s, y + 23 * s], fill=WHITE + (255,))
    # The band runs edge to edge through the arch, clearing a gap around itself.
    pen.rectangle([x - 2 * s, y + 10.5 * s, x + 30 * s, y + 14 * s], fill=(0, 0, 0, 0))
    pen.rectangle([x - 2 * s, y + 11.25 * s, x + 30 * s, y + 13.25 * s], fill=ACCENT + (255,))

    card.paste(layer, (0, 0), layer)


def main() -> None:
    card = background()
    draw = ImageDraw.Draw(card)

    wordmark = ImageFont.truetype(MONO, 26)
    title = ImageFont.truetype(SANS, 60)
    subtitle = ImageFont.truetype(SANS, 27)
    footer = ImageFont.truetype(MONO, 20)

    draw_mark(card, MARGIN, 62, 34)
    draw.text((MARGIN + 52, 70), "ARCVEIL", font=wordmark, fill=WHITE)

    usable = W - MARGIN * 2
    y = 268
    for line in wrap(draw, TITLE, title, usable):
        draw.text((MARGIN, y), line, font=title, fill=WHITE)
        y += 74

    y += 10
    for line in wrap(draw, SUBTITLE, subtitle, usable):
        draw.text((MARGIN, y), line, font=subtitle, fill=(255, 255, 255, 140))
        y += 38

    draw.rectangle([MARGIN, 524, MARGIN + 150, 526], fill=ACCENT)
    draw.text((MARGIN, 552), FOOTER, font=footer, fill=(150, 150, 150))

    card.save(OUT, optimize=True)
    print(f"wrote {OUT.relative_to(ROOT)} ({card.width}x{card.height})")


if __name__ == "__main__":
    main()
