export type FrameType = 'strip' | 'grid' | 'polaroid'

/**
 * Tingkat akses bingkai.
 *  bebas   - bisa dipakai tanpa akun, termasuk unduh.
 *  koleksi - butuh akun buat dipakai. Bukan paywall: nggak ada pembayaran,
 *            yang ditukar cuma "punya arsip" (akun), bukan uang.
 */
export type FrameAccess = 'bebas' | 'koleksi'

export interface FrameSlot {
  index: number
  x: number
  y: number
  width: number
  height: number
  radius?: number
}

export interface CaptionBox {
  x: number
  y: number
  width: number
  height: number
  align: 'left' | 'center'
}

export interface Frame {
  id: string
  title: string
  tagline: string
  type: FrameType
  akses: FrameAccess
  categoryLabel: string
  canvasWidth: number
  canvasHeight: number
  defaultBgColor: string
  accentColor: string
  inkColor: string
  overlayUrl: string
  photoCount: number
  slots: FrameSlot[]
  captionBox: CaptionBox
}

export interface LocalStrip {
  id: string
  frameId: string
  frameTitle: string
  caption: string
  createdAt: number
  blob: Blob
}

export interface CloudStrip {
  id: string
  frame_id: string | null
  image_url: string
  created_at: string
  caption?: string | null
}
