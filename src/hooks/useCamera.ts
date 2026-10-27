import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

export type CameraStatus = 'idle' | 'requesting' | 'ready' | 'denied' | 'unsupported' | 'error'

export interface CameraError {
  status: Exclude<CameraStatus, 'idle' | 'requesting' | 'ready'>
  message: string
}

interface UseCamera {
  videoRef: React.RefObject<HTMLVideoElement>
  status: CameraStatus
  error: CameraError | null
  facing: 'user' | 'environment'
  devices: MediaDeviceInfo[]
  start: () => Promise<void>
  stop: () => void
  flip: () => void
  capture: (mirror?: boolean, width?: number, height?: number) => HTMLCanvasElement | null
}

function describe(err: unknown): CameraError {
  const name = err instanceof DOMException ? err.name : ''
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return { status: 'denied', message: 'Izin kamera ditolak. Izinkan akses kamera di setelan browser, lalu coba lagi.' }
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError') {
    return { status: 'error', message: 'Kamera nggak ketemu di perangkat ini. Pakai opsi unggah foto aja.' }
  }
  if (name === 'NotReadableError') {
    return { status: 'error', message: 'Kamera lagi dipakai aplikasi lain. Tutup aplikasi itu lalu muat ulang.' }
  }
  return { status: 'error', message: 'Gagal menyalakan kamera. Coba muat ulang halaman.' }
}

export function useCamera(): UseCamera {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [status, setStatus] = useState<CameraStatus>('idle')
  const [error, setError] = useState<CameraError | null>(null)
  const [facing, setFacing] = useState<'user' | 'environment'>('user')
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported')
      setError({ status: 'unsupported', message: 'Browser ini belum mendukung kamera. Pakai Chrome/Safari terbaru atau unggah foto.' })
      return
    }
    setStatus('requesting')
    setError(null)
    stop()
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
      })
      streamRef.current = stream
      const video = videoRef.current
      if (video) {
        video.srcObject = stream
        video.muted = true
        video.playsInline = true
        await video.play().catch(() => undefined)
      }
      setStatus('ready')
      const list = await navigator.mediaDevices.enumerateDevices()
      setDevices(list.filter((d) => d.kind === 'videoinput'))
    } catch (err) {
      const described = describe(err)
      setError(described)
      setStatus(described.status)
    }
  }, [facing, stop])

  const flip = useCallback(() => {
    setFacing((prev) => (prev === 'user' ? 'environment' : 'user'))
  }, [])

  useEffect(() => {
    if (status !== 'ready') return
    void start()
    // restart hanya saat facing berubah setelah kamera aktif
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facing])

  // Stage booth berganti = elemen <video> baru tanpa srcObject.
  // Stream-nya masih hidup di streamRef, jadi tempel ulang tiap render.
  useLayoutEffect(() => {
    const video = videoRef.current
    const stream = streamRef.current
    if (!video || !stream) return
    if (video.srcObject !== stream) {
      video.srcObject = stream
      video.muted = true
      video.playsInline = true
      void video.play().catch(() => undefined)
    }
  })

  useEffect(() => () => stop(), [stop])

  const capture = useCallback((mirror = false, width?: number, height?: number) => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return null
    const canvas = document.createElement('canvas')
    canvas.width = width ?? video.videoWidth
    canvas.height = height ?? video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    if (mirror) {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    return canvas
  }, [])

  return { videoRef, status, error, facing, devices, start, stop, flip, capture }
}
