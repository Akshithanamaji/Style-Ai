import { useState } from 'react'
import { classifyFaceShape, FACE_SHAPE_DESCRIPTIONS, ALL_SHAPES } from '../lib/faceShape'
import LandmarkCanvas from '../components/LandmarkCanvas'

const SHAPE_ICONS = { oval: '🥚', round: '⭕', square: '⬜', heart: '💜', diamond: '💎', long: '📏' }

const GRAIN_URI =
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E` +
  `%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E` +
  `%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E` +
  `%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`

export default function FaceShapePage({ imageSrc, landmarks, onNext }) {
  const detected = classifyFaceShape(landmarks)
  const [confirmed, setConfirmed] = useState(detected)

  return (
    <div className="min-h-screen bg-[#111216] text-white relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Grain overlay */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-50"
        style={{
          backgroundImage: GRAIN_URI,
          backgroundSize: '200px 200px',
          backgroundRepeat: 'repeat',
          opacity: 0.35,
        }}
      />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 bg-[#14151B]/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-xl">✨</span>
          <span
            style={{ fontFamily: "'Anton', sans-serif" }}
            className="text-lg tracking-wider uppercase text-white"
          >
            AI Fashion Stylist
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs tracking-wider uppercase text-white/50 font-medium">Step 3 of 5 — Face Shape</span>
          {/* Pill step indicator */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#E882B4]" />
            <span className="w-2 h-2 rounded-full bg-[#E882B4]" />
            <span className="w-5 h-2 rounded-full bg-[#E882B4]" />
            <span className="w-2 h-2 rounded-full bg-white/20" />
            <span className="w-2 h-2 rounded-full bg-white/20" />
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <h1
          style={{ fontFamily: "'Anton', sans-serif" }}
          className="text-3xl sm:text-5xl uppercase tracking-tight text-white mb-3 text-center"
        >
          Your Face Shape
        </h1>
        <p className="text-white/70 text-center mb-10 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Detected automatically from your photo. Correct it if needed.
        </p>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Photo */}
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-black">
              <LandmarkCanvas imageSrc={imageSrc} landmarks={landmarks} />
            </div>
            <p className="text-xs text-white/50 uppercase tracking-wider">Landmark overlay shown for verification</p>
          </div>

          {/* Result card */}
          <div className="flex flex-col gap-6">
            {/* Detected result */}
            <div className="bg-white/[0.04] backdrop-blur-md rounded-3xl p-6 border border-white/10">
              <p className="text-xs uppercase tracking-wider text-white/50 mb-3">Automatically detected</p>
              <div className="flex items-center gap-4">
                <span className="text-5xl p-2 rounded-2xl bg-white/10">{SHAPE_ICONS[detected]}</span>
                <div>
                  <p
                    style={{ fontFamily: "'Anton', sans-serif" }}
                    className="text-2xl text-white tracking-wide uppercase"
                  >
                    {detected}
                  </p>
                  <p className="text-sm text-white/70 mt-1 leading-relaxed">{FACE_SHAPE_DESCRIPTIONS[detected]}</p>
                </div>
              </div>
            </div>

            {/* Manual override */}
            <div className="bg-white/[0.04] backdrop-blur-md rounded-3xl p-6 border border-white/10">
              <label className="block text-sm font-semibold text-white mb-3">
                Looks wrong? Choose your face shape:
              </label>
              <select
                value={confirmed}
                onChange={(e) => setConfirmed(e.target.value)}
                className="w-full border border-white/20 rounded-2xl px-4 py-3 text-white bg-[#1a1c23] focus:outline-none focus:border-[#E882B4] cursor-pointer"
              >
                {ALL_SHAPES.map((s) => (
                  <option key={s} value={s} className="bg-[#1a1c23] text-white">
                    {SHAPE_ICONS[s]} {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              {confirmed !== detected && (
                <p className="text-xs text-amber-300 mt-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2">
                  Using your selection: <strong>{confirmed}</strong> (overriding detected: {detected})
                </p>
              )}
            </div>

            {/* Confirmed shape description */}
            {confirmed !== detected && (
              <div className="bg-[#E882B4]/10 rounded-2xl p-5 border border-[#E882B4]/20">
                <p className="text-sm font-semibold text-[#E882B4] capitalize mb-1">{confirmed}</p>
                <p className="text-sm text-white/80">{FACE_SHAPE_DESCRIPTIONS[confirmed]}</p>
              </div>
            )}

            <button
              onClick={() => onNext({ faceShape: confirmed, detectedFaceShape: detected })}
              style={{ fontFamily: "'Anton', sans-serif" }}
              className="bg-white text-black uppercase tracking-wider text-lg py-4 px-8 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl cursor-pointer"
            >
              Continue →
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
