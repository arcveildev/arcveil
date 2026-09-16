"""Compose the "$ARCVEIL / DEV BURNT" post banner: a Higgsfield background plate
(no text in the render) plus the real Band mark and DM Mono type on the left half.
Brand colours only (navy, mint, white); no gold. Three type styles:

  stack    ticker and headline stacked, all navy, mint rule
  outline  ticker solid, headline as a hollow navy outline
  receipt  frosted card with a mint "DEV BURNT" label, ticker, and a ledger block

Pure functions; nothing mutates the source image.

Usage: python3 compose_burn.py <plate.png> <out.png> <light|dark> [style=stack] [top=0.13] [sub_top=] [scrim=0] [fonts=dir]
"""
import sys
from PIL import Image, ImageDraw, ImageFont

OUT_W, OUT_H = 1920, 1080
NAVY = (27, 49, 88)
WHITE = (255, 255, 255)
MINT = (133, 237, 117)         # #85ed75
MINT_DEEP = (31, 157, 76)      # #1f9d4c, accent on light plates

TICKER = "$ARCVEIL"
HEADLINE = "DEV BURNT"
SUB = "The dev allocation is gone for good."
SUB2 = "Burn tx verifiable on Arc."
FOOTER = "ARCVEIL.DEV  /  BUILT ON ARC"
LEDGER = [("ALLOCATION", "100% OF DEV SUPPLY"), ("STATUS", "BURNT"), ("PROOF", "TX ON ARC")]

