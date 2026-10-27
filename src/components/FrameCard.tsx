import { Link } from 'react-router-dom'
import { ArrowUpRight, Lock } from 'lucide-react'
import type { Frame } from '../types'
import { FrameTrip } from './FrameTrip'
import { useAuth } from '../context/AuthContext'

interface FrameCardProps {
  frame: Frame
  index: number
}

export function FrameCard({ frame, index }: FrameCardProps) {
  const { user } = useAuth()
  const locked = frame.akses === 'koleksi' && !user

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-milk transition duration-300 hover:border-line-strong hover:shadow-[0_24px_50px_-32px_rgba(28,25,23,0.35)]"
    >
      <div className="relative flex h-[19rem] items-center justify-center overflow-hidden bg-[#F4EFE4] px-8 py-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              'radial-gradient(rgba(120,113,108,0.22) 0.6px, transparent 0.7px)',
            backgroundSize: '5px 5px',
          }}
        />
        {/* Tinggi preview dipatok biar judul tiap kartu rata di garis yang sama,
            berapa pun rasio bingkainya. */}
        <div
          className="relative h-full transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1"
          style={{
            aspectRatio: `${frame.canvasWidth} / ${frame.canvasHeight}`,
            filter: 'drop-shadow(0 18px 24px rgba(28,25,23,0.22))',
            maxWidth: '100%',
          }}
        >
          <FrameTrip frame={frame} sampleOffset={index * 2} width={420} radius={2} />
        </div>
        <span className="absolute left-4 top-4 rounded-sm bg-milk/90 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-stone">
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* badge Koleksi — keterangan, bukan hard-sell */}
        {frame.akses === 'koleksi' && (
          <span
            className={`absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-sm px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] ${
              locked ? 'bg-espresso text-cream' : 'bg-milk/90 text-stone'
            }`}
          >
            {locked ? <Lock size={10} /> : null}
            koleksi
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 border-t border-line p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-[1.55rem] leading-tight text-espresso">{frame.title}</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-stone">{frame.tagline}</p>
          </div>
          <span className="mt-1 shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-stone-soft">
            {frame.photoCount}×
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 border-t border-dashed border-line pt-4 font-mono text-[10px] uppercase tracking-[0.1em] text-stone-soft">
          <div>
            <dt className="text-[9px]">format</dt>
            <dd className="mt-0.5 text-stone">{frame.categoryLabel}</dd>
          </div>
          <div>
            <dt className="text-[9px]">akses</dt>
            <dd className="mt-0.5 text-stone">
              {frame.akses === 'bebas' ? 'bebas' : 'butuh akun'}
            </dd>
          </div>
        </dl>

        <Link
          to={locked ? `/masuk?mode=masuk&next=${frame.id}` : `/booth?frame=${frame.id}`}
          className={`mt-auto flex items-center justify-between rounded-lg border px-4 py-3 text-[13px] font-medium transition ${
            locked
              ? 'border-espresso/12 bg-espresso text-cream hover:bg-espresso/90'
              : 'border-espresso/12 bg-cream text-espresso group-hover:border-espresso/25 group-hover:bg-butter/60'
          }`}
        >
          {locked ? 'Masuk buat pakai' : 'Pilih bingkai ini'}
          <ArrowUpRight size={15} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </article>
  )
}
