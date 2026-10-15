import { useState } from 'react'
import { Sparkles } from 'lucide-react'

const GRAIN_URI =
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E` +
  `%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E` +
  `%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E` +
  `%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`

export default function LoginPage({ onNext, onSwitchToSignup }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Login failed')
      onNext({ user: data.user, token: data.token })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#111216] text-white relative overflow-hidden flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-50"
        style={{ backgroundImage: GRAIN_URI, backgroundSize: '200px 200px', backgroundRepeat: 'repeat', opacity: 0.35 }}
      />

      <header className="relative z-20 flex items-center justify-center px-6 py-6">
        <div className="flex items-center gap-3">
          <Sparkles size={18} className="text-[#F4845F]" />
          <span style={{ fontFamily: "'Anton', sans-serif" }} className="text-lg tracking-wider uppercase text-white">
            AI Fashion Stylist
          </span>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <h1 style={{ fontFamily: "'Anton', sans-serif" }} className="text-3xl sm:text-4xl uppercase tracking-tight text-white mb-2 text-center">
            Welcome Back
          </h1>
          <p className="text-white/60 text-center mb-8 text-sm">Log in to continue to your style analysis</p>

          <form onSubmit={handleSubmit} className="bg-white/[0.04] backdrop-blur-md rounded-3xl p-7 border border-white/10 flex flex-col gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-white/20 rounded-2xl px-4 py-3 text-white bg-[#1a1c23] focus:outline-none focus:border-[#F4845F] placeholder:text-white/30"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-white/20 rounded-2xl px-4 py-3 text-white bg-[#1a1c23] focus:outline-none focus:border-[#F4845F] placeholder:text-white/30"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-2.5 text-red-300 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ fontFamily: "'Anton', sans-serif" }}
              className="mt-2 bg-white text-black uppercase tracking-wider text-base py-3.5 px-8 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in…' : 'Log In'}
            </button>
          </form>

          <p className="text-center text-white/60 text-sm mt-6">
            New here?{' '}
            <button onClick={onSwitchToSignup} className="text-[#F4845F] font-semibold hover:underline cursor-pointer">
              Create a profile
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}
