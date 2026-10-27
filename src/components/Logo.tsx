/**
 * Logo maybee — "Honey Cell".
 *
 * Mark dan wordmark sengaja dipisah: mark bisa berdiri sendiri sebagai
 * favicon/app icon, wordmark bisa jadi teks biasa di body copy. Ukuran
 * mark dipatok 1em biar selalu sejajar optis dengan teks di sebelahnya.
 *
 * Geometri identik dengan scripts/generate_logo.py (viewBox 36, sel 14,
 * gap 4, stroke 2.2, radius 3.2) — kalau salah satu diubah, ubah dua-duanya.
 */
interface LogoProps {
  className?: string
  /** Tinggi mark dalam em. Default 1.15 supaya optis seimbang dgn x-height serif. */
  markSize?: number
  /** 'ink' untuk latar terang, 'cream' untuk latar tinta. */
  tone?: 'ink' | 'cream'
  /** Sembunyikan wordmark, cuma mark. */
  markOnly?: boolean
  /** Jarak mark ke wordmark (em). */
  gap?: number
}

const GEOMETRY = {
  view: 36,
  cell: 14,
  gap: 4,
  origin: 2,
  stroke: 2.2,
  radius: 3.2,
}

export function Logo({
  className = '',
  markSize = 1.15,
  tone = 'ink',
  markOnly = false,
  gap = 0.42,
}: LogoProps) {
  const ink = tone === 'cream' ? '#FBF9F5' : '#1C1917'

  return (
    <span className={`inline-flex items-center ${className}`} style={{ gap: `${gap}em` }}>
      <DiamondMark size={markSize} ink={ink} />
      {!markOnly && (
        <span className="font-serif leading-none tracking-[-0.012em]">
          maybee
          <span
            aria-hidden
            className="ml-[0.1em] inline-block rounded-full bg-honey align-baseline"
            style={{ width: '0.17em', height: '0.17em', transform: 'translateY(-0.52em)' }}
          />
        </span>
      )}
    </span>
  )
}

/**
 * Mark "Honey Cell": tiga sel bergaris + satu sel madu solid.
 * Digambar sebagai path eksplisit, bukan div bertumpuk, supaya ketebalan
 * garis tetap konsisten di semua ukuran dan nggak ikut terpengaruh
 * box-sizing atau border-radius browser.
 */
export function DiamondMark({ size = 1.15, ink = '#1C1917' }: { size?: number; ink?: string }) {
  const { view, cell, gap, origin, stroke, radius } = GEOMETRY
  const inset = stroke / 2
  const inner = cell - stroke
  const col2 = origin + cell + gap
  const cells: Array<[number, number]> = [
    [origin, origin],
    [col2, origin],
    [origin, col2],
  ]
  const honeyAt: [number, number] = [col2, col2]

  return (
    <svg
      viewBox={`0 0 ${view} ${view}`}
      aria-hidden
      focusable="false"
      className="shrink-0"
      style={{ width: `${size}em`, height: `${size}em` }}
    >
      {cells.map(([x, y]) => (
        <rect
          key={`${x}-${y}`}
          x={x + inset}
          y={y + inset}
          width={inner}
          height={inner}
          rx={radius}
          fill="none"
          stroke={ink}
          strokeWidth={stroke}
        />
      ))}
      <rect
        x={honeyAt[0]}
        y={honeyAt[1]}
        width={cell}
        height={cell}
        rx={radius}
        fill="#FBBF24"
      />
    </svg>
  )
}
