"""Compose Arcveil social header banners: crop Higgsfield render to 3:1,
overlay the real Band mark + wordmark + tagline. Pure functions, no mutation of inputs."""
from PIL import Image, ImageDraw, ImageFont
import sys

OUT_W, OUT_H = 3000, 1000            # 2x of X's 1500x500 header
BG = (14, 14, 14)
WHITE = (255, 255, 255)
ACCENT = (133, 237, 117)             # #85ed75
BAND_TARGET = 0.45                   # where the light band should sit (fraction of height)

def crop_to_3x1(src: Image.Image, band_y: int, band_target: float = BAND_TARGET) -> Image.Image:
    w, h = src.size
    ch = w // 3
    top = max(0, min(h - ch, int(band_y - band_target * ch)))
    return src.crop((0, top, w, top + ch)).resize((OUT_W, OUT_H), Image.LANCZOS)

def band_mark(height: int, fg=WHITE, accent=ACCENT) -> Image.Image:
    """Logo mark from Logo.tsx (viewBox 28x24), rendered at 4x then downsampled."""
    S = 4
    unit = height * S / 24
    W, H = int(28 * unit), int(24 * unit)
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    u = lambda v: v * unit
    # crown: outer radius 11 centred (14,10.5), inner radius 5, upper half only
    d.pieslice([u(3), u(-0.5), u(25), u(21.5)], 180, 360, fill=fg)
    d.pieslice([u(9), u(5.5), u(19), u(15.5)], 180, 360, fill=(0, 0, 0, 0))
    d.rectangle([u(0), u(10.5), u(28), u(11.25)], fill=(0, 0, 0, 0))   # flat cut at 10.5 (gap above band)
    # legs
    d.rectangle([u(3), u(14), u(9), u(23)], fill=fg)
    d.rectangle([u(19), u(14), u(25), u(23)], fill=fg)
    # band
    d.rectangle([u(0), u(11.25), u(28), u(13.25)], fill=accent)
    return img.resize((W // S, H // S), Image.LANCZOS)

def draw_tracked(d, xy, text, font, fill, tracking):
    x, y = xy
    for ch in text:
        d.text((x, y), ch, font=font, fill=fill)
        x += d.textlength(ch, font=font) + tracking
    return x

def compose(src_path: str, band_y: int, out_path: str, tagline: str, band_target: float = BAND_TARGET, fg=WHITE, accent=ACCENT):
    src = Image.open(src_path).convert("RGB")
    base = crop_to_3x1(src, band_y, band_target).convert("RGBA")
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    margin_x = int(OUT_W * 0.075)
    mark_h = 92
    mark = band_mark(mark_h, fg=fg, accent=accent)
    lockup_y = int(OUT_H * 0.20)
    layer.alpha_composite(mark, (margin_x, lockup_y))

    word_font = ImageFont.truetype("DMMono-Medium.ttf", 84)
    tracking = 84 * 0.04
    text_x = margin_x + mark.width + 34
    bbox = word_font.getbbox("ARCVEIL")
    text_y = lockup_y + (mark_h - (bbox[3] - bbox[1])) // 2 - bbox[1]
    draw_tracked(d, (text_x, text_y), "ARCVEIL", word_font, fg, tracking)

    tag_font = ImageFont.truetype("DMMono-Regular.ttf", 40)
    tag_y = lockup_y + mark_h + 44
    draw_tracked(d, (margin_x, tag_y), tagline, tag_font, fg + (150,), 40 * 0.02)

    small = ImageFont.truetype("DMMono-Regular.ttf", 28)
    draw_tracked(d, (margin_x, int(OUT_H * 0.86)), "ARCVEIL.DEV  /  BUILT ON ARC", small, fg + (100,), 28 * 0.08)

    Image.alpha_composite(base, layer).convert("RGB").save(out_path, quality=95)
    print("wrote", out_path)

NAVY = (27, 49, 88)          # Arc protocol navy #1b3158
ACCENT_LIGHT = (31, 157, 76)  # prime-light preset accent #1f9d4c

if __name__ == "__main__":
    tag = "Agents that can spend, never see, never exceed."
    compose("opt3-raw.png", 670, "arcveil-header-C-sky-veil.png", tag, band_target=0.53, fg=NAVY, accent=ACCENT_LIGHT)
    compose("opt4-raw.png", 697, "arcveil-header-D-sky-arch.png", tag, band_target=0.50, fg=NAVY, accent=ACCENT_LIGHT)
    compose("opt5-raw.png", 956, "arcveil-header-E-horizon-veil.png", tag, band_target=0.62)
    compose("opt6-raw.png", 777, "arcveil-header-F-horizon-arch.png", tag, band_target=0.50)
