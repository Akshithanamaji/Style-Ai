import { useState, useEffect } from 'react'

const UNDERTONE_LABELS = { warm: '🌻 Warm', cool: '❄️ Cool', neutral: '⚖️ Neutral' }
const DEPTH_LABELS = { light: 'Light', medium: 'Medium', deep: 'Deep' }
const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter']
const SEASON_ICONS = { Spring: '🌸', Summer: '☀️', Autumn: '🍂', Winter: '❄️' }

export default function SeasonPage({ imageSrc, landmarks, onNext }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(null)
  const [palette, setPalette] = useState(null)

  useEffect(() => {
    analyzeImage()
  }, [])

  async function analyzeImage() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/analyze-skin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_data: imageSrc, landmarks }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setResult(data)
      setConfirmed(data.season)
      fetchPalette(data.season)
    } catch (e) {
      setError('Analysis failed: ' + e.message)
      setLoading(false)
    }
  }

  async function fetchPalette(season) {
    try {
      const res = await fetch('/api/palette/' + season)
      const data = await res.json()
      setPalette(data)
    } catch {
      // palette is non-critical
    } finally {
      setLoading(false)
    }
  }

  const handleSeasonOverride = async (season) => {
    setConfirmed(season)
    fetchPalette(season)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      <header className="flex items-center gap-3 px-6 py-4 bg-white/70 backdrop-blur-sm border-b border-purple-100">
        <span className="text-xl">✨</span>
        <span className="font-semibold text-purple-800">AI Fashion Stylist</span>
        <span className="ml-2 text-sm text-gray-400">Step 4 of 5 — Color Season</span>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Your Color Season</h1>
        <p className="text-gray-500 text-center mb-2 max-w-lg mx-auto">
          We analyze your skin's undertone and depth to find your seasonal color palette.
        </p>
        <p className="text-xs text-amber-600 text-center mb-8 max-w-lg mx-auto bg-amber-50 rounded-lg px-3 py-2">
          ⚠️ Automated detection is sensitive to lighting and may vary — please use the override below if the result looks wrong.
        </p>

        {loading && (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            <p className="text-gray-500">Analyzing skin tone…</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-6">
            <strong>Error:</strong> {error}
            <button onClick={analyzeImage} className="ml-3 text-red-600 underline cursor-pointer">Retry</button>
          </div>
        )}

        {!loading && result && (
          <div className="flex flex-col gap-6">
            {/* Detected result */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
              <p className="text-sm text-gray-400 mb-3">Automatically detected</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Undertone</p>
                  <p className="font-semibold text-gray-800">{UNDERTONE_LABELS[result.undertone]}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Depth</p>
                  <p className="font-semibold text-gray-800">{DEPTH_LABELS[result.depth]}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Sampled Skin</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-6 h-6 rounded-full border border-gray-200" style={{ background: result.skin_hex }} />
                    <span className="text-xs text-gray-500 font-mono">{result.skin_hex}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Season result + override */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Detected season</p>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{SEASON_ICONS[result.season]}</span>
                    <span className="text-2xl font-bold text-gray-900">{result.season}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-40">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Override season:</label>
                  <select
                    value={confirmed}
                    onChange={(e) => handleSeasonOverride(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-300 cursor-pointer text-sm"
                  >
                    {SEASONS.map((s) => (
                      <option key={s} value={s}>{SEASON_ICONS[s]} {s}</option>
                    ))}
                  </select>
                  {confirmed !== result.season && (
                    <p className="text-xs text-amber-600 mt-1">Using your override: <strong>{confirmed}</strong></p>
                  )}
                </div>
              </div>
            </div>

            {/* Palette swatches */}
            {palette && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{SEASON_ICONS[confirmed]}</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{confirmed} Palette</h3>
                    <p className="text-sm text-gray-500">{palette.description}</p>
                  </div>
                </div>

                <p className="text-sm font-medium text-gray-600 mb-2">Your best colors:</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {palette.best_colors.map((hex, i) => (
                    <div key={hex} className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-xl border border-gray-100 shadow-sm" style={{ background: hex }} title={palette.color_names?.[i]} />
                      <span className="text-xs text-gray-400 font-mono">{hex}</span>
                    </div>
                  ))}
                </div>

                <p className="text-sm font-medium text-gray-600 mb-2">Avoid:</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {palette.avoid_colors.map((hex) => (
                    <div key={hex} className="relative">
                      <div className="w-10 h-10 rounded-xl border border-gray-100 shadow-sm opacity-60" style={{ background: hex }} />
                      <div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold text-lg">✕</div>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-gray-500">
                  Recommended metals: <strong className="text-gray-700">{palette.metal_tone === 'gold' ? '🥇 Gold' : '🥈 Silver'}</strong>
                </p>
              </div>
            )}

            <button
              onClick={() => onNext({ season: confirmed, detectedSeason: result.season, undertone: result.undertone, depth: result.depth, skinHex: result.skin_hex, palette })}
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-3 px-8 rounded-xl hover:shadow-lg hover:scale-105 transition-all cursor-pointer w-full text-center"
            >
              See My Style Report →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
