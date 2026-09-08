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
    } catch (e) {
      setError('Body analysis failed: ' + e.message)
      setAnalysis({ person_category: 'adult_woman', gender_group: 'women', body_type: 'unknown', confidence: 'low', description: '' })
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

  const effectiveBodyType = (isChild || isSenior)
    ? (isChild ? 'child' : 'comfortable')
    : (selectedBodyType || 'rectangle')

  const canContinue = selectedPersonCat && (isChild || isSenior || selectedBodyType)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      <header className="flex items-center gap-3 px-6 py-4 bg-white/70 backdrop-blur-sm border-b border-purple-100">
        <span className="text-xl">✨</span>
        <span className="font-semibold text-purple-800">AI Fashion Stylist</span>
        <span className="ml-2 text-sm text-gray-400">Step 2 of 5 — Body Analysis</span>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Body Structure Analysis</h1>
        <p className="text-gray-500 text-center mb-8 max-w-xl mx-auto">
          We analyze your body proportions to recommend the most flattering dress styles for you.
        </p>

        {loading && (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            <p className="text-gray-500 font-medium">Analyzing body structure with AI…</p>
            <p className="text-gray-400 text-sm">This takes a few seconds</p>
          </div>
        )}

        {!loading && (
          <div className="flex flex-col gap-6">
            {/* AI Detection Result */}
            {analysis && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
                <p className="text-sm text-gray-400 mb-3">AI detected</p>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{PERSON_ICONS[analysis.person_category]}</span>
                    <div>
                      <p className="font-bold text-gray-800">{PERSON_LABELS[analysis.person_category]}</p>
                      <p className="text-xs text-gray-400">Person type</p>
                    </div>
                  </div>
                  {analysis.body_type && analysis.body_type !== 'unknown' && (
                    <div>
                      <p className="font-semibold text-purple-700 capitalize">{analysis.body_type.replace('_', ' ')}</p>
                      <p className="text-xs text-gray-400">Body type • {analysis.confidence} confidence</p>
                    </div>
                  )}
                  {analysis.description && (
                    <p className="text-sm text-gray-500 flex-1 min-w-40">{analysis.description}</p>
                  )}
                </div>
                {analysis.confidence === 'low' && (
                  <p className="text-xs text-amber-600 mt-2 bg-amber-50 rounded-lg px-3 py-2">
                    ⚠️ Low confidence — please confirm your details below. For best results, use a full-body photo.
                  </p>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                <strong>Note:</strong> {error} — Please select manually below.
              </div>
            )}

            {/* Person Type Selector */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
              <h2 className="font-semibold text-gray-800 mb-3">Who is in the photo?</h2>
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
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all cursor-pointer text-left ${
                      selectedPersonCat === id
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300'
                    }`}
                  >
                    <span className="text-xl">{icon}</span>
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Body Type Selector — skip for children & seniors */}
            {selectedPersonCat && !isChild && !isSenior && personTypes && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
                <h2 className="font-semibold text-gray-800 mb-1">Select your body type</h2>
                <p className="text-sm text-gray-400 mb-4">Choose the shape that best matches your proportions</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {personTypes.map((bt) => (
                    <button
                      key={bt.id}
                      onClick={() => setSelectedBodyType(bt.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        selectedBodyType === bt.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 bg-gray-50 hover:border-purple-300 hover:bg-purple-50/40'
                      }`}
                    >
                      <BodySilhouette
                        shape={bt.svgShape}
                        color={selectedBodyType === bt.id ? '#9333ea' : '#c4b5fd'}
                        size={80}
                      />
                      <div className="text-center">
                        <p className={`text-sm font-semibold ${selectedBodyType === bt.id ? 'text-purple-700' : 'text-gray-700'}`}>
                          {bt.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 leading-tight">{bt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Auto-assigned for children/seniors */}
            {selectedPersonCat && (isChild || isSenior) && (
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                <p className="text-sm text-purple-700">
                  {isChild
                    ? '🧒 Recommendations will focus on age-appropriate, comfortable, and playful styles for children.'
                    : '🌸 Recommendations will focus on elegant, comfortable, and easy-to-wear classic styles.'}
                </p>
              </div>
            )}

            {/* Your uploaded photo */}
            {imageSrc && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
                <h2 className="font-semibold text-gray-800 mb-3">Your photo</h2>
                <img
                  src={imageSrc}
                  alt="Uploaded"
                  className="max-w-xs mx-auto rounded-xl shadow-sm"
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
              })}
              className={`w-full py-3 px-8 rounded-xl font-semibold text-white transition-all ${
                canContinue
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 hover:shadow-lg hover:scale-105 cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed'
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
