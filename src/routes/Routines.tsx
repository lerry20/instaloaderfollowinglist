import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  db,
  type PlanItem,
  type Routine,
  type WorkoutDef,
} from '../db/schema'
import { useActiveRoutine, useAllRoutines, useSettings } from '../db/queries'
import ExercisePicker from '../components/ExercisePicker'
import ActiveRoutineCard from '../components/ActiveRoutineCard'
import NewRoutineModal from '../components/NewRoutineModal'
import RoutinePicker from '../components/RoutinePicker'
import { toast } from '../state/toasts'
import { useT } from '../i18n'

export default function Routines() {
  const t = useT()
  const navigate = useNavigate()
  const routines = useAllRoutines()
  const active = useActiveRoutine()
  const settings = useSettings()
  const [editing, setEditing] = useState<Routine | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  if (!routines || !settings) return <div className="page"><p className="muted">{t('common.loading')}</p></div>

  async function activate(id: string) {
    if (!settings) return
    const r = routines?.find((x) => x.id === id)
    await db.settings.put({ ...settings, activeRoutineId: id })
    toast(`Activated: ${r?.name ?? id}`, { kind: 'success' })
  }

  async function clone(r: Routine) {
    const id = `custom-${Date.now()}`
    const dup: Routine = {
      ...r,
      id,
      name: `${r.name} (copy)`,
      builtIn: false,
    }
    await db.routines.put(dup)
    await activate(id)
    setEditing(dup)
  }

  async function deleteRoutine(r: Routine) {
    if (r.builtIn) return
    if (!confirm(`Delete "${r.name}"? This cannot be undone.`)) return
    await db.routines.delete(r.id)
    if (active?.id === r.id) {
      const fallback = routines?.find((x) => x.id !== r.id)
      if (fallback) await activate(fallback.id)
    }
    toast('Routine deleted', { kind: 'warn' })
  }

  const otherRoutines = routines.filter((r) => r.id !== active?.id)

  return (
    <div className="page">
      <h1 className="big-title">{t('nav.routines')}</h1>

      {active ? (
        <>
          <h4>{t('routines.your_program')}</h4>
          <ActiveRoutineCard
            routine={active}
            onSwitch={() => setShowAll(true)}
            onEdit={() => setEditing(active)}
          />
        </>
      ) : null}

      <div className="row" style={{ marginTop: 'var(--space-3)' }}>
        <button className="btn primary" onClick={() => setShowPicker(true)}>
          {t('routines.find_program')}
        </button>
        <button className="btn" onClick={() => setShowNew(true)}>
          + {t('routines.new_program')}
        </button>
      </div>

      <div className="section-head" style={{ marginTop: 'var(--space-5)' }}>
        <h4>{t('routines.all_programs')}</h4>
        {otherRoutines.length > 3 ? (
          <button className="link small" onClick={() => setShowAll((v) => !v)}>
            {showAll ? '−' : `+ ${otherRoutines.length - 3}`}
          </button>
        ) : null}
      </div>

      <div className="routine-list">
        {(showAll ? otherRoutines : otherRoutines.slice(0, 3)).map((r) => (
          <RoutineCardV2
            key={r.id}
            routine={r}
            isActive={active?.id === r.id}
            onActivate={() => activate(r.id)}
            onPreview={() => navigate(`/routines/${r.id}`)}
            onClone={() => clone(r)}
            onEdit={() => setEditing(r)}
            onDelete={() => deleteRoutine(r)}
          />
        ))}
      </div>

      <details className="glossary-card" style={{ marginTop: 'var(--space-4)' }}>
        <summary>What do <strong>RPE</strong>, <strong>RIR</strong>, and <strong>AMRAP</strong> mean?</summary>
        <ul className="glossary-list">
          <li><strong>RPE 7</strong> — effort 7 out of 10. About <em>3 reps short of failure</em>.</li>
          <li><strong>RPE 8</strong> — about <em>2 reps short of failure</em>. The sweet spot for most sets.</li>
          <li><strong>RPE 9</strong> — about <em>1 rep short of failure</em>. For your last set or two.</li>
          <li><strong>RPE 10</strong> — total failure. Save for occasional finishers.</li>
          <li><strong>RIR</strong> — same idea, reverse number. "RIR 2" = 2 reps in reserve = RPE 8.</li>
          <li><strong>AMRAP</strong> — "as many reps as possible." Do as many clean reps as you can.</li>
          <li><strong>PR</strong> — personal record. A new heaviest weight or rep total for that lift.</li>
        </ul>
      </details>

      {editing ? (
        <RoutineEditor
          routine={editing}
          onClose={() => setEditing(null)}
          onClone={async () => {
            await clone(editing)
            setEditing(null)
          }}
        />
      ) : null}

      {showNew ? (
        <NewRoutineModal
          onClose={() => setShowNew(false)}
          onCreated={async (r) => {
            setShowNew(false)
            await activate(r.id)
            setEditing(r)
          }}
        />
      ) : null}

      {showPicker ? <RoutinePicker onClose={() => setShowPicker(false)} /> : null}
    </div>
  )
}

