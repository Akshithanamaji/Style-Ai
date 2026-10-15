import { useState } from 'react'
import { Sparkles, ArrowLeft } from 'lucide-react'

const GRAIN_URI =
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E` +
  `%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E` +
  `%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E` +
  `%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`

export default function ProfileSettingsPage({ user, token, onUpdateUser, onBack }) {
  const [name, setName] = useState(user?.name || '')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  async function handleSaveProfile(e) {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess(false)
    setProfileLoading(true)
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Could not update profile')
      onUpdateUser(data.user)
      setProfileSuccess(true)
    } catch (e) {
      setProfileError(e.message)
    } finally {
      setProfileLoading(false)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    setPasswordLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Could not change password')
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e) {
      setPasswordError(e.message)
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#111216] text-white relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-50"
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
          Profile Settings
        </h1>

        {/* Profile info */}
        <form onSubmit={handleSaveProfile} className="bg-white/[0.04] backdrop-blur-md rounded-3xl p-7 border border-white/10 flex flex-col gap-4 mb-6">
          <h2 className="font-bold text-white text-lg mb-1">Your Information</h2>

          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => { setName(e.target.value); setProfileSuccess(false) }}
              className="w-full border border-white/20 rounded-2xl px-4 py-3 text-white bg-[#1a1c23] focus:outline-none focus:border-[#F4845F]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Email</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full border border-white/10 rounded-2xl px-4 py-3 text-white/50 bg-[#15161c] cursor-not-allowed"
            />
          </div>

          {profileError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-2.5 text-red-300 text-sm">{profileError}</div>
          )}
          {profileSuccess && (
            <div className="bg-[#6BBF7A]/10 border border-[#6BBF7A]/30 rounded-2xl px-4 py-2.5 text-[#6BBF7A] text-sm">Profile updated</div>
          )}

          <button
            type="submit"
            disabled={profileLoading}
            style={{ fontFamily: "'Anton', sans-serif" }}
            className="mt-1 bg-white text-black uppercase tracking-wider text-sm py-3 px-8 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed self-start"
          >
            {profileLoading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>

        {/* Change password */}
        <form onSubmit={handleChangePassword} className="bg-white/[0.04] backdrop-blur-md rounded-3xl p-7 border border-white/10 flex flex-col gap-4 mb-6">
          <h2 className="font-bold text-white text-lg mb-1">Change Password</h2>

          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-white/20 rounded-2xl px-4 py-3 text-white bg-[#1a1c23] focus:outline-none focus:border-[#F4845F]"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full border border-white/20 rounded-2xl px-4 py-3 text-white bg-[#1a1c23] focus:outline-none focus:border-[#F4845F] placeholder:text-white/30"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-white/20 rounded-2xl px-4 py-3 text-white bg-[#1a1c23] focus:outline-none focus:border-[#F4845F]"
            />
          </div>

          {passwordError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-2.5 text-red-300 text-sm">{passwordError}</div>
          )}
          {passwordSuccess && (
            <div className="bg-[#6BBF7A]/10 border border-[#6BBF7A]/30 rounded-2xl px-4 py-2.5 text-[#6BBF7A] text-sm">Password changed</div>
          )}

          <button
            type="submit"
            disabled={passwordLoading}
            style={{ fontFamily: "'Anton', sans-serif" }}
            className="mt-1 bg-white text-black uppercase tracking-wider text-sm py-3 px-8 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed self-start"
          >
            {passwordLoading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </main>
    </div>
  )
}
