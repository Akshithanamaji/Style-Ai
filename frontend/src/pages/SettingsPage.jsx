import { useState } from 'react'
import { Sparkles, ArrowLeft, ShieldCheck, AlertTriangle } from 'lucide-react'

const GRAIN_URI =
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E` +
  `%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E` +
  `%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E` +
  `%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`

const GENDER_GROUPS = [
  { id: '', label: 'Auto-detect from photo' },
  { id: 'women', label: 'Women' },
  { id: 'men', label: 'Men' },
  { id: 'children', label: 'Children' },
  { id: 'seniors', label: 'Seniors' },
]

const OCCASIONS = [
  { id: '', label: 'No default (ask each time)' },
  { id: 'daily', label: 'Daily Wear' },
  { id: 'office', label: 'Office' },
  { id: 'college', label: 'College' },
  { id: 'party', label: 'Party' },
  { id: 'wedding', label: 'Wedding' },
  { id: 'festive', label: 'Festive' },
  { id: 'formal', label: 'Formal' },
  { id: 'night_wear', label: 'Night Wear' },
  { id: 'functions', label: 'Functions' },
]

export default function SettingsPage({ user, token, onUpdateUser, onBack, onAccountDeleted }) {
  const [genderGroup, setGenderGroup] = useState(user?.default_gender_group || '')
  const [occasion, setOccasion] = useState(user?.default_occasion || '')
  const [prefsLoading, setPrefsLoading] = useState(false)
  const [prefsError, setPrefsError] = useState('')
  const [prefsSuccess, setPrefsSuccess] = useState(false)

  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  async function handleSavePrefs(e) {
    e.preventDefault()
    setPrefsError('')
    setPrefsSuccess(false)
    setPrefsLoading(true)
    try {
      const res = await fetch('/api/auth/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          default_gender_group: genderGroup || null,
          default_occasion: occasion || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Could not save preferences')
      onUpdateUser(data.user)
      setPrefsSuccess(true)
    } catch (e) {
      setPrefsError(e.message)
    } finally {
      setPrefsLoading(false)
    }
  }

  async function handleDeleteAccount() {
    setDeleteError('')
    setDeleteLoading(true)
    try {
      const res = await fetch('/api/auth/me', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || 'Could not delete account')
      }
      onAccountDeleted()
    } catch (e) {
      setDeleteError(e.message)
      setDeleteLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#111216] text-white relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-40"
        style={{ backgroundImage: GRAIN_URI, backgroundSize: '200px 200px', backgroundRepeat: 'repeat', opacity: 0.35 }}
      />

      <header className="relative z-20 flex items-center justify-between px-6 py-4 bg-[#14151B]/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <Sparkles size={18} className="text-[#F4845F]" />
          <span style={{ fontFamily: "'Anton', sans-serif" }} className="text-lg tracking-wider uppercase text-white">
            AI Fashion Stylist
          </span>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium cursor-pointer transition-colors"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>
      </header>

      <main className="relative z-10 max-w-xl mx-auto px-4 py-12">
        <h1 style={{ fontFamily: "'Anton', sans-serif" }} className="text-3xl sm:text-4xl uppercase tracking-tight text-white mb-8 text-center">
          Settings
        </h1>

        {/* Style preferences */}
        <form onSubmit={handleSavePrefs} className="bg-white/[0.04] backdrop-blur-md rounded-3xl p-7 border border-white/10 flex flex-col gap-4 mb-6">
          <h2 className="font-bold text-white text-lg mb-1">Style Preferences</h2>
          <p className="text-xs text-white/50 -mt-2 mb-1">Used to pre-fill your analysis steps. You can always change these per session.</p>

          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Default Category</label>
            <select
              value={genderGroup}
              onChange={(e) => { setGenderGroup(e.target.value); setPrefsSuccess(false) }}
              className="w-full border border-white/20 rounded-2xl px-4 py-3 text-white bg-[#1a1c23] focus:outline-none focus:border-[#F4845F] cursor-pointer"
            >
              {GENDER_GROUPS.map((g) => (
                <option key={g.id} value={g.id} className="bg-[#1a1c23]">{g.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Default Occasion</label>
            <select
              value={occasion}
              onChange={(e) => { setOccasion(e.target.value); setPrefsSuccess(false) }}
              className="w-full border border-white/20 rounded-2xl px-4 py-3 text-white bg-[#1a1c23] focus:outline-none focus:border-[#F4845F] cursor-pointer"
            >
              {OCCASIONS.map((o) => (
                <option key={o.id} value={o.id} className="bg-[#1a1c23]">{o.label}</option>
              ))}
            </select>
          </div>

          {prefsError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-2.5 text-red-300 text-sm">{prefsError}</div>
          )}
          {prefsSuccess && (
            <div className="bg-[#6BBF7A]/10 border border-[#6BBF7A]/30 rounded-2xl px-4 py-2.5 text-[#6BBF7A] text-sm">Preferences saved</div>
          )}

          <button
            type="submit"
            disabled={prefsLoading}
            style={{ fontFamily: "'Anton', sans-serif" }}
            className="mt-1 bg-white text-black uppercase tracking-wider text-sm py-3 px-8 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed self-start"
          >
            {prefsLoading ? 'Saving…' : 'Save Preferences'}
          </button>
        </form>

        {/* Privacy */}
        <div className="bg-white/[0.04] backdrop-blur-md rounded-3xl p-7 border border-white/10 flex flex-col gap-3 mb-6">
          <h2 className="font-bold text-white text-lg mb-1 flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#6BBF7A]" /> Privacy &amp; Data
          </h2>
          <p className="text-sm text-white/70 leading-relaxed">
            Photos you upload are analyzed in memory to generate your style results and are never saved to disk
            or stored in our database. Only your account details (name, email, and preferences) are kept.
          </p>
        </div>

        {/* Danger zone */}
        <div className="bg-red-500/[0.04] backdrop-blur-md rounded-3xl p-7 border border-red-500/20 flex flex-col gap-3">
          <h2 className="font-bold text-red-300 text-lg mb-1 flex items-center gap-2">
            <AlertTriangle size={18} /> Danger Zone
          </h2>
          <p className="text-sm text-white/60 leading-relaxed">
            Permanently delete your account and all associated data. This cannot be undone.
          </p>

          {deleteError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-2.5 text-red-300 text-sm">{deleteError}</div>
          )}

          {!confirmingDelete ? (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="mt-1 border border-red-500/40 text-red-300 hover:bg-red-500/10 text-sm font-semibold py-2.5 px-6 rounded-full transition-all cursor-pointer self-start"
            >
              Delete My Account
            </button>
          ) : (
            <div className="flex items-center gap-3 mt-1">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 px-6 rounded-full transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? 'Deleting…' : 'Yes, delete everything'}
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                disabled={deleteLoading}
                className="text-white/60 hover:text-white text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
