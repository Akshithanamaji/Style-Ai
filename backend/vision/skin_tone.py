"""
Skin tone, undertone, and seasonal color analysis from a JPEG/PNG image
and MediaPipe facial landmarks (normalized 0-1 coordinates).

LIMITATIONS (see LIMITATIONS.md for full details):
- Accuracy is highly sensitive to lighting conditions.
- Results may vary significantly across diverse skin tones.
- White-balance correction using eye whites is a heuristic approximation.
- Seasonal color theory is an industry styling convention, not science.
Always show the manual-override control prominently.
"""

import numpy as np
import cv2
import base64
from colormath.color_objects import sRGBColor, LabColor
from colormath.color_conversions import convert_color


# ── Landmark index constants (MediaPipe 468-point model) ─────────────────────
# Forehead center region (landmark 10 is top, we sample near 151, 9, 8)
FOREHEAD_IDX = [9, 8, 151]
# Left cheek landmarks (lateral mid-cheek)
LEFT_CHEEK_IDX = [116, 117, 118, 119, 120]
# Right cheek landmarks
RIGHT_CHEEK_IDX = [345, 346, 347, 348, 349]
# Sclera (eye white) landmarks for white-balance reference
LEFT_SCLERA_IDX = [33, 246, 161, 160, 159, 158, 157, 173]
RIGHT_SCLERA_IDX = [263, 466, 388, 387, 386, 385, 384, 398]


