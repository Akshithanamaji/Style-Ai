export default function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-purple-100 bg-white/70 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✨</span>
          <span className="font-semibold text-purple-800 text-lg tracking-tight">AI Fashion Stylist</span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm text-gray-500">
          <a href="#how" className="hover:text-purple-700 transition-colors">How it works</a>
          <a href="#privacy" className="hover:text-purple-700 transition-colors">Privacy</a>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="mb-6 inline-flex items-center gap-2 bg-purple-100 text-purple-700 text-sm font-medium px-4 py-1.5 rounded-full">
          <span>🎨</span> Powered by AI — Personalized just for you
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6 max-w-3xl">
          Your Personal{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
            AI Fashion
          </span>{' '}
          Stylist
        </h1>

        <p className="text-xl text-gray-600 max-w-xl mb-10 leading-relaxed">
          Upload a photo and get personalized color palettes, style recommendations,
          and outfit suggestions tailored to your unique features — then chat with
          your AI stylist to refine everything.
        </p>

        <button
          onClick={onStart}
          className="bg-gradient-to-r from-purple-600 to-pink-500 text-white text-lg font-semibold px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
        >
          Get Started — It's Free
        </button>

        <p className="mt-4 text-sm text-gray-400">No account needed · Your photo stays private</p>

        {/* Feature cards */}
        <div id="how" className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl w-full text-left">
          {[
            {
              icon: '📸',
              title: 'Upload Your Photo',
              desc: 'Take a selfie or upload a photo. We detect your face shape and skin tone directly in your browser — nothing leaves your device at this stage.',
            },
            {
              icon: '🎨',
              title: 'Get Your Color Season',
              desc: 'We analyze your undertone and skin depth to classify your seasonal color palette — Spring, Summer, Autumn, or Winter.',
            },
            {
              icon: '💬',
              title: 'Chat With Your Stylist',
              desc: 'Describe the occasion, your preferences, or say "no bright colors" — your AI stylist updates recommendations conversationally.',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-purple-100">
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Privacy notice */}
        <div id="privacy" className="mt-12 max-w-xl text-sm text-gray-400 bg-white/60 rounded-xl p-4 border border-gray-100">
          <strong className="text-gray-600">Privacy:</strong> Face detection runs entirely in your browser.
          Photos sent to our server for color analysis are processed in memory only and never stored on disk.
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-100">
        AI Fashion Stylist — v1 · Built with React, FastAPI &amp; Claude
      </footer>
    </div>
  )
}
