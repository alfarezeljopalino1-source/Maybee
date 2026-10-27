import catalog from '../data/frames.json'
import type { Frame } from '../types'

export const frames = catalog as Frame[]

export const categories = ['Semua', ...Array.from(new Set(frames.map((f) => f.categoryLabel)))]

export function getFrame(id: string | undefined): Frame | undefined {
  return frames.find((f) => f.id === id)
}

export function sampleFor(index: number, offset = 0): string {
  return `/samples/pose-${((index + offset) % 6) + 1}.jpg`
}

/** Bingkai yang bisa dipakai tanpa akun. */
export const freeFrames = frames.filter((f) => f.akses === 'bebas')

/** Bingkai Koleksi — butuh akun buat dipakai. */
export const collectionFrames = frames.filter((f) => f.akses === 'koleksi')

/**
 * Satu-satunya tempat aturan akses diputuskan. Dipakai kartu katalog,
 * halaman booth, dan gate simpan — biar nggak ada tiga versi aturan
 * yang gampang beda sendiri.
 */
export function isFrameUnlocked(frame: Frame | undefined, hasAccount: boolean): boolean {
  if (!frame) return false
  return frame.akses === 'bebas' || hasAccount
}
