"""Compose the "$ARCVEIL / DEV BURNT" post banner: a Higgsfield background plate
(no text in the render) plus the real Band mark and DM Mono type on the left half.
Pure functions; nothing mutates the source image.

Usage: python3 compose_burn.py <plate.png> <out.png> <light|dark> [fonts_dir]
"""
import sys
from PIL import Image, ImageDraw, ImageFont

OUT_W, OUT_H = 1920, 1080
NAVY = (27, 49, 88)
WHITE = (255, 255, 255)
MINT = (133, 237, 117)         # #85ed75, for dark plates
MINT_DEEP = (31, 157, 76)      # #1f9d4c, for light plates
GOLD = (233, 196, 120)

TICKER = "$ARCVEIL"
HEADLINE = "DEV BURNT"
SUB = "The dev allocation is gone for good."
SUB2 = "Burn tx verifiable on Arc."
FOOTER = "ARCVEIL.DEV  /  BUILT ON ARC"

PALETTES = {
    "light": {"fg": NAVY, "accent": MINT_DEEP, "mute": NAVY + (190,), "gold": (176, 128, 40)},
    "dark": {"fg": WHITE, "accent": MINT, "mute": WHITE + (170,), "gold": GOLD},
}


def band_mark(height: int, fg, accent) -> Image.Image:
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


def draw_tracked(d, xy, text, font, fill, tracking) -> float:
    x, y = xy
    for ch in text:
        d.text((x, y), ch, font=font, fill=fill)
        x += d.textlength(ch, font=font) + tracking
    return x


def fit_plate(src: Image.Image) -> Image.Image:
    w, h = src.size
    target = OUT_W / OUT_H
    if w / h > target:
        nw = int(h * target)
        src = src.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:
        nh = int(w / target)
        src = src.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    return src.resize((OUT_W, OUT_H), Image.LANCZOS)


def left_scrim(size, color, strength: int) -> Image.Image:
    """Horizontal gradient from `strength` alpha at the left edge to 0 at 60% width,
    so type on a busy plate stays readable without a box."""
    w, h = size
    grad = Image.new("L", (w, 1))
    stop = int(w * 0.6)
    grad.putdata([max(0, int(strength * (1 - x / stop))) if x < stop else 0 for x in range(w)])
    scrim = Image.new("RGBA", size, color + (0,))
    scrim.putalpha(grad.resize(size))
    return scrim


def compose(plate_path: str, out_path: str, mode: str, fonts_dir: str,
            top_frac: float = 0.20, sub_top_frac: float | None = None, scrim: int = 0) -> None:
    pal = PALETTES[mode]
    base = fit_plate(Image.open(plate_path).convert("RGB")).convert("RGBA")
    if scrim:
        base = Image.alpha_composite(base, left_scrim(base.size, (255, 255, 255) if mode == "light" else (0, 0, 0), scrim))
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    margin = int(OUT_W * 0.07)
    top = int(OUT_H * top_frac)

    mark_h = 56
    mark = band_mark(mark_h, pal["fg"], pal["accent"])
    layer.alpha_composite(mark, (margin, top))
    word = ImageFont.truetype(f"{fonts_dir}/DMMono-Medium.ttf", 44)
    bbox = word.getbbox("ARCVEIL")
    draw_tracked(d, (margin + mark.width + 20, top + (mark_h - (bbox[3] - bbox[1])) // 2 - bbox[1]),
                 "ARCVEIL", word, pal["fg"], 44 * 0.06)

    ticker = ImageFont.truetype(f"{fonts_dir}/DMMono-Medium.ttf", 150)
    y = top + mark_h + 70
    draw_tracked(d, (margin - 6, y), TICKER, ticker, pal["fg"], -150 * 0.02)

    head = ImageFont.truetype(f"{fonts_dir}/DMMono-Medium.ttf", 150)
    y += 165
    draw_tracked(d, (margin - 6, y), HEADLINE, head, pal["gold"], -150 * 0.02)

    rule_y = int(OUT_H * sub_top_frac) if sub_top_frac else y + 190
    d.rectangle([margin, rule_y, margin + 220, rule_y + 4], fill=pal["accent"])

    sub = ImageFont.truetype(f"{fonts_dir}/DMMono-Regular.ttf", 34)
    draw_tracked(d, (margin, rule_y + 28), SUB, sub, pal["fg"], 34 * 0.02)
    draw_tracked(d, (margin, rule_y + 28 + 50), SUB2, sub, pal["mute"], 34 * 0.02)

    small = ImageFont.truetype(f"{fonts_dir}/DMMono-Regular.ttf", 22)
    draw_tracked(d, (margin, int(OUT_H * 0.90)), FOOTER, small, pal["mute"], 22 * 0.1)

    Image.alpha_composite(base, layer).convert("RGB").save(out_path, quality=95)
    print("wrote", out_path)


if __name__ == "__main__":
    plate, out, mode = sys.argv[1], sys.argv[2], sys.argv[3]
    opts = dict(a.split("=", 1) for a in sys.argv[4:] if "=" in a)
    compose(plate, out, mode, opts.get("fonts", "../video/arc-mainnet/fonts"),
            top_frac=float(opts.get("top", 0.20)),
            sub_top_frac=float(opts["sub_top"]) if "sub_top" in opts else None,
            scrim=int(opts.get("scrim", 0)))
