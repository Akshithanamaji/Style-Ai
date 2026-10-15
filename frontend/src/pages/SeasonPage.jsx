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

  const GRAIN_URI =
    `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E` +
    `%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E` +
    `%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E` +
    `%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`

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
          <span className="text-xs tracking-wider uppercase text-white/50 font-medium">Step 4 of 5 — Color Season</span>
          {/* Pill step indicator */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#6EB5FF]" />
            <span className="w-2 h-2 rounded-full bg-[#6EB5FF]" />
            <span className="w-2 h-2 rounded-full bg-[#6EB5FF]" />
            <span className="w-5 h-2 rounded-full bg-[#6EB5FF]" />
            <span className="w-2 h-2 rounded-full bg-white/20" />
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <h1
          style={{ fontFamily: "'Anton', sans-serif" }}
          className="text-3xl sm:text-5xl uppercase tracking-tight text-white mb-3 text-center"
        >
          Your Color Season
        </h1>
        <p className="text-white/70 text-center mb-2 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
          We analyze your skin's undertone and depth to find your seasonal color palette.
        </p>
        <p className="text-xs text-amber-300 text-center mb-8 max-w-lg mx-auto bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5">
          ⚠️ Automated detection is sensitive to lighting and may vary — please use the override below if the result looks wrong.
        </p>

        {loading && (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="w-12 h-12 border-4 border-white/20 border-t-[#6EB5FF] rounded-full animate-spin" />
            <p className="text-white font-medium">Analyzing skin tone…</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-300 text-sm mb-6">
            <strong>Error:</strong> {error}
            <button onClick={analyzeImage} className="ml-3 text-red-400 underline cursor-pointer">Retry</button>
          </div>
        )}

        {!loading && result && (
          <div className="flex flex-col gap-6">
            {/* Detected result */}
            <div className="bg-white/[0.04] backdrop-blur-md rounded-3xl p-6 border border-white/10">
              <p className="text-xs uppercase tracking-wider text-white/50 mb-3">Automatically detected</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">Undertone</p>
                  <p className="font-bold text-white text-base">{UNDERTONE_LABELS[result.undertone]}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">Depth</p>
                  <p className="font-bold text-white text-base">{DEPTH_LABELS[result.depth]}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">Sampled Skin</p>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <div className="w-6 h-6 rounded-full border border-white/30 shadow-md" style={{ background: result.skin_hex }} />
                    <span className="text-xs text-white/70 font-mono">{result.skin_hex}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Season result + override */}
            <div className="bg-white/[0.04] backdrop-blur-md rounded-3xl p-6 border border-white/10">
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/50 mb-2">Detected season</p>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl p-2 rounded-2xl bg-white/10">{SEASON_ICONS[result.season]}</span>
                    <span
                      style={{ fontFamily: "'Anton', sans-serif" }}
                      className="text-3xl font-bold text-white tracking-wide uppercase"
                    >
                      {result.season}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-48">
                  <label className="block text-sm font-semibold text-white mb-2">Override season:</label>
                  <select
                    value={confirmed}
                    onChange={(e) => handleSeasonOverride(e.target.value)}
                    className="w-full border border-white/20 rounded-2xl px-4 py-3 text-white bg-[#1a1c23] focus:outline-none focus:border-[#6EB5FF] cursor-pointer text-sm"
                  >
                    {SEASONS.map((s) => (
                      <option key={s} value={s} className="bg-[#1a1c23] text-white">{SEASON_ICONS[s]} {s}</option>
                    ))}
                  </select>
                  {confirmed !== result.season && (
                    <p className="text-xs text-amber-300 mt-2">Using your override: <strong>{confirmed}</strong></p>
                  )}
                </div>
              </div>
            </div>

            {/* Palette swatches */}
            {palette && (
              <div className="bg-white/[0.04] backdrop-blur-md rounded-3xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-3xl p-2 rounded-2xl bg-white/10">{SEASON_ICONS[confirmed]}</span>
                  <div>
                    <h3
                      style={{ fontFamily: "'Anton', sans-serif" }}
                      className="text-xl uppercase tracking-wider text-white"
                    >
                      {confirmed} Palette
                    </h3>
                    <p className="text-sm text-white/70">{palette.description}</p>
                  </div>
                </div>

                <p className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wider text-xs">Your best colors:</p>
                <div className="flex flex-wrap gap-3 mb-6">
                  {palette.best_colors.map((hex, i) => (
                    <div key={hex} className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-2xl border border-white/20 shadow-lg" style={{ background: hex }} title={palette.color_names?.[i]} />
                      <span className="text-[10px] text-white/50 font-mono">{hex}</span>
                    </div>
                  ))}
                </div>

                <p className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wider text-xs">Avoid:</p>
                <div className="flex flex-wrap gap-3 mb-6">
                  {palette.avoid_colors.map((hex) => (
                    <div key={hex} className="relative">
                      <div className="w-12 h-12 rounded-2xl border border-white/20 shadow-lg opacity-60" style={{ background: hex }} />
                      <div className="absolute inset-0 flex items-center justify-center text-red-400 font-bold text-lg">✕</div>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-white/70">
                  Recommended metals: <strong className="text-white">{palette.metal_tone === 'gold' ? '🥇 Gold' : '🥈 Silver'}</strong>
                </p>
              </div>
            )}

            <button
              onClick={() => onNext({ season: confirmed, detectedSeason: result.season, undertone: result.undertone, depth: result.depth, skinHex: result.skin_hex, palette })}
              style={{ fontFamily: "'Anton', sans-serif" }}
              className="bg-white text-black uppercase tracking-wider text-lg py-4 px-8 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl cursor-pointer w-full text-center"
            >
              See My Style Report →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
