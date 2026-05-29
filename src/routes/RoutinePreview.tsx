import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  db,
  MUSCLE_LABEL,
  type Exercise,
  type MuscleKey,
  type PlanItem,
  type Routine,
  type WorkoutDef,
} from '../db/schema'
import { useSettings } from '../db/queries'
import { useT } from '../i18n'
import { useLocalizedExercise } from '../lib/exercise'
import { VOLUME_LANDMARKS } from '../lib/programming'
import { toast } from '../state/toasts'

export default function RoutinePreview() {
  const t = useT()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const settings = useSettings()
  const routine = useLiveQuery(
    async (): Promise<Routine | undefined> => (id ? db.routines.get(id) : undefined),
    [id],
  )
  const exercises = useLiveQuery(() => db.exercises.toArray(), [])

  if (routine === undefined || exercises === undefined) {
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

  const days = routine.daysPerWeek ?? routine.workouts.length
  const exById = new Map(exercises.map((e) => [e.id, e]))
  const isActive = settings?.activeRoutineId === routine.id

  async function activate() {
    const fresh = await db.settings.get(1)
    if (!fresh) return
    await db.settings.put({ ...fresh, activeRoutineId: routine!.id })
    toast(`Activated: ${routine!.name}`, { kind: 'success' })
    navigate('/routines')
  }

  return (
    <div className="page routine-preview">
      <button className="link back-link" onClick={() => navigate('/routines')}>
        ← {t('common.back')}
      </button>

      <header className="exercise-header">
        <h1 className="big-title">{routine.name}</h1>
        <span className="muted small">
          {t('routines.days_per_week', { n: days })}
          {routine.level
            ? ` · ${t(`routines.level_${routine.level}` as 'routines.level_beginner')}`
            : ''}
          {routine.weeksInBlock ? ` · ${routine.weeksInBlock} weeks` : ''}
        </span>
      </header>

      {routine.archetypeNote ? (
        <>
          <section className="card">
            <h3>{t('routines.why_it_works')}</h3>
            <p>{routine.archetypeNote.whyItWorks}</p>
          </section>
          <section className="card">
            <h3>{t('routines.who_shouldnt')}</h3>
            <p>{routine.archetypeNote.whoShouldnt}</p>
          </section>
        </>
      ) : routine.description ? (
        <section className="card">
          <p>{routine.description}</p>
        </section>
      ) : null}

      <section className="card">
        <h3>{t('routines.weekly_volume')}</h3>
        <WeeklyVolumeView routine={routine} exById={exById} />
      </section>

      {routine.workouts.map((w, idx) => (
        <DayCard
          key={w.id}
          workout={w}
          index={idx}
          exById={exById}
          allWorkouts={routine.workouts}
        />
      ))}

      <div className="routine-preview-cta">
        <button
          className="btn primary block"
          onClick={activate}
          disabled={isActive}
        >
          {isActive ? '● Active' : t('routines.activate_this')}
        </button>
      </div>
    </div>
  )
}

function DayCard({
  workout,
  index,
  exById,
  allWorkouts,
}: {
  workout: WorkoutDef
  index: number
  exById: Map<string, Exercise>
  allWorkouts: WorkoutDef[]
}) {
  // Primary muscles trained this day with frequency across the whole week
  const dayMuscles = uniqueMuscles(workout, exById)
  const weeklyFreq = useMemo(() => {
    const m = new Map<MuscleKey, number>()
    for (const w of allWorkouts) {
      for (const i of w.items) {
        const ex = exById.get(i.exerciseId)
        if (!ex) continue
        m.set(ex.primaryMuscle, (m.get(ex.primaryMuscle) ?? 0) + 1)
      }
    }
    return m
  }, [allWorkouts, exById])
  const sets = workout.items.reduce((acc, i) => acc + i.targetSets, 0)
  const minEstimate = Math.max(30, Math.round(sets * 3 + 10))

  // First day expanded by default (a sample of what a session looks like);
  // subsequent days collapsed so the page stays scannable.
  return (
    <details className="card day-card" open={index === 0}>
      <summary className="day-card-summary">
        <div className="day-card-head">
          <span className="day-card-num">Day {index + 1}</span>
          <h2>{workout.name}</h2>
          <span className="day-card-meta">
            {workout.items.length} {workout.items.length === 1 ? 'lift' : 'lifts'} · ~{minEstimate} min
          </span>
        </div>
        <span className="day-card-toggle" aria-hidden>+</span>
      </summary>

      <ul className="day-card-freq" aria-label="Muscles trained this day, frequency this week">
        {dayMuscles.map((m) => (
          <li key={m}>
            {MUSCLE_LABEL[m]} {weeklyFreq.get(m) ?? 0}×/wk
          </li>
        ))}
      </ul>

      <ol className="day-card-lifts">
        {workout.items.map((item) => (
          <ItemRow key={item.exerciseId} item={item} ex={exById.get(item.exerciseId)} />
        ))}
      </ol>
    </details>
  )
}

function ItemRow({ item, ex }: { item: PlanItem; ex?: Exercise }) {
  const local = useLocalizedExercise(ex)
  return (
    <li className="day-card-lift">
      <span className="day-card-lift-name">{local?.name ?? ex?.name ?? item.exerciseId}</span>
      <span className="day-card-lift-prescription tabnum">
        {item.targetSets} × {item.targetReps}
        <span className="day-card-lift-rpe"> @ {item.targetRPE}</span>
      </span>
    </li>
  )
}

function WeeklyVolumeView({
  routine,
  exById,
}: {
  routine: Routine
  exById: Map<string, Exercise>
}) {
  const volumes = useMemo(() => {
    const map = new Map<MuscleKey, number>()
    for (const w of routine.workouts) {
      for (const item of w.items) {
        const ex = exById.get(item.exerciseId)
        if (!ex) continue
        map.set(ex.primaryMuscle, (map.get(ex.primaryMuscle) ?? 0) + item.targetSets)
        for (const sec of ex.secondaryMuscles) {
          map.set(sec, (map.get(sec) ?? 0) + item.targetSets * 0.5)
        }
      }
    }
    return Array.from(map.entries())
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
  }, [routine, exById])

  if (volumes.length === 0) {
    return <p className="muted small">No exercises yet.</p>
  }

  return (
    <ul className="volume-bars">
      {volumes.map(([muscle, sets]) => {
        const lm = VOLUME_LANDMARKS[muscle]
        const status = sets < lm.mev
          ? 'below-mev'
          : sets > lm.mrv
          ? 'past-mrv'
          : sets > lm.mav
          ? 'past-mav'
          : 'optimal'
        const max = Math.max(lm.mrv * 1.1, sets)
        const pct = Math.min(100, (sets / max) * 100)
        return (
          <li key={muscle} className={`volume-row status-${status}`}>
            <span className="volume-label">{MUSCLE_LABEL[muscle]}</span>
            <div className="volume-track">
              <div className="volume-zone optimal" style={{ left: `${(lm.mev / max) * 100}%`, width: `${((lm.mav - lm.mev) / max) * 100}%` }} />
              <div className="volume-zone past-mav" style={{ left: `${(lm.mav / max) * 100}%`, width: `${((lm.mrv - lm.mav) / max) * 100}%` }} />
              <div className="volume-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="volume-count tabnum">{Math.round(sets)}</span>
          </li>
        )
      })}
    </ul>
  )
}

function uniqueMuscles(workout: WorkoutDef, exById: Map<string, Exercise>): MuscleKey[] {
  const set = new Set<MuscleKey>()
  for (const item of workout.items) {
    const ex = exById.get(item.exerciseId)
    if (ex) set.add(ex.primaryMuscle)
  }
  return Array.from(set)
}
