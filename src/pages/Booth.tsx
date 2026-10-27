import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  ArrowRight,
  Camera,
  Check,
  CloudUpload,
  Download,
  HardDriveDownload,
  Loader2,
  Lock,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'
import { CameraStage } from '../components/booth/CameraStage'
import { ReviewStage } from '../components/booth/ReviewStage'
import { FrameStripPicker } from '../components/booth/FrameStripPicker'
import { useCamera } from '../hooks/useCamera'
import { useMultiShot } from '../hooks/useMultiShot'
import { getFrame, isFrameUnlocked } from '../data/frames'
import { downloadBlob, exportStrip, formatStamp, loadImage, type FilterId, type PhotoSource } from '../lib/canvas'
import { isMuted, playChime, setMuted, unlockAudio } from '../lib/audio'
import { recallCaption, saveLocalStrip } from '../lib/localGallery'
import { uploadStrip } from '../lib/cloudGallery'
import { useAuth } from '../context/AuthContext'

type Stage = 'setup' | 'shooting' | 'review'

const CAPTIONS = ['the usual suspects', 'squad goals', 'ferry building, 4 pm', 'sweet little moment']

export function Booth() {
  const [params] = useSearchParams()
  const frame = useMemo(() => getFrame(params.get('frame') ?? undefined) ?? getFrame('honey-classic')!, [params])
  const camera = useCamera()
  const { user, cloudReady } = useAuth()
  // Bingkai Koleksi tetap bisa DILIHAT di booth, tapi jepretan dikunci sampai
  // ada akun. Gate-nya di sini, bukan redirect: orang bisa lihat dulu.
  const locked = !isFrameUnlocked(frame, Boolean(user))

  const [stage, setStage] = useState<Stage>('setup')
  const [photos, setPhotos] = useState<(string | null)[]>(() => Array(frame.photoCount).fill(null))
  const activeSlotRef = useRef(0)
  const [flash, setFlash] = useState(false)
  const [countdownSeconds, setCountdownSeconds] = useState(3)
  const [mirror, setMirror] = useState(true)
  const [muted, setMutedState] = useState(isMuted)

  const [filter, setFilter] = useState<FilterId>('natural')
  const [caption, setCaption] = useState(() => recallCaption())
  const [showDate, setShowDate] = useState(true)
  const [background, setBackground] = useState(frame.defaultBgColor)

  const [busy, setBusy] = useState<'png' | 'local' | 'cloud' | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [cloudSize, setCloudSize] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const uploadTarget = useRef<number | null>(null)

  // nyalakan kamera begitu booth dibuka (izin akan diprompt browser)
  useEffect(() => {
    if (camera.status === 'idle') void camera.start()
  }, [camera])

  // frame berganti → reset semua state sesi
  useEffect(() => {
    setPhotos(Array(frame.photoCount).fill(null))
    setStage('setup')
    setBackground(frame.defaultBgColor)
    setCloudSize(null)
  }, [frame])

  const captureSlot = useCallback(() => {
    const video = camera.videoRef.current
    if (!video || !video.videoWidth) return false
    const height = Math.round((1280 * video.videoHeight) / video.videoWidth)
    const canvas = camera.capture(mirror, 1280, height)
    if (!canvas) return false
    const dataUrl = canvas.toDataURL('image/jpeg', 0.94)
    const target = activeSlotRef.current
    setPhotos((prev) => {
      const next = [...prev]
      next[target] = dataUrl
      return next
    })
    return true
  }, [camera, mirror])

  const shot = useMultiShot({
    countdownSeconds,
    gapSeconds: 1.2,
    onCapture: captureSlot,
    onDone: () => setStage('review'),
  })

  useEffect(() => {
    activeSlotRef.current = shot.activeSlot
  }, [shot.activeSlot])

  useEffect(() => {
    if (shot.phase === 'shooting') {
      setFlash(true)
      const id = window.setTimeout(() => setFlash(false), 240)
      return () => window.clearTimeout(id)
    }
  }, [shot.phase])

  const beginShoot = useCallback(
    (slots: number[]) => {
      if (!slots.length) return
      unlockAudio()
      setStage('shooting')
      setNote(null)
      shot.start(slots)
    },
    [shot],
  )

  const handleStart = () => {
    const empty = photos.map((p, i) => (p ? -1 : i)).filter((i) => i >= 0)
    beginShoot(empty.length ? empty : photos.map((_, i) => i))
  }

  const handleRetake = (index: number) => {
    setPhotos((prev) => {
      const next = [...prev]
      next[index] = null
      return next
    })
    beginShoot([index])
  }

  const handleRestart = () => {
    shot.reset()
    setPhotos(Array(frame.photoCount).fill(null))
    setStage('setup')
    setNote(null)
    setCloudSize(null)
    setCaption(recallCaption())
  }

  const uploadFor = (index: number) => {
    uploadTarget.current = index
    fileRef.current?.click()
  }

  const readAsDataUrl = (file: File) =>
    new Promise<string | null>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(file)
    })

  /**
   * Satu atau banyak file: isi slot target dulu, lalu slot kosong berikutnya.
   * Kalau semua slot penuh, langsung lompat ke review.
   */
  const handleFiles = async (fileList: FileList) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'))
    if (!files.length) return
    const start = uploadTarget.current ?? 0
    const order = [start, ...photos.map((p, i) => (p || i === start ? -1 : i)).filter((i) => i >= 0)]

    const results = await Promise.all(files.slice(0, order.length).map(readAsDataUrl))
    setPhotos((prev) => {
      const next = [...prev]
      results.forEach((dataUrl, i) => {
        const slot = order[i]
        if (dataUrl && slot !== undefined && slot >= 0) next[slot] = dataUrl
      })
      const filled = next.every(Boolean)
      if (filled) {
        setStage('review')
        setNote('Semua slot terisi dari unggahan. Tinggal poles.')
      } else {
        setNote(`${results.filter(Boolean).length} foto masuk. Sisa slot bisa diunggah lagi.`)
      }
      return next
    })
    uploadTarget.current = null
  }

  const renderBlob = useCallback(
    async (format: 'png' | 'webp') => {
      const [overlay, ...imgs] = await Promise.all([
        loadImage(frame.overlayUrl),
        ...photos.map((p) => (p ? loadImage(p) : Promise.resolve(null))),
      ])
      const { blob } = await exportStrip({
        frame,
        overlay,
        photos: imgs as (PhotoSource | null)[],
        filter,
        background,
        caption,
        date: formatStamp(),
        showDate,
        format,
        quality: format === 'webp' ? 0.86 : undefined,
      })
      return blob
    },
    [frame, photos, filter, background, caption, showDate],
  )

  const triggerConfetti = () => {
    const shoot = (x: number) => {
      confetti({
        particleCount: 42,
        spread: 60,
        startVelocity: 38,
        scalar: 0.8,
        origin: { x, y: 0.62 },
        colors: ['#FBBF24', '#FEF3C7', '#1C1917', '#FFFFFF', '#D6D0C5'],
      })
    }
    shoot(0.28)
    window.setTimeout(() => shoot(0.72), 120)
  }

  const handleDownload = async () => {
    setBusy('png')
    try {
      const blob = await renderBlob('png')
      downloadBlob(blob, `maybee-${frame.id}-${Date.now()}.png`)
      triggerConfetti()
      setNote('PNG 300 DPI terunduh. Cek folder Download kamu.')
    } catch {
      setNote('Gagal membuat file. Coba lagi ya.')
    } finally {
      setBusy(null)
    }
  }

  // Galeri lokal = arsip di browser, bukan file cetak. Simpan WebP 1600px
  // (~10x lebih kecil dari PNG 300 DPI) supaya kuota IndexedDB nggak jebol:
  // 40 strip PNG @1.1MB = 44MB, sedangkan WebP @~140KB = 5.6MB.
  const handleSaveLocal = async () => {
    setBusy('local')
    try {
      const blob = await renderBlob('webp')
      await saveLocalStrip({
        id: crypto.randomUUID(),
        frameId: frame.id,
        frameTitle: frame.title,
        caption: caption.trim(),
        createdAt: Date.now(),
        blob,
      })
      setNote('Tersimpan di galeri lokal (browser ini).')
      playChime()
    } catch {
      setNote('Penyimpanan lokal penuh atau diblokir browser.')
    } finally {
      setBusy(null)
    }
  }

  const handleSaveCloud = async () => {
    if (!user) {
      setNote('Masuk dulu buat simpan ke akun maybee.')
      return
    }
    setBusy('cloud')
    try {
      const blob = await renderBlob('webp')
      const result = await uploadStrip({ blob, frameId: frame.id, caption: caption.trim(), userId: user.id })
      setCloudSize(result.sizeKb)
      triggerConfetti()
      setNote('Tersimpan ke akun kamu · ~' + result.sizeKb + ' KB')
    } catch (err) {
      setNote(err instanceof Error ? err.message : 'Gagal unggah ke cloud.')
    } finally {
      setBusy(null)
    }
  }

  const allDone = photos.every(Boolean)

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-stone-soft">
              <Link to="/" className="transition hover:text-espresso">maybee</Link>
              <span>/</span>
              <span className="text-espresso">booth</span>
              <span className="hidden sm:inline">/ {frame.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const next = !muted
                  setMuted(next)
                  setMutedState(next)
                  if (!next) unlockAudio()
                }}
                className="btn btn-quiet !py-2 !text-[11px]"
                aria-label={muted ? 'Nyalakan suara' : 'Matikan suara'}
              >
                {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                <span className="hidden sm:inline">{muted ? 'sunyi' : 'suara'}</span>
              </button>
              <FrameStripPicker frameId={frame.id} />
            </div>
          </div>

          {note && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-start gap-2 rounded-lg border border-line-strong bg-milk px-3.5 py-2.5 text-[12.5px] text-stone"
            >
              <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-honey" />
              <span className="flex-1">{note}</span>
              <button type="button" onClick={() => setNote(null)} className="font-mono text-[10px] uppercase text-stone-soft">
                tutup
              </button>
            </motion.div>
          )}

          <div className="pt-8">
            {locked ? (
              <div className="mx-auto max-w-lg">
                <div className="relative overflow-hidden rounded-2xl border border-line bg-milk p-7 shadow-[0_30px_60px_-48px_rgba(28,25,23,0.4)]">
                  <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-espresso px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-cream">
                    <Lock size={10} /> koleksi
                  </span>

                  <p className="kicker">{frame.categoryLabel}</p>
                  <h1 className="mt-2 max-w-[20ch] font-serif text-[2.1rem] leading-[1.05] tracking-[-0.02em] text-espresso">
                    {frame.title} butuh <span className="italic">akun</span>.
                  </h1>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-stone">
                    Bukan paket berbayar — maybee nggak jual bingkai. Bingkai Koleksi cuma butuh
                    kamu punya arsip, supaya strip-nya punya tempat pulang.
                  </p>

                  <ul className="mt-5 space-y-2 border-t border-line pt-4 text-[12.5px] text-stone">
                    {[
                      'Gratis, tanpa kartu kredit',
                      'Bingkai bebas tetap bisa dipakai tanpa masuk',
                      'Foto tetap diproses di browser kamu',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check size={14} className="mt-0.5 shrink-0 text-espresso" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                    <Link
                      to={`/masuk?mode=masuk&next=${frame.id}`}
                      className="btn btn-dark flex-1 justify-center !py-3"
                    >
                      Masuk atau daftar
                      <ArrowRight size={15} />
                    </Link>
                    <Link to="/#bingkai" className="btn btn-ghost flex-1 justify-center !py-3">
                      Lihat bingkai bebas
                    </Link>
                  </div>

                  <p className="mt-4 font-mono text-[9.5px] uppercase leading-relaxed tracking-[0.1em] text-stone-soft">
                    udah punya akun? tinggal masuk, bingkai ini kebuka otomatis.
                  </p>
                </div>
              </div>
            ) : (
            <AnimatePresence mode="wait">
              {stage === 'setup' && (
                <motion.div
                  key="setup"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mx-auto mb-7 max-w-xl text-center">
                    <p className="kicker">sesi baru</p>
                    <h1 className="mt-2 font-serif text-[2.3rem] leading-[1.03] text-espresso sm:text-[3rem]">
                      Siapin pose, <span className="italic">kita mulai</span>.
                    </h1>
                    <p className="mt-3 text-[13.5px] leading-relaxed text-stone">
                      {frame.photoCount} jepretan berurutan. Hitungan mundur {countdownSeconds} detik tiap
                      slot — santai aja, bisa retake kok.
                    </p>
                  </div>

                  <CameraStage
                    frame={frame}
                    slotIndex={0}
                    videoRef={camera.videoRef}
                    status={camera.status}
                    error={camera.error}
                    mirror={mirror}
                    countdown={null}
                    flash={false}
                    shotsDone={0}
                    totalShots={frame.photoCount}
                    mode="setup"
                    onRetry={() => void camera.start()}
                    onFlip={camera.flip}
                    onUpload={() => uploadFor(0)}
                  >
                    <div className="mt-5 rounded-xl border border-line bg-milk p-4">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                          <div>
                            <p className="kicker">hitungan mundur</p>
                            <div className="mt-2 flex gap-1.5">
                              {[3, 5].map((sec) => (
                                <button
                                  key={sec}
                                  type="button"
                                  onClick={() => setCountdownSeconds(sec)}
                                  className={`rounded-md border px-3 py-1.5 font-mono text-[11px] transition ${
                                    countdownSeconds === sec
                                      ? 'border-espresso bg-espresso text-cream'
                                      : 'border-line-strong text-stone hover:border-stone-soft'
                                  }`}
                                >
                                  {sec} detik
                                </button>
                              ))}
                            </div>
                          </div>
                          <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-stone">
                            <input
                              type="checkbox"
                              checked={mirror}
                              onChange={(e) => setMirror(e.target.checked)}
                              className="h-4 w-4 rounded border-line-strong accent-espresso"
                            />
                            cermin
                          </label>
                          <div>
                            <p className="kicker">slot</p>
                            <p className="mt-2 font-mono text-[11px] text-stone">
                              {frame.photoCount} jepretan
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            unlockAudio()
                            handleStart()
                          }}
                          className="btn btn-honey w-full !py-3 sm:w-auto"
                        >
                          <Camera size={15} /> Mulai jepret
                        </button>
                      </div>

                      <p className="mt-3 flex items-center gap-1.5 border-t border-dashed border-line pt-3 font-mono text-[9.5px] uppercase tracking-[0.12em] text-stone-soft">
                        <Check size={12} /> foto tetap di gawai kamu
                        <span className="mx-1 text-line-strong">·</span>
                        bisa retake per slot
                      </p>
                    </div>
                  </CameraStage>
                </motion.div>
              )}

              {stage === 'shooting' && (
                <motion.div
                  key="shooting"
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CameraStage
                    frame={frame}
                    slotIndex={shot.activeSlot}
                    videoRef={camera.videoRef}
                    status={camera.status}
                    error={camera.error}
                    mirror={mirror}
                    countdown={shot.countdown}
                    flash={flash}
                    shotsDone={shot.shots}
                    totalShots={shot.total}
                    onRetry={camera.start}
                    onFlip={camera.flip}
                    onUpload={() => uploadFor(shot.activeSlot)}
                    onCancel={() => {
                      shot.cancel()
                      setStage('setup')
                    }}
                  />
                </motion.div>
              )}

              {stage === 'review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <ReviewStage
                    frame={frame}
                    photos={photos}
                    filter={filter}
                    caption={caption}
                    showDate={showDate}
                    background={background}
                    onFilterChange={setFilter}
                    onCaptionChange={setCaption}
                    onShowDateChange={setShowDate}
                    onBackgroundChange={setBackground}
                    onRetake={handleRetake}
                    onRestart={handleRestart}
                  >
                    <div className="rounded-xl border border-line bg-milk p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="kicker">simpan</p>
                          <p className="mt-1 text-[12.5px] text-stone">
                            PNG 300 DPI siap cetak, atau simpan ringan ke akun.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={triggerConfetti}
                          className="font-mono text-[9px] uppercase tracking-[0.14em] text-stone-soft underline decoration-line-strong underline-offset-4"
                        >
                          selebrasi kecil
                        </button>
                      </div>

                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={handleDownload}
                          disabled={busy !== null}
                          className="btn btn-dark flex-1 !py-3"
                        >
                          {busy === 'png' ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                          Unduh PNG
                          <span className="ml-1 font-mono text-[9px] text-cream/50">300 dpi</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveLocal}
                          disabled={busy !== null}
                          className="btn btn-ghost flex-1 !py-3"
                        >
                          {busy === 'local' ? <Loader2 size={15} className="animate-spin" /> : <HardDriveDownload size={15} />}
                          Galeri lokal
                        </button>
                      </div>

                      <div className="mt-2 flex flex-col gap-2 border-t border-dashed border-line pt-3 sm:flex-row sm:items-center">
                        <div className="flex flex-1 items-center gap-2 text-[12px] text-stone">
                          <CloudUpload size={14} className="shrink-0 text-stone-soft" />
                          {cloudReady ? (
                            user ? (
                              <span>
                                Simpan ke akun <span className="text-espresso">{user.email}</span>
                                {cloudSize ? ` · ~${cloudSize} KB` : ' · ~200 KB'}
                              </span>
                            ) : (
                              <span>
                                <Link to="/masuk" className="underline decoration-line-strong underline-offset-2 hover:text-espresso">
                                  Masuk
                                </Link>{' '}
                                buat simpan ke akun.
                              </span>
                            )
                          ) : (
                            <span>Cloud lagi nggak dikonfigurasi — pakai galeri lokal aja.</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleSaveCloud}
                          disabled={busy !== null || !cloudReady || !user}
                          className="btn btn-quiet shrink-0 !py-2 !text-[12px] disabled:opacity-40"
                        >
                          {busy === 'cloud' ? <Loader2 size={14} className="animate-spin" /> : <CloudUpload size={14} />}
                          Simpan ke akun
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <button type="button" onClick={handleStart} className="btn btn-ghost !py-2.5 !text-[12px]">
                        <Camera size={14} /> Jepret ulang semua
                      </button>
                      {allDone && (
                        <Link to="/galeri" className="btn btn-quiet !py-2.5 !text-[12px]">
                          Lihat galeri <ArrowRight size={14} />
                        </Link>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {CAPTIONS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCaption(c)}
                          className="rounded-full border border-line bg-cream px-3 py-1.5 font-mono text-[10px] text-stone transition hover:border-line-strong hover:text-espresso"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </ReviewStage>
                </motion.div>
              )}
            </AnimatePresence>
            )}
          </div>
        </div>
      </main>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        multiple
        onChange={(e) => {
          if (e.target.files?.length) void handleFiles(e.target.files)
          e.target.value = ''
        }}
      />

      <SiteFooter />
    </div>
  )
}
