import { useCallback, useEffect, useState } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Splash } from './components/Splash'
import { Landing } from './pages/Landing'
import { Booth } from './pages/Booth'
import { Gallery } from './pages/Gallery'
import { Auth } from './pages/Auth'
import { About } from './pages/About'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    // Link seperti "/#bingkai" harus lompat ke section-nya, bukan ke atas.
    // Tanpa ini, orang yang klik "Bingkai" dari /booth mendarat di hero
    // dan merasa katalognya hilang.
    if (hash) {
      const id = hash.slice(1)
      // tunggu route baru ter-render dulu sebelum nyari elemennya
      const raf = requestAnimationFrame(() => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else {
          window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
        }
      })
      return () => cancelAnimationFrame(raf)
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, hash])
  return null
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-6 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-soft">404 · frame kosong</p>
      <h1 className="font-serif text-[2.6rem] leading-tight text-espresso">Halaman ini nggak kejepret.</h1>
      <Link to="/" className="btn btn-dark mt-2">
        Balik ke beranda
      </Link>
    </div>
  )
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false)
  const finishSplash = useCallback(() => setSplashDone(true), [])

  return (
    <AuthProvider>
      <ScrollToTop />
      {!splashDone && <Splash onDone={finishSplash} />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/booth" element={<Booth />} />
        <Route path="/galeri" element={<Gallery />} />
        <Route path="/masuk" element={<Auth />} />
        <Route path="/tentang" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}
