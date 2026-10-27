import { Check, RotateCcw } from 'lucide-react'
import type { Frame } from '../../types'
import { FILTERS, formatStamp, type FilterId } from '../../lib/canvas'
import { StripPreview } from './StripPreview'

interface ReviewStageProps {
  frame: Frame
  photos: (string | null)[]
  filter: FilterId
  caption: string
  showDate: boolean
  background: string
  onFilterChange: (id: FilterId) => void
  onCaptionChange: (value: string) => void
  onShowDateChange: (value: boolean) => void
  onBackgroundChange: (value: string) => void
  onRetake: (index: number) => void
  onRestart: () => void
  children?: React.ReactNode
}

const SWATCHES = ['#FBF6EC', '#FDF6E4', '#EAEDE2', '#F3E6DA', '#17130F', '#FFFFFF']

export function ReviewStage({
  frame,
  photos,
  filter,
  caption,
  showDate,
  background,
  onFilterChange,
  onCaptionChange,
  onShowDateChange,
  onBackgroundChange,
  onRetake,
  onRestart,
  children,
}: ReviewStageProps) {
  const stamp = formatStamp()

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
      <div className="order-1 lg:order-1">
        <div className="lg:sticky lg:top-24">
          <div className="mx-auto w-full max-w-[340px]">
            <StripPreview
              frame={frame}
              photos={photos}
              filter={filter}
              caption={caption}
              showDate={showDate}
              background={background}
              width={frame.canvasWidth}
              maxHeight="76vh"
            />
          </div>
          <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-stone-soft">
            pratinjau · {frame.canvasWidth} × {frame.canvasHeight} px
          </p>
        </div>
      </div>

      <div className="order-2 flex flex-col gap-7 lg:order-2">
        <div>
          <p className="kicker">cek hasil dulu</p>
          <h1 className="mt-2 font-serif text-[2.2rem] leading-[1.04] text-espresso sm:text-[2.6rem]">
            Rapi. Tinggal <span className="italic">poles</span>.
          </h1>
          <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-stone">
            Klik slot mana pun buat jepret ulang. Filter dan caption langsung kerender di kanvas —
            bukan overlay CSS.
          </p>
        </div>

        {/* slots */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {frame.slots.map((slot, i) => (
            <button
              key={slot.index}
              type="button"
              onClick={() => onRetake(i)}
              className="group relative overflow-hidden rounded-lg border border-line bg-milk transition hover:border-espresso/40"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-cream">
                {photos[i] ? (
                  <img src={photos[i]!} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center font-mono text-[9px] uppercase text-stone-soft">
                    kosong
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-espresso/55 opacity-0 transition group-hover:opacity-100">
                  <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-cream">
                    <RotateCcw size={11} /> retake
                  </span>
                </div>
              </div>
              <span className="absolute left-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-sm bg-milk/90 font-mono text-[8px] text-espresso">
                {slot.index}
              </span>
            </button>
          ))}
        </div>

        {/* filter */}
        <div>
          <div className="flex items-baseline justify-between">
            <p className="kicker">filter</p>
            <span className="font-mono text-[10px] text-stone-soft">{FILTERS.find((f) => f.id === filter)?.hint}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {FILTERS.map((f) => {
              const selected = filter === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onFilterChange(f.id)}
                  className={`rounded-lg border px-2 py-2.5 text-left transition ${
                    selected
                      ? 'border-espresso bg-espresso text-cream'
                      : 'border-line bg-milk text-stone hover:border-stone-soft'
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span className="text-[12px] font-medium">{f.label}</span>
                    {selected && <Check size={12} />}
                  </span>
                  <span className={`mt-1 block font-mono text-[9px] ${selected ? 'text-cream/55' : 'text-stone-soft'}`}>
                    {f.hint}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* caption + tanggal + warna kertas */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="caption" className="kicker">
              caption
            </label>
            <input
              id="caption"
              value={caption}
              onChange={(e) => onCaptionChange(e.target.value.slice(0, 40))}
              placeholder="nama kalian / satu kalimat"
              className="field mt-2"
              maxLength={40}
            />
            <p className="mt-1.5 text-right font-mono text-[9px] text-stone-soft">{caption.length}/40</p>
          </div>

          <div>
            <p className="kicker">kertas</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {SWATCHES.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => onBackgroundChange(color)}
                  aria-label={`Warna kertas ${color}`}
                  className={`h-9 w-9 rounded-md border transition ${
                    background.toLowerCase() === color.toLowerCase()
                      ? 'border-espresso ring-2 ring-honey/60 ring-offset-2 ring-offset-cream'
                      : 'border-line-strong hover:border-stone-soft'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-[12.5px] text-stone">
              <input
                type="checkbox"
                checked={showDate}
                onChange={(e) => onShowDateChange(e.target.checked)}
                className="h-4 w-4 rounded border-line-strong accent-espresso"
              />
              Cetak tanggal <span className="font-mono text-[10px] text-stone-soft">{stamp}</span>
            </label>
          </div>
        </div>

        {children}

        <button
          type="button"
          onClick={onRestart}
          className="mr-auto font-mono text-[10px] uppercase tracking-[0.14em] text-stone-soft underline decoration-line-strong underline-offset-4 transition hover:text-espresso"
        >
          ulang sesi dari awal
        </button>
      </div>
    </div>
  )
}
