import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

export type CameraStatus = 'idle' | 'requesting' | 'ready' | 'denied' | 'unsupported' | 'error'

export interface CameraError {
  status: Exclude<CameraStatus, 'idle' | 'requesting' | 'ready'>
  message: string
  /** Judul pendek biar user paham ini masalah apa, bukan cuma "gagal". */
  title?: string
  /** Langkah konkret yang bisa user apa sendiri. */
  hint?: string
  /** Instruksi per-browser, kalau perlu lebih spesifik dari hint. */
  steps?: string[]
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
  const message = err instanceof Error ? err.message : ''
  const insecure = typeof window !== 'undefined' && !window.isSecureContext
  const host = typeof window !== 'undefined' ? window.location.hostname : ''
  const isLan = /^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host.endsWith('.local')

  // Kasus paling sering di lapangan: buka dari HP lewat IP LAN (http://192.168.x.x:5173).
  // getUserMedia nggak cuma gagal — di beberapa browser objeknya bahkan nggak ada.
  // Jangan pernah bilang "izin ditolak" untuk kasus ini; user bakal muter-muter
  // nyari tombol izin yang memang nggak pernah muncul.
  if (insecure) {
    return {
      status: 'unsupported',
      title: 'Halaman ini bukan koneksi aman',
      message: isLan
        ? `Kamu buka lewat ${host}, yang dianggap bukan koneksi aman. Browser cuma kasih kamera di HTTPS atau localhost.`
        : 'Browser cuma mengizinkan kamera di HTTPS atau localhost, bukan di halaman http biasa.',
      hint: 'Pakai localhost di komputer, atau akses lewat https. Sementara itu tetap bisa unggah foto.',
    }
  }
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    // Chrome suka ngasih NotAllowedError padahal masalahnya nggak ada device
    // atau diblokir kebijakan, bukan user nolak. Cek pesannya kalau ada.
    if (/no device|not found|requested device/i.test(message)) {
      return {
        status: 'error',
        title: 'Kamera tidak terdeteksi',
        message: 'Browser nggak nemu kamera yang bisa dipakai di perangkat ini.',
        hint: 'Cek kamera terpasang & tidak dinonaktifkan, lalu coba lagi. Atau unggah foto.',
      }
    }
    return {
      status: 'denied',
      title: 'Izin kamera diblokir browser',
      message: 'Browser memblokir akses kamera untuk maybee. Ini bukan halaman yang belum aman — koneksinya sudah oke, cuma izinnya dicabut.',
      hint: 'Buka lagi izinnya lewat ikon di address bar, lalu muat ulang halaman.',
      steps: [
        'Klik ikon gembok / kamera di address bar (kiri URL).',
        'Cari "Kamera" → ubah ke "Izinkan" (Allow).',
        'Muat ulang halaman — jangan cuma klik Coba lagi.',
        'iPhone? Setelan → Safari → Kamera → "Tanya". Di Chrome iOS: Setelan → Konten situs → Kamera.',
      ],
    }
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError' || name === 'OverconstrainedError') {
    return {
      status: 'error',
      title: 'Kamera tidak terdeteksi',
      message: 'Kamera nggak ketemu di perangkat ini. Pakai opsi unggah foto aja.',
      hint: 'Pastikan kamera terpasang dan tidak dipakai aplikasi lain.',
    }
  }
  if (name === 'NotReadableError' || name === 'TrackStartError' || name === 'AbortError') {
    return {
      status: 'error',
      title: 'Kamera sedang dipakai',
      message: 'Kamera lagi dipakai aplikasi lain. Tutup aplikasi itu lalu muat ulang.',
      hint: 'Tutup Zoom/Meet/Camera app, lalu klik Coba lagi.',
    }
  }
  return {
    status: 'error',
    title: 'Kamera gagal menyala',
    message: 'Gagal menyalakan kamera. Coba muat ulang halaman.',
    hint: 'Kalau tetap gagal, unggah foto dari galeri — hasilnya sama.',
  }
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
      // Objeknya hilang bisa dua sebab: browser memang tua, ATAU halaman bukan
      // secure context (http://IP-LAN). Jangan salah tuduh browser.
      const insecure = typeof window !== 'undefined' && !window.isSecureContext
      const described: CameraError = insecure
        ? {
            status: 'unsupported',
            title: 'Halaman ini bukan koneksi aman',
            message:
              'Browser cuma mengizinkan kamera di HTTPS atau localhost. Halaman ini dibuka lewat http biasa, jadi kamera dimatikan.',
            hint: 'Akses lewat https, atau buka di localhost. Sementara itu unggah foto tetap jalan.',
          }
        : {
            status: 'unsupported',
            title: 'Browser belum mendukung kamera',
            message: 'Browser ini belum mendukung kamera. Pakai Chrome/Safari terbaru atau unggah foto.',
            hint: 'Coba browser lain, atau unggah foto dari galeri.',
          }
      setStatus(described.status)
      setError(described)
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
