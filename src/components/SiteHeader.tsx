import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Logo } from './Logo'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/#bingkai', label: 'Bingkai' },
  { to: '/booth', label: 'Booth' },
  { to: '/galeri', label: 'Galeri' },
  { to: '/tentang', label: 'Tentang' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { user, cloudReady } = useAuth()
  const location = useLocation()

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-cream/85 backdrop-blur-[6px]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="group flex items-baseline gap-2" onClick={() => setOpen(false)}>
          <Logo className="text-[1.6rem] text-espresso transition group-hover:opacity-80" />
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.22em] text-stone-soft transition group-hover:text-stone sm:block">
            photobox
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative font-mono text-[11px] uppercase tracking-[0.16em] transition ${
                  isActive && location.pathname === link.to.split('#')[0]
                    ? 'text-espresso'
                    : 'text-stone hover:text-espresso'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {/* Jangan pernah disembunyikan. Kalau cloud belum siap, orang tetap
              harus bisa nemu pintunya — halaman /masuk yang jelasin kenapa. */}
          <Link
            to={user ? '/galeri' : '/masuk'}
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-stone transition hover:text-espresso"
          >
            {user ? 'akun' : 'masuk'}
            {!cloudReady && <span className="ml-1 text-stone-soft">·lokal</span>}
          </Link>
          <Link to="/booth" className="btn btn-dark !py-2.5 !text-[13px]">
            Mulai jepret
          </Link>
        </div>

        <button
          type="button"
          className="btn btn-quiet md:hidden !px-2"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={open}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-cream px-5 pb-5 pt-3 md:hidden">
          <div className="flex flex-col">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="border-b border-line/70 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-stone"
              >
                {link.label}
              </Link>
            ))}
            <Link to="/booth" onClick={() => setOpen(false)} className="btn btn-dark mt-4">
              Mulai jepret
            </Link>
            <Link
              to={user ? '/galeri' : '/masuk'}
              onClick={() => setOpen(false)}
              className="mt-3 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-stone"
            >
              {user ? 'akun saya' : 'masuk / daftar'}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
