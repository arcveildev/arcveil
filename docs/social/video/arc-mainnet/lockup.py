"""End-card lockup for the Arc-mainnet reply film: a 1920x1080 RGBA overlay with the
real Band mark, ARCVEIL wordmark, tagline and footer, drawn in navy for the pastel sky
of keyframe K4. Pure functions; the overlay is composited by ffmpeg, never baked
into a keyframe prompt.

Usage: python3 lockup.py <fonts_dir> <out.png>
"""
import sys
from PIL import Image, ImageDraw, ImageFont

W, H = 1920, 1080
NAVY = (27, 49, 88)          # Arc protocol navy #1b3158
ACCENT = (31, 157, 76)       # light-background accent #1f9d4c
TAGLINE = "Agents that can spend, never see, never exceed."
FOOTER = "ARCVEIL.DEV  /  BUILT ON ARC"


def band_mark(height: int, fg=NAVY, accent=ACCENT) -> Image.Image:
    """Logo mark from Logo.tsx (viewBox 28x24), rendered at 4x then downsampled."""
    S = 4
    unit = height * S / 24
    mw, mh = int(28 * unit), int(24 * unit)
    img = Image.new("RGBA", (mw, mh), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    u = lambda v: v * unit
    d.pieslice([u(3), u(-0.5), u(25), u(21.5)], 180, 360, fill=fg)
    d.pieslice([u(9), u(5.5), u(19), u(15.5)], 180, 360, fill=(0, 0, 0, 0))
    d.rectangle([u(0), u(10.5), u(28), u(11.25)], fill=(0, 0, 0, 0))
    d.rectangle([u(3), u(14), u(9), u(23)], fill=fg)
    d.rectangle([u(19), u(14), u(25), u(23)], fill=fg)
    d.rectangle([u(0), u(11.25), u(28), u(13.25)], fill=accent)
    return img.resize((mw // S, mh // S), Image.LANCZOS)


def tracked_width(d, text, font, tracking) -> float:
    return sum(d.textlength(ch, font=font) + tracking for ch in text) - tracking


def draw_tracked(d, xy, text, font, fill, tracking):
    x, y = xy
    for ch in text:
        d.text((x, y), ch, font=font, fill=fill)
        x += d.textlength(ch, font=font) + tracking


def build(fonts_dir: str) -> Image.Image:
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    mark_h = 64
    mark = band_mark(mark_h)
    word_font = ImageFont.truetype(f"{fonts_dir}/DMMono-Medium.ttf", 60)
    word_tracking = 60 * 0.06
    gap = 26
    word_w = tracked_width(d, "ARCVEIL", word_font, word_tracking)
    total_w = mark.width + gap + word_w
    x0 = (W - total_w) / 2
    lockup_y = int(H * 0.17)
    layer.alpha_composite(mark, (int(x0), lockup_y))
    bbox = word_font.getbbox("ARCVEIL")
    text_y = lockup_y + (mark_h - (bbox[3] - bbox[1])) // 2 - bbox[1]
    draw_tracked(d, (x0 + mark.width + gap, text_y), "ARCVEIL", word_font, NAVY, word_tracking)

    tag_font = ImageFont.truetype(f"{fonts_dir}/DMMono-Regular.ttf", 30)
    tag_tracking = 30 * 0.02
    tag_w = tracked_width(d, TAGLINE, tag_font, tag_tracking)
    draw_tracked(d, ((W - tag_w) / 2, lockup_y + mark_h + 30), TAGLINE, tag_font, NAVY + (215,), tag_tracking)

    small = ImageFont.truetype(f"{fonts_dir}/DMMono-Regular.ttf", 22)
    small_tracking = 22 * 0.1
    foot_w = tracked_width(d, FOOTER, small, small_tracking)
    draw_tracked(d, ((W - foot_w) / 2, int(H * 0.91)), FOOTER, small, NAVY + (235,), small_tracking)
    return layer


if __name__ == "__main__":
    fonts_dir, out = sys.argv[1], sys.argv[2]
    build(fonts_dir).save(out)
    print("wrote", out)
