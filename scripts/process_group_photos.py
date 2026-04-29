"""
Converts and resizes group photos for web use.
Outputs to public/GroupPictures/web/
"""

from PIL import Image, ImageOps
import os

INPUT  = os.path.join(os.path.dirname(__file__), "../public/GroupPictures")
OUTPUT = os.path.join(os.path.dirname(__file__), "../public/GroupPictures/web")
MAX_W  = 1200
Q      = 88

os.makedirs(OUTPUT, exist_ok=True)

FILES = ["GP-0.jpg", "GP-1.jpg", "GP-2.jpg", "GP-3.jpg", "GP-4.jpg"]

for fname in FILES:
    src  = os.path.join(INPUT, fname)
    name = os.path.splitext(fname)[0].lower()
    dst  = os.path.join(OUTPUT, f"{name}.jpg")

    img = Image.open(src)
    img = ImageOps.exif_transpose(img)
    img = img.convert("RGB")

    # GP-3 content is rotated 90° CW in a landscape frame — fix it
    if fname == "GP-3.jpg":
        img = img.rotate(90, expand=True)

    w, h = img.size
    if w > MAX_W:
        img = img.resize((MAX_W, int(h * MAX_W / w)), Image.LANCZOS)

    img.save(dst, "JPEG", quality=Q, optimize=True)
    print(f"  ✓ {fname} → {img.size[0]}x{img.size[1]}  →  {dst}")

print("\nDone.")
