import { useState } from 'react'
import { classifyFaceShape, FACE_SHAPE_DESCRIPTIONS, ALL_SHAPES } from '../lib/faceShape'
import LandmarkCanvas from '../components/LandmarkCanvas'

const SHAPE_ICONS = { oval: '🥚', round: '⭕', square: '⬜', heart: '💜', diamond: '💎', long: '📏' }

export default function FaceShapePage({ imageSrc, landmarks, onNext }) {
  const detected = classifyFaceShape(landmarks)
  const [confirmed, setConfirmed] = useState(detected)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      <header className="flex items-center gap-3 px-6 py-4 bg-white/70 backdrop-blur-sm border-b border-purple-100">
        <span className="text-xl">✨</span>
        <span className="font-semibold text-purple-800">AI Fashion Stylist</span>
        <span className="ml-2 text-sm text-gray-400">Step 3 of 5 — Face Shape</span>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Your Face Shape</h1>
        <p className="text-gray-500 text-center mb-8">Detected automatically from your photo. Correct it if needed.</p>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Photo */}
          <div className="flex flex-col items-center gap-3">
            <LandmarkCanvas imageSrc={imageSrc} landmarks={landmarks} />
            <p className="text-xs text-gray-400">Landmark overlay shown for verification</p>
          </div>

          {/* Result card */}
          <div className="flex flex-col gap-5">
            {/* Detected result */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
              <p className="text-sm text-gray-400 mb-1">Automatically detected</p>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{SHAPE_ICONS[detected]}</span>
                <div>
                  <p className="text-xl font-bold text-gray-900 capitalize">{detected}</p>
                  <p className="text-sm text-gray-500">{FACE_SHAPE_DESCRIPTIONS[detected]}</p>
                </div>
              </div>
            </div>

            {/* Manual override */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Looks wrong? Choose your face shape:
              </label>
              <select
                value={confirmed}
                onChange={(e) => setConfirmed(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-300 cursor-pointer"
              >
                {ALL_SHAPES.map((s) => (
                  <option key={s} value={s}>
                    {SHAPE_ICONS[s]} {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              {confirmed !== detected && (
                <p className="text-xs text-amber-600 mt-2">
                  Using your selection: <strong>{confirmed}</strong> (overriding detected: {detected})
                </p>
              )}
            </div>

            {/* Confirmed shape description */}
            {confirmed !== detected && (
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                <p className="text-sm font-medium text-purple-800 capitalize mb-1">{confirmed}</p>
                <p className="text-sm text-purple-700">{FACE_SHAPE_DESCRIPTIONS[confirmed]}</p>
              </div>
            )}

            <button
              onClick={() => onNext({ faceShape: confirmed, detectedFaceShape: detected })}
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-3 px-8 rounded-xl hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
            >
              Continue →
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
