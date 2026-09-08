import { useState, useEffect } from 'react'

const OCCASIONS = [
  { id: 'daily',   label: 'Daily Wear',  icon: '☀️',  desc: 'Everyday outfits' },
  { id: 'office',  label: 'Office',      icon: '💼',  desc: 'Work ready' },
  { id: 'college', label: 'College',     icon: '🎓',  desc: 'Campus style' },
  { id: 'party',   label: 'Party',       icon: '🎉',  desc: 'Night out' },
  { id: 'wedding', label: 'Wedding',     icon: '💒',  desc: 'Special occasion' },
  { id: 'festive', label: 'Festive',     icon: '🪔',  desc: 'Festivals & traditional' },
  { id: 'formal',  label: 'Formal',      icon: '🎩',  desc: 'Black tie events' },
]

const SHAPE_ICONS = { oval:'🥚', round:'⭕', square:'⬜', heart:'💜', diamond:'💎', long:'📏' }
const SEASON_ICONS = { Spring:'🌸', Summer:'☀️', Autumn:'🍂', Winter:'❄️' }

const PERSON_ICONS = {
  adult_woman:'👩', adult_man:'👨', teen_girl:'👧', teen_boy:'👦',
  child:'🧒', senior_woman:'👵', senior_man:'👴',
}

const BODY_ICONS = {
  hourglass:'⌛', pear:'🍐', apple:'🍎', rectangle:'▭',
  inverted_triangle:'🔺', athletic:'🏋️', oval:'⭕',
  child:'🧒', comfortable:'🌸',
}

// Garment silhouette outlines, as point lists (percent coords, 0-100).
// Reused both as a CSS clip-path (fallback) and as an SVG clipPath applied
// over an illustrated human figure so each style renders as an actual
// outfit shown on a body, not just a floating fabric shape.
const DRESS_POINTS = {
  'wrap':        [[28,0],[55,0],[58,12],[72,0],[100,100],[0,100]],
  'a-line':      [[28,0],[72,0],[100,100],[0,100]],
  'bodycon':     [[30,0],[70,0],[76,100],[24,100]],
  'shift':       [[26,0],[74,0],[74,100],[26,100]],
  'maxi':        [[29,0],[71,0],[100,100],[0,100]],
  'empire':      [[27,0],[73,0],[80,28],[100,100],[0,100],[20,28]],
  'flare':       [[33,0],[67,0],[60,50],[100,100],[0,100],[40,50]],
  'peplum':      [[28,0],[72,0],[74,42],[82,42],[100,52],[74,60],[70,100],[30,100],[26,60],[0,52],[18,42],[26,42]],
  'suit':        [[22,0],[78,0],[78,100],[22,100]],
  'kurta':       [[28,0],[72,0],[80,100],[20,100]],
  'lehenga':     [[35,0],[65,0],[65,30],[82,30],[100,100],[0,100],[18,30],[35,30]],
  'saree':       [[28,0],[72,0],[90,40],[85,100],[15,100],[10,40]],
  'anarkali':    [[30,0],[70,0],[72,25],[100,100],[0,100],[28,25]],
  'palazzo':     [[28,0],[72,0],[72,35],[90,35],[90,100],[55,100],[55,35],[45,35],[45,100],[10,100],[10,35],[28,35]],
  'kids-frock':  [[28,0],[72,0],[90,100],[10,100]],
  'comfy-tunic': [[25,0],[75,0],[80,100],[20,100]],
  'default':     [[28,0],[72,0],[88,100],[12,100]],
}

// How far down the body figure each garment falls (SVG y-coord, hip starts ~138).
const HEM_Y = {
  'wrap': 132, 'a-line': 130, 'bodycon': 118, 'shift': 128, 'maxi': 178,
  'empire': 130, 'flare': 128, 'peplum': 112, 'suit': 196, 'kurta': 112,
  'lehenga': 196, 'saree': 196, 'anarkali': 172, 'palazzo': 196,
  'kids-frock': 100, 'comfy-tunic': 108, 'default': 126,
}

