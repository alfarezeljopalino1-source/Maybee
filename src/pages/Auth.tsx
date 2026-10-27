import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Mail, ShieldCheck } from 'lucide-react'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'
import { useAuth } from '../context/AuthContext'

export function Auth() {
  const { cloudReady, signInWithGoogle, signInWithEmail } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState<'google' | 'email' | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const google = async () => {
    setSending('google')
    setError(null)
    const { error: err } = await signInWithGoogle()
    if (err) {
      setError(err)
      setSending(null)
    }
  }

  const magicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSending('email')
    setError(null)
    setMessage(null)
    const { error: err } = await signInWithEmail(email.trim())
    setSending(null)
    if (err) setError(err)
    else setMessage('Link masuk udah dikirim. Cek inbox (dan folder spam) ya.')
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-stone-soft transition hover:text-espresso"
          >
            <ArrowLeft size={13} /> kembali
          </button>

          <p className="kicker">akun maybee</p>
          <h1 className="mt-2 font-serif text-[2.2rem] leading-[1.05] text-espresso">
            Simpan strip, <span className="italic">lintas gawai</span>.
          </h1>
          <p className="mt-3 text-[13.5px] leading-relaxed text-stone">
            Masuk cuma buat nyimpen galeri. Foto tetap diproses di browser — yang dikirim cuma versi
            terkompresi ~200 KB kalau kamu klik simpan.
          </p>

          {!cloudReady ? (
            <div className="mt-7 rounded-xl border border-line bg-milk p-5">
              <p className="font-serif text-lg text-espresso">Cloud belum dikonfigurasi</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-stone">
                Isi kredensial Supabase di <code className="rounded bg-cream px-1 font-mono text-[11px]">.env</code>{' '}
                untuk mengaktifkan login. Tanpa itu, booth & galeri lokal tetap jalan penuh.
              </p>
              <Link to="/booth" className="btn btn-dark mt-4 w-full justify-center">
                Lanjut ke booth
              </Link>
            </div>
          ) : (
            <div className="mt-7 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => void google()}
                disabled={sending !== null}
                className="btn btn-dark w-full justify-center !py-3"
              >
                {sending === 'google' ? <Loader2 size={16} className="animate-spin" /> : <GoogleMark />}
                Masuk dengan Google
              </button>

              <div className="my-1 flex items-center gap-3">
                <span className="h-px flex-1 bg-line" />
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-stone-soft">atau</span>
                <span className="h-px flex-1 bg-line" />
              </div>

              <form onSubmit={magicLink} className="flex flex-col gap-2">
                <label htmlFor="email" className="kicker">
                  email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-soft" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kamu@email.com"
                    className="field !pl-9"
                    autoComplete="email"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending !== null}
                  className="btn btn-ghost w-full justify-center !py-3"
                >
                  {sending === 'email' ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
                  Kirim magic link
                </button>
              </form>

              {message && (
                <p className="rounded-lg border border-line-strong bg-butter/50 px-3 py-2 text-[12px] text-espresso">
                  {message}
                </p>
              )}
              {error && (
                <p className="rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3 py-2 text-[12px] text-[#991B1B]">
                  {error}
                </p>
              )}
            </div>
          )}

          <p className="mt-6 flex items-start gap-2 font-mono text-[9.5px] uppercase leading-relaxed tracking-[0.1em] text-stone-soft">
            <ShieldCheck size={13} className="mt-px shrink-0" />
            kamu bisa hapus akun & semua foto kapan aja.
          </p>
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
