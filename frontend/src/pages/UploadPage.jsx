import { useRef, useState, useCallback, useEffect } from 'react'
import { Sparkles, UploadCloud, Camera, CheckCircle2 } from 'lucide-react'
import { detectLandmarks, prewarmFaceLandmarker } from '../lib/faceMesh'
import LandmarkCanvas from '../components/LandmarkCanvas'

const MODES = { IDLE: 'idle', CAMERA: 'camera', PREVIEW: 'preview', DETECTING: 'detecting', DONE: 'done', ERROR: 'error' }

export default function UploadPage({ onNext }) {
  const [mode, setMode] = useState(MODES.IDLE)
  const [imageSrc, setImageSrc] = useState(null)
  const [landmarks, setLandmarks] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [showCamera, setShowCamera] = useState(false)
  const [modelReady, setModelReady] = useState(false)
  const [closeUpWarning, setCloseUpWarning] = useState(false)

  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  // Start loading the model immediately so it's ready by the time the user picks a photo
  useEffect(() => {
    prewarmFaceLandmarker().then(() => setModelReady(true)).catch(() => {})
  }, [])

  // ── Camera ──────────────────────────────────────────────────────────────────
  const startCamera = async () => {
    setMode(MODES.CAMERA)
    setShowCamera(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch {
      setErrorMsg('Camera access denied. Please allow camera permission or upload a photo instead.')
      setMode(MODES.ERROR)
      setShowCamera(false)
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setShowCamera(false)
  }

  const capturePhoto = () => {
    const video = videoRef.current
    if (!video) return
    if (!video.videoWidth || !video.videoHeight) {
      stopCamera()
      setErrorMsg('Camera feed is not ready yet. Please wait a moment and try again.')
      setMode(MODES.ERROR)
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    stopCamera()
    runDetection(dataUrl)
  }

  // ── File upload ──────────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      // Draw to canvas so EXIF rotation is baked in — otherwise the backend
      // gets the raw (possibly rotated) bytes while landmarks came from the
      // browser-corrected view, causing landmarks to point at the wrong pixels.
      const img = new Image()
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = ev.target.result })
      const MAX_DIM = 1280
      const ratio = Math.min(MAX_DIM / img.naturalWidth, MAX_DIM / img.naturalHeight, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.naturalWidth * ratio)
      canvas.height = Math.round(img.naturalHeight * ratio)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      runDetection(canvas.toDataURL('image/jpeg', 0.92))
    }
    reader.readAsDataURL(file)
  }

  // ── Detection ────────────────────────────────────────────────────────────────
  const runDetection = useCallback(async (dataUrl) => {
    setImageSrc(dataUrl)
    setMode(MODES.DETECTING)
    setErrorMsg('')
    setLandmarks(null)
    setCloseUpWarning(false)
    try {
      const result = await detectLandmarks(dataUrl)
      if (!result) {
        setErrorMsg('No face detected. Please try a clearer photo with your face visible and well-lit.')
        setMode(MODES.ERROR)
        return
      }
      // If the face fills most of the frame's height, this is likely a close-up/
      // headshot rather than a full-body photo — body shape analysis in the next
      // step needs the shoulders, waist, and hips to be visible.
      const ys = result.map((p) => p.y)
      const faceHeightFraction = Math.max(...ys) - Math.min(...ys)
      setCloseUpWarning(faceHeightFraction > 0.45)
      setLandmarks(result)
      setMode(MODES.DONE)
    } catch (err) {
      setErrorMsg('Detection failed: ' + (err.message || 'unknown error'))
      setMode(MODES.ERROR)
    }
  }, [])

  // Cleanup camera on unmount
  useEffect(() => () => stopCamera(), [])

  const reset = () => {
    setMode(MODES.IDLE)
    setImageSrc(null)
    setLandmarks(null)
    setErrorMsg('')
    setCloseUpWarning(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

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

      {/* Ambient background glows */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-[140px] pointer-events-none"
        style={{ background: 'rgba(244, 132, 95, 0.1)' }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-10 left-1/4 w-96 h-96 rounded-full blur-[140px] pointer-events-none"
        style={{ background: 'rgba(110, 181, 255, 0.1)' }}
      />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 bg-[#14151B]/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <Sparkles size={18} className="text-[#F4845F]" />
          <span
            style={{ fontFamily: "'Anton', sans-serif" }}
            className="text-lg tracking-wider uppercase text-white"
          >
            AI Fashion Stylist
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs tracking-wider uppercase text-white/50 font-medium">Step 1 of 5 — Upload Photo</span>
          {/* Pill step indicator */}
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-2 rounded-full bg-[#F4845F]" />
            <span className="w-2 h-2 rounded-full bg-white/20" />
            <span className="w-2 h-2 rounded-full bg-white/20" />
            <span className="w-2 h-2 rounded-full bg-white/20" />
            <span className="w-2 h-2 rounded-full bg-white/20" />
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        <h1
          style={{ fontFamily: "'Anton', sans-serif" }}
          className="text-3xl sm:text-5xl uppercase tracking-tight text-white mb-3 text-center"
        >
          Let's start with your photo
        </h1>
        <p className="text-white/70 text-center mb-10 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Use a clear, well-lit <strong>full-body photo</strong> — head to at least your hips visible — so we can
          analyze your face shape, skin tone, hairstyle length, and full-body structure to recommend the best dress
          style for you and highlight the colours to avoid.
        </p>

        {/* Upload / Camera controls (shown when idle or error) */}
        {(mode === MODES.IDLE || mode === MODES.ERROR) && !showCamera && (
          <div className="flex flex-col items-center gap-5">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-white/20 bg-white/[0.03] backdrop-blur-md rounded-3xl p-12 text-center cursor-pointer hover:border-[#F4845F] hover:bg-white/[0.06] transition-all group flex flex-col items-center justify-center"
            >
              <UploadCloud size={44} className="text-[#F4845F] mb-4 group-hover:scale-110 transition-transform" />
              <p className="text-white font-semibold text-lg">Click to upload a photo</p>
              <p className="text-white/50 text-xs sm:text-sm mt-1 uppercase tracking-wider">JPG, PNG, WEBP — max 10 MB</p>
              {!modelReady && (
                <p className="text-[#6EB5FF] text-xs mt-4 flex items-center justify-center gap-2">
                  <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-[#6EB5FF] rounded-full animate-spin" />
                  Loading face detection model…
                </p>
              )}
              {modelReady && (
                <p className="text-[#6BBF7A] text-xs mt-4 font-semibold tracking-wide">Face detection model ready</p>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            <div className="flex items-center gap-3 w-full my-1">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/40 text-xs uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button
              onClick={startCamera}
              className="w-full flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-semibold py-3.5 px-6 rounded-full hover:bg-white/15 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Camera size={18} />
              <span>Use Camera</span>
            </button>

            {mode === MODES.ERROR && (
              <div className="w-full bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-300 text-sm">
                <strong>Oops:</strong> {errorMsg}
              </div>
            )}
          </div>
        )}

        {/* Camera live view */}
        {showCamera && (
          <div className="flex flex-col items-center gap-5">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/20 w-full max-w-md">
              <video ref={videoRef} autoPlay playsInline muted className="w-full" />
            </div>
            <div className="flex gap-3">
              <button
                onClick={capturePhoto}
                style={{ fontFamily: "'Anton', sans-serif" }}
                className="bg-[#F4845F] text-white uppercase tracking-wider px-8 py-3.5 rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg flex items-center gap-2"
              >
                <Camera size={18} />
                <span>Capture Photo</span>
              </button>
              <button
                onClick={() => { stopCamera(); setMode(MODES.IDLE) }}
                className="bg-white/10 border border-white/20 text-white px-6 py-3.5 rounded-full hover:bg-white/15 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Detecting spinner */}
        {mode === MODES.DETECTING && (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="w-12 h-12 border-4 border-white/20 border-t-[#F4845F] rounded-full animate-spin" />
            <p className="text-white font-medium">Detecting facial landmarks…</p>
            <p className="text-white/50 text-sm text-center max-w-xs">
              {modelReady
                ? 'Running face detection — this takes a few seconds'
                : 'Loading face detection model (~15 s on first run), then detecting…'}
            </p>
          </div>
        )}

        {/* Result: preview + landmark overlay */}
        {(mode === MODES.DONE || (mode === MODES.ERROR && imageSrc)) && imageSrc && (
          <div className="flex flex-col items-center gap-6">
            <div className="relative inline-block rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-black">
              <LandmarkCanvas imageSrc={imageSrc} landmarks={landmarks} />
            </div>

            {mode === MODES.DONE && (
              <>
                <div className="bg-[#6BBF7A]/15 border border-[#6BBF7A]/30 rounded-full px-6 py-3 text-[#6BBF7A] text-sm font-semibold tracking-wide flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#6BBF7A]" />
                  <span>{landmarks?.length} facial landmarks detected successfully</span>
                </div>
                {closeUpWarning && (
                  <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-amber-200 text-sm">
                    <strong>Heads up:</strong> this looks like a close-up photo. Body shape analysis in the next step
                    needs your shoulders, waist, and hips visible — for best results, go back and upload a full-body
                    photo instead.
                  </div>
                )}
                <div className="flex gap-4">
                  <button
                    onClick={reset}
                    className="bg-white/10 border border-white/20 text-white px-6 py-3.5 rounded-full hover:bg-white/15 transition-colors cursor-pointer"
                  >
                    Try another photo
                  </button>
                  <button
                    onClick={() => onNext({ imageSrc, landmarks })}
                    style={{ fontFamily: "'Anton', sans-serif" }}
                    className="bg-white text-black uppercase tracking-wider px-8 py-3.5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl cursor-pointer"
                  >
                    Continue →
                  </button>
                </div>
              </>
            )}

            {mode === MODES.ERROR && (
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="w-full bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-300 text-sm">
                  <strong>No face detected.</strong> {errorMsg}
                </div>
                <button
                  onClick={reset}
                  style={{ fontFamily: "'Anton', sans-serif" }}
                  className="bg-[#F4845F] text-white uppercase tracking-wider px-8 py-3.5 rounded-full hover:scale-105 transition-all cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