interface RoutineCardV2Props {
  routine: Routine
  isActive: boolean
  onActivate: () => void
  onPreview: () => void
  onClone: () => void
  onEdit: () => void
  onDelete: () => void
}

function RoutineCardV2({ routine, isActive, onActivate, onPreview, onClone, onEdit, onDelete }: RoutineCardV2Props) {
  const t = useT()
  const days = routine.daysPerWeek ?? routine.workouts.length
  const sched = buildScheduleStrip(days)
  // Rough estimate: total working sets across all workouts × 3 min per set.
  // Falls back to a generic ~60min when items are empty.
  const totalSets = routine.workouts.reduce(
    (acc, w) => acc + w.items.reduce((a, i) => a + i.targetSets, 0),
    0,
  )
  const minPerSession = routine.workouts.length > 0
    ? Math.max(30, Math.round((totalSets / routine.workouts.length) * 3 + 10))
    : 60

  return (
    <article className={`routine-card-v2${isActive ? ' active' : ''}`}>
      <header className="routine-card-v2-head">
        <div>
          <h3>{routine.name}</h3>
          {routine.level ? (
            <span className="routine-card-v2-meta">
              {t(`routines.level_${routine.level}` as 'routines.level_beginner')}
            </span>
          ) : null}
        </div>
      </header>

      <div className="routine-card-v2-stats">
        <span>{t('routines.days_per_week', { n: days })}</span>
        <span className="dot">·</span>
        <span>{t('routines.min_per_session', { n: minPerSession })}</span>
      </div>

      <ul className="routine-card-v2-schedule" aria-label="Weekly schedule">
        {sched.map((s, i) => (
          <li key={i} className={`sched-day${s.train ? ' train' : ''}`}>
            <span className="sched-day-letter">{s.letter}</span>
            <span className="sched-day-code">{s.code}</span>
          </li>
        ))}
      </ul>

      <p className="routine-card-v2-description">{routine.description}</p>

      <div className="routine-card-v2-actions">
        {!isActive ? (
          <button className="btn primary small" onClick={onActivate}>{t('common.activate')}</button>
        ) : null}
        <button className="btn small" onClick={onPreview}>{t('routines.preview')}</button>
        {routine.builtIn ? (
          <button className="btn small ghost" onClick={onClone}>{t('routines.use_template')}</button>
        ) : (
          <>
            <button className="btn small" onClick={onEdit}>{t('common.edit')}</button>
            <button className="btn small danger" onClick={onDelete}>{t('common.delete')}</button>
          </>
        )}
      </div>
    </article>
  )
}

// Build a 7-day visual schedule (M T W T F S S) with train-day shading.
// Even distribution heuristic — close enough for the card, the user can
// pick actual days in the editor.
function buildScheduleStrip(daysPerWeek: number): { letter: string; code: string; train: boolean }[] {
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  // Common splits — hard-code which days are train days for clean visuals.
  const presets: Record<number, boolean[]> = {
    2: [true, false, false, true, false, false, false],
    3: [true, false, true, false, true, false, false],
    4: [true, true, false, true, true, false, false],
    5: [true, true, true, false, true, true, false],
    6: [true, true, true, false, true, true, true],
    7: [true, true, true, true, true, true, true],
  }
  const train = presets[daysPerWeek] ?? Array.from({ length: 7 }, (_, i) => i < daysPerWeek)
  return letters.map((l, i) => ({
    letter: l,
    code: train[i] ? '·' : '',
    train: train[i],
  }))
}

