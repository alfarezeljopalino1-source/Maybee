import type { Frame, FrameSlot } from '../types'

export type FilterId = 'natural' | 'noir' | 'retro' | 'warm'

export interface FilterPreset {
  id: FilterId
  label: string
  hint: string
  css: string
  grain: boolean
}

export const FILTERS: FilterPreset[] = [
  { id: 'natural', label: 'Natural', hint: 'warna asli', css: 'none', grain: false },
  { id: 'noir', label: 'B&W Noir', hint: 'kontras klasik', css: 'grayscale(1) contrast(1.1) brightness(0.98)', grain: false },
  { id: 'retro', label: 'Retro 90s', hint: 'grain film', css: 'sepia(0.32) saturate(1.1) contrast(1.08) brightness(1.02)', grain: true },
  { id: 'warm', label: 'Warm Korean', hint: 'kuning lembut', css: 'saturate(1.16) sepia(0.16) brightness(1.04)', grain: false },
]

export function filterCss(id: FilterId): FilterPreset {
  return FILTERS.find((f) => f.id === id) ?? FILTERS[0]
}

const imageCache = new Map<string, Promise<HTMLImageElement>>()

export function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src)
  if (cached) return cached
  const { promise, resolve, reject } = Promise.withResolvers<HTMLImageElement>()
  const img = new Image()
  img.decoding = 'async'
  img.onload = () => resolve(img)
  img.onerror = () => reject(new Error(`Gagal memuat gambar: ${src}`))
  img.src = src
  imageCache.set(src, promise)
  return promise
}

export function preloadImages(srcs: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(srcs.map((s) => loadImage(s)))
}

/** Sumber foto yang udah di memori: hasil jepretan kamera, unggahan, atau gambar bingkai. */
export type PhotoSource = HTMLImageElement | ImageBitmap | HTMLCanvasElement

function sourceSize(img: PhotoSource): { w: number; h: number } {
  if (img instanceof HTMLImageElement) return { w: img.naturalWidth, h: img.naturalHeight }
  return { w: img.width, h: img.height }
}

/** Crop tengah ala object-fit: cover, dipetakan ke kotak slot. */
export function drawCover(
  ctx: CanvasRenderingContext2D,
  img: PhotoSource,
  slot: FrameSlot,
): void {
  const { w: iw, h: ih } = sourceSize(img)
  if (!iw || !ih) return
  const target = slot.width / slot.height
  const source = iw / ih
  let sw = iw
  let sh = ih
  let sx = 0
  let sy = 0
  if (source > target) {
    sw = ih * target
    sx = (iw - sw) / 2
  } else {
    sh = iw / target
    sy = (ih - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, slot.x, slot.y, slot.width, slot.height)
}

export interface ComposeOptions {
  frame: Frame
  photos: (PhotoSource | null)[]
  overlay: HTMLImageElement | null
  filter: FilterId
  background: string
  caption?: string
  date?: string
  showDate?: boolean
  /** lebar output dalam px; tinggi mengikuti rasio kanvas bingkai */
  width?: number
}

/** Ambang kasar: 0 = hitam, 1 = putih. Cukup buat nentuin tinta terang/gelap. */
function luminance(hex: string): number {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const r = parseInt(full.slice(0, 2), 16) / 255
  const g = parseInt(full.slice(2, 4), 16) / 255
  const b = parseInt(full.slice(4, 6), 16) / 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

let lightOverlayCache: { src: HTMLImageElement; canvas: HTMLCanvasElement } | null = null

/**
 * Versi "tinta putih" dari overlay: semua piksel yang keliatan (tinta, garis,
 * butiran) di-flip jadi krem terang, area transparan tetap transparan.
 * Dipakai kalau user pilih kertas gelap.
 */
function getLightOverlay(src: HTMLImageElement, w: number, h: number): HTMLCanvasElement | null {
  if (lightOverlayCache?.src === src) return lightOverlayCache.canvas
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(src, 0, 0, w, h)
  const data = ctx.getImageData(0, 0, w, h)
  const px = data.data
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] === 0) continue
    // pertahanin bobot alpha aslinya biar hairline tetap tipis
    px[i] = 242
    px[i + 1] = 236
    px[i + 2] = 224
  }
  ctx.putImageData(data, 0, 0)
  lightOverlayCache = { src, canvas }
  return canvas
}

let grainTile: HTMLCanvasElement | null = null

function getGrainTile(): HTMLCanvasElement {
  if (grainTile) return grainTile
  const size = 180
  const tile = document.createElement('canvas')
  tile.width = size
  tile.height = size
  const ctx = tile.getContext('2d')!
  const data = ctx.createImageData(size, size)
  for (let i = 0; i < data.data.length; i += 4) {
    const v = 120 + Math.random() * 135
    data.data[i] = v
    data.data[i + 1] = v
    data.data[i + 2] = v
    data.data[i + 3] = 42
  }
  ctx.putImageData(data, 0, 0)
  grainTile = tile
  return tile
}

