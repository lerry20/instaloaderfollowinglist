import { useEffect, useMemo, useState } from 'react'
import { db, MUSCLE_LABEL, type Exercise, type MuscleKey } from '../db/schema'
import { useAllExercises, useSettings } from '../db/queries'
import { loadFullCatalog } from '../lib/extendedCatalog'
import { useLocalizedExercise } from '../lib/exercise'
import { canDoExercise } from '../lib/equipment'

interface Props {
  title: string
  onClose: () => void
  onPick: (id: string) => void
  initialMuscle?: MuscleKey
  initialEquipment?: string
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

const EQUIPMENT_FILTERS: { key: 'all' | string; label: string }[] = [
  { key: 'all', label: 'Any' },
  { key: 'barbell', label: 'Barbell' },
  { key: 'dumbbell', label: 'Dumbbell' },
  { key: 'cable', label: 'Cable' },
  { key: 'machine', label: 'Machine' },
  { key: 'body', label: 'Bodyweight' },
]

const RECENTS_KEY = 'bulklog:recentExercises'
const MAX_RECENTS = 8

function loadRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as string[]
  } catch {
    return []
  }
}

function saveRecents(ids: string[]) {
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(ids.slice(0, MAX_RECENTS)))
  } catch {
    // ignore
  }
}

function equipmentMatches(eq: string, filter: string) {
  const e = eq.toLowerCase()
  if (filter === 'all') return true
  if (filter === 'body') return e.includes('body') || e === '—' || e.includes('bodyweight')
  return e.includes(filter)
}

export default function ExercisePicker({
  title,
  onClose,
  onPick,
  initialMuscle,
  initialEquipment,
}: Props) {
  const settings = useSettings()
  const availableEquipment = settings?.availableEquipment
  const curated = useAllExercises() ?? []
  const [q, setQ] = useState('')
  const [muscle, setMuscle] = useState<'all' | MuscleKey>(initialMuscle ?? 'all')
  const [equipment, setEquipment] = useState<string>(initialEquipment ?? 'all')
  const [extra, setExtra] = useState<Exercise[]>([])
  const [loadingExtra, setLoadingExtra] = useState(true)
  const [extraError, setExtraError] = useState<string | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  const [recents, setRecents] = useState<string[]>(() => loadRecents())

  useEffect(() => {
    loadFullCatalog()
      .then((list) => setExtra(list))
      .catch((err) => setExtraError(err.message ?? 'Failed to load full catalog'))
      .finally(() => setLoadingExtra(false))
  }, [])

  const allExercises = useMemo(() => {
    const seen = new Set<string>()
    const merged: Exercise[] = []
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
  }, [curated, extra])

  const recentExercises = useMemo(() => {
    return recents
      .map((id) => allExercises.find((e) => e.id === id))
      .filter((e): e is Exercise => !!e)
  }, [recents, allExercises])

  const filteredList = useMemo(() => {
    let list = allExercises
    // Hard filter against the user's available equipment (Settings).
    // undefined = "have everything" — no filtering.
    if (availableEquipment !== undefined) {
      list = list.filter((e) => canDoExercise(e, availableEquipment))
    }
    if (muscle !== 'all') {
      list = list.filter(
        (e) => e.primaryMuscle === muscle || e.secondaryMuscles.includes(muscle as MuscleKey),
      )
    }
    if (equipment !== 'all') {
      list = list.filter((e) => equipmentMatches(e.equipment, equipment))
    }
    if (q) {
      const ql = q.toLowerCase()
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(ql) ||
          e.primaryMuscle.toLowerCase().includes(ql) ||
          e.equipment.toLowerCase().includes(ql),
      )
    }
    return list
  }, [allExercises, q, muscle, equipment, availableEquipment])

  const visible = filteredList.slice(0, 200)
  const truncated = filteredList.length > 200

  async function pick(ex: Exercise) {
    const existing = await db.exercises.get(ex.id)
    if (!existing) await db.exercises.put(ex)
    const next = [ex.id, ...recents.filter((id) => id !== ex.id)].slice(0, MAX_RECENTS)
    setRecents(next)
    saveRecents(next)
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

        <details className="picker-filter-details" open={!q}>
          <summary>
            Filters{' '}
            <span className="muted small">
              {muscle !== 'all' || equipment !== 'all'
                ? `· ${[muscle !== 'all' ? MUSCLE_LABEL[muscle as MuscleKey] : '', equipment !== 'all' ? equipment : '']
                    .filter(Boolean)
                    .join(', ')}`
                : ''}
            </span>
          </summary>
          <div className="filter-block">
            <span className="muted small">Muscle group</span>
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
          </div>
          <div className="filter-block">
            <span className="muted small">Equipment</span>
            <div className="muscle-filters">
              {EQUIPMENT_FILTERS.map((f) => (
                <button
                  key={f.key}
                  className={`chip${equipment === f.key ? ' active' : ''}`}
                  onClick={() => setEquipment(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </details>

        {loadingExtra ? (
          <p className="muted small">Loading full catalog…</p>
        ) : extraError ? (
          <p className="muted small">Offline: only the curated 25 are available.</p>
        ) : null}

        {recentExercises.length > 0 && !q ? (
          <div className="recents-block">
            <span className="muted small recents-label">Recent</span>
            <ul className="recents-row">
              {recentExercises.map((e) => (
                <li key={e.id}>
                  <button className="chip" onClick={() => pick(e)}>
                    <ExerciseLocalizedName ex={e} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <ul className="picker-list">
          {visible.length === 0 ? (
            <li className="picker-empty">No matches.</li>
          ) : (
            visible.map((e) => (
              <li key={e.id}>
                <button className="picker-row" onClick={() => pick(e)}>
                  <span className="picker-row-head">
                    <strong><ExerciseLocalizedName ex={e} /></strong>
                    {e.isCurated ? (
                      <span
                        className="curated-pill"
                        onClick={(ev) => {
                          ev.stopPropagation()
                          ev.preventDefault()
                          setShowInfo(true)
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        ★ Core
                      </span>
                    ) : null}
                  </span>
                  <span className="muted small">
                    {MUSCLE_LABEL[e.primaryMuscle]}
                    <ExerciseLocalizedEquipment ex={e} />
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>

        {truncated ? (
          <p className="muted small">Showing top 200 — refine search to narrow down.</p>
        ) : null}

        {showInfo ? (
          <div className="modal-backdrop nested" onClick={() => setShowInfo(false)}>
            <div className="modal small-modal" onClick={(e) => e.stopPropagation()}>
              <header className="modal-head">
                <h3>★ Core exercises</h3>
                <button className="link" onClick={() => setShowInfo(false)}>Close</button>
              </header>
              <p>
                The 25 ★ Core lifts are the curated set with hand-written technique cues and
                bulking-specific tips. Everything else comes from the open free-exercise-db
                catalog with generic instructions.
              </p>
              <p className="muted small">
                When picking an exercise, both kinds work identically — Core just gets richer
                content on its detail page.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function ExerciseLocalizedName({ ex }: { ex: Exercise }) {
  const local = useLocalizedExercise(ex)
  return <>{local?.name ?? ex.name}</>
}

function ExerciseLocalizedEquipment({ ex }: { ex: Exercise }) {
  const local = useLocalizedExercise(ex)
  const eq = local?.equipment ?? ex.equipment
  return <>{eq && eq !== '—' ? ` · ${eq}` : ''}</>
}
