interface WordmarkProps {
  className?: string
  size?: number
}

export function Wordmark({ className = '', size }: WordmarkProps) {
  return (
    <span
      className={`font-serif leading-none tracking-[-0.01em] ${className}`}
      style={size ? { fontSize: size } : undefined}
    >
      maybee<span className="ml-[0.12em] inline-block h-[0.18em] w-[0.18em] translate-y-[-0.55em] rounded-full bg-honey align-baseline" />
    </span>
  )
}
