interface Props {
  rows?: number
  height?: number
  width?: string
  className?: string
}

export default function Skeleton({ rows = 3, height = 18, width = '100%', className }: Props) {
  return (
    <div className={`skeleton-stack ${className ?? ''}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="skeleton-bar"
          style={{ height, width: i === rows - 1 ? '60%' : width }}
        />
      ))}
    </div>
  )
}