function RoutineEditor({
  routine: initial,
  onClose,
  onClone,
}: {
  routine: Routine
  onClose: () => void
  onClone: () => void
}) {
  // Subscribe to the live routine so edits made inside this modal show up
  // immediately (otherwise we hold a stale snapshot and "+ Add workout"
  // would silently appear to do nothing until reopen).
  const live = useLiveQuery(() => db.routines.get(initial.id), [initial.id])
  const routine = live ?? initial
  const isBuiltIn = routine.builtIn

  async function patch(updates: Partial<Routine>) {
    if (isBuiltIn) return
    await db.routines.put({ ...routine, ...updates })
    toast('Saved', { kind: 'success', duration: 1200 })
  }

  async function addWorkout() {
    if (isBuiltIn) return
    const id = `${routine.id}-w${Date.now()}`
    const workouts = [...routine.workouts, { id, name: `Day ${routine.workouts.length + 1}`, items: [] }]
    await patch({ workouts })
  }

  async function patchWorkout(wid: string, updates: Partial<WorkoutDef>) {
    if (isBuiltIn) return
    const workouts = routine.workouts.map((w) => (w.id === wid ? { ...w, ...updates } : w))
    await patch({ workouts })
  }

  async function removeWorkout(wid: string) {
    if (isBuiltIn) return
    if (!confirm('Remove this workout?')) return
    await patch({ workouts: routine.workouts.filter((w) => w.id !== wid) })
  }

  async function duplicateWorkout(wid: string) {
    if (isBuiltIn) return
    const src = routine.workouts.find((w) => w.id === wid)
    if (!src) return
    const newId = `${routine.id}-w${Date.now()}`
    const dup: WorkoutDef = {
      ...src,
      id: newId,
      name: `${src.name} (B)`,
    }
    const srcIdx = routine.workouts.findIndex((w) => w.id === wid)
    const workouts = [...routine.workouts]
    workouts.splice(srcIdx + 1, 0, dup)
    await patch({ workouts })
  }

  async function moveWorkout(wid: string, dir: -1 | 1) {
    if (isBuiltIn) return
    const idx = routine.workouts.findIndex((w) => w.id === wid)
    if (idx < 0) return
    const target = idx + dir
    if (target < 0 || target >= routine.workouts.length) return
    const workouts = [...routine.workouts]
    ;[workouts[idx], workouts[target]] = [workouts[target], workouts[idx]]
    await patch({ workouts })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal big" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <div>
            <h3>{routine.name}</h3>
            <span className="muted small">{isBuiltIn ? 'Built-in (read-only)' : 'Custom · auto-saves'}</span>
          </div>
          <button className="link" onClick={onClose}>Close</button>
        </header>

        {!isBuiltIn ? (
          <label className="field">
            <span>Name</span>
            <input
              type="text"
              value={routine.name}
              onChange={(e) => patch({ name: e.target.value })}
            />
          </label>
        ) : null}

        {!isBuiltIn ? (
          <label className="field">
            <span>Description</span>
            <textarea
              rows={2}
              value={routine.description}
              onChange={(e) => patch({ description: e.target.value })}
            />
          </label>
        ) : null}

        <div className="workout-edits">
          {routine.workouts.map((w) => (
            <WorkoutEditor
              key={w.id}
              workout={w}
              readOnly={isBuiltIn}
              canMoveUp={routine.workouts.indexOf(w) > 0}
              canMoveDown={routine.workouts.indexOf(w) < routine.workouts.length - 1}
              onPatch={(updates) => patchWorkout(w.id, updates)}
              onRemove={() => removeWorkout(w.id)}
              onDuplicate={() => duplicateWorkout(w.id)}
              onMove={(dir) => moveWorkout(w.id, dir)}
            />
          ))}
        </div>

        <div className="modal-foot">
          {isBuiltIn ? (
            <button className="btn primary block" onClick={onClone}>
              Clone to edit
            </button>
          ) : (
            <button className="btn block" onClick={addWorkout}>
              + Add workout
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function WorkoutEditor({
  workout,
  readOnly,
  canMoveUp,
  canMoveDown,
  onPatch,
  onRemove,
  onDuplicate,
  onMove,
}: {
  workout: WorkoutDef
  readOnly: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  onPatch: (updates: Partial<WorkoutDef>) => void
  onRemove: () => void
  onDuplicate: () => void
  onMove: (dir: -1 | 1) => void
}) {
  const exercises = useLiveQuery(() => db.exercises.toArray(), []) ?? []
  const [adding, setAdding] = useState(false)

  function updateItem(idx: number, patch: Partial<PlanItem>) {
    if (readOnly) return
    const items = workout.items.map((it, i) => (i === idx ? { ...it, ...patch } : it))
    onPatch({ items })
  }
  function removeItem(idx: number) {
    if (readOnly) return
    onPatch({ items: workout.items.filter((_, i) => i !== idx) })
  }
  function moveItem(idx: number, dir: -1 | 1) {
    if (readOnly) return
    const next = [...workout.items]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    onPatch({ items: next })
  }

  return (
    <div className="workout-edit">
      <div className="workout-edit-head">
        {readOnly ? (
          <h4>{workout.name}</h4>
        ) : (
          <input
            type="text"
            value={workout.name}
            placeholder="e.g. Push, Heavy Day, Monday"
            onChange={(e) => onPatch({ name: e.target.value })}
          />
        )}
        {!readOnly ? (
          <div className="row small-gap">
            <button className="link" onClick={() => onMove(-1)} disabled={!canMoveUp} aria-label="Move workout up">↑</button>
            <button className="link" onClick={() => onMove(1)} disabled={!canMoveDown} aria-label="Move workout down">↓</button>
            <button className="link" onClick={onDuplicate}>Duplicate</button>
            <button className="link danger" onClick={onRemove}>Remove</button>
          </div>
        ) : null}
      </div>
      <ul className="workout-items">
        {workout.items.map((it, idx) => {
          const ex = exercises.find((e) => e.id === it.exerciseId)
          return (
            <li key={idx} className="workout-item">
              <div className="workout-item-name">
                <strong>{ex?.name ?? it.exerciseId}</strong>
                {!readOnly ? (
                  <span className="row small-gap">
                    <button className="link" onClick={() => moveItem(idx, -1)} aria-label="Move up">↑</button>
                    <button className="link" onClick={() => moveItem(idx, 1)} aria-label="Move down">↓</button>
                    <button className="link danger" onClick={() => removeItem(idx)}>Remove</button>
                  </span>
                ) : null}
              </div>
              <div className="workout-item-fields">
                <label>
                  <span>Sets</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    disabled={readOnly}
                    value={it.targetSets}
                    onChange={(e) => updateItem(idx, { targetSets: Number(e.target.value) || 1 })}
                  />
                </label>
                <label>
                  <span>Reps</span>
                  <input
                    type="text"
                    disabled={readOnly}
                    value={it.targetReps}
                    onChange={(e) => updateItem(idx, { targetReps: e.target.value })}
                  />
                </label>
                <label>
                  <span>RPE</span>
                  <input
                    type="number"
                    step="0.5"
                    min={1}
                    max={10}
                    disabled={readOnly}
                    value={it.targetRPE}
                    onChange={(e) => updateItem(idx, { targetRPE: Number(e.target.value) || 8 })}
                  />
                </label>
              </div>
            </li>
          )
        })}
      </ul>
      {!readOnly ? (
        <button className="btn small" onClick={() => setAdding(true)}>+ Add exercise</button>
      ) : null}
      {adding ? (
        <ExercisePicker
          title={`Add to ${workout.name}`}
          onClose={() => setAdding(false)}
          onPick={(id) => {
            onPatch({
              items: [
                ...workout.items,
                { exerciseId: id, targetSets: 3, targetReps: '8–10', targetRPE: 8 },
              ],
            })
            setAdding(false)
          }}
        />
      ) : null}
    </div>
  )
}
