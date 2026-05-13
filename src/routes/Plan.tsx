import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DAY_KEYS,
  DAY_LABEL,
  type DayKey,
  type PlanItem,
  db,
} from '../db/schema'
import { useAllExercises, usePlan } from '../db/queries'
import ExercisePicker from '../components/ExercisePicker'

export default function Plan() {
  const plan = usePlan()
  const exercises = useAllExercises()
  const [editingDay, setEditingDay] = useState<DayKey | null>(null)

  if (!plan || !exercises) return <div className="page"><p className="muted">Loading…</p></div>

  async function savePlanDay(day: DayKey, items: PlanItem[], label: string) {
    if (!plan) return
    const next = {
      ...plan,
      weekTemplate: {
        ...plan.weekTemplate,
        [day]: items.length === 0 ? null : { label, items },
      },
    }
    await db.plans.put(next)
  }

  return (
    <div className="page">
      <h1>Weekly Plan</h1>
      <p className="muted small">{plan.name}</p>
      <div className="week-grid">
        {DAY_KEYS.map((day) => {
          const pd = plan.weekTemplate[day]
          return (
            <article key={day} className="card day-card">
              <header className="day-card-head">
                <div>
                  <span className="muted">{DAY_LABEL[day]}</span>
                  <h3>{pd?.label ?? 'Rest'}</h3>
                </div>
                <div className="day-card-actions">
                  {pd ? (
                    <Link to={`/workout/${day}`} className="btn small">Open</Link>
                  ) : null}
                  <button className="btn small ghost" onClick={() => setEditingDay(day)}>
                    Edit
                  </button>
                </div>
              </header>
              {pd ? (
                <ul className="day-card-list">
                  {pd.items.map((item) => {
                    const ex = exercises.find((e) => e.id === item.exerciseId)
                    return (
                      <li key={item.exerciseId}>
                        <span className="muted small">{item.targetSets} × {item.targetReps} · RPE {item.targetRPE}</span>
                        <strong>{ex?.name ?? item.exerciseId}</strong>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="muted small">Rest day — no exercises planned.</p>
              )}
            </article>
          )
        })}
      </div>

      {editingDay ? (
        <PlanDayEditor
          day={editingDay}
          plan={plan}
          onClose={() => setEditingDay(null)}
          onSave={(items, label) => {
            savePlanDay(editingDay, items, label)
            setEditingDay(null)
          }}
        />
      ) : null}
    </div>
  )
}

function PlanDayEditor({
  day,
  plan,
  onClose,
  onSave,
}: {
  day: DayKey
  plan: NonNullable<ReturnType<typeof usePlan>>
  onClose: () => void
  onSave: (items: PlanItem[], label: string) => void
}) {
  const current = plan.weekTemplate[day]
  const exercises = useAllExercises() ?? []
  const [label, setLabel] = useState(current?.label ?? '')
  const [items, setItems] = useState<PlanItem[]>(current?.items ?? [])
  const [adding, setAdding] = useState(false)

  function updateItem(idx: number, patch: Partial<PlanItem>) {
    setItems((arr) => arr.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }

  function removeItem(idx: number) {
    setItems((arr) => arr.filter((_, i) => i !== idx))
  }

  function moveItem(idx: number, dir: -1 | 1) {
    setItems((arr) => {
      const next = [...arr]
      const target = idx + dir
      if (target < 0 || target >= arr.length) return arr
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <h3>Edit {DAY_LABEL[day]}</h3>
          <button className="link" onClick={onClose}>Close</button>
        </header>
        <label className="field">
          <span>Day label (leave blank for rest day)</span>
          <input
            type="text"
            value={label}
            placeholder="e.g. Push A"
            onChange={(e) => setLabel(e.target.value)}
          />
        </label>
        <div className="edit-items">
          {items.length === 0 ? (
            <p className="muted small">No exercises yet.</p>
          ) : (
            items.map((item, idx) => {
              const ex = exercises.find((e) => e.id === item.exerciseId)
              return (
                <div key={idx} className="edit-item">
                  <div className="edit-item-head">
                    <strong>{ex?.name ?? item.exerciseId}</strong>
                    <div className="edit-item-actions">
                      <button className="link" onClick={() => moveItem(idx, -1)} aria-label="Move up">↑</button>
                      <button className="link" onClick={() => moveItem(idx, 1)} aria-label="Move down">↓</button>
                      <button className="link danger" onClick={() => removeItem(idx)}>Remove</button>
                    </div>
                  </div>
                  <div className="edit-item-fields">
                    <label>
                      <span>Sets</span>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={item.targetSets}
                        onChange={(e) => updateItem(idx, { targetSets: Number(e.target.value) || 1 })}
                      />
                    </label>
                    <label>
                      <span>Reps</span>
                      <input
                        type="text"
                        value={item.targetReps}
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
                        value={item.targetRPE}
                        onChange={(e) => updateItem(idx, { targetRPE: Number(e.target.value) || 8 })}
                      />
                    </label>
                  </div>
                </div>
              )
            })
          )}
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={() => setAdding(true)}>+ Add exercise</button>
          <button
            className="btn primary"
            onClick={() => onSave(items, label.trim() || DAY_LABEL[day])}
          >
            Save
          </button>
        </div>

        {adding ? (
          <ExercisePicker
            title="Add exercise"
            onClose={() => setAdding(false)}
            onPick={(id) => {
              setItems((arr) => [
                ...arr,
                { exerciseId: id, targetSets: 3, targetReps: '8–10', targetRPE: 8 },
              ])
              setAdding(false)
            }}
          />
        ) : null}
      </div>
    </div>
  )
}
