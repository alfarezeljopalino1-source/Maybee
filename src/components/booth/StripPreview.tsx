import { useEffect, useRef, useState } from 'react'
import type { Frame } from '../../types'
import { composeStrip, formatStamp, loadImage, type FilterId, type PhotoSource } from '../../lib/canvas'

export interface StripRenderOptions {
  frame: Frame
  photos: (string | null)[]
  filter: FilterId
  caption: string
  showDate: boolean
  background: string
  width?: number
  /** batasi tinggi (mis. 72vh) biar strip 4-cut nggak kepotong di layar pendek */
  maxHeight?: string
  className?: string
}

/**
 * Kanvas pratinjau tunggal — semua perubahan filter/caption/warna langsung
 * dirender ulang lewat composeStrip, jadi preview = hasil export.
 */
export function StripPreview({
  frame,
  photos,
  filter,
  caption,
  showDate,
  background,
  width = 640,
  maxHeight,
  className = '',
}: StripRenderOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    const canvas = canvasRef.current
    if (!canvas) return

    const urls = photos.filter((p): p is string => Boolean(p))
    const unique = Array.from(new Set(urls))

    Promise.all([loadImage(frame.overlayUrl), ...unique.map((u) => loadImage(u))])
      .then(([overlay, ...rest]) => {
        if (!active) return
        const map = new Map(unique.map((u, i) => [u, rest[i]]))
        const resolved = photos.map((p) => (p ? map.get(p) ?? null : null))
        composeStrip(canvas, {
          frame,
          overlay,
          photos: resolved as (PhotoSource | null)[],
          filter,
          background,
          caption,
          date: formatStamp(),
          showDate,
          width,
        })
        setReady(true)
      })
      .catch(() => setReady(false))

    return () => {
      active = false
    }
  }, [frame, photos, filter, caption, showDate, background, width])

  return (
    <canvas
      ref={canvasRef}
      className={`h-auto rounded-[3px] shadow-[0_24px_50px_-26px_rgba(28,25,23,0.45)] ring-1 ring-espresso/10 transition-opacity duration-300 ${
        maxHeight ? 'mx-auto block' : 'w-full'
      } ${className}`}
      style={{
        opacity: ready ? 1 : 0.35,
        ...(maxHeight ? { maxHeight, width: 'auto', maxWidth: '100%' } : null),
      }}
      aria-label="Pratinjau strip foto"
    />
  )
}
