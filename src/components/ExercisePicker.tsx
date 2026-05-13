import { useEffect, useMemo, useState } from 'react'
import { db, MUSCLE_LABEL, type Exercise, type MuscleKey } from '../db/schema'
import { useAllExercises } from '../db/queries'
import { loadFullCatalog } from '../lib/extendedCatalog'

interface Props {
  title: string
  onClose: () => void
  onPick: (id: string) => void
}

const MUSCLE_FILTERS: { key: 'all' | MuscleKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'chest', label: MUSCLE_LABEL.chest },
  { key: 'lat', label: 'Back' },
  { key: 'frontDelt', label: 'Shoulders' },
  { key: 'bicep', label: MUSCLE_LABEL.bicep },
  { key: 'tricep', label: MUSCLE_LABEL.tricep },
  { key: 'quad', label: MUSCLE_LABEL.quad },
  { key: 'hamstring', label: MUSCLE_LABEL.hamstring },
  { key: 'glute', label: MUSCLE_LABEL.glute },
  { key: 'calf', label: MUSCLE_LABEL.calf },
  { key: 'core', label: MUSCLE_LABEL.core },
]

export default function ExercisePicker({ title, onClose, onPick }: Props) {
  const curated = useAllExercises() ?? []
  const [q, setQ] = useState('')
  const [muscle, setMuscle] = useState<'all' | MuscleKey>('all')
  const [extra, setExtra] = useState<Exercise[]>([])
  const [loadingExtra, setLoadingExtra] = useState(true)
  const [extraError, setExtraError] = useState<string | null>(null)

  useEffect(() => {
    loadFullCatalog()
      .then((list) => setExtra(list))
      .catch((err) => setExtraError(err.message ?? 'Failed to load full catalog'))
      .finally(() => setLoadingExtra(false))
  }, [])

  const list = useMemo(() => {
    const seen = new Set<string>()
    const merged: Exercise[] = []
    // Curated rise to the top (and override duplicates).
    for (const e of curated) {
      if (!seen.has(e.id)) {
        merged.push(e)
        seen.add(e.id)
      }
    }
    for (const e of extra) {
      if (!seen.has(e.id) && !curated.some((c) => c.name.toLowerCase() === e.name.toLowerCase())) {
        merged.push(e)
        seen.add(e.id)
      }
    }
    return merged
      .filter((e) =>
        muscle === 'all'
          ? true
          : e.primaryMuscle === muscle || e.secondaryMuscles.includes(muscle),
      )
      .filter((e) => {
        if (!q) return true
        const ql = q.toLowerCase()
        return (
          e.name.toLowerCase().includes(ql) ||
          e.primaryMuscle.toLowerCase().includes(ql) ||
          e.equipment.toLowerCase().includes(ql)
        )
      })
      .slice(0, 100)
  }, [curated, extra, q, muscle])

  async function pick(ex: Exercise) {
    // Persist non-curated picks so plans + sessions can reference them.
    const existing = await db.exercises.get(ex.id)
    if (!existing) await db.exercises.put(ex)
    onPick(ex.id)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <h3>{title}</h3>
          <button className="link" onClick={onClose}>Cancel</button>
        </header>

        <input
          autoFocus
          type="search"
          placeholder="Search exercise, muscle, equipment…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="picker-search"
        />

        <div className="muscle-filters">
          {MUSCLE_FILTERS.map((f) => (
            <button
              key={f.key}
              className={`chip${muscle === f.key ? ' active' : ''}`}
              onClick={() => setMuscle(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loadingExtra ? (
          <p className="muted small">Loading full catalog…</p>
        ) : extraError ? (
          <p className="muted small">Offline: only the curated 25 are available.</p>
        ) : null}

        <ul className="picker-list">
          {list.length === 0 ? (
            <li className="picker-empty">No matches.</li>
          ) : (
            list.map((e) => (
              <li key={e.id}>
                <button className="picker-row" onClick={() => pick(e)}>
                  <span className="picker-row-head">
                    <strong>{e.name}</strong>
                    {e.isCurated ? <span className="curated-pill">★ Core</span> : null}
                  </span>
                  <span className="muted small">
                    {MUSCLE_LABEL[e.primaryMuscle]}
                    {e.equipment && e.equipment !== '—' ? ` · ${e.equipment}` : ''}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