/** Gambar placeholder lembut buat slot yang belum diisi (biar preview tetap jujur). */
function drawEmptySlot(ctx: CanvasRenderingContext2D, slot: FrameSlot, ink: string): void {
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.045)'
  ctx.fillRect(slot.x, slot.y, slot.width, slot.height)
  ctx.strokeStyle = 'rgba(0,0,0,0.10)'
  ctx.lineWidth = Math.max(1, slot.width * 0.0015)
  const step = Math.max(18, slot.width / 14)
  ctx.beginPath()
  for (let x = slot.x - slot.height; x < slot.x + slot.width; x += step) {
    ctx.moveTo(x, slot.y + slot.height)
    ctx.lineTo(x + slot.height, slot.y)
  }
  ctx.stroke()
  ctx.fillStyle = ink
  ctx.globalAlpha = 0.45
  ctx.font = `${Math.round(slot.width * 0.045)}px "JetBrains Mono", ui-monospace, monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`POSE ${String(slot.index).padStart(2, '0')}`, slot.x + slot.width / 2, slot.y + slot.height / 2)
  ctx.restore()
}

function roundRectPath(ctx: CanvasRenderingContext2D, slot: FrameSlot) {
  const r = slot.radius ?? 0
  ctx.beginPath()
  if (r > 0 && typeof ctx.roundRect === 'function') {
    ctx.roundRect(slot.x, slot.y, slot.width, slot.height, r)
  } else {
    ctx.rect(slot.x, slot.y, slot.width, slot.height)
  }
}

function fitFont(ctx: CanvasRenderingContext2D, text: string, family: string, weight: number, size: number, maxWidth: number): string {
  let current = size
  let font = `${weight} ${current}px ${family}`
  ctx.font = font
  let guard = 0
  while (ctx.measureText(text).width > maxWidth && current > size * 0.45 && guard < 40) {
    current -= Math.max(1, Math.round(size * 0.03))
    font = `${weight} ${current}px ${family}`
    ctx.font = font
    guard += 1
  }
  return font
}

/**
 * Sandwich compositing: background → foto → grain → overlay bingkai → caption.
 * Semua koordinat pakai ruang desain bingkai (mis. 1200x3600), lalu di-scale sekali.
 */
export function composeStrip(canvas: HTMLCanvasElement, opts: ComposeOptions): number {
  const { frame } = opts
  const targetWidth = opts.width ?? frame.canvasWidth
  const scale = targetWidth / frame.canvasWidth
  const W = frame.canvasWidth
  const H = frame.canvasHeight

  canvas.width = Math.round(W * scale)
  canvas.height = Math.round(H * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return scale
  ctx.setTransform(scale, 0, 0, scale, 0, 0)
  ctx.clearRect(0, 0, W, H)

  // Layer 1 — kertas
  ctx.fillStyle = opts.background || frame.defaultBgColor
  ctx.fillRect(0, 0, W, H)

  const preset = filterCss(opts.filter)

  // Layer 2 — foto
  frame.slots.forEach((slot, i) => {
    const photo = opts.photos[i] ?? null
    ctx.save()
    roundRectPath(ctx, slot)
    ctx.clip()
    if (photo) {
      ctx.filter = preset.css
      drawCover(ctx, photo, slot)
      ctx.filter = 'none'
      if (preset.grain) {
        const pattern = ctx.createPattern(getGrainTile(), 'repeat')
        if (pattern) {
          ctx.globalCompositeOperation = 'overlay'
          ctx.globalAlpha = 0.5
          ctx.fillStyle = pattern
          ctx.fillRect(slot.x, slot.y, slot.width, slot.height)
        }
      }
    } else {
      drawEmptySlot(ctx, slot, frame.inkColor)
    }
    ctx.restore()
  })

  // Layer 3 — overlay bingkai
  let paperInk = frame.inkColor
  if (opts.overlay) {
    // Kertas gelap + tinta bingkai gelap = teks hilang. Kalau kontrasnya
    // bahaya, cetak ulang overlay jadi "tinta putih" (silhouette) biar tetap
    // kebaca — persis kayak print putih di kertas hitam.
    const paper = opts.background || frame.defaultBgColor
    if (luminance(paper) < 0.42 && luminance(frame.inkColor) < 0.5) {
      const light = getLightOverlay(opts.overlay, W, H)
      if (light) {
        ctx.drawImage(light, 0, 0, W, H)
        paperInk = '#F6F0E4'
      } else {
        ctx.drawImage(opts.overlay, 0, 0, W, H)
      }
    } else {
      ctx.drawImage(opts.overlay, 0, 0, W, H)
    }
  }

  // Layer 4 — caption & tanggal
  const box = frame.captionBox
  const ink = paperInk
  ctx.save()
  ctx.textAlign = box.align === 'center' ? 'center' : 'left'
  ctx.textBaseline = 'top'
  const baseX = box.align === 'center' ? box.x + box.width / 2 : box.x
  const serifFamily = '"Instrument Serif", Georgia, "Times New Roman", serif'
  const monoFamily = '"JetBrains Mono", ui-monospace, monospace'

  let cursor = box.y + box.height * 0.02
  const caption = opts.caption?.trim()
  if (caption) {
    const font = fitFont(ctx, caption, serifFamily, 400, Math.round(W * 0.058), box.width)
    ctx.font = font
    ctx.fillStyle = ink
    ctx.fillText(caption, baseX, cursor)
    cursor += Math.round(W * 0.058) * 1.0
  } else {
    cursor += Math.round(W * 0.03)
  }

  if (opts.showDate !== false && opts.date) {
    ctx.font = `400 ${Math.round(W * 0.026)}px ${monoFamily}`
    ctx.fillStyle = ink
    ctx.globalAlpha = 0.72
    ctx.fillText(opts.date, baseX, cursor)
  }
  ctx.restore()
  return scale
}

export function formatStamp(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d} · maybee booth`
}

