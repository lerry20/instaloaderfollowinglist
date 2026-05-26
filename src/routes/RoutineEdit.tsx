import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Routine, type WorkoutDef } from '../db/schema'
import { useSettings } from '../db/queries'
import WorkoutEditor from '../components/WorkoutEditor'
import { toast } from '../state/toasts'
import { useT } from '../i18n'

export default function RoutineEdit() {
  const t = useT()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const settings = useSettings()
  const routine = useLiveQuery(
    async (): Promise<Routine | undefined> => (id ? db.routines.get(id) : undefined),
    [id],
  )

  if (routine === undefined) {
    return <div className="page"><p className="muted">{t('common.loading')}</p></div>
  }
  if (!routine) {
    return (
      <div className="page">
        <button className="link back-link" onClick={() => navigate('/routines')}>
          ← {t('common.back')}
        </button>
        <p className="muted">Routine not found.</p>
      </div>
    )
  }

  // Built-ins can't be edited directly. Offer to clone-and-edit on landing.
  if (routine.builtIn) {
    return (
      <div className="page">
        <button className="link back-link" onClick={() => navigate('/routines')}>
          ← {t('common.back')}
        </button>
        <h1 className="big-title">{routine.name}</h1>
        <p className="muted small">
          Built-in routines can't be edited directly. Make a copy first — you can
          customize the copy without losing the original.
        </p>
        <button className="btn primary block" onClick={() => cloneAndOpen()}>
          Make a copy and edit
        </button>
      </div>
    )
  }

  async function cloneAndOpen() {
    if (!routine) return
    const newId = `custom-${Date.now()}`
    const dup: Routine = {
      ...routine,
      id: newId,
      name: `${routine.name} (mine)`,
      builtIn: false,
      workouts: routine.workouts.map((w, i) => ({
        ...w,
        id: `${newId}-w${i + 1}`,
        items: [...w.items],
      })),
    }
    await db.routines.put(dup)
    if (settings) await db.settings.put({ ...settings, activeRoutineId: newId })
    navigate(`/routines/${newId}/edit`, { replace: true })
  }

  async function patch(updates: Partial<Routine>) {
    if (!routine || routine.builtIn) return
    await db.routines.put({ ...routine, ...updates })
  }

  async function addWorkout() {
    if (!routine || routine.builtIn) return
    const newId = `${routine.id}-w${Date.now()}`
    const workouts = [
      ...routine.workouts,
      { id: newId, name: `Day ${routine.workouts.length + 1}`, items: [] },
    ]
    await patch({ workouts })
  }

  async function patchWorkout(wid: string, updates: Partial<WorkoutDef>) {
    if (!routine || routine.builtIn) return
    const workouts = routine.workouts.map((w) => (w.id === wid ? { ...w, ...updates } : w))
    await patch({ workouts })
  }

  async function removeWorkout(wid: string) {
    if (!routine || routine.builtIn) return
    if (!confirm('Remove this day from the routine?')) return
    await patch({ workouts: routine.workouts.filter((w) => w.id !== wid) })
  }

  async function duplicateWorkout(wid: string) {
    if (!routine || routine.builtIn) return
    const src = routine.workouts.find((w) => w.id === wid)
    if (!src) return
    const newId = `${routine.id}-w${Date.now()}`
    const dup: WorkoutDef = { ...src, id: newId, name: `${src.name} (copy)` }
    const srcIdx = routine.workouts.findIndex((w) => w.id === wid)
    const workouts = [...routine.workouts]
    workouts.splice(srcIdx + 1, 0, dup)
    await patch({ workouts })
  }

  async function moveWorkout(wid: string, dir: -1 | 1) {
    if (!routine || routine.builtIn) return
    const idx = routine.workouts.findIndex((w) => w.id === wid)
    const target = idx + dir
    if (idx < 0 || target < 0 || target >= routine.workouts.length) return
    const workouts = [...routine.workouts]
    ;[workouts[idx], workouts[target]] = [workouts[target], workouts[idx]]
    await patch({ workouts })
  }

  async function deleteRoutine() {
    if (!routine || routine.builtIn) return
    if (!confirm(`Delete "${routine.name}"? This cannot be undone.`)) return
    await db.routines.delete(routine.id)
    toast('Routine deleted', { kind: 'warn' })
    navigate('/routines')
  }

  return (
    <div className="page routine-edit">
      <button className="link back-link" onClick={() => navigate('/routines')}>
        ← {t('common.back')}
      </button>

      <header className="exercise-header">
        <span className="muted small">Editing · changes save automatically</span>
        <input
          type="text"
          className="routine-edit-name"
          value={routine.name}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="Routine name"
        />
      </header>

      <label className="field">
        <span>What's this routine about? (optional)</span>
        <textarea
          rows={2}
          value={routine.description}
          placeholder="A short note for yourself — when to use this routine, what it's for…"
          onChange={(e) => patch({ description: e.target.value })}
        />
      </label>

      <p className="muted small routine-edit-hint">
        💡 Below is each <strong>training day</strong>. Tap the day name to rename it
        ("Monday", "Push A", "Heavy Day" — whatever works). Add or remove exercises with the
        buttons inside each day. Sets / Reps / RPE: <strong>Sets</strong> = how many rounds,{' '}
        <strong>Reps</strong> = number per set (write ranges like 8-10), <strong>RPE</strong>{' '}
        = how hard, 1–10. Stop 1–2 reps short of failure at RPE 8.
      </p>

      <div className="workout-edits-v2">
        {routine.workouts.map((w, idx) => (
          <WorkoutEditor
            key={w.id}
            workout={w}
            workoutIndex={idx}
            canMoveUp={idx > 0}
            canMoveDown={idx < routine.workouts.length - 1}
            onPatch={(updates) => patchWorkout(w.id, updates)}
            onRemove={() => removeWorkout(w.id)}
            onDuplicate={() => duplicateWorkout(w.id)}
            onMove={(d) => moveWorkout(w.id, d)}
          />
        ))}
      </div>

      <button className="btn block routine-edit-add-day" onClick={addWorkout}>
        + Add another day
      </button>

      <details className="advanced-details routine-edit-danger">
        <summary>Danger zone</summary>
        <button className="btn small danger block" onClick={deleteRoutine}>
          Delete this routine
        </button>
      </details>
    </div>
  )
}
