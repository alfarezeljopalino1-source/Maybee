import { requireSupabase, STORAGE_BUCKET } from './supabase'
import type { CloudStrip } from '../types'
import { blobExtension } from './canvas'

const MAX_EDGE = 1600
const WEBP_QUALITY = 0.8

/**
 * Kompres di sisi klien sebelum unggah.
 * Hasil normal ~150-250 KB, jadi ribuan strip masih muat di free tier Supabase.
 */
export async function compressForCloud(blob: Blob): Promise<Blob> {
  if (typeof createImageBitmap === 'undefined') return blob
  const bitmap = await createImageBitmap(blob)
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return blob
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  const { promise, resolve } = Promise.withResolvers<Blob>()
  canvas.toBlob((out) => resolve(out ?? blob), 'image/webp', WEBP_QUALITY)
  return promise
}

export interface UploadResult {
  strip: CloudStrip
  sizeKb: number
}

export async function uploadStrip(params: {
  blob: Blob
  frameId: string
  caption: string
  userId: string
}): Promise<UploadResult> {
  const client = requireSupabase()
  const compressed = await compressForCloud(params.blob)
  const ext = blobExtension(compressed)
  const path = `${params.userId}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await client.storage
    .from(STORAGE_BUCKET)
    .upload(path, compressed, { contentType: compressed.type || 'image/webp', upsert: false })
  if (uploadError) throw new Error(uploadError.message)

  const { data: publicUrl } = client.storage.from(STORAGE_BUCKET).getPublicUrl(path)

  const { data, error } = await client
    .from('photo_strips')
    .insert({
      user_id: params.userId,
      frame_id: params.frameId,
      image_url: publicUrl.publicUrl,
      caption: params.caption || null,
    })
    .select('id, frame_id, image_url, created_at, caption')
    .single()

  if (error) {
    await client.storage.from(STORAGE_BUCKET).remove([path])
    throw new Error(error.message)
  }

  return {
    strip: data as CloudStrip,
    sizeKb: Math.round(compressed.size / 1024),
  }
}

export async function listCloudStrips(userId: string): Promise<CloudStrip[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('photo_strips')
    .select('id, frame_id, image_url, created_at, caption')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as CloudStrip[]
}

export async function deleteCloudStrip(strip: CloudStrip): Promise<void> {
  const client = requireSupabase()
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`
  const idx = strip.image_url.indexOf(marker)
  if (idx >= 0) {
    const path = decodeURIComponent(strip.image_url.slice(idx + marker.length))
    await client.storage.from(STORAGE_BUCKET).remove([path])
  }
  const { error } = await client.from('photo_strips').delete().eq('id', strip.id)
  if (error) throw new Error(error.message)
}
