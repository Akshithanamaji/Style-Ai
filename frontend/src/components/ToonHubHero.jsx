import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

// ─── constants ────────────────────────────────────────────────────────────────
const AUTO_DELAY = 3000   // ms between slides
const ANIM_DUR   = 650    // ms CSS transition duration

const IMAGES = [
  {
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png',
    bg: '#F4845F',
  },
  {
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/2.b977faab.png',
    bg: '#6BBF7A',
  },
  {
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/3.4df853b4.png',
    bg: '#E882B4',
  },
  {
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/4.4457fbce.png',
    bg: '#6EB5FF',
  },
]

const GRAIN_URI =
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E` +
  `%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E` +
  `%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E` +
  `%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`

const EASE = `cubic-bezier(0.4,0,0.2,1)`
const TRANSITION = [
  `transform ${ANIM_DUR}ms ${EASE}`,
  `filter ${ANIM_DUR}ms ${EASE}`,
  `opacity ${ANIM_DUR}ms ${EASE}`,
  `left ${ANIM_DUR}ms ${EASE}`,
  `bottom ${ANIM_DUR}ms ${EASE}`,
  `height ${ANIM_DUR}ms ${EASE}`,
].join(', ')

// ─── role styles ──────────────────────────────────────────────────────────────
function getRoleStyle(role, isMobile) {
  switch (role) {
    case 'center':
      return {
        transform: `translateX(-50%) scale(${isMobile ? 1.25 : 1.68})`,
        filter:  'blur(0px)',
        opacity: 1,
        zIndex:  20,
        left:    '50%',
        height:  isMobile ? '60%' : '92%',
        bottom:  isMobile ? '22%' : '0',
      }
    case 'left':
      return {
        transform: 'translateX(-50%) scale(1)',
        filter:  'blur(2px)',
        opacity: 0.85,
        zIndex:  10,
        left:    isMobile ? '20%' : '30%',
        height:  isMobile ? '16%' : '28%',
        bottom:  isMobile ? '32%' : '12%',
      }
    case 'right':
      return {
        transform: 'translateX(-50%) scale(1)',
        filter:  'blur(2px)',
        opacity: 0.85,
        zIndex:  10,
        left:    isMobile ? '80%' : '70%',
        height:  isMobile ? '16%' : '28%',
        bottom:  isMobile ? '32%' : '12%',
      }
    default: // back
      return {
        transform: 'translateX(-50%) scale(1)',
        filter:  'blur(4px)',
        opacity: 1,
        zIndex:  5,
        left:    '50%',
        height:  isMobile ? '13%' : '22%',
        bottom:  isMobile ? '32%' : '12%',
      }
  }
}

// ─── component ────────────────────────────────────────────────────────────────
export default function ToonHubHero({ onStart }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640)
  const intervalRef = useRef(null)

  // ── Preload images ───────────────────────────────────────────────────────
  useEffect(() => {
    IMAGES.forEach(({ src }) => { const i = new Image(); i.src = src })
  }, [])

  // ── Responsive ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  // ── AUTO-PLAY ────────────────────────────────────────────────────────────
  //    Uses functional setState: never reads stale activeIndex inside the interval.
  //    The `ignored` flag pattern makes it React StrictMode safe — in dev the
  //    effect fires twice (mount→unmount→mount). The ignored flag from the first
  //    cleanup ensures only the second (real) interval survives.
  useEffect(() => {
    let ignored = false
    const id = setInterval(() => {
      if (ignored) return
      setActiveIndex(prev => (prev + 1) % IMAGES.length)
    }, AUTO_DELAY)
    return () => {
      ignored = true
      clearInterval(id)
    }
  }, [])

  // ── Keyboard navigation ─────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')
        setActiveIndex(prev => (prev + IMAGES.length - 1) % IMAGES.length)
      if (e.key === 'ArrowRight')
        setActiveIndex(prev => (prev + 1) % IMAGES.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ── Role mapping ────────────────────────────────────────────────────────
  const getRole = (idx) => {
    const n = IMAGES.length
    if (idx === activeIndex)             return 'center'
    if (idx === (activeIndex + n - 1) % n) return 'left'
    if (idx === (activeIndex + 1) % n)   return 'right'
    return 'back'
  }

  // ── Manual nav ──────────────────────────────────────────────────────────
  const goNext = () => setActiveIndex(prev => (prev + 1) % IMAGES.length)
  const goPrev = () => setActiveIndex(prev => (prev + IMAGES.length - 1) % IMAGES.length)

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        backgroundColor: IMAGES[activeIndex].bg,
        transition: `background-color ${ANIM_DUR}ms ${EASE}`,
        fontFamily: "'Inter', sans-serif",
      }}
      className="relative w-full overflow-hidden"
    >
      <div style={{ height: '100vh', overflow: 'hidden' }} className="relative w-full">

        {/* ── Grain overlay ─────────────────────────────────────────────── */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 50,
            backgroundImage: GRAIN_URI,
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat',
            opacity: 0.4,
          }}
        />

        {/* ── Giant ghost text ──────────────────────────────────────────── */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none"
          style={{ zIndex: 2, top: '18%' }}
        >
          <span
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: 'clamp(90px, 28vw, 380px)',
              fontWeight: 900,
              color: 'white',
              lineHeight: 1,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
            }}
          >
            AI STYLE
          </span>
        </div>

        {/* ── Top-left brand ────────────────────────────────────────────── */}
        <div className="absolute top-6 left-4 sm:left-8" style={{ zIndex: 60 }}>
          <span
            className="text-xs font-semibold uppercase"
            style={{ color: 'white', opacity: 0.9, letterSpacing: '0.18em' }}
          >
            TOONHUB
          </span>
        </div>

        {/* ── Dot indicators (top-right) ────────────────────────────────── */}
        <div
          className="absolute top-6 right-4 sm:right-8 flex gap-2 items-center"
          style={{ zIndex: 60 }}
        >
          {IMAGES.map((_, idx) => {
            const active = idx === activeIndex
            return (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to character ${idx + 1}`}
                style={{
                  width:        active ? '28px' : '8px',
                  height:       '8px',
                  borderRadius: '9999px',
                  background:   'white',
                  opacity:      active ? 1 : 0.4,
                  border:       'none',
                  cursor:       'pointer',
                  padding:      0,
                  transition:   `width 400ms ${EASE}, opacity 400ms ${EASE}`,
                  // animated progress fill on the active dot
                  backgroundImage: active
                    ? `linear-gradient(to right,
                        rgba(255,255,255,0.6) 0%,
                        white 50%,
                        rgba(255,255,255,0.6) 100%)`
                    : 'none',
                  animation: active ? 'dotPulse 3s linear infinite' : 'none',
                }}
              />
            )
          })}
        </div>

        {/* ── Carousel ──────────────────────────────────────────────────── */}
        <div className="absolute inset-0" style={{ zIndex: 3 }}>
          {IMAGES.map((img, idx) => {
            const role      = getRole(idx)
            const roleStyle = getRoleStyle(role, isMobile)
            return (
              <div
                key={idx}
                style={{
                  position:   'absolute',
                  aspectRatio: '0.6 / 1',
                  transition:  TRANSITION,
                  willChange:  'transform, filter, opacity',
                  ...roleStyle,
                }}
              >
                <img
                  src={img.src}
                  alt={`Character figurine ${idx + 1}`}
                  draggable={false}
                  style={{
                    width:           '100%',
                    height:          '100%',
                    objectFit:       'contain',
                    objectPosition:  'bottom center',
                    userSelect:      'none',
                  }}
                />
              </div>
            )
          })}
        </div>

        {/* ── Bottom-left: website copy and navigation ─────────────────── */}
        <div
          className="absolute bottom-6 left-4 sm:bottom-12 sm:left-24"
          style={{ zIndex: 60, maxWidth: '360px' }}
        >
          <p
            className="font-bold uppercase tracking-widest mb-2 sm:mb-3 text-base sm:text-[22px]"
            style={{ color: '#fff', opacity: 1, letterSpacing: '0.02em', textShadow: '0 1px 8px rgba(0, 0, 0, 0.35)' }}
          >
            AI STYLE STUDIO
          </p>
          <p
            className="hidden sm:block text-xs sm:text-sm mb-4 sm:mb-5"
            style={{ color: '#fff', opacity: 1, lineHeight: 1.6, textShadow: '0 1px 8px rgba(0, 0, 0, 0.35)' }}
          >
            Personalized fashion guidance using your photo, face features, body shape,
            and seasonal tones to find the most flattering dress styles and color choices.
          </p>

          <div className="flex items-center gap-3">
            {[
              { id: 'style-prev', label: 'Previous', Icon: ArrowLeft,  fn: goPrev },
              { id: 'style-next', label: 'Next',     Icon: ArrowRight, fn: goNext },
            ].map(({ id, label, Icon, fn }) => (
              <button
                key={id}
                id={id}
                onClick={fn}
                aria-label={label}
                className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full border-2 border-white text-white cursor-pointer"
                style={{ background: 'transparent', transition: 'transform 150ms, background-color 150ms' }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.08)'
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <Icon size={26} strokeWidth={2.25} />
              </button>
            ))}
          </div>
        </div>

        {/* ── Bottom-right: DISCOVER IT ─────────────────────────────────── */}
        <div
          className="absolute bottom-6 right-4 sm:bottom-20 sm:right-10"
          style={{ zIndex: 60 }}
        >
          <a
            href="#"
            id="toonhub-discover"
            onClick={e => { e.preventDefault(); onStart?.() }}
            className="flex items-center gap-2"
            style={{
              fontFamily:     "'Anton', sans-serif",
              fontSize:       'clamp(20px, 4vw, 56px)',
              fontWeight:     400,
              color:          'white',
              opacity:        0.95,
              letterSpacing:  '-0.02em',
              lineHeight:     1,
              textTransform:  'uppercase',
              textDecoration: 'none',
              transition:     'opacity 200ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '0.95' }}
          >
            DISCOVER IT
            <ArrowRight className="w-5 h-5 sm:w-8 sm:h-8" strokeWidth={2.25} />
          </a>
        </div>

      </div>

      {/* ── CSS for dot pulse animation ─────────────────────────────────── */}
      <style>{`
        @keyframes dotPulse {
          0%   { opacity: 0.5; }
          50%  { opacity: 1;   }
          100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
