import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type PlanItem, type WorkoutDef } from '../db/schema'
import ExercisePicker from './ExercisePicker'
import { useLocalizedExercise } from '../lib/exercise'
import { haptics } from '../lib/haptics'
import { useT } from '../i18n'

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

const exerciseCostMin = (sets: number) => sets * 3 + 2

/** One day inside the routine editor.
 *
 * Uses the same editorial collapsible pattern as the rest of the app
 * (eyebrow + display title + bare chevron, grid-template-rows height
 * animation) so a multi-day routine stays scannable: collapsed days
 * show their name + exercise count + minutes, only the one you're
 * editing expands. Tap any header to switch focus.
 *
 * Inline rename + per-day controls (move / duplicate / delete) live
 * inside the open drawer, so the trigger row stays a single
 * uncluttered button. */
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
  const t = useT()
  const exercises = useLiveQuery(() => db.exercises.toArray(), []) ?? []
  const exById = new Map(exercises.map((e) => [e.id, e]))
  const [adding, setAdding] = useState(false)

  // Default: only the first day is open. Multi-day routines no longer
  // unfurl all of their empty CTAs at once.
  const [open, setOpen] = useState(workoutIndex === 0)

  const isEmpty = workout.items.length === 0
  const minEstimate = isEmpty
    ? null
    : Math.max(
        20,
        Math.round(workout.items.reduce((a, it) => a + exerciseCostMin(it.targetSets), 0)),
      )

  const dayFallback = t('workout.day_fallback', { n: workoutIndex + 1 })
  const displayName = workout.name || dayFallback
  const stat = isEmpty ? undefined : `${workout.items.length} · ~${minEstimate}m`
  const subtitle = isEmpty ? 'Empty — tap to add exercises' : undefined

  function updateItem(idx: number, patch: Partial<PlanItem>) {
    if (readOnly) return
    onPatch({
      items: workout.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    })
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

  function toggle() {
    haptics.subtle()
    setOpen((v) => !v)
  }

  return (
    <section className={`cx-section day-editor ${open ? 'cx-section-open' : ''}`.trim()}>
      <button
        type="button"
        className="cx-section-trigger"
        aria-expanded={open}
        onClick={toggle}
      >
        <span className="cx-section-headline">
          <span className="cx-section-eyebrow">{t('workout.day_label', { n: workoutIndex + 1 })}</span>
          <span className="cx-section-title-row">
            <span className="cx-section-title">{displayName}</span>
            {stat ? <span className="cx-section-stat tabnum">{stat}</span> : null}
          </span>
          {subtitle ? <span className="cx-section-subtitle">{subtitle}</span> : null}
        </span>
        <span className="cx-section-chevron" aria-hidden>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
            <path
              d="M6 9.5L12 15L18 9.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      <div className="cx-section-drawer" aria-hidden={!open}>
        <div className="cx-section-drawer-clip">
          <div className="cx-section-body day-editor-body">
            {!readOnly ? (
              <label className="day-editor-rename">
                <span>{t('workout.day_name_label')}</span>
                <input
                  type="text"
                  value={workout.name}
                  placeholder={t('workout.day_name_placeholder', { n: workoutIndex + 1 })}
                  onChange={(e) => onPatch({ name: e.target.value })}
                />
              </label>
            ) : null}

            {isEmpty ? (
              !readOnly ? (
                <button
                  type="button"
                  className="workout-empty-cta"
                  onClick={() => setAdding(true)}
                >
                  <span className="workout-empty-cta-plus">+</span>
                  <span>
                    <strong>{t('workout.empty_cta_title')}</strong>
                    <span className="muted small">
                      {t('workout.empty_cta_sub')}
                    </span>
                  </span>
                </button>
              ) : (
                <p className="muted small">{t('workout.empty_readonly')}</p>
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
                {t('workout.add_more')}
              </button>
            ) : null}

            {!readOnly ? (
              <div className="day-editor-controls">
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
          </div>
        </div>
      </div>

      {adding ? (
        <ExercisePicker
          title={t('workout.picker_add_to', { name: displayName })}
          onClose={() => setAdding(false)}
          onPick={(id) => {
            const ex = exById.get(id)
            // Smart defaults so a deadlift doesn't land at 3×8-10 like a curl.
            // Compounds → hypertrophy-leaning 4×6-8 @ RPE 8.
            // Isolations → higher-rep stretch-mediated 3×10-12 @ RPE 9.
            const isCompound = ex?.category === 'compound'
            const defaults: Omit<PlanItem, 'exerciseId'> = isCompound
              ? { targetSets: 4, targetReps: '6–8', targetRPE: 8 }
              : { targetSets: 3, targetReps: '10–12', targetRPE: 9 }
            onPatch({
              items: [...workout.items, { exerciseId: id, ...defaults }],
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
  const t = useT()
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
          <span>{t('workout.field_sets')}</span>
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
          <span>{t('workout.field_reps')}</span>
          <input
            type="text"
            disabled={readOnly}
            value={item.targetReps}
            placeholder="e.g. 8-10"
            onChange={(e) => onUpdate({ targetReps: e.target.value })}
          />
        </label>
        <label>
          <span>{t('workout.field_rpe')}</span>
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
