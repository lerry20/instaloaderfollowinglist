import { useEffect, useRef, useState } from 'react'
import type { PlanItem, Units } from '../db/schema'
import SessionExerciseCard from './SessionExerciseCard'

interface Props {
  items: PlanItem[]
  sessionId: number
  units: Units
  onSwap: (oldId: string, newId: string) => void | Promise<void>
  onSkip: (exerciseId: string) => void | Promise<void>
  onFocus: (kg: number | null) => void
  workingLogsByExercise: Record<string, number>
}

export default function SessionPager({
  items,
  sessionId,
  units,
  onSwap,
  onSkip,
  onFocus,
  workingLogsByExercise,
}: Props) {
  const pagerRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)

  // Track which page is currently most-visible via IntersectionObserver.
  useEffect(() => {
    const container = pagerRef.current
    if (!container) return
    const pages = Array.from(container.querySelectorAll<HTMLElement>('.session-page'))
    if (pages.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the most-visible page.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!visible) return
        const idx = pages.indexOf(visible.target as HTMLElement)
        if (idx >= 0) setActiveIdx(idx)
      },
      { root: container, threshold: [0.4, 0.6, 0.85] },
    )
    pages.forEach((p) => observer.observe(p))
    return () => observer.disconnect()
  }, [items.length, items.map((i) => i.exerciseId).join(',')])

  function goTo(i: number, smooth = true) {
    const container = pagerRef.current
    if (!container) return
    const target = Math.max(0, Math.min(items.length - 1, i))
    const page = container.querySelectorAll<HTMLElement>('.session-page')[target]
    if (!page) return
    page.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', inline: 'start', block: 'nearest' })
  }

  if (items.length === 0) return null

  return (
    <div className="pager-shell">
      <div className="pager-dots" role="tablist" aria-label="Workout exercises">
        {items.map((it, i) => {
          const exId = it.exerciseId
          const workedSets = workingLogsByExercise[exId] ?? 0
          const targetSets = it.targetSets
          const done = workedSets >= targetSets
          return (
            <button
              key={exId}
              role="tab"
              aria-selected={i === activeIdx}
              className={`page-dot${i === activeIdx ? ' active' : ''}${done ? ' done' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Exercise ${i + 1} of ${items.length}`}
            />
          )
        })}
      </div>

      <div className="session-pager" ref={pagerRef}>
        {items.map((item, idx) => (
          <div key={item.exerciseId} className="session-page" data-page-index={idx}>
            <SessionExerciseCard
              item={item}
              sessionId={sessionId}
              units={units}
              positionIndex={idx}
              totalExercises={items.length}
              onSwap={(newId) => onSwap(item.exerciseId, newId)}
              onSkip={() => onSkip(item.exerciseId)}
              onFocus={onFocus}
              onAdvance={() => goTo(idx + 1)}
            />
          </div>
        ))}
      </div>

      <div className="pager-nav">
        <button
          className="btn ghost small pager-nav-btn"
          onClick={() => goTo(activeIdx - 1)}
          disabled={activeIdx === 0}
        >
          ◀ Prev
        </button>
        <span className="pager-nav-label muted small">
          {activeIdx + 1} / {items.length}
        </span>
        <button
          className="btn small pager-nav-btn"
          onClick={() => goTo(activeIdx + 1)}
          disabled={activeIdx >= items.length - 1}
        >
          Next ▶
        </button>
      </div>
    </div>
  )
}
