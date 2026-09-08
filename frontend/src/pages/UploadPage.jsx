import { useRef, useState, useCallback, useEffect } from 'react'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-4 bg-white/70 backdrop-blur-sm border-b border-purple-100">
        <span className="text-xl">✨</span>
        <span className="font-semibold text-purple-800">AI Fashion Stylist</span>
        <span className="ml-2 text-sm text-gray-400">Step 1 of 5 — Upload Photo</span>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Let's start with your photo</h1>
        <p className="text-gray-500 text-center mb-8">
          Use a clear, well-lit <strong>full-body photo</strong> — head to at least your hips visible — so we can
          analyze your face shape, skin tone, and body shape together. Face detection runs entirely in your browser;
          your photo is never uploaded at this stage.
        </p>

        {/* Upload / Camera controls (shown when idle or error) */}
        {(mode === MODES.IDLE || mode === MODES.ERROR) && !showCamera && (
          <div className="flex flex-col items-center gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-purple-300 rounded-2xl p-12 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all"
            >
              <div className="text-5xl mb-3">📁</div>
              <p className="text-gray-700 font-medium">Click to upload a photo</p>
              <p className="text-gray-400 text-sm mt-1">JPG, PNG, WEBP — max 10 MB</p>
              {!modelReady && (
                <p className="text-purple-400 text-xs mt-3 flex items-center justify-center gap-1.5">
                  <span className="inline-block w-3 h-3 border-2 border-purple-300 border-t-purple-500 rounded-full animate-spin" />
                  Loading face detection model…
                </p>
              )}
              {modelReady && (
                <p className="text-green-500 text-xs mt-3">Face detection model ready</p>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button
              onClick={startCamera}
              className="w-full flex items-center justify-center gap-2 bg-white border border-purple-300 text-purple-700 font-medium py-3 px-6 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer"
            >
              <span>📷</span> Use Camera
            </button>

            {mode === MODES.ERROR && (
              <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                <strong>Oops:</strong> {errorMsg}
              </div>
            )}
          </div>
        )}

        {/* Camera live view */}
        {showCamera && (
          <div className="flex flex-col items-center gap-4">
            <div className="relative rounded-2xl overflow-hidden shadow-lg bg-black w-full max-w-md">
              <video ref={videoRef} autoPlay playsInline muted className="w-full" />
            </div>
            <div className="flex gap-3">
              <button
                onClick={capturePhoto}
                className="bg-purple-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-purple-700 transition-colors cursor-pointer"
              >
                📸 Capture Photo
              </button>
              <button
                onClick={() => { stopCamera(); setMode(MODES.IDLE) }}
                className="bg-white border border-gray-300 text-gray-600 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Detecting spinner */}
        {mode === MODES.DETECTING && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            <p className="text-gray-600 font-medium">Detecting facial landmarks…</p>
            <p className="text-gray-400 text-sm text-center max-w-xs">
              {modelReady
                ? 'Running face detection — this takes a few seconds'
                : 'Loading face detection model (~15 s on first run), then detecting…'}
            </p>
          </div>
        )}

        {/* Result: preview + landmark overlay */}
        {(mode === MODES.DONE || (mode === MODES.ERROR && imageSrc)) && imageSrc && (
          <div className="flex flex-col items-center gap-6">
            <div className="relative inline-block rounded-2xl overflow-hidden shadow-xl">
              <LandmarkCanvas imageSrc={imageSrc} landmarks={landmarks} />
            </div>

            {mode === MODES.DONE && (
              <>
                <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 text-green-700 text-sm font-medium">
                  ✅ {landmarks?.length} facial landmarks detected successfully
                </div>
                {closeUpWarning && (
                  <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
                    <strong>Heads up:</strong> this looks like a close-up photo. Body shape analysis in the next step
                    needs your shoulders, waist, and hips visible — for best results, go back and upload a full-body
                    photo instead.
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={reset}
                    className="bg-white border border-gray-300 text-gray-600 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Try another photo
                  </button>
                  <button
                    onClick={() => onNext({ imageSrc, landmarks })}
                    className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold px-8 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
                  >
                    Continue →
                  </button>
                </div>
              </>
            )}

            {mode === MODES.ERROR && (
              <div className="flex flex-col items-center gap-3 w-full">
                <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                  <strong>No face detected.</strong> {errorMsg}
                </div>
                <button
                  onClick={reset}
                  className="bg-purple-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-purple-700 transition-colors cursor-pointer"
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
