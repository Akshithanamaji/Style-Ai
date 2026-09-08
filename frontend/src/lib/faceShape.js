/**
 * Face shape classification from 468 MediaPipe landmarks (normalized 0–1).
 *
 * Strategy: derive 4 key measurements from landmark indices, compute
 * ratios, then apply threshold rules. All ratios are relative — absolute
 * pixel size is irrelevant.
 *
 * Key landmark indices (MediaPipe FaceLandmarker 468-point model):
 *   Jaw left   : 234   Jaw right  : 454   (widest jaw points)
 *   Cheek left : 93    Cheek right: 323   (widest cheekbone points)
 *   Forehead L : 103   Forehead R : 332   (above brows, temple area)
 *   Chin tip   : 152   Top of head: 10    (face length)
 *   Jaw angle L: 172   Jaw angle R: 397   (jaw angles for square vs round)
 */

const IDX = {
  jawL: 234, jawR: 454,
  cheekL: 93, cheekR: 323,
  foreheadL: 103, foreheadR: 332,
  chin: 152, top: 10,
  jawAngL: 172, jawAngR: 397,
}

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

/**
 * Returns one of: 'oval' | 'round' | 'square' | 'heart' | 'diamond' | 'long'
 */
export function classifyFaceShape(landmarks) {
  const lm = landmarks

  const jawWidth       = dist(lm[IDX.jawL],       lm[IDX.jawR])
  const cheekWidth     = dist(lm[IDX.cheekL],      lm[IDX.cheekR])
  const foreheadWidth  = dist(lm[IDX.foreheadL],   lm[IDX.foreheadR])
  const faceLength     = dist(lm[IDX.top],          lm[IDX.chin])

  // Use cheekWidth as the common denominator for ratios
  const lengthToWidth  = faceLength   / cheekWidth   // high → long face
  const jawToCheek     = jawWidth     / cheekWidth   // low → heart/diamond, high → square
  const foreheadToJaw  = foreheadWidth / jawWidth    // high → heart, low → diamond

  /*
   * Threshold rationale (empirically common in styling guides):
   *   lengthToWidth > 1.55  → face is notably longer than wide → LONG
   *   lengthToWidth < 1.10  → face is nearly as wide as tall → ROUND or SQUARE
   *     jawToCheek  > 0.90  → jaw ≈ cheek width → SQUARE (angular)
   *     else                → ROUND (soft)
   *   foreheadToJaw > 1.15  → forehead notably wider than jaw → HEART
   *   jawToCheek    < 0.75  → narrow jaw vs. wide cheekbones → DIAMOND
   *   else                  → OVAL (balanced default)
   */
  if (lengthToWidth > 1.55)        return 'long'
  if (lengthToWidth < 1.10) {
    return jawToCheek > 0.90 ? 'square' : 'round'
  }
  if (foreheadToJaw > 1.15)        return 'heart'
  if (jawToCheek    < 0.75)        return 'diamond'
  return 'oval'
}

export const FACE_SHAPE_DESCRIPTIONS = {
  oval:    'Balanced proportions — slightly wider at the cheeks, gently tapering to chin and forehead.',
  round:   'Similar width and length, with soft curves and a rounded chin.',
  square:  'Strong, defined jaw approximately as wide as the cheekbones and forehead.',
  heart:   'Wider forehead tapering to a narrow, pointed chin.',
  diamond: 'Wide, prominent cheekbones with a narrow forehead and narrow jaw.',
  long:    'Face length is notably greater than its width, with a long, straight structure.',
}

export const ALL_SHAPES = ['oval', 'round', 'square', 'heart', 'diamond', 'long']
