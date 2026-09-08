import { describe, it, expect } from 'vitest'
import { classifyFaceShape } from './faceShape'

/**
 * Helper: build a minimal 468-landmark array where only the indices
 * used by classifyFaceShape are set to meaningful positions.
 * All unused landmarks default to { x: 0.5, y: 0.5, z: 0 }.
 */
function makeLandmarks(overrides) {
  const lm = Array.from({ length: 468 }, () => ({ x: 0.5, y: 0.5, z: 0 }))
  for (const [idx, pos] of Object.entries(overrides)) {
    lm[Number(idx)] = { ...lm[Number(idx)], ...pos }
  }
  return lm
}

// IDX reference (mirrors faceShape.js):
// jawL:103→234  jawR:454  cheekL:93  cheekR:323
// foreheadL:103  foreheadR:332  chin:152  top:10
// jawAngL:172  jawAngR:397

describe('classifyFaceShape', () => {
  it('detects OVAL — balanced proportions', () => {
    // cheekWidth=0.50, faceLength=0.60 → L/W=1.20 (mid-range, between 1.10 and 1.55)
    // jawWidth=0.40 → jawToCheek=0.80 (not square >0.90, not diamond <0.75)
    // foreheadWidth=0.44 → foreheadToJaw=1.10 (not heart >1.15)
    const lm = makeLandmarks({
      234: { x: 0.30, y: 0.5 }, 454: { x: 0.70, y: 0.5 },   // jaw width=0.40
      93:  { x: 0.25, y: 0.5 }, 323: { x: 0.75, y: 0.5 },   // cheek width=0.50
      103: { x: 0.28, y: 0.4 }, 332: { x: 0.72, y: 0.4 },   // forehead width=0.44 → f/j=1.10
      152: { x: 0.5,  y: 0.82 }, 10: { x: 0.5,  y: 0.22 },  // length=0.60 → L/W=1.20
    })
    expect(classifyFaceShape(lm)).toBe('oval')
  })

  it('detects ROUND — short face, soft jaw', () => {
    // faceLength/cheekWidth < 1.10; jawToCheek < 0.90
    const lm = makeLandmarks({
      234: { x: 0.38, y: 0.5 }, 454: { x: 0.62, y: 0.5 },   // jaw narrow  width=0.24
      93:  { x: 0.22, y: 0.5 }, 323: { x: 0.78, y: 0.5 },   // cheek       width=0.56
      103: { x: 0.27, y: 0.4 }, 332: { x: 0.73, y: 0.4 },   // forehead    width=0.46
      152: { x: 0.5,  y: 0.72 }, 10: { x: 0.5,  y: 0.28 }, // length=0.44 → ratio≈0.79
    })
    expect(classifyFaceShape(lm)).toBe('round')
  })

  it('detects SQUARE — wide jaw matches cheeks', () => {
    // faceLength/cheekWidth < 1.10; jawToCheek > 0.90
    const lm = makeLandmarks({
      234: { x: 0.20, y: 0.5 }, 454: { x: 0.80, y: 0.5 },   // jaw wide=0.60
      93:  { x: 0.22, y: 0.5 }, 323: { x: 0.78, y: 0.5 },   // cheek =0.56 → ratio=1.07
      103: { x: 0.25, y: 0.4 }, 332: { x: 0.75, y: 0.4 },   // forehead=0.50 → f/j=0.83
      152: { x: 0.5,  y: 0.72 }, 10: { x: 0.5,  y: 0.28 }, // length=0.44 → L/W=0.79
    })
    expect(classifyFaceShape(lm)).toBe('square')
  })

  it('detects HEART — wide forehead, narrow jaw', () => {
    // foreheadToJaw > 1.15; lengthToWidth in mid-range
    const lm = makeLandmarks({
      234: { x: 0.40, y: 0.5 }, 454: { x: 0.60, y: 0.5 },   // jaw narrow=0.20
      93:  { x: 0.22, y: 0.5 }, 323: { x: 0.78, y: 0.5 },   // cheek=0.56
      103: { x: 0.18, y: 0.35 }, 332: { x: 0.82, y: 0.35 }, // forehead wide=0.64 → f/j=3.2
      152: { x: 0.5,  y: 0.75 }, 10: { x: 0.5,  y: 0.25 }, // length=0.50 → L/W=0.89→<1.10
    })
    // L/W=0.89 < 1.10 → ROUND/SQUARE branch first; need L/W in mid range
    // Let's make it longer: length=0.65
    const lm2 = makeLandmarks({
      234: { x: 0.42, y: 0.5 }, 454: { x: 0.58, y: 0.5 },   // jaw=0.16
      93:  { x: 0.22, y: 0.5 }, 323: { x: 0.78, y: 0.5 },   // cheek=0.56
      103: { x: 0.18, y: 0.35 }, 332: { x: 0.82, y: 0.35 }, // forehead=0.64 → f/j=4.0
      152: { x: 0.5,  y: 0.78 }, 10: { x: 0.5,  y: 0.22 }, // length=0.56 → L/W=1.0→<1.10
    })
    // Still < 1.10 → round/square. Make length truly mid:
    const lm3 = makeLandmarks({
      234: { x: 0.42, y: 0.55 }, 454: { x: 0.58, y: 0.55 }, // jaw=0.16
      93:  { x: 0.22, y: 0.50 }, 323: { x: 0.78, y: 0.50 }, // cheek=0.56
      103: { x: 0.17, y: 0.38 }, 332: { x: 0.83, y: 0.38 }, // forehead=0.66 → f/j=4.1
      152: { x: 0.5,  y: 0.82 }, 10: { x: 0.5,  y: 0.18 }, // length=0.64 → L/W=1.14
    })
    expect(classifyFaceShape(lm3)).toBe('heart')
  })

  it('detects DIAMOND — wide cheeks, narrow jaw and forehead', () => {
    // jawToCheek < 0.75; lengthToWidth in mid-range; foreheadToJaw < 1.15
    const lm = makeLandmarks({
      234: { x: 0.40, y: 0.55 }, 454: { x: 0.60, y: 0.55 }, // jaw=0.20
      93:  { x: 0.18, y: 0.50 }, 323: { x: 0.82, y: 0.50 }, // cheek=0.64 → j/c=0.31
      103: { x: 0.30, y: 0.37 }, 332: { x: 0.70, y: 0.37 }, // forehead=0.40 → f/j=2.0→heart?
      // f/j=2.0 > 1.15 so we'd get heart. Narrow the forehead more relative to jaw:
      // Actually f/j = foreheadWidth/jawWidth: forehead=0.22, jaw=0.20 → f/j=1.1 < 1.15 ✓
      152: { x: 0.5,  y: 0.80 }, 10:  { x: 0.5,  y: 0.20 }, // length=0.60 → L/W=0.94→<1.10
    })
    // L/W=0.60/0.64=0.94 → falls into round/square branch. Need L/W mid.
    const lm2 = makeLandmarks({
      234: { x: 0.41, y: 0.55 }, 454: { x: 0.59, y: 0.55 }, // jaw=0.18
      93:  { x: 0.17, y: 0.50 }, 323: { x: 0.83, y: 0.50 }, // cheek=0.66 → j/c=0.27<0.75
      103: { x: 0.30, y: 0.37 }, 332: { x: 0.70, y: 0.37 }, // forehead=0.40 → f/j=2.2→heart
      152: { x: 0.5,  y: 0.83 }, 10:  { x: 0.5,  y: 0.17 }, // length=0.66 → L/W=1.0→<1.10
    })
    // Still round/square branch. Use a forehead barely less than jaw to avoid heart:
    const lm3 = makeLandmarks({
      234: { x: 0.41, y: 0.55 }, 454: { x: 0.59, y: 0.55 }, // jaw=0.18
      93:  { x: 0.17, y: 0.50 }, 323: { x: 0.83, y: 0.50 }, // cheek=0.66 → j/c=0.27<0.75
      103: { x: 0.36, y: 0.37 }, 332: { x: 0.64, y: 0.37 }, // forehead=0.28 → f/j=1.56→heart
      152: { x: 0.5,  y: 0.83 }, 10:  { x: 0.5,  y: 0.17 }, // length=0.66 → L/W=1.0
    })
    // The classification checks heart (foreheadToJaw) BEFORE diamond (jawToCheek).
    // For diamond we need foreheadToJaw <= 1.15 AND jawToCheek < 0.75.
    // forehead=0.19 → f/j=0.19/0.18=1.05<1.15 ✓; and L/W must be > 1.10:
    const lm4 = makeLandmarks({
      234: { x: 0.41, y: 0.52 }, 454: { x: 0.59, y: 0.52 }, // jaw=0.18
      93:  { x: 0.17, y: 0.50 }, 323: { x: 0.83, y: 0.50 }, // cheek=0.66 → j/c=0.27<0.75
      103: { x: 0.38, y: 0.37 }, 332: { x: 0.62, y: 0.37 }, // forehead=0.24 → f/j=1.33>1.15→heart
      152: { x: 0.5,  y: 0.85 }, 10:  { x: 0.5,  y: 0.15 }, // length=0.70 → L/W=1.06
    })
    // forehead/jaw > 1.15 → heart again. Let's just barely keep f/j < 1.15:
    const lm5 = makeLandmarks({
      234: { x: 0.41, y: 0.52 }, 454: { x: 0.59, y: 0.52 }, // jaw=0.18
      93:  { x: 0.17, y: 0.50 }, 323: { x: 0.83, y: 0.50 }, // cheek=0.66 → j/c=0.27<0.75 ✓
      103: { x: 0.40, y: 0.37 }, 332: { x: 0.60, y: 0.37 }, // forehead=0.20 → f/j=1.11<1.15 ✓
      152: { x: 0.5,  y: 0.85 }, 10:  { x: 0.5,  y: 0.15 }, // length=0.70 → L/W=1.06<1.10 → round/sq
    })
    // L/W still < 1.10. Let's make it 1.20:
    const lm6 = makeLandmarks({
      234: { x: 0.41, y: 0.52 }, 454: { x: 0.59, y: 0.52 }, // jaw=0.18
      93:  { x: 0.17, y: 0.50 }, 323: { x: 0.83, y: 0.50 }, // cheek=0.66 → j/c=0.27<0.75 ✓
      103: { x: 0.40, y: 0.37 }, 332: { x: 0.60, y: 0.37 }, // forehead=0.20 → f/j=1.11<1.15 ✓
      152: { x: 0.5,  y: 0.87 }, 10:  { x: 0.5,  y: 0.13 }, // length=0.74 → L/W=1.12 ✓
    })
    expect(classifyFaceShape(lm6)).toBe('diamond')
  })

  it('detects LONG — tall narrow face', () => {
    // lengthToWidth > 1.55
    const lm = makeLandmarks({
      234: { x: 0.38, y: 0.5 }, 454: { x: 0.62, y: 0.5 },   // jaw=0.24
      93:  { x: 0.28, y: 0.5 }, 323: { x: 0.72, y: 0.5 },   // cheek=0.44
      103: { x: 0.30, y: 0.4 }, 332: { x: 0.70, y: 0.4 },   // forehead=0.40
      152: { x: 0.5,  y: 0.88 }, 10: { x: 0.5,  y: 0.12 }, // length=0.76 → L/W=0.76/0.44=1.73>1.55
    })
    expect(classifyFaceShape(lm)).toBe('long')
  })
})
