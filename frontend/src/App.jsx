import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import UploadPage from './pages/UploadPage'
import BodyTypePage from './pages/BodyTypePage'
import FaceShapePage from './pages/FaceShapePage'
import SeasonPage from './pages/SeasonPage'
import ResultsPage from './pages/ResultsPage'
import ChatPanel from './components/ChatPanel'

function App() {
  const [step, setStep] = useState('landing')
  const [session, setSession] = useState({})
  const [showChat, setShowChat] = useState(false)

  const merge = (data) => setSession((prev) => ({ ...prev, ...data }))

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
  }

  let page = null
  if (step === 'landing') {
    page = <LandingPage onStart={() => setStep('upload')} />
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
      />
    )
  }

  return (
    <div className="relative">
      {page}

      {step !== 'landing' && (
        <>
          <button
            onClick={() => setShowChat((v) => !v)}
            className="fixed bottom-6 right-6 z-50 bg-purple-600 hover:bg-purple-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all hover:scale-105 cursor-pointer text-2xl"
            title="Chat with Stylist"
          >
            {showChat ? '✕' : '💬'}
          </button>

          {showChat && (
            <div className="fixed bottom-24 right-6 z-50 w-80 h-[500px] bg-white rounded-2xl shadow-2xl border border-purple-100 flex flex-col overflow-hidden">
              <ChatPanel context={chatContext} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default App
