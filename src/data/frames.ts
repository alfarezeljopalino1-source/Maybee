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
