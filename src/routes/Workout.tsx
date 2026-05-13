import { useMemo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  DAY_KEYS,
  DAY_LABEL,
  type DayKey,
  type PlanItem,
  db,
} from '../db/schema'
import {
  getOrCreateTodaySession,
  lastTopSetForExercise,
  logSet,
  markSessionComplete,
  useAllExercises,
  usePlan,
  useSessionSetLogs,
} from '../db/queries'
import { useRestTimer } from '../state/restTimer'
import SetRow from '../components/SetRow'

export default function Workout() {
  const { day } = useParams<{ day: DayKey }>()
  const dayKey = (day && DAY_KEYS.includes(day) ? day : 'mon') as DayKey
  const plan = usePlan()
  const planDay = plan?.weekTemplate[dayKey] ?? null
  const exercises = useAllExercises() ?? []
  const navigate = useNavigate()

  const sessionId = useLiveQuery(async () => {
    if (!planDay) return null
    return getOrCreateTodaySession(dayKey, planDay.label)
  }, [dayKey, planDay?.label])

  const sessionLogs = useSessionSetLogs(sessionId ?? undefined)
  const session = useLiveQuery(
    () => (sessionId ? db.sessions.get(sessionId) : undefined),
    [sessionId],
  )

  const settings = useLiveQuery(() => db.settings.get(1), [])
  const units = settings?.units ?? 'kg'

  const items = useMemo(() => planDay?.items ?? [], [planDay])

  if (!plan) {
    return <div className="page"><p className="muted">Loading…</p></div>
  }
  if (!planDay) {
    return (
      <div className="page">
        <h1>Rest day</h1>
        <p className="muted">No workout planned for {DAY_LABEL[dayKey]}.</p>
        <Link to="/plan" className="link">Edit the weekly plan →</Link>
      </div>
    )
  }
  if (!sessionId || !sessionLogs) {
    return <div className="page"><p className="muted">Loading workout…</p></div>
  }

  return (
    <div className="page workout-page">
      <header className="workout-header">
        <div>
          <span className="muted">{DAY_LABEL[dayKey]}</span>
          <h1>{planDay.label}</h1>
        </div>
        {session && !session.completedAt ? (
          <button
            className="btn primary"
            onClick={async () => {
              await markSessionComplete(sessionId)
              navigate('/history')
            }}
          >
            Finish workout
          </button>
        ) : (
          <span className="badge good">Completed</span>
        )}
      </header>

      {items.map((item) => {
        const ex = exercises.find((e) => e.id === item.exerciseId)
        const logsForItem = sessionLogs
          .filter((l) => l.exerciseId === item.exerciseId)
          .sort((a, b) => a.setIndex - b.setIndex)
        return (
          <WorkoutItemCard
            key={item.exerciseId}
            item={item}
            exerciseName={ex?.name ?? item.exerciseId}
            primaryMuscle={ex?.primaryMuscle}
            equipment={ex?.equipment}
            units={units}
            logs={logsForItem}
            sessionId={sessionId}
            defaultRestSec={settings?.defaultRestSec ?? 90}
          />
        )
      })}
    </div>
  )
}

function WorkoutItemCard({
  item,
  exerciseName,
  primaryMuscle,
  equipment,
  units,
  logs,
  sessionId,
  defaultRestSec,
}: {
  item: PlanItem
  exerciseName: string
  primaryMuscle?: string
  equipment?: string
  units: string
  logs: { id?: number; weight: number; reps: number; rpe: number | null; setIndex: number }[]
  sessionId: number
  defaultRestSec: number
}) {
  const startTimer = useRestTimer((s) => s.start)
  const lastTop = useLiveQuery(() => lastTopSetForExercise(item.exerciseId), [item.exerciseId])
  const suggested = lastTop ? lastTop.weight + 2.5 : undefined

  const rows: { index: number; logged?: typeof logs[number] }[] = []
  for (let i = 0; i < Math.max(item.targetSets, logs.length); i++) {
    rows.push({ index: i, logged: logs.find((l) => l.setIndex === i) })
  }

  return (
    <article className="card workout-card">
      <header className="workout-card-head">
        <Link to={`/exercise/${item.exerciseId}`} className="exercise-link">
          <h3>{exerciseName}</h3>
          <span className="muted small">
            {primaryMuscle}
            {equipment ? ` · ${equipment}` : ''}
          </span>
        </Link>
        <span className="muted small">
          Target: {item.targetSets} × {item.targetReps} @ RPE {item.targetRPE}
        </span>
      </header>
      {suggested ? (
        <p className="muted small suggestion">
          Last top set: {lastTop!.weight}
          {units} → try {suggested}
          {units} today.
        </p>
      ) : (
        <p className="muted small suggestion">First time logging — pick a starter weight you can hit clean.</p>
      )}
      <div className="set-list">
        {rows.map(({ index, logged }) => (
          <SetRow
            key={index}
            index={index}
            units={units}
            defaultWeight={
              logged
                ? logged.weight
                : suggested ??
                  (logs[logs.length - 1]?.weight ?? lastTop?.weight ?? undefined)
            }
            defaultReps={logged ? logged.reps : Number(String(item.targetReps).split(/[–-]/)[0]) || undefined}
            logged={logged}
            onLog={async (data) => {
              await logSet(sessionId, item.exerciseId, index, data.weight, data.reps, data.rpe)
              startTimer(defaultRestSec)
            }}
            onUnlog={async () => {
              if (logged?.id) await db.setLogs.delete(logged.id)
            }}
          />
        ))}
      </div>
    </article>
  )
}
