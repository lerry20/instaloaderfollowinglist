import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type PlanItem, type WorkoutDef } from '../db/schema'
import ExercisePicker from './ExercisePicker'
import { useLocalizedExercise } from '../lib/exercise'

interface Props {
  workout: WorkoutDef
  readOnly?: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  workoutIndex: number
  onPatch: (updates: Partial<WorkoutDef>) => void
  onRemove: () => void
  onDuplicate: () => void
  onMove: (dir: -1 | 1) => void
}

export default function WorkoutEditor({
  workout,
  readOnly = false,
  canMoveUp,
  canMoveDown,
  workoutIndex,
  onPatch,
  onRemove,
  onDuplicate,
  onMove,
}: Props) {
  const exercises = useLiveQuery(() => db.exercises.toArray(), []) ?? []
  const exById = new Map(exercises.map((e) => [e.id, e]))
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

  const isEmpty = workout.items.length === 0
  // Empty workouts open so the "+ Add first exercise" CTA is visible.
  // Filled workouts collapse to summary — you tap the row to edit.
  const [open, setOpen] = useState(isEmpty)
  const totalSets = workout.items.reduce((a, it) => a + it.targetSets, 0)
  const minEstimate = totalSets > 0 ? Math.max(30, Math.round(totalSets * 3 + 10)) : null

  return (
    <section className={`workout-edit-v2${open ? ' open' : ''}`}>
      <header className="workout-edit-v2-head">
        <button
          type="button"
          className="workout-edit-v2-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Collapse this day' : 'Expand this day'}
        >
          {open ? '−' : '+'}
        </button>
        <span className="day-tag">Day {workoutIndex + 1}</span>
        <input
          type="text"
          className="workout-edit-v2-name"
          value={workout.name}
          placeholder="e.g. Push, Heavy Day, Monday"
          disabled={readOnly}
          onChange={(e) => onPatch({ name: e.target.value })}
          onClick={(e) => e.stopPropagation()}
        />
        {!open ? (
          <span className="workout-edit-v2-summary-meta">
            {workout.items.length} {workout.items.length === 1 ? 'lift' : 'lifts'}
            {minEstimate ? ` · ~${minEstimate} min` : ''}
          </span>
        ) : null}
        {!readOnly ? (
          <div className="workout-edit-v2-controls" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="icon-btn-mini"
              onClick={() => onMove(-1)}
              disabled={!canMoveUp}
              aria-label="Move day up"
              title="Move up"
            >↑</button>
            <button
              type="button"
              className="icon-btn-mini"
              onClick={() => onMove(1)}
              disabled={!canMoveDown}
              aria-label="Move day down"
              title="Move down"
            >↓</button>
            <button
              type="button"
              className="icon-btn-mini"
              onClick={onDuplicate}
              aria-label="Duplicate day"
              title="Duplicate"
            >⎘</button>
            <button
              type="button"
              className="icon-btn-mini danger"
              onClick={onRemove}
              aria-label="Remove day"
              title="Remove"
            >✕</button>
          </div>
        ) : null}
      </header>

      {open ? (
      <>
      {isEmpty ? (
        !readOnly ? (
          <button
            type="button"
            className="workout-empty-cta"
            onClick={() => setAdding(true)}
          >
            <span className="workout-empty-cta-plus">+</span>
            <span>
              <strong>Add the first exercise</strong>
              <span className="muted small">
                Pick from the catalog or your recents
              </span>
            </span>
          </button>
        ) : (
          <p className="muted small">No exercises yet.</p>
        )
      ) : (
        <ul className="workout-items-v2">
          {workout.items.map((item, idx) => (
            <ItemRow
              key={idx}
              item={item}
              idx={idx}
              total={workout.items.length}
              readOnly={readOnly}
              exName={exById.get(item.exerciseId)?.name ?? item.exerciseId}
              exFullObj={exById.get(item.exerciseId)}
              onUpdate={(p) => updateItem(idx, p)}
              onRemove={() => removeItem(idx)}
              onMove={(d) => moveItem(idx, d)}
            />
          ))}
        </ul>
      )}

      {!readOnly && !isEmpty ? (
        <button
          type="button"
          className="btn small workout-add-more"
          onClick={() => setAdding(true)}
        >
          + Add another exercise
        </button>
      ) : null}
      </>
      ) : null}

      {adding ? (
        <ExercisePicker
          title={`Add to ${workout.name || `Day ${workoutIndex + 1}`}`}
          onClose={() => setAdding(false)}
          onPick={(id) => {
            onPatch({
              items: [
                ...workout.items,
                { exerciseId: id, targetSets: 3, targetReps: '8–10', targetRPE: 8 },
              ],
            })
            setAdding(false)
            setOpen(true)
          }}
        />
      ) : null}
    </section>
  )
}

function ItemRow({
  item,
  idx,
  total,
  readOnly,
  exName,
  exFullObj,
  onUpdate,
  onRemove,
  onMove,
}: {
  item: PlanItem
  idx: number
  total: number
  readOnly: boolean
  exName: string
  exFullObj: Parameters<typeof useLocalizedExercise>[0]
  onUpdate: (p: Partial<PlanItem>) => void
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
}) {
  const local = useLocalizedExercise(exFullObj)
  return (
    <li className="workout-item-v2">
      <div className="workout-item-v2-head">
        <strong className="workout-item-v2-name">{local?.name ?? exName}</strong>
        {!readOnly ? (
          <div className="workout-item-v2-controls">
            <button
              type="button"
              className="icon-btn-mini"
              onClick={() => onMove(-1)}
              disabled={idx === 0}
              aria-label="Move up"
              title="Move up"
            >↑</button>
            <button
              type="button"
              className="icon-btn-mini"
              onClick={() => onMove(1)}
              disabled={idx === total - 1}
              aria-label="Move down"
              title="Move down"
            >↓</button>
            <button
              type="button"
              className="icon-btn-mini danger"
              onClick={onRemove}
              aria-label="Remove exercise"
              title="Remove"
            >✕</button>
          </div>
        ) : null}
      </div>
      <div className="workout-item-v2-fields">
        <label>
          <span>Sets</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={10}
            disabled={readOnly}
            value={item.targetSets}
            onChange={(e) => onUpdate({ targetSets: Number(e.target.value) || 1 })}
          />
        </label>
        <label>
          <span>Reps</span>
          <input
            type="text"
            disabled={readOnly}
            value={item.targetReps}
            placeholder="e.g. 8-10"
            onChange={(e) => onUpdate({ targetReps: e.target.value })}
          />
        </label>
        <label>
          <span>RPE</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            min={1}
            max={10}
            disabled={readOnly}
            value={item.targetRPE}
            onChange={(e) => onUpdate({ targetRPE: Number(e.target.value) || 8 })}
          />
        </label>
      </div>
    </li>
  )
}
