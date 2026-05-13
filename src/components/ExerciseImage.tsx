import { useEffect, useState } from 'react'

interface Props {
  urls: string[]
  alt: string
  className?: string
}

export default function ExerciseImage({ urls, alt, className }: Props) {
  const [idx, setIdx] = useState(0)
  const [errored, setErrored] = useState(false)

  useEffect(() => {
    if (urls.length < 2) return
    const id = window.setInterval(() => setIdx((i) => (i + 1) % urls.length), 1100)
    return () => window.clearInterval(id)
  }, [urls])

  if (errored || urls.length === 0) {
    return (
      <div className={`exercise-image-fallback ${className ?? ''}`} aria-label={alt}>
        <span aria-hidden>🏋️</span>
      </div>
    )
  }

  return (
    <img
      className={`exercise-image ${className ?? ''}`}
      src={urls[idx]}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  )
}
