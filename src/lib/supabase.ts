import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

/**
 * null artinya app tetap jalan dalam mode lokal (galeri perangkat + unduh).
 * Isi .env buat ngaktifin login & cloud gallery.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey, { auth: { persistSession: true, detectSessionInUrl: true } }) : null

export const isCloudReady = supabase !== null
export const STORAGE_BUCKET = 'user_gallery'

export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY di .env')
  return supabase
}
