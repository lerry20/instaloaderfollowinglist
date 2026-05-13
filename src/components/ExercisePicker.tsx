import { useEffect, useMemo, useState } from 'react'
import { db, type Exercise, type MuscleKey } from '../db/schema'
import { useAllExercises } from '../db/queries'
import { loadExtendedCatalog } from '../lib/extendedCatalog'

interface Props {
  title: string
  onClose: () => void
  onPick: (id: string) => void
}

const MUSCLE_FILTERS: { key: 'all' | MuscleKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'chest', label: 'Chest' },
  { key: 'lat', label: 'Back' },
  { key: 'frontDelt', label: 'Shoulders' },
  { key: 'bicep', label: 'Biceps' },
  { key: 'tricep', label: 'Triceps' },
  { key: 'quad', label: 'Quads' },
  { key: 'hamstring', label: 'Hamstrings' },
  { key: 'glute', label: 'Glutes' },
  { key: 'calf', label: 'Calves' },
  { key: 'core', label: 'Core' },
]

export default function ExercisePicker({ title, onClose, onPick }: Props) {
  const core = useAllExercises() ?? []
  const [q, setQ] = useState('')
  const [muscle, setMuscle] = useState<'all' | MuscleKey>('all')
  const [showExtended, setShowExtended] = useState(false)
  const [extended, setExtended] = useState<Exercise[] | null>(null)
  const [loadingExt, setLoadingExt] = useState(false)
  const [extError, setExtError] = useState<string | null>(null)

  useEffect(() => {
    if (!showExtended || extended) return
    setLoadingExt(true)
    setExtError(null)
    loadExtendedCatalog()
      .then((list) => setExtended(list))
      .catch((err) => setExtError(err.message ?? 'Failed to load extended catalog'))
      .finally(() => setLoadingExt(false))
  }, [showExtended, extended])

  const list = useMemo(() => {
    const all = showExtended ? [...core, ...(extended ?? [])] : core
    const seen = new Set<string>()
    const dedup = all.filter((e) => (seen.has(e.id) ? false : seen.add(e.id)))
    return dedup
      .filter((e) => (muscle === 'all' ? true : e.primaryMuscle === muscle || e.muscleHighlights.includes(muscle)))
      .filter(
        (e) =>
          e.name.toLowerCase().includes(q.toLowerCase()) ||
          e.primaryMuscle.toLowerCase().includes(q.toLowerCase()) ||
          e.equipment.toLowerCase().includes(q.toLowerCase()),
      )
      .slice(0, 80)
  }, [core, extended, q, muscle, showExtended])

  async function pick(ex: Exercise) {
    // Persist extended exercise into local db so plans + sessions can reference it.
    if (ex.source === 'extended') {
      const existing = await db.exercises.get(ex.id)
      if (!existing) await db.exercises.put(ex)
    }
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

        <div className="picker-source-row">
          <label className="ext-toggle">
            <input
              type="checkbox"
              checked={showExtended}
              onChange={(e) => setShowExtended(e.target.checked)}
            />
            <span>Include extended catalog (700+ exercises)</span>
          </label>
          {loadingExt ? <span className="muted small">Loading…</span> : null}
          {extError ? <span className="danger small">{extError}</span> : null}
        </div>

        <ul className="picker-list">
          {list.length === 0 ? (
            <li className="picker-empty">No matches. {showExtended ? 'Try a different muscle filter.' : 'Toggle extended catalog above.'}</li>
          ) : (
            list.map((e) => (
              <li key={e.id}>
                <button className="picker-row" onClick={() => pick(e)}>
                  <span className="picker-row-head">
                    <strong>{e.name}</strong>
                    {e.source === 'extended' ? <span className="ext-pill">Extended</span> : null}
                  </span>
                  <span className="muted small">
                    {e.primaryMuscle}
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