export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  const { promise, resolve, reject } = Promise.withResolvers<Blob>()
  canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Gagal membuat berkas gambar'))), type, quality)
  return promise
}

export interface ExportOptions extends Omit<ComposeOptions, 'width'> {
  format?: 'png' | 'webp'
  quality?: number
  maxWidth?: number
  /** DPI yang ditulis ke metadata PNG (default 300). */
  dpi?: number
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff
  for (let i = 0; i < bytes.length; i += 1) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

/**
 * Canvas nggak pernah nulis metadata DPI, jadi file PNG dari toBlob() selalu
 * kebaca 72 DPI walau pikselnya 1200x3600. Kita sisipin chunk pHYs sendiri
 * tepat setelah IHDR supaya Photoshop / printer ngerti ini 300 DPI asli.
 */
export async function withPngDpi(blob: Blob, dpi = 300): Promise<Blob> {
  if (blob.type !== 'image/png') return blob
  const buffer = new Uint8Array(await blob.arrayBuffer())
  const signature = [137, 80, 78, 71, 13, 10, 26, 10]
  if (signature.some((b, i) => buffer[i] !== b)) return blob

  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
  const ihdrEnd = 8 + 8 + view.getUint32(8) + 4 // sig + (len + type) + data + crc
  const ppm = Math.round(dpi / 0.0254)

  const phys = new Uint8Array(21)
  const pv = new DataView(phys.buffer)
  pv.setUint32(0, 9) // data length
  phys.set([0x70, 0x48, 0x59, 0x73], 4) // 'pHYs'
  pv.setUint32(8, ppm) // x pixels per unit
  pv.setUint32(12, ppm) // y pixels per unit
  phys[16] = 1 // unit = meter
  pv.setUint32(17, crc32(phys.subarray(4, 17)))

  const out = new Uint8Array(buffer.byteLength + phys.byteLength)
  out.set(buffer.subarray(0, ihdrEnd), 0)
  out.set(phys, ihdrEnd)
  out.set(buffer.subarray(ihdrEnd), ihdrEnd + phys.byteLength)
  return new Blob([out], { type: 'image/png' })
}

/**
 * `document.fonts.ready` bisa nge-hang selamanya kalau font CDN lambat/diblokir
 * (kejadian nyata di jaringan jelek + WebView). Export nggak boleh ikut mati,
 * jadi tunggu maksimal sekian ms lalu lanjut pakai font fallback.
 */
export async function waitForFonts(maxMs = 1200): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    await Promise.race([
      document.fonts.ready,
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, maxMs)
      }),
    ])
  } catch {
    /* font gagal load: lanjut aja, canvas punya fallback */
  } finally {
    if (timer) clearTimeout(timer)
  }
}

/** Render sekali lagi di kanvas lepas-layar saat export (bukan canvas preview). */
export async function exportStrip(opts: ExportOptions): Promise<{ blob: Blob; width: number; height: number }> {
  await waitForFonts()
  const width = opts.maxWidth ?? opts.frame.canvasWidth
  const canvas = document.createElement('canvas')
  composeStrip(canvas, { ...opts, width })
  const format = opts.format ?? 'png'
  const type = format === 'webp' ? 'image/webp' : 'image/png'
  const raw = await canvasToBlob(canvas, type, opts.quality)
  // Safari lama bisa mengembalikan PNG walau diminta WebP — jaga-jaga.
  const blob = raw.type === 'image/png' ? await withPngDpi(raw, opts.dpi ?? 300) : raw
  return { blob, width: canvas.width, height: canvas.height }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export function blobExtension(blob: Blob): string {
  if (blob.type === 'image/webp') return 'webp'
  if (blob.type === 'image/png') return 'png'
  if (blob.type === 'image/jpeg') return 'jpg'
  return 'bin'
}
