"""Burned-in captions for the Arc-mainnet reply film, drawn the same way as the
lockup: DM Mono in navy on a soft white pill, bottom-centre. One RGBA PNG per cue,
then ffmpeg overlays each for its window. Cue times are film time (the VO starts
at +0.3 s) and come from silencedetect on vo-grady.mp3.

Usage: python3 captions.py <fonts_dir> <out_dir>   → writes cue PNGs + filter.txt
"""
import sys
from PIL import Image, ImageDraw, ImageFont

W, H = 1920, 1080
NAVY = (27, 49, 88)
PILL = (255, 255, 255, 205)
FONT_PX = 40
LINE_GAP = 12
PAD_X, PAD_Y = 34, 20
RADIUS = 12
BASELINE_Y = int(H * 0.86)   # bottom edge of the pill

# (start, end, text) in film seconds. The last line is carried by the lockup instead.
CUES = [
    (0.30, 2.00, "Arc mainnet is live."),
    (2.00, 6.60, "USDC as gas, sub-second finality,\nand agents moving money from day one."),
    (6.90, 9.90, "But an agent that can spend\nis an agent that can see:"),
    (10.30, 12.10, "every balance, every key."),
    (12.60, 15.50, "Arcveil hands it a mandate\ninstead of your keys."),
    (15.80, 18.90, "It spends. It never sees.\nIt never exceeds."),
    (19.10, 21.00, "And every action leaves a receipt."),
]


def render_cue(text: str, font: ImageFont.FreeTypeFont) -> Image.Image:
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    lines = text.split("\n")
    line_h = font.getbbox("Ag")[3] - font.getbbox("Ag")[1]
    widths = [d.textlength(line, font=font) for line in lines]
    box_w = max(widths) + 2 * PAD_X
    box_h = len(lines) * line_h + (len(lines) - 1) * LINE_GAP + 2 * PAD_Y
    x0 = (W - box_w) / 2
    y0 = BASELINE_Y - box_h
    d.rounded_rectangle([x0, y0, x0 + box_w, y0 + box_h], radius=RADIUS, fill=PILL)
    y = y0 + PAD_Y - font.getbbox("Ag")[1]
    for line, lw in zip(lines, widths):
        d.text(((W - lw) / 2, y), line, font=font, fill=NAVY)
        y += line_h + LINE_GAP
    return layer


def ffmpeg_filter(n: int) -> str:
    """Chain of overlays: input 0 is the film, inputs 1..n are the cue PNGs (looped)."""
    parts, prev = [], "0:v"
    for i in range(n):
        start, end, _ = CUES[i]
        out = f"v{i + 1}"
        parts.append(f"[{prev}][{i + 1}:v]overlay=0:0:enable='between(t,{start},{end})'[{out}]")
        prev = out
    return ";".join(parts), prev


if __name__ == "__main__":
    fonts_dir, out_dir = sys.argv[1], sys.argv[2]
    font = ImageFont.truetype(f"{fonts_dir}/DMMono-Medium.ttf", FONT_PX)
    for i, (_, _, text) in enumerate(CUES):
        render_cue(text, font).save(f"{out_dir}/cue{i + 1}.png")
    graph, last = ffmpeg_filter(len(CUES))
    with open(f"{out_dir}/filter.txt", "w") as f:
        f.write(graph + "\n" + last + "\n")
    print("wrote", len(CUES), "cues; final label", last)
