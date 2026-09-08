# Known Limitations — AI Fashion Stylist v1

## Face Shape Classification

**Accuracy: approximately 60–80%**

The face shape classifier uses ratio-based thresholds derived from a small set of landmark measurements (jaw width, cheekbone width, forehead width, face length). This approach has the following limitations:

- **No training data**: A CNN trained on labeled face shape images could achieve 80–95%+ accuracy. The rule-based system uses hand-tuned thresholds that may not generalize well.
- **Landmark noise**: MediaPipe landmark positions can shift by a few percent depending on photo angle, lighting, and compression — this affects the ratios meaningfully.
- **Head tilt / angle sensitivity**: The classifier assumes a roughly frontal face. Tilted or turned faces will produce incorrect measurements.
- **Ambiguous cases**: Many real faces fall between categories (e.g. oval/round, square/diamond). The classifier will pick one arbitrarily near the threshold boundary.

**Mitigation**: A manual override dropdown is provided on the Face Shape page. Please use it if the detected result looks wrong.

---

## Skin Tone & Undertone Detection

**Accuracy: lighting-sensitive and variable across skin tones**

The skin analysis pipeline:
1. White-balances using the sclera (eye white) as a neutral reference
2. Samples skin pixels from the forehead and cheeks
3. Converts median RGB to CIE LAB and classifies from L/a/b values

Known limitations:

- **Lighting bias**: The white-balance correction assumes the eye whites are near-neutral. Under strongly colored artificial lighting (warm LED, studio softboxes, fluorescent), corrections may overshoot or undershoot.
- **Skin tone range**: LAB thresholds for warm/cool undertone were designed with a moderate skin tone range in mind. Results may be less accurate at extreme ends of the lightness spectrum (very light or very deep skin tones).
- **Photo quality**: Heavy compression, strong flash, or overexposure will distort sampled colors significantly.
- **Fairness note**: Automated undertone and season classification tools have historically performed less accurately on darker skin tones. This implementation inherits that limitation. We strongly recommend using the manual override.

**Mitigation**: The manual override dropdown on the Season page is prominently displayed for this reason. The detected result should be treated as a starting point, not a definitive classification.

---

## Seasonal Color Analysis

**Seasonal color analysis is an industry styling heuristic — not a scientifically validated standard.**

The four-season (Spring/Summer/Autumn/Winter) system was popularized by Carole Jackson's "Color Me Beautiful" (1980) and has since been extended to 12-season and 16-season systems by various stylists. Key caveats:

- There is no peer-reviewed science establishing that seasonal palettes objectively flatter certain skin tones.
- The system assumes four discrete categories, while human coloring exists on a continuous spectrum.
- Individual preferences, cultural context, and current trends may override "season" recommendations.
- This app uses a simplified 4-season grid; a professional colorist may classify you differently.

---

## Privacy

Photos sent to the backend for skin analysis are processed in memory only and are never written to disk or stored in a database. The backend holds no persistent user data between server restarts.

Face detection (landmark detection) runs entirely in your browser via MediaPipe — the raw photo is never transmitted to the server for that step.

---

## Phase 2 Improvements (Recommended)

See README.md for a full Phase 2 roadmap.
