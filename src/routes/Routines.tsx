import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  db,
  type PlanItem,
  type Routine,
  type WorkoutDef,
} from '../db/schema'
import { useActiveRoutine, useAllRoutines, useSettings } from '../db/queries'
import ExercisePicker from '../components/ExercisePicker'
import { toast } from '../state/toasts'

export default function Routines() {
  const routines = useAllRoutines()
  const active = useActiveRoutine()
  const settings = useSettings()
  const [editing, setEditing] = useState<Routine | null>(null)

  if (!routines || !settings) return <div className="page"><p className="muted">Loading…</p></div>

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

  return (
    <div className="page">
      <h1 className="big-title">Routines</h1>
      <p className="muted small">Pick a routine to activate it. Tap any routine to view or edit.</p>

      <div className="routine-list">
        {routines.map((r) => (
          <article key={r.id} className={`routine-card${active?.id === r.id ? ' active' : ''}`}>
            <div className="routine-card-head">
              <div>
                <h3>{r.name}</h3>
                <span className="muted small">
                  {r.workouts.length} workouts
                  {r.builtIn ? ' · built-in' : ' · custom'}
                </span>
              </div>
              {active?.id === r.id ? <span className="badge good">Active</span> : null}
            </div>
            <p className="muted small">{r.description}</p>
            <ul className="routine-workouts">
              {r.workouts.map((w) => (
                <li key={w.id}>{w.name}</li>
              ))}
            </ul>
            <div className="row">
              {active?.id !== r.id ? (
                <button className="btn primary small" onClick={() => activate(r.id)}>
                  Activate
                </button>
              ) : null}
              <button className="btn small" onClick={() => setEditing(r)}>
                {r.builtIn ? 'Preview' : 'Edit'}
              </button>
              {r.builtIn ? (
                <button className="btn small ghost" onClick={() => clone(r)}>
                  Clone
                </button>
              ) : null}
              {!r.builtIn ? (
                <button className="btn small danger" onClick={() => deleteRoutine(r)}>
                  Delete
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <button
        className="btn block"
        onClick={async () => {
          const id = `custom-${Date.now()}`
          const r: Routine = {
            id,
            name: 'New routine',
            description: 'My custom routine.',
            builtIn: false,
            workouts: [{ id: `${id}-w1`, name: 'Workout 1', items: [] }],
          }
          await db.routines.put(r)
          setEditing(r)
          await activate(id)
        }}
      >
        + New custom routine
      </button>

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
    </div>
  )
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
    const workouts = [...routine.workouts, { id, name: `Workout ${routine.workouts.length + 1}`, items: [] }]
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
