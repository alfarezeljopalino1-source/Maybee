import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Loader2, Lock, Mail, ShieldCheck, User } from 'lucide-react'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'
import { Logo } from '../components/Logo'
import { useAuth } from '../context/AuthContext'
import { getFrame } from '../data/frames'

type Mode = 'masuk' | 'daftar' | 'lupa' | 'reset'

const COPY: Record<Mode, { kicker: string; title: string; sub: string; cta: string }> = {
  masuk: {
    kicker: 'akun maybee',
    title: 'Masuk ke arsipmu.',
    sub: 'Galeri cloud, bingkai Koleksi, dan strip yang bisa kamu buka lagi dari gawai mana pun.',
    cta: 'Masuk',
  },
  daftar: {
    kicker: 'bikin akun',
    title: 'Mulai arsip sendiri.',
    sub: 'Gratis, tanpa kartu kredit. Akun cuma buat nyimpen — booth tetap bisa dipakai tanpa masuk.',
    cta: 'Bikin akun',
  },
  lupa: {
    kicker: 'lupa password',
    title: 'Reset lewat email.',
    sub: 'Kami kirim tautan sekali pakai. Buka di perangkat yang sama biar sesinya nyambung.',
    cta: 'Kirim tautan reset',
  },
  reset: {
    kicker: 'password baru',
    title: 'Ganti password.',
    sub: 'Kamu masuk lewat tautan reset. Set password baru, langsung kepakai.',
    cta: 'Simpan password',
  },
}

