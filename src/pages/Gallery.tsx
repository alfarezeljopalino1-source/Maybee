import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Cloud, Download, HardDrive, Loader2, LogIn, Trash2 } from 'lucide-react'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'
import { useAuth } from '../context/AuthContext'
import { deleteLocalStrip, listLocalStrips } from '../lib/localGallery'
import { downloadBlob } from '../lib/canvas'
import { deleteCloudStrip, listCloudStrips } from '../lib/cloudGallery'
import type { CloudStrip, LocalStrip } from '../types'

type Tab = 'lokal' | 'akun'

function bytesToKb(bytes: number): string {
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function dateLabel(value: string | number): string {
  const d = new Date(value)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function Gallery() {
  const { user, cloudReady, signOut } = useAuth()
  const [tab, setTab] = useState<Tab>('lokal')
  const [local, setLocal] = useState<LocalStrip[]>([])
  const [cloud, setCloud] = useState<CloudStrip[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const loadLocal = useCallback(async () => {
    try {
      setLocal(await listLocalStrips())
    } catch {
      setError('Galeri lokal nggak bisa dibuka di browser ini.')
    }
  }, [])

  const loadCloud = useCallback(async () => {
    if (!user || !cloudReady) return
    setLoading(true)
    setError(null)
    try {
      setCloud(await listCloudStrips(user.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat galeri akun.')
    } finally {
      setLoading(false)
    }
  }, [user, cloudReady])

  useEffect(() => {
    void loadLocal()
  }, [loadLocal])

  useEffect(() => {
    if (tab === 'akun') void loadCloud()
  }, [tab, loadCloud])

  // object URL untuk blob lokal — dibersihkan saat list berubah
  useEffect(() => {
    const created: string[] = []
    const map: Record<string, string> = {}
    for (const strip of local) {
      const url = URL.createObjectURL(strip.blob)
      map[strip.id] = url
      created.push(url)
    }
    setUrls(map)
    return () => created.forEach((u) => URL.revokeObjectURL(u))
  }, [local])

  const removeLocal = async (id: string) => {
    await deleteLocalStrip(id)
    setConfirmId(null)
    await loadLocal()
  }

  const removeCloud = async (strip: CloudStrip) => {
    try {
      await deleteCloudStrip(strip)
      setCloud((prev) => prev.filter((s) => s.id !== strip.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus.')
    } finally {
      setConfirmId(null)
    }
  }

  const download = async (url: string, name: string) => {
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      // Safari batalin unduhan kalau object URL langsung di-revoke — kasih napas dulu.
      downloadBlob(blob, name)
    } catch {
      window.open(url, '_blank', 'noopener')
    }
  }

  const count = tab === 'lokal' ? local.length : cloud.length
  const isEmpty = !loading && count === 0

  const body = useMemo(() => {
    if (isEmpty) {
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-milk/50 px-6 py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-cream">
            <Cloud size={18} className="text-stone-soft" strokeWidth={1.5} />
          </div>
          <h2 className="mt-5 font-serif text-2xl text-espresso">Masih kosong, bray.</h2>
          <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-stone">
            {tab === 'lokal'
              ? 'Strip yang kamu simpan di browser ini bakal muncul di sini. Nggak butuh akun.'
              : 'Simpan strip ke akun kamu, nanti bisa dibuka dari gawai mana pun.'}
          </p>
          <Link to="/booth" className="btn btn-dark mt-6">
            Mulai sesi foto
          </Link>
        </div>
      )
    }
    return null
  }, [isEmpty, tab])

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <div className="flex flex-col justify-between gap-6 border-b border-line pb-7 sm:flex-row sm:items-end">
            <div>
              <p className="kicker">galeri</p>
              <h1 className="mt-2 font-serif text-[2.3rem] leading-[1.02] text-espresso sm:text-[2.9rem]">
                Kenangan yang <span className="italic">kesimpen</span>.
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {cloudReady && user && (
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-stone-soft">
                  {user.email}
                </span>
              )}
              {cloudReady && user && (
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="btn btn-quiet !py-2 !text-[11px]"
                >
                  keluar
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab('lokal')}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition ${
                tab === 'lokal'
                  ? 'border-espresso bg-espresso text-cream'
                  : 'border-line-strong bg-milk text-stone hover:text-espresso'
              }`}
            >
              <HardDrive size={13} /> lokal
              <span className={tab === 'lokal' ? 'text-cream/55' : 'text-stone-soft'}>{String(local.length).padStart(2, '0')}</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('akun')}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition ${
                tab === 'akun'
                  ? 'border-espresso bg-espresso text-cream'
                  : 'border-line-strong bg-milk text-stone hover:text-espresso'
              }`}
            >
              <Cloud size={13} /> akun
              <span className={tab === 'akun' ? 'text-cream/55' : 'text-stone-soft'}>{String(cloud.length).padStart(2, '0')}</span>
            </button>
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-line-strong bg-milk px-3.5 py-2.5 text-[12.5px] text-stone">{error}</p>
          )}

          {tab === 'akun' && !cloudReady && (
            <div className="mt-8 rounded-xl border border-line bg-milk p-6">
              <p className="font-serif text-xl text-espresso">Cloud belum aktif</p>
              <p className="mt-2 max-w-md text-[13px] leading-relaxed text-stone">
                Isi <code className="rounded bg-cream px-1 font-mono text-[11px]">VITE_SUPABASE_URL</code> dan{' '}
                <code className="rounded bg-cream px-1 font-mono text-[11px]">VITE_SUPABASE_ANON_KEY</code> di file{' '}
                <code className="rounded bg-cream px-1 font-mono text-[11px]">.env</code>, lalu jalankan{' '}
                <code className="rounded bg-cream px-1 font-mono text-[11px]">supabase/schema.sql</code>. Sementara itu
                galeri lokal tetap jalan.
              </p>
            </div>
          )}

          {tab === 'akun' && cloudReady && !user && (
            <div className="mt-8 flex flex-col items-start gap-4 rounded-xl border border-line bg-milk p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-serif text-xl text-espresso">Masuk dulu, yuk.</p>
                <p className="mt-1 text-[13px] text-stone">Galeri akun nyimpen strip kamu lintas gawai.</p>
              </div>
              <Link to="/masuk" className="btn btn-dark">
                <LogIn size={15} /> Masuk
              </Link>
            </div>
          )}

          {tab === 'akun' && cloudReady && user && loading && (
            <div className="mt-10 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-stone-soft">
              <Loader2 size={14} className="animate-spin" /> memuat galeri
            </div>
          )}

          {body}

          {tab === 'lokal' && local.length > 0 && (
            <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {local.map((strip, i) => (
                <motion.article
                  key={strip.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.35 }}
                  className="group overflow-hidden rounded-xl border border-line bg-milk transition hover:border-line-strong"
                >
                  <div className="flex justify-center bg-[#F4EFE4] px-4 py-5">
                    <img
                      src={urls[strip.id]}
                      alt={`Strip ${strip.frameTitle}`}
                      className="max-h-[340px] w-auto rounded-[2px] shadow-[0_14px_28px_-14px_rgba(28,25,23,0.4)]"
                      loading="lazy"
                    />
                  </div>
                  <div className="border-t border-line p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-serif text-lg text-espresso">{strip.caption || strip.frameTitle}</p>
                        <p className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-stone-soft">
                          {dateLabel(strip.createdAt)} · {bytesToKb(strip.blob.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => (confirmId === strip.id ? void removeLocal(strip.id) : setConfirmId(strip.id))}
                        className={`shrink-0 rounded-md px-1.5 py-1 transition ${
                          confirmId === strip.id ? 'bg-[#FEE2E2] text-[#B91C1C]' : 'text-stone-soft hover:text-espresso'
                        }`}
                        aria-label="Hapus strip"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => urls[strip.id] && void download(urls[strip.id], `maybee-${strip.frameId}.png`)}
                        className="btn btn-ghost flex-1 !py-2 !text-[11px]"
                      >
                        <Download size={13} /> unduh
                      </button>
                    </div>
                    {confirmId === strip.id && (
                      <p className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.1em] text-[#B91C1C]">
                        tap ikon hapus lagi buat konfirmasi
                      </p>
                    )}
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          {tab === 'akun' && user && cloud.length > 0 && (
            <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cloud.map((strip, i) => (
                <motion.article
                  key={strip.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.35 }}
                  className="overflow-hidden rounded-xl border border-line bg-milk transition hover:border-line-strong"
                >
                  <div className="flex justify-center bg-[#F4EFE4] px-4 py-5">
                    <img
                      src={strip.image_url}
                      alt={`Strip ${strip.caption ?? ''}`}
                      className="max-h-[340px] w-auto rounded-[2px] shadow-[0_14px_28px_-14px_rgba(28,25,23,0.4)]"
                      loading="lazy"
                    />
                  </div>
                  <div className="border-t border-line p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-serif text-lg text-espresso">{strip.caption || 'tanpa judul'}</p>
                        <p className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-stone-soft">
                          {dateLabel(strip.created_at)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => (confirmId === strip.id ? void removeCloud(strip) : setConfirmId(strip.id))}
                        className={`shrink-0 rounded-md px-1.5 py-1 transition ${
                          confirmId === strip.id ? 'bg-[#FEE2E2] text-[#B91C1C]' : 'text-stone-soft hover:text-espresso'
                        }`}
                        aria-label="Hapus strip"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => void download(strip.image_url, `maybee-${strip.id}.webp`)}
                        className="btn btn-ghost flex-1 !py-2 !text-[11px]"
                      >
                        <Download size={13} /> unduh
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
