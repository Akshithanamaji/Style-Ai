import { useState, useEffect } from 'react'

const WOMEN_TYPES = [
  {
    id: 'hourglass',
    label: 'Hourglass',
    icon: '⌛',
    desc: 'Balanced shoulders & hips, defined waist',
    svgShape: 'M30,12 C24,10 18,14 18,20 L16,48 C14,56 14,62 16,70 L18,108 Q50,116 82,108 L84,70 C86,62 86,56 84,48 L82,20 C82,14 76,10 70,12 Q50,18 30,12Z',
  },
  {
    id: 'pear',
    label: 'Pear',
    icon: '🍐',
    desc: 'Hips wider than shoulders',
    svgShape: 'M34,12 C30,10 26,12 24,16 L22,42 Q50,52 78,42 L76,16 C74,12 70,10 66,12 Q50,18 34,12Z M22,44 C18,60 12,80 8,108 Q50,118 92,108 C88,80 82,60 78,44 Q50,54 22,44Z',
  },
  {
    id: 'apple',
    label: 'Apple',
    icon: '🍎',
    desc: 'Fuller middle, great legs',
    svgShape: 'M30,12 C24,10 18,14 18,20 C10,40 8,70 8,108 Q50,118 92,108 C92,70 90,40 82,20 C82,14 76,10 70,12 Q50,18 30,12Z',
  },
  {
    id: 'rectangle',
    label: 'Rectangle',
    icon: '▭',
    desc: 'Shoulders, waist & hips similar width',
    svgShape: 'M28,12 C24,10 20,12 20,16 L20,108 Q50,114 80,108 L80,16 C80,12 76,10 72,12 Q50,18 28,12Z',
  },
  {
    id: 'inverted_triangle',
    label: 'Inverted Triangle',
    icon: '🔺',
    desc: 'Broader shoulders, narrower hips',
    svgShape: 'M18,12 C14,10 10,14 10,20 L10,28 Q50,36 90,28 L90,20 C90,14 86,10 82,12 Q50,18 18,12Z M10,30 L28,108 Q50,114 72,108 L90,30 Q50,38 10,30Z',
  },
]

const MEN_TYPES = [
  {
    id: 'athletic',
    label: 'Athletic / V-Shape',
    icon: '🏋️',
    desc: 'Broad shoulders, narrow waist',
    svgShape: 'M14,10 Q50,20 86,10 L82,38 Q50,46 18,38Z M18,40 L22,108 Q50,114 78,108 L82,40 Q50,48 18,40Z',
  },
  {
    id: 'rectangle',
    label: 'Rectangle',
    icon: '▭',
    desc: 'Even proportions — shoulders & hips similar',
    svgShape: 'M24,10 C20,8 16,12 16,16 L16,108 Q50,114 84,108 L84,16 C84,12 80,8 76,10 Q50,16 24,10Z',
  },
  {
    id: 'oval',
    label: 'Oval',
    icon: '⭕',
    desc: 'Broader midsection, great legs',
    svgShape: 'M26,10 C22,8 18,12 18,16 L14,50 C8,64 8,80 14,108 Q50,118 86,108 C92,80 92,64 86,50 L82,16 C82,12 78,8 74,10 Q50,16 26,10Z',
  },
]

const CHILD_TYPES = [
  { id: 'girl', label: 'Girl', icon: '👧', desc: "Girls' styles & fits" },
  { id: 'boy', label: 'Boy', icon: '👦', desc: "Boys' styles & fits" },
]

const BODY_TYPE_MAP = {
  adult_woman: WOMEN_TYPES, teen_girl: WOMEN_TYPES,
  adult_man: MEN_TYPES, teen_boy: MEN_TYPES,
  child: null, senior_woman: null, senior_man: null,
}

const PERSON_LABELS = {
  adult_woman: 'Woman', adult_man: 'Man',
  teen_girl: 'Teen Girl', teen_boy: 'Teen Boy',
  child: 'Child', senior_woman: 'Senior Woman', senior_man: 'Senior Man',
}

const PERSON_ICONS = {
  adult_woman: '👩', adult_man: '👨',
  teen_girl: '👧', teen_boy: '👦',
  child: '🧒', senior_woman: '👵', senior_man: '👴',
}

const HAIR_LENGTHS = [
  { id: 'short', label: 'Short', icon: '💇' },
  { id: 'medium', label: 'Medium', icon: '👩‍🦰' },
  { id: 'long', label: 'Long', icon: '👱‍♀️' },
  { id: 'bald', label: 'Bald', icon: '👨‍🦲' },
]

function BodySilhouette({ shape, color = '#a855f7', size = 100 }) {
  const vbW = 100, vbH = 130
  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      width={size}
      height={Math.round(size * vbH / vbW)}
      className="mx-auto"
    >
      <path d={shape} fill={color} opacity="0.85" />
    </svg>
  )
}