PALETTES = {
    "light": {"fg": NAVY, "accent": MINT_DEEP, "pill": MINT, "pill_fg": NAVY, "mute": NAVY + (190,), "card": WHITE + (200,)},
    "dark": {"fg": WHITE, "accent": MINT, "pill": MINT, "pill_fg": NAVY, "mute": WHITE + (170,), "card": (11, 20, 36, 200)},
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


def tracked_width(d, text, font, tracking) -> float:
    return sum(d.textlength(ch, font=font) + tracking for ch in text) - tracking


def draw_tracked(d, xy, text, font, fill, tracking, stroke=0, stroke_fill=None) -> float:
    x, y = xy
    for ch in text:
        d.text((x, y), ch, font=font, fill=fill, stroke_width=stroke, stroke_fill=stroke_fill)
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
    w, h = size
    grad = Image.new("L", (w, 1))
    stop = int(w * 0.6)
    grad.putdata([max(0, int(strength * (1 - x / stop))) if x < stop else 0 for x in range(w)])
    scrim = Image.new("RGBA", size, color + (0,))
    scrim.putalpha(grad.resize(size))
    return scrim


def fonts(fonts_dir: str):
    med = lambda px: ImageFont.truetype(f"{fonts_dir}/DMMono-Medium.ttf", px)
    reg = lambda px: ImageFont.truetype(f"{fonts_dir}/DMMono-Regular.ttf", px)
    return med, reg


def draw_lockup(layer, d, pal, med, x, y, mark_h=56) -> int:
    mark = band_mark(mark_h, pal["fg"], pal["accent"])
    layer.alpha_composite(mark, (x, y))
    word = med(44)
    bbox = word.getbbox("ARCVEIL")
    draw_tracked(d, (x + mark.width + 20, y + (mark_h - (bbox[3] - bbox[1])) // 2 - bbox[1]), "ARCVEIL", word, pal["fg"], 44 * 0.06)
    return y + mark_h


def draw_subs(d, pal, reg, x, rule_y):
    d.rectangle([x, rule_y, x + 220, rule_y + 4], fill=pal["accent"])
    sub = reg(34)
    draw_tracked(d, (x, rule_y + 28), SUB, sub, pal["fg"], 34 * 0.02)
    draw_tracked(d, (x, rule_y + 78), SUB2, sub, pal["mute"], 34 * 0.02)


def draw_footer(d, pal, reg, x):
    draw_tracked(d, (x, int(OUT_H * 0.90)), FOOTER, reg(22), pal["mute"], 22 * 0.1)


def style_stack(layer, d, pal, med, reg, margin, top, sub_top):
    y = draw_lockup(layer, d, pal, med, margin, top) + 70
    big = med(150)
    draw_tracked(d, (margin - 6, y), TICKER, big, pal["fg"], -150 * 0.02)
    y += 165
    draw_tracked(d, (margin - 6, y), HEADLINE, big, pal["fg"], -150 * 0.02)
    draw_subs(d, pal, reg, margin, sub_top or y + 190)


def style_outline(layer, d, pal, med, reg, margin, top, sub_top):
    y = draw_lockup(layer, d, pal, med, margin, top) + 70
    big = med(150)
    draw_tracked(d, (margin - 6, y), TICKER, big, pal["fg"], -150 * 0.02)
    y += 165
    draw_tracked(d, (margin - 6, y), HEADLINE, big, (0, 0, 0, 0), -150 * 0.02, stroke=4, stroke_fill=pal["fg"])
    draw_subs(d, pal, reg, margin, sub_top or y + 190)


def style_receipt(layer, d, pal, med, reg, margin, top, sub_top):
    card_w, pad = 780, 48
    x0, y0 = margin, top
    # measure content first
    label_font, big, row_font, key_font = med(26), med(132), reg(30), reg(22)
    label_h = 46
    content_h = pad + label_h + 28 + 150 + 30 + 2 + 30 + len(LEDGER) * 52 + pad - 20
    d.rounded_rectangle([x0, y0, x0 + card_w, y0 + content_h], radius=18, fill=pal["card"])
    x, y = x0 + pad, y0 + pad
    # mint label pill
    lw = tracked_width(d, HEADLINE, label_font, 26 * 0.12)
    d.rounded_rectangle([x, y, x + lw + 36, y + label_h], radius=8, fill=pal["pill"])
    lb = label_font.getbbox(HEADLINE)
    draw_tracked(d, (x + 18, y + (label_h - (lb[3] - lb[1])) // 2 - lb[1]), HEADLINE, label_font, pal["pill_fg"], 26 * 0.12)
    y += label_h + 28
    draw_tracked(d, (x - 5, y), TICKER, big, pal["fg"], -132 * 0.02)
    y += 150 + 30
    d.rectangle([x, y, x0 + card_w - pad, y + 2], fill=pal["accent"])
    y += 30
    for key, val in LEDGER:
        draw_tracked(d, (x, y + 6), key, key_font, pal["mute"], 22 * 0.12)
        vw = tracked_width(d, val, row_font, 30 * 0.02)
        draw_tracked(d, (x0 + card_w - pad - vw, y), val, row_font, pal["fg"], 30 * 0.02)
        y += 52
    # lockup sits under the card
    draw_lockup(layer, d, pal, med, margin, y0 + content_h + 36, mark_h=40)


STYLES = {"stack": style_stack, "outline": style_outline, "receipt": style_receipt}


def compose(plate_path, out_path, mode, fonts_dir, style="stack", top_frac=0.13, sub_top_frac=None, scrim=0):
    pal = PALETTES[mode]
    base = fit_plate(Image.open(plate_path).convert("RGB")).convert("RGBA")
    if scrim:
        base = Image.alpha_composite(base, left_scrim(base.size, WHITE if mode == "light" else (0, 0, 0), scrim))
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    med, reg = fonts(fonts_dir)
    margin = int(OUT_W * 0.07)
    STYLES[style](layer, d, pal, med, reg, margin, int(OUT_H * top_frac), int(OUT_H * sub_top_frac) if sub_top_frac else None)
    if style != "receipt":
        draw_footer(d, pal, reg, margin)
    Image.alpha_composite(base, layer).convert("RGB").save(out_path, quality=95)
    print("wrote", out_path)


if __name__ == "__main__":
    plate, out, mode = sys.argv[1], sys.argv[2], sys.argv[3]
    opts = dict(a.split("=", 1) for a in sys.argv[4:] if "=" in a)
    compose(plate, out, mode, opts.get("fonts", "../video/arc-mainnet/fonts"),
            style=opts.get("style", "stack"),
            top_frac=float(opts.get("top", 0.13)),
            sub_top_frac=float(opts["sub_top"]) if "sub_top" in opts else None,
            scrim=int(opts.get("scrim", 0)))
