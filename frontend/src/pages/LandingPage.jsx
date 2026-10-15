import { ArrowRight, Camera, Palette, MessageSquare, Sparkles } from 'lucide-react'
import ToonHubHero from '../components/ToonHubHero'

const GRAIN_URI =
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E` +
  `%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E` +
  `%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E` +
  `%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`

export default function LandingPage({ onStart }) {
  const cards = [
    {
      num: '01',
      accent: '#F4845F',
      glow: 'rgba(244, 132, 95, 0.15)',
      Icon: Camera,
      tag: 'Local In-Browser Vision',
      badge: 'Private',
      title: 'Upload Your Photo',
      desc: 'Take a selfie or upload a photo. We detect your face shape and skin tone directly in your browser — nothing leaves your device at this stage.',
    },
    {
      num: '02',
      accent: '#6BBF7A',
      glow: 'rgba(107, 191, 122, 0.15)',
      Icon: Palette,
      tag: 'Seasonal Matrix Engine',
      badge: 'Precision',
      title: 'Get Your Color Season',
      desc: 'We analyze your undertone and skin depth to classify your seasonal color palette — Spring, Summer, Autumn, or Winter.',
    },
    {
      num: '03',
      accent: '#E882B4',
      glow: 'rgba(232, 130, 180, 0.15)',
      Icon: MessageSquare,
      tag: 'Conversational AI Co-Pilot',
      badge: 'Adaptive',
      title: 'Chat With Your Stylist',
      desc: 'Describe the occasion, your preferences, or say "no bright colors" — your AI stylist updates recommendations conversationally.',
    },
  ]

  return (
    <div className="flex flex-col bg-[#111216] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── TOONHUB Hero (full viewport) ─────────────────────────────────── */}
      <ToonHubHero onStart={onStart} />

      {/* ── Feature section ──────────────────────────────────────────────── */}
      <main
        id="how"
        className="relative flex flex-col items-center text-center px-6 py-24 sm:py-32 bg-[#121319] overflow-hidden"
      >
        {/* Grain overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            backgroundImage: GRAIN_URI,
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat',
            opacity: 0.35,
          }}
        />

        {/* Ambient colored backdrop glows matching ToonHub characters */}
        <div
          aria-hidden="true"
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
          style={{ background: 'rgba(244, 132, 95, 0.12)' }}
        />
        <div
          aria-hidden="true"
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
          style={{ background: 'rgba(110, 181, 255, 0.12)' }}
        />

        {/* Giant ghost typography in Anton font */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-12 flex items-center justify-center pointer-events-none select-none"
          style={{ zIndex: 0 }}
        >
          <span
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: 'clamp(80px, 20vw, 280px)',
              fontWeight: 900,
              color: 'rgba(255, 255, 255, 0.03)',
              lineHeight: 1,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
            }}
          >
            AI STYLIST
          </span>
        </div>

        {/* Content container */}
        <div className="relative z-10 flex flex-col items-center max-w-5xl mx-auto w-full">
          {/* Badge (no emoji, modern vector icon) */}
          <div className="mb-6 inline-flex items-center gap-2.5 border border-white/20 bg-white/10 backdrop-blur-md text-white text-xs font-semibold px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">
            <Sparkles size={14} className="text-[#F4845F]" />
            <span>Powered by AI — Personalized just for you</span>
          </div>

          {/* Heading */}
          <h1
            style={{ fontFamily: "'Anton', sans-serif" }}
            className="text-4xl sm:text-6xl md:text-7xl uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#F4845F] via-[#E882B4] to-[#6EB5FF] leading-[1.05] tracking-tight mb-6 max-w-3xl"
          >
            Your Personal AI Fashion Stylist
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-white/80 max-w-xl mb-10 leading-relaxed font-normal">
            Upload a photo and get personalized color palettes, style recommendations,
            and outfit suggestions tailored to your unique features — then chat with
            your AI stylist to refine everything.
          </p>

          {/* CTA button */}
          <button
            onClick={onStart}
            style={{ fontFamily: "'Anton', sans-serif" }}
            className="group inline-flex items-center gap-3 bg-white text-black text-lg sm:text-xl font-bold uppercase tracking-wider px-8 sm:px-10 py-4 sm:py-5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <span>Get Started — It&apos;s Free</span>
            <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ArrowRight size={18} strokeWidth={2.5} />
            </span>
          </button>

          {/* Sub-label */}
          <p className="mt-4 text-xs sm:text-sm text-white/50 tracking-wider uppercase font-medium">
            No account needed · Your photo stays private
          </p>

          {/* New Design Style: Interactive Studio Bento Console */}
          <div className="relative mt-20 max-w-5xl w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 text-left">
              {cards.map(({ num, accent, glow, Icon, tag, badge, title, desc }) => (
                <div
                  key={title}
                  className="relative rounded-[36px] p-8 transition-all duration-500 hover:-translate-y-3 group overflow-hidden flex flex-col justify-between"
                  style={{
                    background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.08) 0%, rgba(17,18,24,0.95) 75%)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: `0 16px 40px -15px ${glow}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = accent
                    e.currentTarget.style.boxShadow = `0 24px 50px -10px ${accent}45`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'
                    e.currentTarget.style.boxShadow = `0 16px 40px -15px ${glow}`
                  }}
                >
                  {/* Subtle technical background grid */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity"
                    style={{
                      backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
                      backgroundSize: '16px 16px',
                    }}
                  />

                  {/* Corner accent glow */}
                  <div
                    aria-hidden="true"
                    className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-[60px] pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: accent }}
                  />

                  {/* Top Bar: Tactical Mode Indicator + Numeral */}
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
                      <span
                        style={{ fontFamily: "'Anton', sans-serif" }}
                        className="text-xs uppercase tracking-wider text-white"
                      >
                        MODULE {num}
                      </span>
                    </div>

                    <span
                      style={{ fontFamily: "'Anton', sans-serif", color: accent }}
                      className="text-3xl tracking-tight font-black"
                    >
                      {num}
                    </span>
                  </div>

                  {/* High-Concept Interactive Visual Deck (Zero Emojis) */}
                  <div className="relative z-10 mb-7 rounded-2xl bg-black/50 border border-white/10 p-5 overflow-hidden">
                    {num === '01' && (
                      <div className="relative h-24 flex items-center justify-center">
                        {/* Radar concentric circular rings */}
                        <div className="absolute w-20 h-20 rounded-full border border-dashed border-[#F4845F]/30 animate-spin" style={{ animationDuration: '12s' }} />
                        <div className="absolute w-14 h-14 rounded-full border border-[#F4845F]/20" />

                        {/* Center Camera Icon with optical glow */}
                        <div className="relative z-10 w-12 h-12 rounded-xl bg-[#F4845F]/20 border border-[#F4845F]/50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-[#F4845F]/20">
                          <Icon size={22} className="text-[#F4845F]" strokeWidth={2.2} />
                        </div>

                        {/* Corner reticle marks */}
                        <div className="absolute top-2 left-2 text-[9px] font-mono text-[#F4845F]/70">SCAN // 4K</div>
                        <div className="absolute bottom-2 right-2 text-[9px] font-mono text-[#F4845F]/70">ZERO-CLOUD</div>
                      </div>
                    )}

                    {num === '02' && (
                      <div className="relative h-24 flex items-center justify-between px-3">
                        {/* Dynamic Chromatic Spectrum Rods */}
                        <div className="flex items-end gap-2 h-16">
                          {[
                            { c: '#F4845F', h: '65%', label: 'SP' },
                            { c: '#6BBF7A', h: '100%', label: 'SU' },
                            { c: '#E882B4', h: '80%', label: 'AU' },
                            { c: '#6EB5FF', h: '90%', label: 'WI' },
                          ].map((rod) => (
                            <div key={rod.label} className="flex flex-col items-center gap-1 group-hover:scale-105 transition-transform">
                              <div
                                className="w-5 rounded-lg shadow-md transition-all duration-300"
                                style={{
                                  height: rod.h,
                                  backgroundColor: rod.c,
                                  boxShadow: `0 4px 12px ${rod.c}40`,
                                }}
                              />
                              <span className="text-[8px] font-mono font-bold text-white/50">{rod.label}</span>
                            </div>
                          ))}
                        </div>

                        {/* Center Palette Icon */}
                        <div className="w-12 h-12 rounded-xl bg-[#6BBF7A]/20 border border-[#6BBF7A]/50 flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-[#6BBF7A]/20 flex-shrink-0">
                          <Icon size={22} className="text-[#6BBF7A]" strokeWidth={2.2} />
                        </div>
                      </div>
                    )}

                    {num === '03' && (
                      <div className="relative h-24 flex items-center justify-between px-3">
                        {/* Audio equalizer frequency waves */}
                        <div className="flex items-center gap-1.5 flex-1 mr-4">
                          {[40, 75, 55, 95, 60, 85, 45].map((h, i) => (
                            <div
                              key={i}
                              className="flex-1 rounded-full bg-[#E882B4] transition-all duration-300 group-hover:scale-y-125"
                              style={{
                                height: `${h}%`,
                                opacity: 0.3 + (i % 3) * 0.3,
                                boxShadow: '0 0 8px rgba(232, 130, 180, 0.3)',
                              }}
                            />
                          ))}
                        </div>

                        {/* Message Icon */}
                        <div className="w-12 h-12 rounded-xl bg-[#E882B4]/20 border border-[#E882B4]/50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-[#E882B4]/20 flex-shrink-0">
                          <Icon size={22} className="text-[#E882B4]" strokeWidth={2.2} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Text Information (100% Unchanged) */}
                  <div className="relative z-10 flex-1">
                    <h3
                      style={{ fontFamily: "'Anton', sans-serif" }}
                      className="text-white text-2xl uppercase tracking-wider mb-3 leading-tight"
                    >
                      {title}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed font-normal">{desc}</p>
                  </div>

                  {/* Interactive Tactile Trigger Bar */}
                  <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                      <span className="text-xs font-semibold uppercase tracking-wider text-white/70 group-hover:text-white transition-colors">
                        {tag}
                      </span>
                    </div>

                    <div
                      className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/70 group-hover:text-white group-hover:border-white/50 group-hover:translate-x-1 transition-all"
                      style={{ backgroundColor: `${accent}15` }}
                    >
                      <ArrowRight size={14} strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-white/40 border-t border-white/10 bg-[#0c0d11] tracking-widest uppercase font-medium">
        AI Fashion Stylist — v1 · Built with React, FastAPI &amp; Claude
      </footer>
    </div>
  )
}
