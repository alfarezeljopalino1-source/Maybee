import { AnimatePresence, motion } from 'framer-motion'
import { Camera, Loader2, RefreshCw, SwitchCamera, Upload } from 'lucide-react'
import type { ReactNode, RefObject } from 'react'
import type { Frame } from '../../types'
import type { CameraError, CameraStatus } from '../../hooks/useCamera'

interface CameraStageProps {
  frame: Frame
  slotIndex: number
  videoRef: RefObject<HTMLVideoElement>
  status: CameraStatus
  error: CameraError | null
  mirror: boolean
  countdown: number | null
  flash: boolean
  shotsDone: number
  totalShots: number
  mode?: 'setup' | 'shoot'
  onRetry: () => void
  onFlip: () => void
  onUpload: () => void
  onCancel?: () => void
  children?: ReactNode
}

export function CameraStage({
  frame,
  slotIndex,
  videoRef,
  status,
  error,
  mirror,
  countdown,
  flash,
  shotsDone,
  totalShots,
  mode = 'shoot',
  onRetry,
  onFlip,
  onUpload,
  onCancel,
  children,
}: CameraStageProps) {
  const slot = frame.slots[slotIndex] ?? frame.slots[0]
  const ratio = slot.width / slot.height
  const live = status === 'ready'

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="kicker">
            {mode === 'setup'
              ? 'pratinjau kamera'
              : `slot ${String(slotIndex + 1).padStart(2, '0')} / ${String(frame.photoCount).padStart(2, '0')}`}
          </p>
          <p className="mt-1 font-serif text-lg text-espresso">{frame.title}</p>
        </div>
        {mode === 'shoot' && onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-quiet !py-2 !text-[12px]">
            Batal
          </button>
        )}
      </div>

      <div
        className="relative mx-auto w-full overflow-hidden rounded-xl border border-espresso/15 bg-[#141210] shadow-[0_30px_70px_-40px_rgba(28,25,23,0.7)]"
        style={{ aspectRatio: String(ratio), maxHeight: '62vh' }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover transition-opacity duration-300"
          style={{ transform: mirror ? 'scaleX(-1)' : undefined, opacity: live ? 1 : 0 }}
        />

        {/* guide mask */}
        {live && (
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute rounded-[2px] border border-white/40"
              style={{ inset: '7%', boxShadow: '0 0 0 9999px rgba(20,18,16,0.42)' }}
            >
              <div className="absolute inset-0 opacity-25">
                <div className="absolute left-1/3 top-0 h-full w-px bg-white/60" />
                <div className="absolute left-2/3 top-0 h-full w-px bg-white/60" />
                <div className="absolute left-0 top-1/3 h-px w-full bg-white/60" />
                <div className="absolute left-0 top-2/3 h-px w-full bg-white/60" />
              </div>
              {[
                'left-0 top-0 border-l-2 border-t-2',
                'right-0 top-0 border-r-2 border-t-2',
                'left-0 bottom-0 border-b-2 border-l-2',
                'right-0 bottom-0 border-b-2 border-r-2',
              ].map((cls) => (
                <span key={cls} className={`absolute h-5 w-5 border-white/85 ${cls}`} />
              ))}
            </div>

            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-sm bg-black/45 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/85">
              <span className={`h-1.5 w-1.5 rounded-full ${mode === 'shoot' ? 'animate-pulse bg-[#F87171]' : 'bg-[#4ADE80]'}`} />
              {mode === 'shoot' ? `rec ${String(shotsDone).padStart(2, '0')}/${String(totalShots).padStart(2, '0')}` : 'live'}
            </div>
            <div className="absolute right-3 top-3 rounded-sm bg-black/45 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/85">
              {frame.categoryLabel}
            </div>
          </div>
        )}

        {!live && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            {status === 'requesting' || status === 'idle' ? (
              <>
                <Loader2 size={22} className="animate-spin text-white/70" />
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/60">menyalakan kamera</p>
              </>
            ) : (
              <>
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20">
                  <Camera size={18} className="text-white/70" strokeWidth={1.5} />
                </div>
                {error?.title && (
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">{error.title}</p>
                )}
                <p className="max-w-sm text-[13px] leading-relaxed text-white/70">
                  {error?.message ?? 'Kamera belum aktif.'}
                </p>
                {error?.hint && (
                  <p className="max-w-sm text-[11.5px] leading-relaxed text-white/40">{error.hint}</p>
                )}
                {error?.steps && error.steps.length > 0 && (
                  <ol className="max-w-sm space-y-1 text-left text-[11px] leading-relaxed text-white/45">
                    {error.steps.map((step, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="font-mono text-white/30">{String(i + 1).padStart(2, '0')}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                )}
                <div className="flex flex-wrap justify-center gap-2">
                  <button type="button" onClick={onRetry} className="btn btn-honey !py-2 !text-[12px]">
                    <RefreshCw size={14} /> Coba lagi
                  </button>
                  <button
                    type="button"
                    onClick={onUpload}
                    className="btn border border-white/25 bg-white/5 !py-2 !text-[12px] text-white hover:bg-white/10"
                  >
                    <Upload size={14} /> Unggah foto
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        <AnimatePresence>
          {countdown !== null && countdown > 0 && (
            <motion.div
              key={countdown}
              initial={{ scale: 1.35, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <span className="font-serif text-[7rem] leading-none text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.5)] sm:text-[9rem]">
                {countdown}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {flash && (
            <motion.div
              className="pointer-events-none absolute inset-0 bg-white"
              initial={{ opacity: 0.95 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-stone-soft sm:block">
          {live
            ? 'posisikan wajah di dalam bingkai'
            : status === 'requesting' || status === 'idle'
              ? 'menyalakan kamera'
              : 'kamera belum siap'}
        </p>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <button
            type="button"
            onClick={onFlip}
            className="btn btn-ghost flex-1 !py-2.5 !text-[12px] sm:flex-none"
            disabled={!live}
          >
            <SwitchCamera size={15} /> Balik kamera
          </button>
          <button type="button" onClick={onUpload} className="btn btn-ghost flex-1 !py-2.5 !text-[12px] sm:flex-none">
            <Upload size={15} /> Unggah
          </button>
        </div>
      </div>

      {children}
    </div>
  )
}
