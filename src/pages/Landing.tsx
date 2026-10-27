import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Camera, Download, Frame as FrameIcon, ShieldCheck, Sparkles } from 'lucide-react'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'
import { FrameCard } from '../components/FrameCard'
import { FrameTrip } from '../components/FrameTrip'
import { categories, frames, getFrame } from '../data/frames'

const heroFrame = getFrame('honey-classic')!
const heroSticker = getFrame('polaroid-duo')!

const steps = [
  {
    icon: FrameIcon,
    title: 'Pilih bingkai',
    body: 'Strip 4-cut, grid 2×2, atau polaroid. Semua rasio udah dipatok presisi 300 DPI.',
  },
  {
    icon: Camera,
    title: 'Pose berempat',
    body: 'Hitungan mundur, flash, dan suara cekrek. Bisa retake satu slot aja kalau kurang sreg.',
  },
  {
    icon: Download,
    title: 'Unduh atau simpan',
    body: 'Langsung masuk galeri HP, atau simpan ~200 KB ke akun maybee kamu.',
  },
]

export function Landing() {
  const [active, setActive] = useState('Semua')
  const filtered = useMemo(
    () => (active === 'Semua' ? frames : frames.filter((f) => f.categoryLabel === active)),
    [active],
  )

  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pb-24 lg:pt-20">
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-milk px-3 py-1.5"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-honey opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-honey" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                tanpa unduh aplikasi
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 font-serif text-[2.9rem] leading-[0.98] tracking-[-0.02em] text-espresso sm:text-[4.2rem] lg:text-[4.6rem]"
            >
              sweet memories,
              <br />
              <span className="italic text-stone">one strip</span> at a time.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-md text-[15px] leading-relaxed text-stone sm:text-base"
            >
              Photobox instan langsung dari browser kamu. Pilih bingkai, pose 4 kali,
              simpan atau unduh gratis — hasilnya siap cetak 300 DPI.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link to="/booth" className="btn btn-dark">
                Mulai sesi foto
                <ArrowRight size={15} />
              </Link>
              <a href="#bingkai" className="btn btn-ghost">
                Lihat katalog bingkai
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.42, duration: 0.6 }}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-stone-soft"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} /> foto nggak keluar dari browser
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles size={13} /> 4 filter analog
              </span>
            </motion.div>
          </div>

          {/* mockup strip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-[420px] lg:max-w-none"
          >
            <div className="absolute -inset-6 -z-10 rounded-[50%] bg-butter/50 blur-3xl" />
            <div className="relative flex items-end justify-center gap-5 px-2">
              <div className="w-[54%] shrink-0">
                <div className="tilt-strip origin-bottom drop-shadow-[0_26px_36px_rgba(28,25,23,0.28)] transition duration-500 hover:rotate-0">
                  <FrameTrip frame={heroFrame} sampleOffset={1} width={480} radius={2} />
                </div>
              </div>
              <div className="w-[34%] shrink-0 rotate-[5deg] pb-8 drop-shadow-[0_18px_26px_rgba(28,25,23,0.22)] transition duration-500 hover:rotate-0">
                <FrameTrip frame={heroSticker} sampleOffset={4} width={340} radius={2} filter="warm" />
              </div>
            </div>
            <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full border border-line bg-milk/90 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-stone">
              <span className="h-1 w-1 rounded-full bg-espresso/40" />
              honey classic · 1200 × 3600 px
            </div>
          </motion.div>
        </div>
      </section>

      {/* KATALOG */}
      <section id="bingkai" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:px-8 lg:py-24">
        <div className="flex flex-col gap-6 border-b border-line pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="kicker">katalog bingkai</p>
            <h2 className="mt-3 max-w-lg font-serif text-[2.1rem] leading-[1.05] text-espresso sm:text-[2.8rem]">
              Bingkai yang bikin strip terasa <span className="italic">nyata</span>.
            </h2>
          </div>
          <p className="max-w-xs text-[13px] leading-relaxed text-stone">
            Tiap bingkai punya koordinat slot presisi — bukan tempelan gambar. Hasil export-nya sama
            persis dengan preview.
          </p>
        </div>

        <div className="no-scrollbar -mx-5 mt-6 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
          {categories.map((cat) => {
            const count = cat === 'Semua' ? frames.length : frames.filter((f) => f.categoryLabel === cat).length
            const selected = active === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActive(cat)}
                className={`shrink-0 rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition ${
                  selected
                    ? 'border-espresso bg-espresso text-cream'
                    : 'border-line-strong bg-milk text-stone hover:border-stone-soft hover:text-espresso'
                }`}
              >
                {cat}
                <span className={`ml-2 ${selected ? 'text-cream/55' : 'text-stone-soft'}`}>
                  {String(count).padStart(2, '0')}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((frame, i) => (
            <FrameCard key={frame.id} frame={frame} index={frames.findIndex((f) => f.id === frame.id) || i} />
          ))}
        </div>
      </section>

      {/* CARA KERJA */}
      <section className="border-y border-line bg-[#F7F2E7]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="kicker">cara kerja</p>
              <h2 className="mt-3 font-serif text-[2.1rem] leading-[1.06] text-espresso sm:text-[2.6rem]">
                Tiga langkah, nggak ada ribet.
              </h2>
              <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-stone">
                Semua proses — kamera, filter, komposisi, kompresi — jalan di gawai kamu. Server cuma
                dipakai kalau kamu mau simpan ke akun.
              </p>
              <Link to="/booth" className="btn btn-honey mt-6">
                Coba booth sekarang
                <ArrowRight size={15} />
              </Link>
            </div>

            <ol className="grid gap-4 sm:grid-cols-1">
              {steps.map((step, i) => (
                <li
                  key={step.title}
                  className="flex gap-4 rounded-xl border border-line bg-milk/70 p-5 transition hover:border-line-strong hover:bg-milk"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-cream">
                    <step.icon size={17} className="text-espresso" strokeWidth={1.6} />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-[10px] text-stone-soft">0{i + 1}</span>
                      <h3 className="font-serif text-xl text-espresso">{step.title}</h3>
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed text-stone">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="relative overflow-hidden rounded-2xl border border-espresso/10 bg-slate-deep px-6 py-12 text-cream sm:px-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage: 'radial-gradient(rgba(251,191,36,0.5) 0.6px, transparent 0.7px)',
              backgroundSize: '6px 6px',
            }}
          />
          <div className="relative flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/50">gratis, selamanya</p>
              <h2 className="mt-3 max-w-md font-serif text-[2rem] leading-[1.06] sm:text-[2.5rem]">
                Siapin pose terbaikmu. Sisanya maybee yang urus.
              </h2>
            </div>
            <Link
              to="/booth"
              className="btn shrink-0 bg-cream text-espresso hover:bg-white"
            >
              Buka booth
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
