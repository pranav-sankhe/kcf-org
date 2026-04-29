"""
Processes member photos:
  - Detects face using OpenCV Haar cascade
  - Crops to face with generous padding (so it looks like a profile picture)
  - Resizes to 400x400 square
  - Saves as high-quality JPEG to public/processed/
"""

import cv2
import os
import sys
from PIL import Image, ImageOps

INPUT_DIR = os.path.join(os.path.dirname(__file__), "../public")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "../public/processed")
OUTPUT_SIZE = (400, 400)
JPEG_QUALITY = 92

# Haar cascade bundled with OpenCV
CASCADE_PATH = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
face_cascade = cv2.CascadeClassifier(CASCADE_PATH)

PHOTO_FILES = [
    "Ajay.jpg", "Anant.jpg", "Anil.jpg", "Ashwini.jpg",
    "Deepesh.jpg", "Devesh.jpg", "Ritik.jpg", "Rohit.jpg",
    "Sahas.jpg", "Shreyansh.jpg", "pranav.png", "siddhant.jpg",
]

os.makedirs(OUTPUT_DIR, exist_ok=True)


def detect_face(img_cv):
    """Try frontal face, fall back to profile, then return None."""
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)

    faces = face_cascade.detectMultiScale(
        gray, scaleFactor=1.05, minNeighbors=4, minSize=(60, 60)
    )
    if len(faces) == 0:
        # Try with looser params
        faces = face_cascade.detectMultiScale(
            gray, scaleFactor=1.1, minNeighbors=2, minSize=(40, 40)
        )
    if len(faces) == 0:
        return None

    # Pick the largest face
    faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
    return faces[0]  # x, y, w, h


def crop_to_face(pil_img, x, y, w, h, padding_factor=1.5):
    """
    Expand the face bounding box by padding_factor on all sides,
    make it square, and crop.
    """
    iw, ih = pil_img.size
    cx = x + w // 2
    cy = y + h // 2

    # Square side = face_size * padding_factor, a bit more vertical padding for forehead
    half = int(max(w, h) * padding_factor / 2)
    # Shift center up slightly to include forehead
    cy = cy - int(h * 0.1)

    left   = max(cx - half, 0)
    right  = min(cx + half, iw)
    top    = max(cy - half, 0)
    bottom = min(cy + half, ih)

    # If we hit an edge, extend the other side to keep it square
    side = min(right - left, bottom - top)
    return pil_img.crop((left, top, left + side, top + side))


def process(filename):
    src = os.path.join(INPUT_DIR, filename)
    name, _ = os.path.splitext(filename)
    dst = os.path.join(OUTPUT_DIR, f"{name}.jpg")

    # Load with Pillow, auto-rotate from EXIF
    pil_img = Image.open(src)
    pil_img = ImageOps.exif_transpose(pil_img)
    pil_img = pil_img.convert("RGB")

    # Convert to OpenCV for face detection
    import numpy as np
    img_cv = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

    face = detect_face(img_cv)

    if face is not None:
        x, y, w, h = face
        cropped = crop_to_face(pil_img, x, y, w, h, padding_factor=1.6)
        print(f"  ✓ {filename}: face detected at ({x},{y}) size {w}x{h}")
    else:
        # No face found — smart center-square crop (upper-middle of image)
        iw, ih = pil_img.size
        side = min(iw, ih)
        left = (iw - side) // 2
        # Crop from slightly above center vertically (portraits tend to be top-heavy)
        top = max(0, int(ih * 0.05))
        cropped = pil_img.crop((left, top, left + side, top + side))
        print(f"  ⚠ {filename}: no face detected, used center crop")

    # Resize to 400x400 with high-quality Lanczos
    final = cropped.resize(OUTPUT_SIZE, Image.LANCZOS)

    final.save(dst, "JPEG", quality=JPEG_QUALITY, optimize=True)
    print(f"    → saved {dst} ({final.size[0]}x{final.size[1]})")


if __name__ == "__main__":
    print(f"Processing {len(PHOTO_FILES)} photos → {OUTPUT_DIR}\n")
    for f in PHOTO_FILES:
        src = os.path.join(INPUT_DIR, f)
        if not os.path.exists(src):
            print(f"  ✗ {f}: not found, skipping")
            continue
        try:
            process(f)
        except Exception as e:
            print(f"  ✗ {f}: ERROR — {e}")
    print("\nDone.")
