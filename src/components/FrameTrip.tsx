import { useEffect, useRef } from 'react'
import type { Frame } from '../types'
import { FILTERS, composeStrip, loadImage, preloadImages, type FilterId, type PhotoSource } from '../lib/canvas'

interface FrameTripProps {
  frame: Frame
  sampleOffset?: number
  filter?: FilterId
  className?: string
  width?: number
  radius?: number
}

/**
 * Render bingkai asli + foto sampel ke canvas kecil.
 * Dipakai di kartu katalog biar yang dilihat user = yang bakal diekspor.
 */
export function FrameTrip({ frame, sampleOffset = 0, filter = 'natural', className = '', width = 420, radius = 0 }: FrameTripProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let active = true
    const canvas = canvasRef.current
    if (!canvas) return

    const photoUrls = frame.slots.map((_, i) => `/samples/pose-${((i + sampleOffset) % 6) + 1}.jpg`)

    Promise.all([loadImage(frame.overlayUrl), preloadImages(photoUrls)])
      .then(([overlay, photos]) => {
        if (!active) return
        composeStrip(canvas, {
          frame,
          overlay,
          photos: photos as PhotoSource[],
          filter,
          background: frame.defaultBgColor,
          width,
          showDate: false,
        })
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [frame, sampleOffset, filter, width])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: 'auto', display: 'block', borderRadius: radius || undefined }}
      aria-label={`Pratinjau bingkai ${frame.title}`}
    />
  )
}

export function filterLabel(id: FilterId): string {
  return FILTERS.find((f) => f.id === id)?.label ?? 'Natural'
}
