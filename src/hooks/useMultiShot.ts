import { useCallback, useEffect, useRef, useState } from 'react'
import { playBeep, playChime, playShutter, unlockAudio } from '../lib/audio'

export type SessionPhase = 'idle' | 'countdown' | 'between' | 'shooting' | 'done'

interface UseMultiShotOptions {
  countdownSeconds: number
  gapSeconds: number
  /** Ambil satu gambar; return false kalau gagal (mis. kamera belum siap). */
  onCapture: () => boolean
  /** Dipanggil setelah semua slot dalam antrean selesai. */
  onDone?: () => void
}

interface MultiShotApi {
  phase: SessionPhase
  countdown: number
  activeSlot: number
  shots: number
  total: number
  start: (slots: number[]) => void
  cancel: () => void
  reset: () => void
}

/**
 * Timer multi-shot: countdown beep → jepret → jeda → slot berikutnya.
 * Antrean slot dikirim saat start(), jadi nggak bergantung timing state React.
 * Semua timeout disimpan di ref supaya cancel() benar-benar bersih.
 */
export function useMultiShot({ countdownSeconds, gapSeconds, onCapture, onDone }: UseMultiShotOptions): MultiShotApi {
  const [phase, setPhase] = useState<SessionPhase>('idle')
  const [countdown, setCountdown] = useState(0)
  const [activeSlot, setActiveSlot] = useState(0)
  const [shots, setShots] = useState(0)
  const [total, setTotal] = useState(0)

  const timers = useRef<number[]>([])
  const cancelled = useRef(false)
  const captureRef = useRef(onCapture)
  const doneRef = useRef(onDone)
  captureRef.current = onCapture
  doneRef.current = onDone

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }, [])

  const after = useCallback((ms: number, fn: () => void) => {
    const id = window.setTimeout(() => {
      if (!cancelled.current) fn()
    }, ms)
    timers.current.push(id)
  }, [])

  const reset = useCallback(() => {
    cancelled.current = true
    clearTimers()
    setPhase('idle')
    setCountdown(0)
    setActiveSlot(0)
    setShots(0)
  }, [clearTimers])

  const cancel = useCallback(() => {
    reset()
  }, [reset])

  const runSlot = useCallback(
    (slots: number[], cursor: number) => {
      if (cancelled.current) return
      if (cursor >= slots.length) {
        setCountdown(0)
        setPhase('done')
        playChime()
        doneRef.current?.()
        return
      }

      const slot = slots[cursor]
      setActiveSlot(slot)
      setPhase('countdown')

      for (let s = countdownSeconds; s >= 1; s -= 1) {
        after((countdownSeconds - s) * 1000, () => {
          setCountdown(s)
          playBeep(s <= 1 ? 1046 : 784, s <= 1 ? 0.14 : 0.08)
        })
      }

      after(countdownSeconds * 1000, () => {
        setCountdown(0)
        setPhase('shooting')
        playShutter()
        const ok = captureRef.current()
        if (!ok) {
          cancelled.current = true
          setPhase('idle')
          return
        }
        setShots(cursor + 1)
        setPhase('between')
        after(gapSeconds * 1000, () => runSlot(slots, cursor + 1))
      })
    },
    [after, countdownSeconds, gapSeconds],
  )

  const start = useCallback(
    (slots: number[]) => {
      if (!slots.length) return
      unlockAudio()
      clearTimers()
      cancelled.current = false
      setShots(0)
      setTotal(slots.length)
      runSlot(slots, 0)
    },
    [clearTimers, runSlot],
  )

  useEffect(
    () => () => {
      cancelled.current = true
      clearTimers()
    },
    [clearTimers],
  )

  return { phase, countdown, activeSlot, shots, total, start, cancel, reset }
}
