import { useEffect, useRef } from 'react'

// Draws the photo and overlays all 468 facial landmarks as small dots
export default function LandmarkCanvas({ imageSrc, landmarks }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Cap display size for large images
      const MAX_W = 480
      const scale = img.width > MAX_W ? MAX_W / img.width : 1
      canvas.width = img.width * scale
      canvas.height = img.height * scale

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      if (!landmarks) return

      // Draw each landmark as a small semi-transparent dot
      ctx.fillStyle = 'rgba(168, 85, 247, 0.75)' // purple-500
      for (const { x, y } of landmarks) {
        ctx.beginPath()
        ctx.arc(x * canvas.width, y * canvas.height, 1.8, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    img.src = imageSrc
  }, [imageSrc, landmarks])

  return <canvas ref={canvasRef} className="max-w-full rounded-2xl" />
}
