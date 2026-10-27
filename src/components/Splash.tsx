import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { hasSeenSplash, markSplashSeen } from '../lib/localGallery'
import { playShutter, unlockAudio } from '../lib/audio'

interface SplashProps {
  onDone: () => void
}

const STRIP_BLOCKS = [0, 1, 2, 3]

export function Splash({ onDone }: SplashProps) {
  const [visible] = useState(() => !hasSeenSplash())
  const [exiting, setExiting] = useState(false)

  const dismiss = useCallback(() => {
    if (exiting) return
    setExiting(true)
    markSplashSeen()
    window.setTimeout(onDone, 520)
  }, [exiting, onDone])

  useEffect(() => {
    if (!visible) {
      onDone()
      return
    }
    const flashTimer = window.setTimeout(() => {
      playShutter()
    }, 1400)
    const exitTimer = window.setTimeout(() => {
      setExiting(true)
      markSplashSeen()
    }, 2050)
    const doneTimer = window.setTimeout(() => onDone(), 2620)
    return () => {
      window.clearTimeout(flashTimer)
      window.clearTimeout(exitTimer)
      window.clearTimeout(doneTimer)
    }
  }, [visible, onDone])

  if (!visible) return null

  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        className="fixed inset-0 z-[100] flex items-center justify-center bg-cream paper-texture"
        initial={{ y: 0 }}
        animate={exiting ? { y: '-100%' } : { y: 0 }}
        exit={{ y: '-100%' }}
        transition={{ duration: 0.62, ease: [0.76, 0, 0.24, 1] }}
      >
        <button
          type="button"
          onClick={dismiss}
          onPointerDown={unlockAudio}
          className="absolute right-4 top-4 z-10 rounded-md px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-stone transition hover:bg-black/5 hover:text-espresso sm:right-6 sm:top-6"
        >
          Lewati
        </button>

        <div className="flex flex-col items-center gap-9 px-6">
          {/* aperture */}
          <motion.div
            className="relative h-16 w-16"
            initial={{ scale: 0.75, opacity: 0, rotate: -35 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              className="absolute inset-0 rounded-full border border-espresso/25"
              animate={{ rotate: 360 }}
              transition={{ duration: 2.6, ease: 'linear', repeat: Infinity }}
            />
            <span className="absolute inset-[7px] rounded-full border border-espresso/15" />
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute left-1/2 top-1/2 h-[26px] w-[1.5px] origin-bottom rounded-full bg-espresso/45"
                style={{ rotate: `${i * 60}deg`, translateX: '-50%', translateY: '-100%' }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.12 + i * 0.045, duration: 0.45, ease: 'easeOut' }}
              />
            ))}
            <motion.span
              className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-honey"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.42, type: 'spring', stiffness: 320, damping: 16 }}
            />
          </motion.div>

          <div className="flex flex-col items-center gap-3">
            <motion.h1
              className="font-serif text-[3.2rem] leading-none tracking-[-0.02em] text-espresso sm:text-6xl"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.58, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              maybee
            </motion.h1>
            <motion.p
              className="font-mono text-[10px] uppercase tracking-[0.28em] text-stone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              sweet little photobox
            </motion.p>
          </div>

          {/* strip foto jatuh satu-satu */}
          <div className="flex items-end gap-1.5">
            {STRIP_BLOCKS.map((i) => (
              <motion.div
                key={i}
                className="w-[26px] rounded-[3px] bg-white shadow-[0_6px_16px_-8px_rgba(28,25,23,0.45)] ring-1 ring-line"
                style={{ height: 26 + i * 9 }}
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.72 + i * 0.09, type: 'spring', stiffness: 260, damping: 18 }}
              >
                <div className="m-[3px] h-full rounded-[2px] bg-[#EFE7D9]" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* flash tipis */}
        <motion.div
          className="pointer-events-none absolute inset-0 bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.92, 0] }}
          transition={{ delay: 1.4, duration: 0.4, times: [0, 0.25, 1], ease: 'easeOut' }}
        />

        <span className="absolute bottom-6 left-0 right-0 text-center font-mono text-[10px] tracking-[0.2em] text-stone-soft">
          300 DPI · BROWSER ONLY
        </span>
      </motion.div>
    </AnimatePresence>
  )
}
