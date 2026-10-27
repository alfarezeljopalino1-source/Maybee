/**
 * Suara photobox tanpa file audio: semuanya di-sintesis via Web Audio API
 * (0 KB aset, latency nol, aman buat free tier).
 */

let ctx: AudioContext | null = null
let noiseBuffer: AudioBuffer | null = null
let muted = false

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    // Safari lama mengekspos webkitAudioContext; deklarasikan sempit, bukan cast inline.
    const legacyWindow: Window & { webkitAudioContext?: typeof AudioContext } = window
    const Ctor = window.AudioContext ?? legacyWindow.webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function getNoise(ac: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer
  const length = Math.floor(ac.sampleRate * 0.35)
  const buffer = ac.createBuffer(1, length, ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i += 1) {
    const t = i / length
    // noise "cekrek": decay eksponensial + sedikit pre-transient
    data[i] = (Math.random() * 2 - 1) * Math.exp(-14 * t) * (1 - Math.exp(-220 * t))
  }
  noiseBuffer = buffer
  return buffer
}

/** Harus dipanggil sekali dari gesture user pertama (autoplay policy). */
export function unlockAudio(): void {
  audio()
}

export function setMuted(value: boolean): void {
  muted = value
}

export function isMuted(): boolean {
  return muted
}

export function playShutter(): void {
  if (muted) return
  const ac = audio()
  if (!ac) return
  const now = ac.currentTime

  const source = ac.createBufferSource()
  source.buffer = getNoise(ac)

  const highpass = ac.createBiquadFilter()
  highpass.type = 'highpass'
  highpass.frequency.value = 1400

  const bandpass = ac.createBiquadFilter()
  bandpass.type = 'bandpass'
  bandpass.frequency.value = 3200
  bandpass.Q.value = 0.9

  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.5, now + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22)

  source.connect(highpass).connect(bandpass).connect(gain).connect(ac.destination)
  source.start(now)
  source.stop(now + 0.32)

  // klik mekanis kecil
  const click = ac.createOscillator()
  const clickGain = ac.createGain()
  click.type = 'square'
  click.frequency.setValueAtTime(180, now)
  click.frequency.exponentialRampToValueAtTime(70, now + 0.05)
  clickGain.gain.setValueAtTime(0.22, now)
  clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07)
  click.connect(clickGain).connect(ac.destination)
  click.start(now)
  click.stop(now + 0.08)
}

export function playBeep(frequency = 880, duration = 0.09, volume = 0.16): void {
  if (muted) return
  const ac = audio()
  if (!ac) return
  const now = ac.currentTime
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'sine'
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  osc.connect(gain).connect(ac.destination)
  osc.start(now)
  osc.stop(now + duration + 0.02)
}

/** Beep penutup yang lebih tinggi, menandakan sesi selesai. */
export function playChime(): void {
  if (muted) return
  playBeep(1046, 0.12, 0.14)
  setTimeout(() => playBeep(1318, 0.16, 0.12), 110)
}
