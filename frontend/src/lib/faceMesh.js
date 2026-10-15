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

// Fraction of the image height (from the top) to retry detection against when
// the full frame fails. MediaPipe's short-range face detector is tuned for
// close-up/selfie framing and often misses faces that are small relative to
// the frame — exactly what happens with the full-body "head to hips" photos
// this app asks for, since the face only occupies the top slice of the image.
// Cropping to that slice and upscaling it raises the face's effective size
// enough for the same model to find it, without needing a different model.
const RETRY_CROP_HEIGHT_FRACTION = 0.45
const RETRY_UPSCALE = 1.5

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
  if (result.faceLandmarks && result.faceLandmarks.length > 0) {
    return result.faceLandmarks[0]
  }

  // Full-frame detection found nothing — retry against an upscaled crop of
  // just the top portion, which is where the face will be in a full-body photo.
  const cropHeight = img.naturalHeight * RETRY_CROP_HEIGHT_FRACTION
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth * RETRY_UPSCALE
  canvas.height = cropHeight * RETRY_UPSCALE
  canvas.getContext('2d').drawImage(
    img, 0, 0, img.naturalWidth, cropHeight,
    0, 0, canvas.width, canvas.height
  )

  const cropResult = landmarker.detect(canvas)
  if (!cropResult.faceLandmarks || cropResult.faceLandmarks.length === 0) return null

  // Landmarks are normalized (0–1) relative to the crop — remap the y axis
  // back to the full image's coordinate space so downstream code (skin tone
  // sampling, the landmark overlay, face-shape classification) still lines
  // up with the original photo. x is unchanged since the crop is full-width.
  return cropResult.faceLandmarks[0].map((lm) => ({
    ...lm,
    y: lm.y * RETRY_CROP_HEIGHT_FRACTION,
  }))
}
