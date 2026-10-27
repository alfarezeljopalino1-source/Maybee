import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Camera, Download, Frame as FrameIcon, ShieldCheck, Sparkles } from 'lucide-react'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'
import { FrameCard } from '../components/FrameCard'
import { FrameTrip } from '../components/FrameTrip'
import { categories, collectionFrames, freeFrames, frames, getFrame } from '../data/frames'

const specimen = [
  { id: 'honey-classic', note: 'strip 4-cut' },
  { id: 'butter-grid', note: 'grid 2×2' },
  { id: 'polaroid-duo', note: 'polaroid' },
]

const colophon = [
  { term: 'jepretan', value: '4 slot' },
  { term: 'resolusi', value: '300 dpi' },
  { term: 'filter', value: '4 analog' },
  { term: 'biaya', value: 'gratis' },
]

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

const ease = [0.22, 1, 0.36, 1] as const

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.7, ease },
})

export function Landing() {
  const [active, setActive] = useState('Semua')
  const filtered = useMemo(
    () =>
      active === 'Semua'
        ? freeFrames
        : freeFrames.filter((f) => f.categoryLabel === active),
    [active],
  )

  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />

      {/* ── HERO ─────────────────────────────────────────────────────────
          Teks yang jadi panggung. Mockup strip diturunkan jadi spesimen
          kecil di kaki halaman, bukan rebutan perhatian sama headline. */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          {/* masthead */}
          <motion.div
            {...rise(0)}
            className="flex items-baseline justify-between gap-4 border-b border-line py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-stone-soft"
          >
            <span className="text-stone">photobox · browser only</span>
            <span className="hidden sm:inline">est. 2026 — indonesia</span>
          </motion.div>

          <div className="pb-14 pt-12 sm:pb-16 sm:pt-16 lg:pb-20 lg:pt-20">
            <motion.p {...rise(0.04)} className="kicker">
              foto strip, tanpa antre
            </motion.p>

            <motion.h1 {...rise(0.1)} className="display mt-5 max-w-[19ch]">
              sweet memories,
              <br />
              <span className="italic text-stone">one strip</span> at a time.
            </motion.h1>

            {/* Dua kolom: paragraf pembuka + kolofon. Rasio sengaja nggak 50/50. */}
            <div className="mt-10 grid grid-cols-1 gap-10 border-t border-line pt-9 sm:mt-12 lg:grid-cols-12 lg:gap-8">
              <motion.div {...rise(0.18)} className="lg:col-span-6">
                <p className="body-copy dropcap text-[15px] leading-[1.72]">
                  Photobox di browser kamu. Pilih bingkai, pose empat kali dengan hitungan
                  mundur, lalu poles warnanya. Hasilnya file PNG 300 DPI yang siap dicetak —
                  bukan screenshot burem.
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link to="/booth" className="btn btn-dark">
                    Mulai sesi foto
                    <ArrowRight size={15} />
                  </Link>
                  <a href="#bingkai" className="btn btn-quiet border border-line-strong">
                    Lihat katalog
                  </a>
                </div>

                <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.13em] text-stone-soft">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={12} /> foto tetap di gawai
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={12} /> tanpa akun
                  </span>
                </p>
              </motion.div>

              {/* kolofon — info teknis dirapatkan, bukan dipecah jadi 4 kartu */}
              <motion.dl
                {...rise(0.26)}
                className="self-start border-t border-line pt-5 lg:col-span-4 lg:col-start-9 lg:border-t-0 lg:pt-0"
              >
                <p className="micro mb-3">ringkasan</p>
                {colophon.map((row) => (
                  <div
                    key={row.term}
                    className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 last:border-b-0"
                  >
                    <dt className="font-mono text-[10px] uppercase tracking-[0.13em] text-stone-soft">
                      {row.term}
                    </dt>
                    <dd className="font-serif text-[1.15rem] leading-none text-espresso">{row.value}</dd>
                  </div>
                ))}
              </motion.dl>
            </div>
          </div>

          {/* spesimen — gambar strip dikecilin, disusun kayak plat katalog cetak:
              tinggi gambar dipatok, caption rata bawah di garis dasar yang sama. */}
          <motion.div {...rise(0.34)} className="border-t border-line pt-8 pb-10">
            <div className="flex items-baseline justify-between gap-4">
              <p className="kicker">01 — spesimen bingkai</p>
              <p className="hidden font-mono text-[9px] uppercase tracking-[0.16em] text-stone-soft sm:block">
                skala 1:9
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 sm:gap-x-8">
              {specimen.map((item, i) => {
                const frame = getFrame(item.id)
                if (!frame) return null
                return (
                  <Link
                    key={item.id}
                    to={`/booth?frame=${item.id}`}
                    className="group flex flex-col"
                  >
                    {/* Tinggi dipatok, lebar ngikutin rasio asli bingkai.
                        Strip 4-cut jadi ramping, grid jadi lebar — persis katalog cetak. */}
                    <div className="flex h-[10.5rem] items-end sm:h-[12rem]">
                      <div
                        className="transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1"
                        style={{
                          height: '100%',
                          aspectRatio: `${frame.canvasWidth} / ${frame.canvasHeight}`,
                          filter: 'drop-shadow(0 10px 16px rgba(28,25,23,0.18))',
                        }}
                      >
                        <FrameTrip frame={frame} sampleOffset={i * 2} width={300} radius={1} />
                      </div>
                    </div>

                    <div className="mt-3 border-t border-line pt-2.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="font-serif text-[1rem] leading-tight text-espresso">{frame.title}</p>
                        <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-stone-soft">
                          0{i + 1}
                        </span>
                      </div>
                      <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.13em] text-stone-soft">
                        {item.note} · {frame.photoCount}×
                      </p>
                    </div>
                  </Link>
                )
              })}

              <Link
                to="/booth"
                className="group flex flex-col justify-end"
              >
                <div className="flex h-[9.5rem] items-end sm:h-[11rem]">
                  <p className="max-w-[9rem] font-serif text-[1.15rem] leading-[1.25] text-stone transition group-hover:text-espresso">
                    delapan bingkai, satu booth.
                  </p>
                </div>
                <div className="mt-3 border-t border-line pt-2.5">
                  <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.13em] text-stone transition group-hover:text-espresso">
                    lihat semua
                    <ArrowUpRight size={11} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </p>
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── KATALOG ─────────────────────────────────────────────────── */}
      <section id="bingkai" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:px-8 lg:py-24">
        <div className="grid gap-6 border-b border-line pb-7 sm:grid-cols-[1fr_auto] sm:items-end sm:gap-10">
          <div>
            <p className="kicker">02 — katalog bingkai</p>
            <h2 className="title mt-3 max-w-xl">
              Bingkai yang bikin strip terasa <span className="italic">nyata</span>.
            </h2>
          </div>
          <p className="max-w-[22rem] text-[13px] leading-[1.65] text-stone">
            Enam bingkai bebas dipakai tanpa akun. Tiap bingkai punya koordinat slot presisi —
            bukan tempelan gambar, jadi hasil export sama persis dengan preview.
          </p>
        </div>

        {/* Di mobile pill-nya dibiarin wrap dua baris — lebih jujur daripada
            scroll horizontal yang nggak ada tanda-tandanya. */}
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((cat) => {
            const count =
              cat === 'Semua'
                ? freeFrames.length
                : freeFrames.filter((f) => f.categoryLabel === cat).length
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


      {/* ── KOLEKSI ─────────────────────────────────────────────────────
          Section ini menjawab satu pertanyaan: "kok ada yang dikunci?"
          Jawabannya bukan paywall — dan itu ditulis apa adanya. */}
      <section id="koleksi" className="border-t border-line bg-[#F7F2E7]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <p className="kicker">03 — koleksi</p>
              <h2 className="title mt-3">
                Dua bingkai yang minta <span className="italic">alamat</span>.
              </h2>
              <p className="mt-4 max-w-[34ch] text-[13.5px] leading-[1.7] text-stone">
                Nggak ada paket, nggak ada langganan, nggak ada tombol bayar. Bingkai Koleksi
                cuma butuh akun — supaya strip-nya punya tempat pulang dan bisa kamu buka lagi
                dari HP lain.
              </p>

              <dl className="mt-7 divide-y divide-line border-y border-line">
                {[
                  ['6 bingkai bebas', 'tanpa akun, unduh sepuasnya'],
                  ['2 bingkai koleksi', 'butuh akun, bukan bayar'],
                  ['galeri cloud', '±200 KB per strip, privat'],
                ].map(([t, v]) => (
                  <div key={t} className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="text-[12.5px] text-espresso">{t}</dt>
                    <dd className="font-mono text-[10px] uppercase tracking-[0.1em] text-stone-soft">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-7 flex flex-wrap gap-2">
                <Link to="/masuk?mode=daftar" className="btn btn-dark">
                  Bikin akun gratis
                  <ArrowRight size={15} />
                </Link>
                <Link to="/masuk" className="btn btn-ghost">
                  Udah punya akun
                </Link>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
              {collectionFrames.map((frame) => (
                <FrameCard
                  key={frame.id}
                  frame={frame}
                  index={frames.findIndex((f) => f.id === frame.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CARA KERJA ──────────────────────────────────────────────── */}
      <section className="border-y border-line bg-[#F7F2E7]">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 lg:py-20">
          <p className="kicker">04 — cara kerja</p>

          <div className="mt-3 grid gap-8 lg:grid-cols-12 lg:gap-10">
            <h2 className="title lg:col-span-5">
              Tiga langkah,
              <br />
              nggak ada <span className="italic">ribet</span>.
            </h2>
            <p className="body-copy self-end text-[14px] lg:col-span-5 lg:col-start-8">
              Kamera, filter, komposisi, kompresi — semuanya jalan di gawai kamu. Server cuma
              kepake kalau kamu sendiri yang mau simpan ke akun.
            </p>
          </div>

          {/* Daftar bergaris, bukan tiga kartu sejajar. Lebih tenang dibaca. */}
          <ol className="mt-10 divide-y divide-line border-y border-line">
            {steps.map((step, i) => (
              <li key={step.title} className="group grid gap-3 py-7 sm:grid-cols-[auto_1fr_auto] sm:items-baseline sm:gap-6">
                <span className="font-mono text-[10px] tracking-[0.16em] text-stone-soft">0{i + 1}</span>
                <div className="max-w-xl">
                  <h3 className="heading">
                    <span className="mr-2 inline-block align-middle text-stone-soft">
                      <step.icon size={16} strokeWidth={1.5} className="inline" />
                    </span>
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] leading-[1.65] text-stone">{step.body}</p>
                </div>
                <ArrowUpRight
                  size={16}
                  className="hidden text-stone-soft transition group-hover:text-espresso sm:block"
                />
              </li>
            ))}
          </ol>

          <Link to="/booth" className="btn btn-honey mt-8">
            Coba booth sekarang
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="relative overflow-hidden rounded-xl border border-espresso/10 bg-slate-deep px-6 py-14 text-cream sm:px-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.16]"
            style={{
              backgroundImage: 'radial-gradient(rgba(251,191,36,0.5) 0.6px, transparent 0.7px)',
              backgroundSize: '6px 6px',
            }}
          />
          <div className="relative grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/45">
                gratis, selamanya
              </p>
              <h2 className="mt-4 max-w-[24ch] font-serif text-[clamp(1.9rem,3.4vw,2.75rem)] leading-[1.02] tracking-[-0.02em] text-cream">
                Siapin pose terbaikmu. Sisanya maybee yang urus.
              </h2>
            </div>
            <Link to="/booth" className="btn shrink-0 bg-cream text-espresso hover:bg-white">
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
