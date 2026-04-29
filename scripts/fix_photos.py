"""
Manual crop fixes for siddhant, pranav, Rohit.
Crop box = (left, top, right, bottom) in pixels of the original image.
"""

from PIL import Image, ImageOps
import os

PUBLIC   = os.path.join(os.path.dirname(__file__), "../public")
OUT      = os.path.join(os.path.dirname(__file__), "../public/processed")
SIZE     = (400, 400)
QUALITY  = 92

# Original dimensions for reference when choosing crops:
#   pranav.png  : 1920 x 1080  (landscape, face upper-center, person looking down-left)
#   siddhant.jpg: 3024 x 4032  (portrait, face upper-center, crop missed forehead)
#   Rohit.jpg   : 3024 x 4032  (portrait, full body, face in upper portion)

MANUAL = {
    "pranav.png":    (720,  20, 1350, 680),   # face upper-center of landscape frame
    "siddhant.jpg":  (750,  30, 2250, 1530),  # upper-center, include full forehead
    "Rohit.jpg":     (980,  50, 2380, 1450),  # face in upper third of portrait
}

for filename, box in MANUAL.items():
    src = os.path.join(PUBLIC, filename)
    name = os.path.splitext(filename)[0]
    dst = os.path.join(OUT, f"{name}.jpg")

    img = Image.open(src)
    img = ImageOps.exif_transpose(img)
    img = img.convert("RGB")

    left, top, right, bottom = box
    w = right - left
    h = bottom - top
    side = min(w, h)

    # Make strictly square from the crop box
    cx = (left + right) // 2
    cy = (top + bottom) // 2
    half = side // 2
    sq = img.crop((cx - half, max(0, cy - half), cx + half, cy + half))

    final = sq.resize(SIZE, Image.LANCZOS)
    final.save(dst, "JPEG", quality=QUALITY, optimize=True)
    print(f"✓ {filename} → {dst}")

print("Done.")
