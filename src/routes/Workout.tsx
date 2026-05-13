import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
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
  lastWorkingTopSet,
  logSet,
  markSessionComplete,
  swapSessionItem,
  useAllExercises,
  usePlan,
  useSession,
  useSessionSetLogs,
  useSettings,
} from '../db/queries'
import { ensureNotificationPermission, useRestTimer } from '../state/restTimer'
import { kgToDisplay } from '../lib/units'
import SetRow from '../components/SetRow'
import PlateCalculator from '../components/PlateCalculator'
import WorkoutSummary from '../components/WorkoutSummary'
import ExercisePicker from '../components/ExercisePicker'

export default function Workout() {
  const { day } = useParams<{ day: DayKey }>()
  const dayKey = (day && DAY_KEYS.includes(day as DayKey) ? (day as DayKey) : 'mon') as DayKey
  const plan = usePlan()
  const planDay = plan?.weekTemplate[dayKey] ?? null
  const exercises = useAllExercises() ?? []
  const settings = useSettings()
  const navigate = useNavigate()
  const [showSummary, setShowSummary] = useState<number | null>(null)
  const [showPlateCalc, setShowPlateCalc] = useState(false)

  const sessionId = useLiveQuery(async () => {
    if (!planDay) return null
    return getOrCreateTodaySession(dayKey, planDay.label, planDay.items)
  }, [dayKey, planDay?.label])

  const session = useSession(sessionId ?? undefined)
  const sessionLogs = useSessionSetLogs(sessionId ?? undefined)

  const units = settings?.units ?? 'kg'

  const items: PlanItem[] = useMemo(() => session?.items ?? planDay?.items ?? [], [session?.items, planDay])

  if (!plan) return <div className="page"><p className="muted">Loading…</p></div>
  if (!planDay) {
    return (
      <div className="page">
        <h1>Rest day</h1>
        <p className="muted">No workout planned for {DAY_LABEL[dayKey]}.</p>
        <Link to="/plan" className="link">Edit the weekly plan →</Link>
      </div>
    )
  }
  if (!sessionId || !sessionLogs || !session) {
    return <div className="page"><p className="muted">Loading workout…</p></div>
  }

  return (
    <div className="page workout-page">
      <header className="workout-header">
        <div>
          <span className="muted">{DAY_LABEL[dayKey]}</span>
          <h1>{planDay.label}</h1>
        </div>
        <div className="workout-actions">
          <button
            className="btn ghost small"
            onClick={() => setShowPlateCalc((v) => !v)}
            aria-pressed={showPlateCalc}
          >
            {showPlateCalc ? 'Hide plates' : 'Plates'}
          </button>
          {session.completedAt ? (
            <span className="badge good">Completed</span>
          ) : (
            <button
              className="btn primary"
              onClick={async () => {
                await markSessionComplete(sessionId)
                setShowSummary(sessionId)
              }}
            >
              Finish
            </button>
          )}
        </div>
      </header>

      {showPlateCalc ? <PlateCalculator units={units} /> : null}

      {items.map((item) => {
        const ex = exercises.find((e) => e.id === item.exerciseId)
        const logsForItem = sessionLogs
          .filter((l) => l.exerciseId === item.exerciseId)
          .sort((a, b) => a.loggedAt - b.loggedAt)
        return (
          <WorkoutItemCard
            key={item.exerciseId}
            item={item}
            exerciseId={item.exerciseId}
            exerciseName={ex?.name ?? item.exerciseId}
            primaryMuscle={ex?.primaryMuscle}
            equipment={ex?.equipment}
            exerciseDefaultRestSec={ex?.defaultRestSec ?? settings?.defaultRestSec ?? 90}
            units={units}
            logs={logsForItem}
            sessionId={sessionId}
            fallbackRestSec={settings?.defaultRestSec ?? 90}
          />
        )
      })}

      {!session.completedAt && items.length > 0 ? (
        <button
          className="btn primary block"
          onClick={async () => {
            await markSessionComplete(sessionId)
            setShowSummary(sessionId)
          }}
        >
          Finish workout
        </button>
      ) : null}

      {showSummary !== null ? (
        <WorkoutSummary
          sessionId={showSummary}
          units={units}
          onClose={() => {
            setShowSummary(null)
            navigate('/history')
          }}
        />
      ) : null}
    </div>
  )
}

