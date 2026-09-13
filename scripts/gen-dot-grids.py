"""Regenerates the two plain dot-grid textures in public/backgrounds."""
import random
from PIL import Image, ImageDraw

random.seed(7)

def fig7(path="public/backgrounds/fig-7-bg.png", w=2100, h=1818, step=42):
    im = Image.new("RGBA", (w, h), (11, 11, 11, 255))
    d = ImageDraw.Draw(im)
    for y in range(20, h, step):
        for x in range(20, w, step):
            if random.random() < 0.85:
                d.rectangle((x, y, x + 3, y + 3), fill=(255, 255, 255, random.randint(28, 52)))
    im.save(path)

def env_hub(path="public/backgrounds/environment-hub-bg.png", w=863, h=443, step=28):
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for y in range(10, h, step):
        for x in range(10, w, step):
            a = int(70 * max(0, 1 - x / w) * random.uniform(0.5, 1))
            if a > 4:
                d.ellipse((x, y, x + 2, y + 2), fill=(255, 255, 255, a))
    im.save(path)

if __name__ == "__main__":
    fig7()
    env_hub()
    print("dot grids regenerated")