def decode_image(image_bytes: bytes) -> np.ndarray:
    """Decode image bytes to BGR numpy array."""
    arr = np.frombuffer(image_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image")
    return img


def decode_base64_image(data_url: str) -> np.ndarray:
    """Accept a data URL (data:image/...;base64,...) or raw base64 string."""
    if data_url.startswith("data:"):
        _, encoded = data_url.split(",", 1)
    else:
        encoded = data_url
    return decode_image(base64.b64decode(encoded))


def sample_region(img: np.ndarray, landmarks: list[dict], indices: list[int], radius: int = 5) -> list[tuple]:
    """
    Sample pixel colors from small circular regions around each landmark.
    Returns a flat list of (R, G, B) tuples (0-255 ints).
    """
    h, w = img.shape[:2]
    samples = []
    for idx in indices:
        lm = landmarks[idx]
        px, py = int(lm["x"] * w), int(lm["y"] * h)
        for dy in range(-radius, radius + 1):
            for dx in range(-radius, radius + 1):
                if dx * dx + dy * dy <= radius * radius:
                    nx, ny = px + dx, py + dy
                    if 0 <= nx < w and 0 <= ny < h:
                        b, g, r = img[ny, nx]
                        samples.append((int(r), int(g), int(b)))
    return samples


def median_color(samples: list[tuple]) -> tuple:
    """Return the per-channel median of a list of (R,G,B) samples."""
    if not samples:
        return (200, 170, 140)  # fallback neutral
    arr = np.array(samples)
    return tuple(int(np.median(arr[:, c])) for c in range(3))


def white_balance_correction(img: np.ndarray, landmarks: list[dict]) -> np.ndarray:
    """
    Apply a simple von Kries-style white balance using the sclera (eye white)
    as a neutral reference. This reduces color casts from warm/cool lighting.

    The assumption is that the eye whites are neutral gray/white in reality.
    If the sampled eye whites appear yellowish, we shift the whole image cooler.
    """
    sclera_samples = (
        sample_region(img, landmarks, LEFT_SCLERA_IDX, radius=3) +
        sample_region(img, landmarks, RIGHT_SCLERA_IDX, radius=3)
    )
    if not sclera_samples:
        return img  # no correction possible

    ref_r, ref_g, ref_b = median_color(sclera_samples)
    # Target: neutral sclera at ~220 (not full white to avoid blown highlights)
    target = 220.0
    if ref_r == 0 or ref_g == 0 or ref_b == 0:
        return img

    # Cap at 1.5× to avoid blowing out images where sclera landmarks land off-target
    scale_r = min(target / ref_r, 1.5)
    scale_g = min(target / ref_g, 1.5)
    scale_b = min(target / ref_b, 1.5)

    corrected = img.astype(np.float32)
    corrected[:, :, 2] = np.clip(corrected[:, :, 2] * scale_r, 0, 255)  # R (BGR: channel 2)
    corrected[:, :, 1] = np.clip(corrected[:, :, 1] * scale_g, 0, 255)  # G
    corrected[:, :, 0] = np.clip(corrected[:, :, 0] * scale_b, 0, 255)  # B

    return corrected.astype(np.uint8)


def rgb_to_lab(r: int, g: int, b: int) -> tuple:
    """Convert sRGB (0-255) to CIE LAB using colormath."""
    srgb = sRGBColor(r / 255.0, g / 255.0, b / 255.0)
    lab = convert_color(srgb, LabColor)
    return lab.lab_l, lab.lab_a, lab.lab_b


def classify_undertone(lab_a: float, lab_b: float) -> str:
    """
    Classify undertone from LAB a/b channels:
    - a+ = red/pink, a- = green
    - b+ = yellow, b- = blue

    Warm (golden/peachy): high b+ relative to a+
    Cool (pink/rosy):     high a+ relative to b+, or b- trending blue
    Neutral:              balanced a and b channels

    These thresholds are empirical approximations. Real accuracy requires
    spectrophotometric measurement. See LIMITATIONS.md.
    """
    # Warm: yellow dominates (high b) and not strongly pink
    if lab_b > 18 and lab_a < lab_b * 0.6:
        return "warm"
    # Cool: pink dominates or slightly blue-shifted
    if lab_a > 12 and lab_b < lab_a * 1.2:
        return "cool"
    # Neutral: neither strongly warm nor cool
    return "neutral"


def classify_depth(lab_l: float) -> str:
    """
    Classify skin depth from LAB L (lightness, 0=black, 100=white).
    light:  L > 65
    medium: 45 <= L <= 65
    deep:   L < 45
    """
    if lab_l > 65:
        return "light"
    if lab_l >= 45:
        return "medium"
    return "deep"


def map_to_season(undertone: str, depth: str) -> str:
    """
    Map undertone × depth → seasonal color type.

    Seasonal theory grid (industry heuristic):
      warm + light  → Spring
      cool + light  → Summer
      warm + medium → Spring or Autumn (we use Autumn for warmer depth)
      cool + medium → Summer or Winter (we use Summer for lighter medium)
      warm + deep   → Autumn
      cool + deep   → Winter
      neutral + *   → nearest season by depth
    """
    table = {
        ("warm",    "light"):  "Spring",
        ("warm",    "medium"): "Autumn",
        ("warm",    "deep"):   "Autumn",
        ("cool",    "light"):  "Summer",
        ("cool",    "medium"): "Summer",
        ("cool",    "deep"):   "Winter",
        ("neutral", "light"):  "Spring",
        ("neutral", "medium"): "Autumn",
        ("neutral", "deep"):   "Winter",
    }
    return table.get((undertone, depth), "Spring")


def _run_analysis(img: np.ndarray, landmarks: list[dict]) -> dict:
    img_wb = white_balance_correction(img, landmarks)

    samples = (
        sample_region(img_wb, landmarks, FOREHEAD_IDX, radius=7) +
        sample_region(img_wb, landmarks, LEFT_CHEEK_IDX, radius=6) +
        sample_region(img_wb, landmarks, RIGHT_CHEEK_IDX, radius=6)
    )

    r, g, b = median_color(samples)
    L, a, bb = rgb_to_lab(r, g, b)

    undertone = classify_undertone(a, bb)
    depth = classify_depth(L)
    season = map_to_season(undertone, depth)

    print(f"[skin] rgb=({r},{g},{b}) hex=#{r:02x}{g:02x}{b:02x} "
          f"LAB=({L:.1f},{a:.1f},{bb:.1f}) "
          f"-> {undertone}/{depth} -> {season}")

    return {
        "season": season,
        "undertone": undertone,
        "depth": depth,
        "skin_rgb": [r, g, b],
        "skin_hex": f"#{r:02x}{g:02x}{b:02x}",
        "lab": {"L": round(L, 1), "a": round(a, 1), "b": round(bb, 1)},
    }


def analyze_skin_tone_img(img: np.ndarray, landmarks: list[dict]) -> dict:
    """Accepts a BGR numpy array (already decoded)."""
    return _run_analysis(img, landmarks)


def analyze_skin_tone(image_bytes: bytes, landmarks: list[dict]) -> dict:
    """Accepts raw image bytes."""
    return _run_analysis(decode_image(image_bytes), landmarks)
