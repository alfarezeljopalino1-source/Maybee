import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { Frame } from '../types'
import { FrameTrip } from './FrameTrip'

interface FrameCardProps {
  frame: Frame
  index: number
}

export function FrameCard({ frame, index }: FrameCardProps) {
  const tall = frame.canvasHeight / frame.canvasWidth > 2.2

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-milk transition duration-300 hover:border-line-strong hover:shadow-[0_24px_50px_-32px_rgba(28,25,23,0.35)]"
    >
      <div className="relative flex items-center justify-center overflow-hidden bg-[#F4EFE4] px-8 pb-6 pt-9">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              'radial-gradient(rgba(120,113,108,0.22) 0.6px, transparent 0.7px)',
            backgroundSize: '5px 5px',
          }}
        />
        <div
          className={`relative transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 ${
            tall ? 'w-[46%]' : 'w-[74%]'
          }`}
          style={{ filter: 'drop-shadow(0 18px 24px rgba(28,25,23,0.22))' }}
        >
          <FrameTrip frame={frame} sampleOffset={index * 2} width={tall ? 320 : 520} radius={2} />
        </div>
        <span className="absolute left-4 top-4 rounded-sm bg-milk/90 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-stone">
          {String(index + 1).padStart(2, '0')}
        </span>
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
            <dt className="text-[9px]">kanvas</dt>
            <dd className="mt-0.5 text-stone">
              {frame.canvasWidth}×{frame.canvasHeight}
            </dd>
          </div>
        </dl>

        <Link
          to={`/booth?frame=${frame.id}`}
          className="mt-auto flex items-center justify-between rounded-lg border border-espresso/12 bg-cream px-4 py-3 text-[13px] font-medium text-espresso transition group-hover:border-espresso/25 group-hover:bg-butter/60"
        >
          Pilih bingkai ini
          <ArrowUpRight size={15} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </article>
  )
}