const SKIN_TONES = ['#e8b894', '#c9895f', '#8d5524', '#f2c9a1', '#a9673f']
const HAIR_COLORS = ['#2b1b12', '#4a2c17', '#1a1a1a', '#6b3e26', '#3a2418']

// Real photos of people wearing each garment style (curated, full-length or
// clearly silhouette-showing shots), so the recommendation reads like an
// actual brand lookbook instead of an illustration. Falls back to the
// illustrated figure below if a photo ever fails to load.
const DRESS_PHOTO_IDS = {
  'wrap': 8285736, 'a-line': 29254558, 'bodycon': 17993891, 'shift': 18904271,
  'maxi': 25731827, 'empire': 8693623, 'flare': 33244272, 'peplum': 33736386,
  'suit': 32275951, 'kurta': 12279088, 'lehenga': 28405815, 'saree': 7176430,
  'anarkali': 34077588, 'palazzo': 18978267, 'kids-frock': 36893900,
  'comfy-tunic': 32757041, 'default': 16987325,
}

function getDressPhotoUrl(key) {
  const id = DRESS_PHOTO_IDS[key] || DRESS_PHOTO_IDS['default']
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=400`
}

function getDressStyleKey(styleName) {
  const name = styleName.toLowerCase()
  if (name.includes('wrap')) return 'wrap'
  if (name.includes('a-line') || name.includes('a line') || name.includes('flare') || name.includes('flared')) return 'a-line'
  if (name.includes('bodycon') || name.includes('fitted')) return 'bodycon'
  if (name.includes('shift') || name.includes('straight') || name.includes('shirt dress') || name.includes('t-shirt')) return 'shift'
  if (name.includes('maxi') || name.includes('gown')) return 'maxi'
  if (name.includes('empire') || name.includes('balloon')) return 'empire'
  if (name.includes('peplum') || name.includes('ruffle')) return 'peplum'
  if (name.includes('suit') || name.includes('blazer') || name.includes('trouser') || name.includes('pants') || name.includes('jeans')) return 'suit'
  if (name.includes('kurta') || name.includes('kurti') || name.includes('tunic') || name.includes('top') || name.includes('blouse') || name.includes('tee') || name.includes('polo')) return 'kurta'
  if (name.includes('lehenga')) return 'lehenga'
  if (name.includes('saree')) return 'saree'
  if (name.includes('anarkali') || name.includes('salwar') || name.includes('kameez')) return 'anarkali'
  if (name.includes('palazzo')) return 'palazzo'
  if (name.includes('frock') || name.includes('kids')) return 'kids-frock'
  if (name.includes('comfort') || name.includes('casual') || name.includes('cotton')) return 'comfy-tunic'
  return 'default'
}

function toSvgPoints(pts) {
  return pts.map(([x, y]) => `${(x / 100).toFixed(4)},${(y / 100).toFixed(4)}`).join(' ')
}

// Illustrated human figure (front-facing fashion croquis) wearing the garment
// silhouette — shows people exactly which body area each style covers,
// like a brand lookbook, instead of an abstract fabric shape floating alone.
function FigureCard({ styleName, index }) {
  const key = getDressStyleKey(styleName)
  const hemY = HEM_Y[key]
  const skin = SKIN_TONES[index % SKIN_TONES.length]
  const hair = HAIR_COLORS[index % HAIR_COLORS.length]
  const uid = `fig-${index}-${key}`

  return (
    <svg viewBox="0 0 100 210" className="w-full h-full transition-transform group-hover:scale-105" style={{ maxHeight: 168 }}>
      <defs>
        <clipPath id={`clip-${uid}`} clipPathUnits="objectBoundingBox">
          <polygon points={toSvgPoints(DRESS_POINTS[key])} />
        </clipPath>
        <linearGradient id={`grad-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={`var(--main-${uid})`} />
          <stop offset="100%" stopColor={`var(--alt-${uid})`} />
        </linearGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="50" cy="203" rx="20" ry="3.5" fill="#00000010" />

      {/* legs */}
      <path d="M42,136 Q39,170 44,198 L49,198 Q47,168 49,136 Z" fill={skin} />
      <path d="M58,136 Q61,170 56,198 L51,198 Q53,168 51,136 Z" fill={skin} />
      {/* feet */}
      <ellipse cx="45.5" cy="200" rx="6.5" ry="3" fill="#33261c" />
      <ellipse cx="54.5" cy="200" rx="6.5" ry="3" fill="#33261c" />

      {/* arms */}
      <path d="M33,34 Q18,56 20,90 Q20,98 25,101 L31,98 Q27,96 27,88 Q27,55 39,37 Z" fill={skin} />
      <path d="M67,34 Q82,56 80,90 Q80,98 75,101 L69,98 Q73,96 73,88 Q73,55 61,37 Z" fill={skin} />

      {/* neck + head */}
      <rect x="45" y="25" width="10" height="10" fill={skin} />
      <circle cx="50" cy="16" r="12" fill={skin} />
      <path d="M38,10 Q50,-4 62,10 Q63,18 59,21 Q61,10 50,9 Q39,10 41,21 Q37,18 38,10 Z" fill={hair} />

      {/* garment, clipped to the style silhouette, over the torso/legs */}
      <rect
        x="24" y="28" width="52" height={hemY - 28}
        fill={`url(#grad-${uid})`}
        clipPath={`url(#clip-${uid})`}
        opacity="0.95"
      />
    </svg>
  )
}