export default function BodyTypePage({ imageSrc, onNext }) {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPersonCat, setSelectedPersonCat] = useState(null)
  const [selectedBodyType, setSelectedBodyType] = useState(null)
  const [selectedHairLength, setSelectedHairLength] = useState(null)

  useEffect(() => {
    analyzeBody()
  }, [])

  async function analyzeBody() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/analyze-body', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_data: imageSrc }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setAnalysis(data)
      setSelectedPersonCat(data.person_category)
      setSelectedBodyType(data.body_type !== 'unknown' ? data.body_type : null)
      setSelectedHairLength(data.hair_length && data.hair_length !== 'unknown' ? data.hair_length : null)
    } catch (e) {
      setError('Body analysis failed: ' + e.message)
      setAnalysis({ person_category: 'adult_woman', gender_group: 'women', body_type: 'unknown', confidence: 'low', description: '', hair_length: 'unknown' })
      setSelectedPersonCat('adult_woman')
    } finally {
      setLoading(false)
    }
  }

  const personTypes = BODY_TYPE_MAP[selectedPersonCat]
  const isChild = selectedPersonCat === 'child'
  const isSenior = selectedPersonCat === 'senior_woman' || selectedPersonCat === 'senior_man'

  const genderGroup = (cat) => {
    if (cat === 'child') return 'children'
    if (cat === 'senior_woman' || cat === 'senior_man') return 'seniors'
    if (cat === 'adult_woman' || cat === 'teen_girl') return 'women'
    return 'men'
  }

  const effectiveBodyType = isSenior
    ? 'comfortable'
    : (selectedBodyType || (isChild ? null : 'rectangle'))

  const canContinue = selectedPersonCat && (isSenior || selectedBodyType) && selectedHairLength

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
          <span className="text-xs tracking-wider uppercase text-white/50 font-medium">Step 2 of 5 — Body Analysis</span>
          {/* Pill step indicator */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#6BBF7A]" />
            <span className="w-5 h-2 rounded-full bg-[#6BBF7A]" />
            <span className="w-2 h-2 rounded-full bg-white/20" />
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
          Body Structure Analysis
        </h1>
        <p className="text-white/70 text-center mb-10 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          We analyze your body proportions to recommend the most flattering dress styles for you.
        </p>

        {loading && (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="w-12 h-12 border-4 border-white/20 border-t-[#6BBF7A] rounded-full animate-spin" />
            <p className="text-white font-medium">Analyzing body structure with AI…</p>
            <p className="text-white/50 text-sm">This takes a few seconds</p>
          </div>
        )}

        {!loading && (
          <div className="flex flex-col gap-6">
            {/* AI Detection Result */}
            {analysis && (
              <div className="bg-white/[0.04] backdrop-blur-md rounded-3xl p-6 border border-white/10">
                <p className="text-xs tracking-wider uppercase text-white/50 mb-3">AI detected</p>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl p-2 rounded-2xl bg-white/10">{PERSON_ICONS[analysis.person_category]}</span>
                    <div>
                      <p className="font-bold text-white text-base">{PERSON_LABELS[analysis.person_category]}</p>
                      <p className="text-xs text-white/50 uppercase tracking-wider">Person type</p>
                    </div>
                  </div>
                  {analysis.body_type && analysis.body_type !== 'unknown' && (
                    <div className="pl-4 border-l border-white/10">
                      <p className="font-semibold text-[#6BBF7A] capitalize text-base">{analysis.body_type.replace('_', ' ')}</p>
                      <p className="text-xs text-white/50">Body type • {analysis.confidence} confidence</p>
                    </div>
                  )}
                  {analysis.hair_length && analysis.hair_length !== 'unknown' && (
                    <div className="pl-4 border-l border-white/10">
                      <p className="font-semibold text-[#6BBF7A] capitalize text-base">{analysis.hair_length}</p>
                      <p className="text-xs text-white/50">Hair length</p>
                    </div>
                  )}
                  {analysis.description && (
                    <p className="text-sm text-white/70 flex-1 min-w-40">{analysis.description}</p>
                  )}
                </div>
                {analysis.confidence === 'low' && (
                  <p className="text-xs text-amber-300 mt-4 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5">
                    ⚠️ Low confidence — please confirm your details below. For best results, use a full-body photo.
                  </p>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-300 text-sm">
                <strong>Note:</strong> {error} — Please select manually below.
              </div>
            )}

            {/* Person Type Selector */}
            <div className="bg-white/[0.04] backdrop-blur-md rounded-3xl p-6 border border-white/10">
              <h2 className="font-bold text-white text-lg mb-4">Who is in the photo?</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'adult_woman', label: 'Woman', icon: '👩' },
                  { id: 'adult_man',   label: 'Man',   icon: '👨' },
                  { id: 'teen_girl',   label: 'Teen Girl', icon: '👧' },
                  { id: 'teen_boy',    label: 'Teen Boy',  icon: '👦' },
                  { id: 'child',       label: 'Child',     icon: '🧒' },
                  { id: 'senior_woman',label: 'Senior Woman', icon: '👵' },
                  { id: 'senior_man',  label: 'Senior Man',  icon: '👴' },
                ].map(({ id, label, icon }) => (
                  <button
                    key={id}
                    onClick={() => { setSelectedPersonCat(id); setSelectedBodyType(null) }}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border transition-all cursor-pointer text-left ${
                      selectedPersonCat === id
                        ? 'border-[#6BBF7A] bg-[#6BBF7A]/15 text-[#6BBF7A] font-semibold'
                        : 'border-white/10 bg-white/[0.02] text-white/70 hover:border-white/30 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className="text-xl">{icon}</span>
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Boy/Girl Selector — children only */}
            {selectedPersonCat && isChild && (
              <div className="bg-white/[0.04] backdrop-blur-md rounded-3xl p-6 border border-white/10">
                <h2 className="font-bold text-white text-lg mb-1">Is this a boy or girl?</h2>
                <p className="text-xs text-white/50 uppercase tracking-wider mb-5">Used to tailor dress style recommendations</p>
                <div className="grid grid-cols-2 gap-4">
                  {CHILD_TYPES.map((ct) => (
                    <button
                      key={ct.id}
                      onClick={() => setSelectedBodyType(ct.id)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                        selectedBodyType === ct.id
                          ? 'border-[#6BBF7A] bg-[#6BBF7A]/15 shadow-lg shadow-[#6BBF7A]/10'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.05]'
                      }`}
                    >
                      <span className="text-3xl">{ct.icon}</span>
                      <div className="text-left">
                        <p className={`text-sm font-semibold ${selectedBodyType === ct.id ? 'text-[#6BBF7A]' : 'text-white'}`}>
                          {ct.label}
                        </p>
                        <p className="text-xs text-white/50 mt-0.5">{ct.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Body Type Selector — skip for children & seniors */}
            {selectedPersonCat && !isChild && !isSenior && personTypes && (
              <div className="bg-white/[0.04] backdrop-blur-md rounded-3xl p-6 border border-white/10">
                <h2 className="font-bold text-white text-lg mb-1">Select your body type</h2>
                <p className="text-xs text-white/50 uppercase tracking-wider mb-5">Choose the shape that best matches your proportions</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {personTypes.map((bt) => (
                    <button
                      key={bt.id}
                      onClick={() => setSelectedBodyType(bt.id)}
                      className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                        selectedBodyType === bt.id
                          ? 'border-[#6BBF7A] bg-[#6BBF7A]/15 shadow-lg shadow-[#6BBF7A]/10'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.05]'
                      }`}
                    >
                      <BodySilhouette
                        shape={bt.svgShape}
                        color={selectedBodyType === bt.id ? '#6BBF7A' : '#ffffff80'}
                        size={80}
                      />
                      <div className="text-center">
                        <p className={`text-sm font-semibold ${selectedBodyType === bt.id ? 'text-[#6BBF7A]' : 'text-white'}`}>
                          {bt.label}
                        </p>
                        <p className="text-xs text-white/50 mt-1 leading-tight">{bt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Hair Length Selector */}
            {selectedPersonCat && (
              <div className="bg-white/[0.04] backdrop-blur-md rounded-3xl p-6 border border-white/10">
                <h2 className="font-bold text-white text-lg mb-1">Select your hair length</h2>
                <p className="text-xs text-white/50 uppercase tracking-wider mb-5">Used to tailor hairstyle tips for your face shape</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {HAIR_LENGTHS.map(({ id, label, icon }) => (
                    <button
                      key={id}
                      onClick={() => setSelectedHairLength(id)}
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border transition-all cursor-pointer text-left ${
                        selectedHairLength === id
                          ? 'border-[#6BBF7A] bg-[#6BBF7A]/15 text-[#6BBF7A] font-semibold'
                          : 'border-white/10 bg-white/[0.02] text-white/70 hover:border-white/30 hover:bg-white/[0.06]'
                      }`}
                    >
                      <span className="text-xl">{icon}</span>
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Auto-assigned for seniors */}
            {selectedPersonCat && isSenior && (
              <div className="bg-[#6BBF7A]/10 rounded-2xl p-5 border border-[#6BBF7A]/20">
                <p className="text-sm text-[#6BBF7A]">
                  🌸 Recommendations will focus on elegant, comfortable, and easy-to-wear classic styles.
                </p>
              </div>
            )}

            {/* Your uploaded photo */}
            {imageSrc && (
              <div className="bg-white/[0.04] backdrop-blur-md rounded-3xl p-6 border border-white/10 text-center">
                <h2 className="font-bold text-white text-lg mb-4">Your photo</h2>
                <img
                  src={imageSrc}
                  alt="Uploaded"
                  className="max-w-xs mx-auto rounded-2xl shadow-xl border border-white/10"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                />
              </div>
            )}

            <button
              disabled={!canContinue}
              onClick={() => onNext({
                bodyType: effectiveBodyType,
                personCategory: selectedPersonCat,
                genderGroup: genderGroup(selectedPersonCat),
                hairLength: selectedHairLength,
              })}
              style={{ fontFamily: "'Anton', sans-serif" }}
              className={`w-full py-4 px-8 rounded-full uppercase tracking-wider text-lg transition-all ${
                canContinue
                  ? 'bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-2xl cursor-pointer'
                  : 'bg-white/20 text-white/40 cursor-not-allowed'
              }`}
            >
              {canContinue ? 'Continue to Face Shape →' : 'Select your details above to continue'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
