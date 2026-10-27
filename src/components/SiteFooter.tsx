import { Link } from 'react-router-dom'
import { Wordmark } from './Wordmark'

export function SiteFooter() {
  const email = import.meta.env.VITE_CONTACT_EMAIL ?? 'hello@maybee.app'

  return (
    <footer className="border-t border-line bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col justify-between gap-10 sm:flex-row">
          <div className="max-w-xs">
            <Wordmark className="text-2xl text-espresso" />
            <p className="mt-3 text-[13px] leading-relaxed text-stone">
              Sweet little photobox di browser kamu. Dibikin buat kenangan yang pengen dicetak, bukan
              cuma di-scroll.
            </p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-stone-soft">
              made in indonesia · 300 dpi
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone-soft">jelajah</p>
              <ul className="mt-3 space-y-2 text-[13px] text-stone">
                <li>
                  <Link to="/booth" className="transition hover:text-espresso">Booth</Link>
                </li>
                <li>
                  <Link to="/galeri" className="transition hover:text-espresso">Galeri</Link>
                </li>
                <li>
                  <Link to="/tentang" className="transition hover:text-espresso">Tentang</Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone-soft">bantuan</p>
              <ul className="mt-3 space-y-2 text-[13px] text-stone">
                <li>
                  <Link to="/tentang#privasi" className="transition hover:text-espresso">Privasi</Link>
                </li>
                <li>
                  <a href={`mailto:${email}`} className="transition hover:text-espresso">Kontak</a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone-soft">catatan</p>
              <ul className="mt-3 space-y-2 text-[13px] text-stone">
                <li>Foto nggak diproses di server</li>
                <li>Bingkai baru tiap bulan</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 font-mono text-[10px] uppercase tracking-[0.12em] text-stone-soft sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} maybee</span>
          <span>sweet little photobox in your browser.</span>
        </div>
      </div>
    </footer>
  )
}