function StyleCard({ styleName, colors, index }) {
  const [imgError, setImgError] = useState(false)
  const mainColor = colors?.[index % (colors?.length || 1)] || '#a855f7'
  const altColor = colors?.[(index + 1) % (colors?.length || 1)] || '#ec4899'
  const key = getDressStyleKey(styleName)
  const uid = `fig-${index}-${key}`

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
      {/* Real photo of the style worn on a body, so it reads like an actual lookbook */}
      <div
        className="h-44 relative overflow-hidden bg-gray-100"
        style={{
          [`--main-${uid}`]: mainColor,
          [`--alt-${uid}`]: altColor,
        }}
      >
        {!imgError ? (
          <img
            src={getDressPhotoUrl(key)}
            alt={styleName}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${mainColor}18, ${altColor}12)` }}
          >
            <FigureCard styleName={styleName} index={index} />
          </div>
        )}
        {/* Color dots below */}
        <div className="absolute bottom-2 right-3 flex gap-1">
          {colors?.slice(0, 4).map((c, i) => (
            <div key={i} className="w-3.5 h-3.5 rounded-full border border-white shadow-sm" style={{ background: c }} />
          ))}
        </div>
      </div>

      <div className="p-3">
        <p className="font-semibold text-gray-800 text-sm leading-tight">{styleName}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: mainColor }} />
          <span className="text-xs text-gray-400 font-mono">{mainColor}</span>
        </div>
      </div>
    </div>
  )
}

function CatalogCard({ item }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      {!imgError ? (
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-36 object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="h-36 flex items-center justify-center" style={{ background: item.dominant_color + '22' }}>
          <div className="w-14 h-14 rounded-xl shadow-sm" style={{ background: item.dominant_color }} />
        </div>
      )}
      <div className="p-3">
        <p className="font-medium text-gray-800 text-sm leading-tight">{item.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full capitalize">{item.category}</span>
          <div className="w-4 h-4 rounded-full border border-gray-200" style={{ background: item.dominant_color }} />
        </div>
      </div>
    </div>
  )
}

export default function ResultsPage({ faceShape, season, undertone, depth, skinHex, palette: initialPalette, bodyType, genderGroup, personCategory }) {
  const [occasion, setOccasion] = useState('daily')
  const [recs, setRecs] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRecs(occasion)
  }, [occasion])

  async function fetchRecs(occ) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          face_shape: faceShape,
          season,
          occasion: occ,
          body_type: bodyType || 'unknown',
          gender_group: genderGroup || 'women',
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      setRecs(await res.json())
    } catch (e) {
      setError('Could not load recommendations: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const palette = recs?.palette || initialPalette
  const bodyInfo = recs?.body_type_info || {}
  const dressStyles = recs?.dress_styles || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      <header className="flex items-center gap-3 px-6 py-4 bg-white/70 backdrop-blur-sm border-b border-purple-100">
        <span className="text-xl">✨</span>
        <span className="font-semibold text-purple-800">AI Fashion Stylist</span>
        <span className="ml-2 text-sm text-gray-400">Step 5 of 5 — Your Complete Style Report</span>
      </header>

      <div className="max-w-5xl mx-auto w-full">
        <main className="px-4 py-8">

          {/* Full Profile Summary */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100 mb-6">
            <h2 className="font-bold text-gray-900 mb-4 text-base">Your Style Profile</h2>
            <div className="flex flex-wrap gap-5 items-center">
              {personCategory && (
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{PERSON_ICONS[personCategory] || '🧍'}</span>
                  <div>
                    <p className="text-xs text-gray-400">Person</p>
                    <p className="font-bold text-gray-900 capitalize">{personCategory?.replace('_', ' ')}</p>
                  </div>
                </div>
              )}
              {bodyType && bodyType !== 'unknown' && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{BODY_ICONS[bodyType] || '👤'}</span>
                  <div>
                    <p className="text-xs text-gray-400">Body Type</p>
                    <p className="font-bold text-gray-900 capitalize">{bodyType.replace('_', ' ')}</p>
                  </div>
                </div>
              )}
              {faceShape && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{SHAPE_ICONS[faceShape]}</span>
                  <div>
                    <p className="text-xs text-gray-400">Face Shape</p>
                    <p className="font-bold text-gray-900 capitalize">{faceShape}</p>
                  </div>
                </div>
              )}
              {season && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{SEASON_ICONS[season]}</span>
                  <div>
                    <p className="text-xs text-gray-400">Color Season</p>
                    <p className="font-bold text-gray-900">{season}</p>
                  </div>
                </div>
              )}
              {skinHex && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-gray-200" style={{ background: skinHex }} />
                  <div>
                    <p className="text-xs text-gray-400">Undertone</p>
                    <p className="font-bold text-gray-900 capitalize">{undertone} · {depth}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Body Type Advice */}
          {bodyInfo && bodyInfo.label && (
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{bodyInfo.icon || bodyInfo.emoji_icon || '👤'}</span>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">{bodyInfo.label} Body Type</h2>
                  <p className="text-sm text-gray-500">{bodyInfo.description}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {bodyInfo.best_silhouettes && (
                  <div>
                    <h3 className="font-semibold text-green-700 text-sm mb-2">✅ Best Silhouettes</h3>
                    <div className="flex flex-wrap gap-2">
                      {bodyInfo.best_silhouettes.map((s) => (
                        <span key={s} className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-100">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {(bodyInfo.best_fits || bodyInfo.best_necklines) && (
                  <div>
                    <h3 className="font-semibold text-purple-700 text-sm mb-2">👗 Best Styles</h3>
                    <div className="flex flex-wrap gap-2">
                      {(bodyInfo.best_necklines || bodyInfo.best_fits || []).map((s) => (
                        <span key={s} className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full border border-purple-100">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {bodyInfo.avoid && (
                  <div>
                    <h3 className="font-semibold text-red-600 text-sm mb-2">❌ Avoid</h3>
                    <div className="flex flex-wrap gap-2">
                      {bodyInfo.avoid.map((s) => (
                        <span key={s} className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full border border-red-100">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {bodyInfo.tips && (
                  <div className="md:col-span-2">
                    <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                      <p className="text-sm text-amber-800">💡 <strong>Stylist Tip:</strong> {bodyInfo.tips}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Color Palette */}
          {palette && (
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{SEASON_ICONS[season]}</span>
                <h2 className="font-bold text-gray-900 text-lg">{season} Color Palette</h2>
              </div>
              <p className="text-sm text-gray-500 mb-4">{palette.description}</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Your best colors:</p>
                  <div className="flex flex-wrap gap-2 mb-1">
                    {palette.best_colors?.map((hex, i) => (
                      <div key={hex} className="flex flex-col items-center gap-1" title={palette.color_names?.[i]}>
                        <div className="w-10 h-10 rounded-xl border border-gray-100 shadow-sm" style={{ background: hex }} />
                        <span className="text-[9px] text-gray-400 font-mono">{hex}</span>
                        {palette.color_names?.[i] && <span className="text-[9px] text-gray-400 text-center leading-tight">{palette.color_names[i]}</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Colors to avoid:</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {palette.avoid_colors?.map((hex) => (
                      <div key={hex} className="relative">
                        <div className="w-10 h-10 rounded-xl border border-gray-100 shadow-sm opacity-60" style={{ background: hex }} />
                        <div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold text-sm">✕</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Best metals: <strong className="text-gray-700">{palette.metal_tone === 'gold' ? '🥇 Gold' : '🥈 Silver'}</strong>
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Occasion Selector */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Choose Occasion</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {OCCASIONS.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setOccasion(id)}
                  className={`flex flex-col items-center py-2.5 px-4 rounded-xl border-2 transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                    occasion === id
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300'
                  }`}
                >
                  <span className="text-lg">{icon}</span>
                  <span className="text-xs font-medium mt-0.5">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="flex items-center gap-3 py-6 text-gray-500">
              <div className="w-5 h-5 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              Loading outfit recommendations…
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-4">{error}</div>
          )}

          {recs && !loading && (
            <>
              {/* Dress Style Recommendations with visual silhouettes */}
              {dressStyles.length > 0 && (
                <section className="mb-8">
                  <h2 className="font-bold text-gray-900 mb-1 text-lg">
                    {OCCASIONS.find(o => o.id === occasion)?.icon} Recommended Styles for{' '}
                    {OCCASIONS.find(o => o.id === occasion)?.label}
                  </h2>
                  {bodyInfo?.label && (
                    <p className="text-sm text-gray-500 mb-4">
                      Curated for <strong>{bodyInfo.label}</strong> body type · {season} season colors
                    </p>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {dressStyles.map((styleName, i) => (
                      <StyleCard
                        key={styleName + i}
                        styleName={styleName}
                        colors={palette?.best_colors}
                        index={i}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Catalog items */}
              {recs.catalog_items && recs.catalog_items.length > 0 && (
                <section className="mb-8">
                  <h2 className="font-bold text-gray-900 mb-1 text-lg">
                    Shop The Look — {OCCASIONS.find(o => o.id === occasion)?.label}
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">Items matched to your color season and body type</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {recs.catalog_items.map((item) => (
                      <CatalogCard key={item.id} item={item} />
                    ))}
                  </div>
                </section>
              )}

              {/* Face Shape Style Tips */}
              {recs.face_advice && (
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100 mb-6">
                  <h2 className="font-bold text-gray-900 mb-4 text-lg">
                    {SHAPE_ICONS[faceShape]} Face Shape Styling Tips — {faceShape?.charAt(0).toUpperCase() + faceShape?.slice(1)}
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {['necklines', 'hairstyles', 'glasses', 'earrings'].map((key) =>
                      recs.face_advice[key] && recs.face_advice[key].length > 0 ? (
                        <div key={key}>
                          <h3 className="font-semibold text-purple-700 capitalize mb-2">{key}</h3>
                          <ul className="space-y-1.5">
                            {recs.face_advice[key].slice(0, 3).map((item) => (
                              <li key={item.style} className="text-sm text-gray-600">
                                <span className="font-medium text-gray-800">{item.style}</span>
                                {item.reason && <span className="text-gray-400"> — {item.reason}</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null
                    )}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