export function Auth() {
  const {
    cloudReady,
    user,
    signInWithGoogle,
    signInWithPassword,
    signUpWithPassword,
    sendPasswordReset,
    updatePassword,
    signInWithEmail,
  } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  // `next` diisi id bingkai Koleksi yang tadi diklik. Setelah masuk, orang
  // dibalikin ke booth bingkai itu — bukan dibuang ke galeri.
  const nextFrame = params.get('next')
  const nextFrameTitle = getFrame(nextFrame ?? undefined)?.title
  const afterAuth = nextFrame ? `/booth?frame=${nextFrame}` : '/galeri'

  const initialMode = (params.get('mode') as Mode | null) ?? 'masuk'
  const [mode, setMode] = useState<Mode>(
    initialMode === 'daftar' || initialMode === 'lupa' || initialMode === 'reset' ? initialMode : 'masuk',
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Sesi reset datang dari tautan Supabase (?mode=reset + token di hash).
  const resetFlow = mode === 'reset'

  useEffect(() => {
    setError(null)
    setMessage(null)
  }, [mode])

  const copy = COPY[mode]

  const switchMode = (next: Mode) => {
    setMode(next)
    setPassword('')
    setPassword2('')
  }

  const google = async () => {
    setBusy('google')
    setError(null)
    const { error: err } = await signInWithGoogle()
    if (err) {
      setError(err)
      setBusy(null)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    const em = email.trim()

    if (mode === 'lupa') {
      if (!em) return
      setBusy('lupa')
      const { error: err } = await sendPasswordReset(em)
      setBusy(null)
      if (err) setError(err)
      else setMessage('Tautan reset udah dikirim. Cek inbox — berlaku 60 menit.')
      return
    }

    if (mode === 'reset') {
      if (password.length < 6) {
        setError('Password minimal 6 karakter.')
        return
      }
      if (password !== password2) {
        setError('Dua password-nya belum sama.')
        return
      }
      setBusy('reset')
      const { error: err } = await updatePassword(password)
      setBusy(null)
      if (err) setError(err)
      else {
        setMessage('Password tersimpan. Mengalihkan…')
        window.setTimeout(() => navigate(afterAuth), 900)
      }
      return
    }

    if (!em || !password) return

    if (mode === 'daftar') {
      if (password.length < 6) {
        setError('Password minimal 6 karakter.')
        return
      }
      setBusy('daftar')
      const { error: err, needsConfirm } = await signUpWithPassword(em, password, name)
      setBusy(null)
      if (err) setError(err)
      else if (needsConfirm) setMessage('Akun dibuat. Cek inbox buat konfirmasi, terus masuk lagi ya.')
      else {
        setMessage('Akun aktif. Mengalihkan…')
        window.setTimeout(() => navigate(afterAuth), 800)
      }
      return
    }

    setBusy('masuk')
    const { error: err } = await signInWithPassword(em, password)
    setBusy(null)
    if (err) setError(err)
    else {
      setMessage('Masuk. Mengalihkan…')
      window.setTimeout(() => navigate(afterAuth), 500)
    }
  }

  const magicLink = async () => {
    const em = email.trim()
    if (!em) {
      setError('Isi email dulu buat kirim magic link.')
      return
    }
    setBusy('magic')
    setError(null)
    setMessage(null)
    const { error: err } = await signInWithEmail(em)
    setBusy(null)
    if (err) setError(err)
    else setMessage('Magic link terkirim. Cek inbox (dan folder spam) ya.')
  }

  const tabs = useMemo(
    () =>
      ([
        ['masuk', 'Masuk'],
        ['daftar', 'Daftar'],
      ] as Array<[Mode, string]>).map(([key, label]) => ({ key, label })),
    [],
  )

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <SiteHeader />
      <main className="flex flex-1 items-start justify-center px-5 py-10 sm:py-14">
        <div className="grid w-full max-w-4xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* ---------------- kolom kiri: narasi ---------------- */}
          <div className="order-2 lg:order-1">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-7 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-stone-soft transition hover:text-espresso"
            >
              <ArrowLeft size={13} /> kembali
            </button>

            <p className="kicker">{copy.kicker}</p>
            <h1 className="mt-2 max-w-[17ch] font-serif text-[clamp(2rem,4vw,2.7rem)] leading-[1.04] tracking-[-0.02em] text-espresso">
              {copy.title}
            </h1>
            <p className="mt-3 max-w-[42ch] text-[13.5px] leading-relaxed text-stone">{copy.sub}</p>

            {nextFrame && !user && (
              <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-line-strong bg-butter/40 px-3 py-2 text-[12px] text-espresso">
                <Lock size={13} />
                Masuk buat pakai bingkai{' '}
                <span className="font-medium">{nextFrameTitle ?? nextFrame}</span>
              </p>
            )}

            {user && !resetFlow && (
              <div className="mt-6 rounded-xl border border-line bg-milk p-4">
                <p className="text-[13px] text-espresso">
                  Kamu udah masuk sebagai <span className="font-medium">{user.email}</span>.
                </p>
                <Link to={afterAuth} className="btn btn-dark mt-3 w-full justify-center !py-2.5">
                  {nextFrame ? 'Lanjut ke booth' : 'Buka galeri'} <ArrowRight size={15} />
                </Link>
              </div>
            )}

            {/* Aturan akses, dinyatakan terang-terangan. Ini pembeda utama
                dari photobox yang jual paket: di maybee nggak ada yang dibeli. */}
            <div className="mt-8 border-t border-line pt-5">
              <p className="micro mb-3">apa yang kamu dapat</p>
              <dl className="space-y-2.5">
                {[
                  ['6 bingkai bebas', 'tanpa akun, tanpa batas, unduh PNG 300 DPI'],
                  ['2 bingkai Koleksi', 'butuh akun — bukan bayar, cuma punya arsip'],
                  ['galeri cloud', 'strip tersimpan ~200 KB, bisa dibuka di HP lain'],
                ].map(([term, value]) => (
                  <div key={term} className="flex items-baseline justify-between gap-4 border-b border-line/70 pb-2.5 last:border-b-0 last:pb-0">
                    <dt className="text-[12.5px] font-medium text-espresso">{term}</dt>
                    <dd className="max-w-[24ch] text-right text-[11.5px] leading-snug text-stone">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* ---------------- kolom kanan: satu kartu ---------------- */}
          <div className="order-1 lg:order-2">
            <div className="relative rounded-2xl border border-line bg-milk p-6 shadow-[0_30px_60px_-46px_rgba(28,25,23,0.45)] sm:p-7">
              <div className="flex items-center justify-between">
                <Logo className="text-[1.35rem] text-espresso" markSize={1.05} />
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-stone-soft">
                  {resetFlow ? 'password baru' : 'gratis'}
                </span>
              </div>

              {!cloudReady ? (
                <div className="mt-6">
                  <p className="font-serif text-lg text-espresso">Cloud belum dikonfigurasi</p>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-stone">
                    Isi kredensial Supabase di{' '}
                    <code className="rounded bg-cream px-1 font-mono text-[11px]">.env</code> untuk
                    mengaktifkan login. Tanpa itu, booth &amp; galeri lokal tetap jalan penuh.
                  </p>
                  <Link to="/booth" className="btn btn-dark mt-4 w-full justify-center">
                    Lanjut ke booth
                  </Link>
                </div>
              ) : (
                <>
                  {/* tab — cuma dua, lupa/reset dibuka lewat tautan kecil */}
                  {!resetFlow && (
                    <div className="mt-5 grid grid-cols-2 gap-1 rounded-lg border border-line bg-cream p-1">
                      {tabs.map((t) => (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => switchMode(t.key)}
                          aria-pressed={mode === t.key}
                          className={`rounded-md py-2 text-[12.5px] font-medium transition ${
                            mode === t.key
                              ? 'bg-milk text-espresso shadow-[0_1px_2px_rgba(28,25,23,0.08)]'
                              : 'text-stone hover:text-espresso'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <form onSubmit={submit} className="mt-5 flex flex-col gap-3.5">
                    {mode === 'daftar' && (
                      <label className="flex flex-col gap-1.5">
                        <span className="kicker">nama</span>
                        <div className="relative">
                          <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-soft" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="nama panggilan (opsional)"
                            className="field !pl-9"
                            autoComplete="nickname"
                          />
                        </div>
                      </label>
                    )}

                    {mode !== 'reset' && (
                      <label className="flex flex-col gap-1.5">
                        <span className="kicker">email</span>
                        <div className="relative">
                          <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-soft" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="kamu@email.com"
                            className="field !pl-9"
                            autoComplete="email"
                          />
                        </div>
                      </label>
                    )}

                    {mode !== 'lupa' && (
                      <label className="flex flex-col gap-1.5">
                        <span className="kicker">{mode === 'reset' ? 'password baru' : 'password'}</span>
                        <div className="relative">
                          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-soft" />
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="minimal 6 karakter"
                            className="field !pl-9"
                            autoComplete={mode === 'daftar' ? 'new-password' : 'current-password'}
                          />
                        </div>
                      </label>
                    )}

                    {mode === 'reset' && (
                      <label className="flex flex-col gap-1.5">
                        <span className="kicker">ulangi password</span>
                        <div className="relative">
                          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-soft" />
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
                            placeholder="ulangi password baru"
                            className="field !pl-9"
                            autoComplete="new-password"
                          />
                        </div>
                      </label>
                    )}

                    <button
                      type="submit"
                      disabled={busy !== null}
                      className="btn btn-dark mt-1 w-full justify-center !py-3"
                    >
                      {busy === mode ? <Loader2 size={15} className="animate-spin" /> : null}
                      {copy.cta}
                    </button>
                  </form>

                  {mode === 'masuk' && (
                    <button
                      type="button"
                      onClick={() => switchMode('lupa')}
                      className="mt-3 w-full text-center font-mono text-[10px] uppercase tracking-[0.12em] text-stone-soft transition hover:text-espresso"
                    >
                      lupa password?
                    </button>
                  )}

                  {!resetFlow && (
                    <>
                      <div className="my-5 flex items-center gap-3">
                        <span className="h-px flex-1 bg-line" />
                        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-stone-soft">atau</span>
                        <span className="h-px flex-1 bg-line" />
                      </div>

                      <button
                        type="button"
                        onClick={() => void google()}
                        disabled={busy !== null}
                        className="btn btn-ghost w-full justify-center !py-2.5"
                      >
                        {busy === 'google' ? <Loader2 size={15} className="animate-spin" /> : <GoogleMark />}
                        Lanjut dengan Google
                      </button>

                      {/* Di mode reset, tombol utama sudah mengirim email —
                          magic link di sini cuma bikin dua tombol kembar. */}
                      {!resetFlow && (
                        <button
                          type="button"
                          onClick={() => void magicLink()}
                          disabled={busy !== null}
                          className="mt-2 w-full text-center font-mono text-[10px] uppercase tracking-[0.12em] text-stone-soft transition hover:text-espresso"
                        >
                          {busy === 'magic' ? 'mengirim…' : 'atau kirim magic link ke email'}
                        </button>
                      )}
                    </>
                  )}

                  {message && (
                    <p className="mt-4 rounded-lg border border-line-strong bg-butter/50 px-3 py-2.5 text-[12px] leading-relaxed text-espresso">
                      {message}
                    </p>
                  )}
                  {error && (
                    <p className="mt-4 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3 py-2.5 text-[12px] leading-relaxed text-[#991B1B]">
                      {error}
                    </p>
                  )}

                  <p className="mt-5 flex items-start gap-2 border-t border-line pt-4 font-mono text-[9.5px] uppercase leading-relaxed tracking-[0.1em] text-stone-soft">
                    <ShieldCheck size={13} className="mt-px shrink-0" />
                    foto diproses di browser. yang dikirim cuma versi ~200 KB kalau kamu simpan.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#FBBF24"
        d="M12 2a10 10 0 1 0 9.54 12.98H12v-3.2h9.3c.06.5.1 1.02.1 1.55C21.4 18.5 17.2 22 12 22 6.48 22 2 17.52 2 12S6.48 2 12 2c2.7 0 4.96.99 6.7 2.6l-2.3 2.3A6.8 6.8 0 0 0 12 5.2 6.8 6.8 0 0 0 5.2 12 6.8 6.8 0 0 0 12 18.8c3.4 0 5.6-2.27 6.1-5.4H12"
      />
    </svg>
  )
}
