"""
Generates assets/og-image.png (1200x630, the standard Open Graph size) from the
car mascot in assets/img_carro.png. Run again if the copy/branding changes:

    python scripts/generate-og-image.py
"""

from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT = 1200, 630
BG_TOP = (11, 18, 32)       # #0b1220
BG_BOTTOM = (19, 28, 46)    # #131c2e
GREEN = (34, 197, 94)       # #22c55e
LIGHT = (230, 237, 247)     # #e6edf7
MUTED = (148, 163, 184)     # #94a3b8

FONT_DIR = "C:/Windows/Fonts"
title_font = ImageFont.truetype(f"{FONT_DIR}/segoeuib.ttf", 118)
subtitle_font = ImageFont.truetype(f"{FONT_DIR}/segoeui.ttf", 40)
tagline_font = ImageFont.truetype(f"{FONT_DIR}/segoeui.ttf", 30)

img = Image.new("RGB", (WIDTH, HEIGHT), BG_TOP)
draw = ImageDraw.Draw(img)

# vertical gradient background
for y in range(HEIGHT):
    t = y / HEIGHT
    r = round(BG_TOP[0] + (BG_BOTTOM[0] - BG_TOP[0]) * t)
    g = round(BG_TOP[1] + (BG_BOTTOM[1] - BG_TOP[1]) * t)
    b = round(BG_TOP[2] + (BG_BOTTOM[2] - BG_TOP[2]) * t)
    draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

# car mascot, right side
car = Image.open("assets/img_carro.png").convert("RGBA")
car_h = 480
car_w = round(car_h * car.width / car.height)
car = car.resize((car_w, car_h), Image.LANCZOS)
car_x = WIDTH - car_w - 30
car_y = (HEIGHT - car_h) // 2
img.paste(car, (car_x, car_y), car)

# text block, left side
left_pad = 64
text_max_width = car_x - left_pad - 20

draw.text((left_pad, 190), "willfipe", font=title_font, fill=GREEN)
draw.text((left_pad, 320), "Consulta a tabela FIPE", font=subtitle_font, fill=LIGHT)
draw.text((left_pad, 372), "de veículos", font=subtitle_font, fill=LIGHT)
draw.text((left_pad, 440), "Carros  ·  Motos  ·  Caminhões", font=tagline_font, fill=MUTED)

img.save("assets/og-image.png", optimize=True)
print("Wrote assets/og-image.png", img.size)
