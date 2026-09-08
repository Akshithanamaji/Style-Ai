import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

// MediaPipe's WASM runtime logs internal glog-style diagnostics (e.g. "W0903 ...
// gl_context.cc:1119] OpenGL error checking is disabled") straight to
// console.warn/console.error. These are informational, not real errors, so
// filter them out to avoid alarming noise in the browser console.
const MEDIAPIPE_NOISE = /\.(cc|cpp):\d+\]|XNNPACK delegate|Graph successfully started running/

function silenceMediapipeNoise(methodName) {
  const original = console[methodName]
  console[methodName] = (...args) => {
    if (typeof args[0] === 'string' && MEDIAPIPE_NOISE.test(args[0])) return
    original.apply(console, args)
  }
}

silenceMediapipeNoise('warn')
silenceMediapipeNoise('error')
silenceMediapipeNoise('log')
silenceMediapipeNoise('info')

let faceLandmarker = null
let initPromise = null

function getFaceLandmarker() {
  if (!initPromise) {
    initPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks('/mediapipe-wasm')
      faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: '/models/face_landmarker.task',
          delegate: 'CPU',
        },
        outputFaceBlendshapes: false,
        runningMode: 'IMAGE',
        numFaces: 1,
      })
      return faceLandmarker
    })()
  }
  return initPromise
}

// Call this as early as possible to start loading in the background.
export function prewarmFaceLandmarker() {
  return getFaceLandmarker()
}

export async function detectLandmarks(dataUrl) {
  const landmarker = await getFaceLandmarker()

  // Draw the data URL into an HTMLImageElement so MediaPipe can read it
  const img = new Image()
  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = () => reject(new Error('Could not load the captured image — it may be empty or corrupted.'))
    img.src = dataUrl
  })

  const result = landmarker.detect(img)
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null

  // Return the first face's 468 landmarks (normalized 0–1 coordinates)
  return result.faceLandmarks[0]
}
