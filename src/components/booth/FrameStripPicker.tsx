import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronDown, LayoutGrid } from 'lucide-react'
import { frames } from '../../data/frames'
import { FrameTrip } from '../FrameTrip'

export function FrameStripPicker({ frameId }: { frameId: string }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn btn-quiet !py-2 !text-[11px]"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <LayoutGrid size={14} />
        <span className="hidden sm:inline">ganti bingkai</span>
        <ChevronDown size={13} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[292px] overflow-hidden rounded-xl border border-line bg-milk shadow-[0_24px_60px_-24px_rgba(28,25,23,0.35)]">
          <p className="border-b border-line px-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-stone-soft">
            pilih bingkai
          </p>
          <ul role="listbox" className="max-h-[70vh] overflow-y-auto p-1.5">
            {frames.map((f) => {
              const selected = f.id === frameId
              return (
                <li key={f.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      setOpen(false)
                      navigate(`/booth?frame=${f.id}`)
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition ${
                      selected ? 'bg-butter/60' : 'hover:bg-cream'
                    }`}
                  >
                    <span className="h-12 w-9 shrink-0 overflow-hidden rounded-[2px] bg-cream ring-1 ring-line">
                      <FrameTrip frame={f} width={120} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] text-espresso">{f.title}</span>
                      <span className="block font-mono text-[9px] uppercase tracking-[0.1em] text-stone-soft">
                        {f.categoryLabel} · {f.photoCount}×
                      </span>
                    </span>
                    {selected && <Check size={13} className="shrink-0 text-espresso" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
