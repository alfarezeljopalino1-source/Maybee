import { Link } from 'react-router-dom'
import { ArrowRight, Camera, Code2, HardDrive, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'

const principles = [
  {
    icon: ShieldCheck,
    title: 'Privasi bukan fitur tambahan',
    body: 'Kamera, komposisi, dan filter jalan lokal di browser. Nggak ada frame foto kamu yang lewat server kecuali kamu sendiri yang klik simpan ke akun.',
  },
  {
    icon: Sparkles,
    title: 'Anti AI-slop',
    body: 'Nggak ada gradien ungu-biru, nggak ada kartu rounded tanpa alasan. Warna hangat, tipografi editorial, detail ala kamera analog.',
  },
  {
    icon: HardDrive,
    title: 'Ringan tapi jujur',
    body: 'Preview dan hasil export pakai kanvas yang sama — 300 DPI, koordinat slot presisi, tanpa kompromi kualitas.',
  },
]

export function About() {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-line">
          <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
            <p className="kicker">tentang maybee</p>
            <h1 className="mt-3 max-w-2xl font-serif text-[2.6rem] leading-[1.02] tracking-[-0.02em] text-espresso sm:text-[3.6rem]">
              Photobox yang nggak bikin kamu <span className="italic">keluar aplikasi</span>.
            </h1>
            <p className="mt-6 max-w-xl text-[14.5px] leading-relaxed text-stone">
              maybee lahir dari kebiasaan sederhana: foto bareng teman, tapi pengen langsung jadi strip
              yang rapi — bukan buka aplikasi, pilih template, tunggu iklan, baru bisa simpan. Semua
              prosesnya kita pindahin ke browser kamu.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
          <div className="grid gap-6 sm:grid-cols-3">
            {principles.map((p) => (
              <div key={p.title} className="rounded-xl border border-line bg-milk p-5">
                <p.icon size={18} className="text-espresso" strokeWidth={1.5} />
                <h2 className="mt-4 font-serif text-xl leading-tight text-espresso">{p.title}</h2>
                <p className="mt-2 text-[12.5px] leading-relaxed text-stone">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="privasi" className="scroll-mt-20 border-y border-line bg-[#F7F2E7]">
          <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
            <p className="kicker">privasi & data</p>
            <h2 className="mt-3 font-serif text-[2rem] leading-tight text-espresso sm:text-[2.4rem]">
              Apa yang sebenarnya disimpan?
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-line bg-milk/70 p-5">
                <h3 className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-stone-soft">
                  <Camera size={13} /> tanpa akun
                </h3>
                <ul className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-stone">
                  <li>· Foto cuma ada di memori tab browser, hilang saat ditutup.</li>
                  <li>· Strip yang kamu simpan masuk IndexedDB gawai ini (maks 40 strip).</li>
                  <li>· Nggak ada analytics pihak ketiga, nggak ada cookie iklan.</li>
                </ul>
              </div>
              <div className="rounded-xl border border-line bg-milk/70 p-5">
                <h3 className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-stone-soft">
                  <HardDrive size={13} /> dengan akun
                </h3>
                <ul className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-stone">
                  <li>· Cuma strip yang kamu klik “simpan ke akun” yang diunggah.</li>
                  <li>· Dikompres ke WebP ~200 KB, disimpan di storage privat milikmu.</li>
                  <li>· Bisa dihapus kapan pun dari halaman galeri.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
          <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="kicker">di balik layar</p>
              <h2 className="mt-3 font-serif text-[2rem] leading-tight text-espresso sm:text-[2.4rem]">
                Dibikin pakai React + Canvas, tanpa template.
              </h2>
              <p className="mt-3 max-w-md text-[13px] leading-relaxed text-stone">
                Compositing engine-nya gambar berlapis: kertas → foto (crop presisi) → grain → overlay
                bingkai → caption. Bingkai baru tinggal tambah PNG transparan + koordinat slot.
              </p>
            </div>
            <Link to="/booth" className="btn btn-honey shrink-0">
              Coba sekarang <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-10 grid gap-3 border-t border-line pt-8 sm:grid-cols-3">
            {[
              { icon: Code2, label: 'stack', value: 'Vite · React · Tailwind' },
              { icon: HeartHandshake, label: 'dibuat oleh', value: 'Ben & Bro Jopal' },
              { icon: Camera, label: 'resolusi', value: '300 DPI · PNG / WebP' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <item.icon size={15} className="text-stone-soft" />
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-stone-soft">{item.label}</p>
                  <p className="text-[12.5px] text-espresso">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
