interface Props {
  values: number[]
  width?: number
  height?: number
}

export default function MiniSparkline({ values, width = 64, height = 22 }: Props) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pad = 3
  const w = width - pad * 2
  const h = height - pad * 2
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * w
    const y = pad + h - ((v - min) / range) * h
    return { x, y }
  })
  const path = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const last = values[values.length - 1]
  const prev = values[values.length - 2] ?? last
  const dir = last > prev ? 'up' : last < prev ? 'down' : 'flat'
  const stroke =
    dir === 'up'
      ? 'var(--good)'
      : dir === 'down'
      ? 'var(--danger)'
      : 'var(--primary)'

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline points={path} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 2.5 : 1.6} fill={stroke} />
      ))}
    </svg>
  )
}