function WorkoutItemCard({
  item,
  exerciseId,
  exerciseName,
  primaryMuscle,
  equipment,
  exerciseDefaultRestSec,
  units,
  logs,
  sessionId,
}: {
  item: PlanItem
  exerciseId: string
  exerciseName: string
  primaryMuscle?: string
  equipment?: string
  exerciseDefaultRestSec: number
  units: 'kg' | 'lb'
  logs: { id?: number; weight: number; reps: number; rpe: number | null; isWarmup: boolean; loggedAt: number }[]
  sessionId: number
  fallbackRestSec: number
}) {
  const startTimer = useRestTimer((s) => s.start)
  const lastTop = useLiveQuery(
    () => lastWorkingTopSet(exerciseId, sessionId),
    [exerciseId, sessionId],
  )
  const cardRef = useRef<HTMLElement>(null)
  const [showSwap, setShowSwap] = useState(false)

  const workingLogs = logs.filter((l) => !l.isWarmup)
  const lastWorkingThisSession = workingLogs[workingLogs.length - 1]
  const suggestedKg = lastWorkingThisSession
    ? lastWorkingThisSession.weight
    : lastTop
    ? lastTop.weight + (units === 'kg' ? 2.5 : 5 * 0.45359237)
    : undefined
  const repsLow = Number(String(item.targetReps).split(/[–\-]/)[0]) || undefined

  const totalRows = Math.max(item.targetSets, workingLogs.length)
  const rows: { index: number; logged?: typeof logs[number] }[] = []
  for (let i = 0; i < totalRows; i++) {
    rows.push({ index: i, logged: workingLogs[i] })
  }
  const warmupRows = logs
    .filter((l) => l.isWarmup)
    .map((l, idx) => ({ logged: l, virtualIndex: idx }))

  return (
    <article className="card workout-card" ref={cardRef}>
      <header className="workout-card-head">
        <Link to={`/exercise/${exerciseId}`} className="exercise-link">
          <h3>{exerciseName}</h3>
          <span className="muted small">
            {primaryMuscle}
            {equipment ? ` · ${equipment}` : ''}
          </span>
        </Link>
        <div className="workout-card-actions">
          <span className="muted small">
            {item.targetSets} × {item.targetReps} @ RPE {item.targetRPE}
          </span>
          <button
            className="link"
            onClick={() => setShowSwap(true)}
            aria-label={`Swap ${exerciseName}`}
          >
            Swap
          </button>
        </div>
      </header>

      <p className="muted small suggestion">
        {lastTop ? (
          <>
            Last working top:{' '}
            <strong>
              {kgToDisplay(lastTop.weight, units).toFixed(units === 'kg' ? 1 : 0)} {units} × {lastTop.reps}
            </strong>{' '}
            · try{' '}
            <strong>
              {kgToDisplay(suggestedKg!, units).toFixed(units === 'kg' ? 1 : 0)} {units}
            </strong>{' '}
            today.
          </>
        ) : (
          <>First time logging — pick a starter weight you can clean.</>
        )}
      </p>

      {warmupRows.length > 0 ? (
        <div className="set-list">
          {warmupRows.map((w) => (
            <SetRow
              key={`w-${w.logged.id}`}
              index={w.virtualIndex}
              units={units}
              logged={w.logged}
              onUnlog={async () => {
                if (w.logged.id) await db.setLogs.delete(w.logged.id)
              }}
              onLog={() => {}}
            />
          ))}
        </div>
      ) : null}

      <div className="set-list">
        {rows.map(({ index, logged }) => (
          <SetRow
            key={`${index}-${logged?.id ?? 'pending'}`}
            index={index}
            units={units}
            defaultWeightKg={logged ? logged.weight : suggestedKg}
            defaultReps={logged ? logged.reps : repsLow}
            logged={logged}
            onLog={async (data) => {
              await logSet(
                sessionId,
                exerciseId,
                index,
                data.weightKg,
                data.reps,
                data.rpe,
                data.isWarmup,
              )
              startTimer(exerciseDefaultRestSec)
              // Auto-scroll to next pending row or next card
              setTimeout(() => {
                const next = cardRef.current?.querySelector('.set-row.pending') as HTMLElement | null
                if (next) {
                  next.scrollIntoView({ behavior: 'smooth', block: 'center' })
                } else {
                  const nextCard = cardRef.current?.nextElementSibling as HTMLElement | null
                  if (nextCard) nextCard.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }, 60)
            }}
            onUnlog={async () => {
              if (logged?.id) await db.setLogs.delete(logged.id)
            }}
          />
        ))}
      </div>

      <button className="link add-warmup" onClick={() => {
        // Insert a pending warm-up by toggling the first row's warm-up state is awkward;
        // simpler: scroll to a fresh pending row at the top.
        const first = cardRef.current?.querySelector('.set-row.pending') as HTMLElement | null
        first?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }}>
        + Need a warm-up set? Toggle "Warm-up" on the first pending set.
      </button>

      {showSwap ? (
        <ExercisePicker
          title={`Swap ${exerciseName}`}
          onClose={() => setShowSwap(false)}
          onPick={async (newId) => {
            await swapSessionItem(sessionId, exerciseId, {
              ...item,
              exerciseId: newId,
            })
            setShowSwap(false)
          }}
        />
      ) : null}

      <NotificationsPromptOnce />
    </article>
  )
}

function NotificationsPromptOnce() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) return
    if (Notification.permission !== 'default') return
    const timer = window.setTimeout(() => {
      void ensureNotificationPermission().then((granted) => {
        if (granted) {
          void db.settings.get(1).then((s) => {
            if (s) db.settings.put({ ...s, notificationsEnabled: true })
          })
        }
      })
    }, 4000)
    return () => window.clearTimeout(timer)
  }, [])
  return null
}

