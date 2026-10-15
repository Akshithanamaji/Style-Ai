import { useState, useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import CreateProfilePage from './pages/CreateProfilePage'
import ProfileSettingsPage from './pages/ProfileSettingsPage'
import SettingsPage from './pages/SettingsPage'
import UploadPage from './pages/UploadPage'
import BodyTypePage from './pages/BodyTypePage'
import FaceShapePage from './pages/FaceShapePage'
import SeasonPage from './pages/SeasonPage'
import ResultsPage from './pages/ResultsPage'
import ChatPanel from './components/ChatPanel'
import Sidebar from './components/Sidebar'

import { MessageSquare, X } from 'lucide-react'

const TOKEN_KEY = 'afs_token'

function App() {
  const [step, setStep] = useState('landing')
  const [session, setSession] = useState({})
  const [showChat, setShowChat] = useState(false)

  const merge = (data) => setSession((prev) => ({ ...prev, ...data }))

  // Restore a previously logged-in session so returning users skip the login gate.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => merge({ user: data.user, token }))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
  }, [])

  const handleDiscover = () => setStep(session.user ? 'upload' : 'login')

  const handleAuthed = (data) => {
    localStorage.setItem(TOKEN_KEY, data.token)
    merge({ user: data.user, token: data.token })
    setStep('upload')
  }

  const handleLogout = () => {
    if (session.token) {
      fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${session.token}` } }).catch(() => {})
    }
    localStorage.removeItem(TOKEN_KEY)
    setSession((prev) => ({ ...prev, user: null, token: null }))
    setStep('landing')
  }

  const handleAccountDeleted = () => {
    localStorage.removeItem(TOKEN_KEY)
    setSession({})
    setStep('landing')
  }

  const goTo = (target) => () => {
    setSession((prev) => ({ ...prev, sidebarReturnStep: step }))
    setStep(target)
  }

  const chatContext = {
    faceShape: session.faceShape,
    season: session.season,
    undertone: session.undertone,
    depth: session.depth,
    occasion: session.occasion || 'daily',
    palette: session.palette,
    bodyType: session.bodyType,
    genderGroup: session.genderGroup,
    personCategory: session.personCategory,
    hairLength: session.hairLength,
  }

  let page = null
  if (step === 'landing') {
    page = <LandingPage onStart={handleDiscover} />
  } else if (step === 'login') {
    page = <LoginPage onNext={handleAuthed} onSwitchToSignup={() => setStep('signup')} />
  } else if (step === 'signup') {
    page = <CreateProfilePage onNext={handleAuthed} onSwitchToLogin={() => setStep('login')} />
  } else if (step === 'profile') {
    page = (
      <ProfileSettingsPage
        user={session.user}
        token={session.token}
        onUpdateUser={(user) => merge({ user })}
        onBack={() => setStep(session.sidebarReturnStep || 'landing')}
      />
    )
  } else if (step === 'settings') {
    page = (
      <SettingsPage
        user={session.user}
        token={session.token}
        onUpdateUser={(user) => merge({ user })}
        onBack={() => setStep(session.sidebarReturnStep || 'landing')}
        onAccountDeleted={handleAccountDeleted}
      />
    )
  } else if (step === 'upload') {
    page = <UploadPage onNext={(data) => { merge(data); setStep('bodyType') }} />
  } else if (step === 'bodyType') {
    page = (
      <BodyTypePage
        imageSrc={session.imageSrc}
        onNext={(data) => { merge(data); setStep('faceShape') }}
      />
    )
  } else if (step === 'faceShape') {
    page = (
      <FaceShapePage
        imageSrc={session.imageSrc}
        landmarks={session.landmarks}
        onNext={(data) => { merge(data); setStep('season') }}
      />
    )
  } else if (step === 'season') {
    page = (
      <SeasonPage
        imageSrc={session.imageSrc}
        landmarks={session.landmarks}
        onNext={(data) => { merge(data); setStep('results') }}
      />
    )
  } else if (step === 'results') {
    page = (
      <ResultsPage
        faceShape={session.faceShape}
        season={session.season}
        undertone={session.undertone}
        depth={session.depth}
        skinHex={session.skinHex}
        palette={session.palette}
        bodyType={session.bodyType}
        genderGroup={session.genderGroup}
        personCategory={session.personCategory}
        hairLength={session.hairLength}
        defaultOccasion={session.user?.default_occasion}
      />
    )
  }

  const noSidebarSteps = ['landing', 'login', 'signup']
  const showSidebar = session.user && !noSidebarSteps.includes(step)
  const showChat_ = !['landing', 'login', 'signup', 'profile', 'settings'].includes(step)

  return (
    <div className="flex">
      {showSidebar && (
        <Sidebar
          step={step}
          userName={session.user.name}
          onHome={() => setStep('landing')}
          onProfile={goTo('profile')}
          onSettings={goTo('settings')}
          onLogout={handleLogout}
        />
      )}

      <div className="flex-1 min-w-0 relative">
        {page}

        {showChat_ && (
          <>
            <button
              onClick={() => setShowChat((v) => !v)}
              className="fixed bottom-6 right-6 z-50 bg-[#14151B] hover:bg-[#1E2028] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-2xl border-2 border-white/20 hover:border-[#F4845F] transition-all hover:scale-110 active:scale-95 cursor-pointer text-lg"
              title="Chat with Stylist"
            >
              {showChat ? <X size={20} /> : <MessageSquare size={20} className="text-[#F4845F]" />}
            </button>

            {showChat && (
              <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[520px] bg-[#14151B] rounded-3xl shadow-2xl border border-white/20 flex flex-col overflow-hidden">
                <ChatPanel context={chatContext} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default App
