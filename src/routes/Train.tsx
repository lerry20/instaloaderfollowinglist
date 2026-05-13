import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Routine, type Session, type WorkoutDef } from '../db/schema'
import {
  abandonSession,
  markSessionComplete,
  startSession,
  suggestNextWorkout,
  swapSessionItem,
  useActiveRoutine,
  useActiveSession,
  useBodyweightLogs,
  useSessionSetLogs,
  useSettings,
} from '../db/queries'
import SessionExerciseCard from '../components/SessionExerciseCard'
import WorkoutSummary from '../components/WorkoutSummary'
import PlateCalculator from '../components/PlateCalculator'
import { kgToDisplay } from '../lib/units'
import { ensureNotificationPermission } from '../state/restTimer'

export default function Train() {
  const settings = useSettings()
  const routine = useActiveRoutine()
  const session = useActiveSession()
  const navigate = useNavigate()
  const [next, setNext] = useState<WorkoutDef | null>(null)

  useEffect(() => {
    if (!routine) return
    suggestNextWorkout(routine).then(setNext)
  }, [routine, session?.id, session?.completedAt])

  if (!settings || !routine) {
    return <div className="page"><p className="muted">Loading…</p></div>
  }

  if (session) {
    return (
      <ActiveSessionView
        session={session}
        routine={routine}
        units={settings.units}
        onFinish={async (id) => {
          await markSessionComplete(id)
        }}
        onAbandon={async (id) => {
          if (confirm('Discard this in-progress workout?')) {
            await abandonSession(id)
            navigate('/')
          }
        }}
      />
    )
  }

  return <StartScreen routine={routine} next={next} />
}

function StartScreen({ routine, next }: { routine: Routine; next: WorkoutDef | null }) {
  const navigate = useNavigate()
  const settings = useSettings()
  const bw = useBodyweightLogs()
  const latestBw = bw && bw.length > 0 ? bw[bw.length - 1] : null
  const units = settings?.units ?? 'kg'

  async function start() {
    if (!next) return
    const id = await startSession(routine, next)
    void ensureNotificationPermission()
    navigate(`/train`)
    // Force re-render by referencing id (unused but keeps fn async-aware)
    void id
  }

  return (
    <div className="page train-start">
      <header className="hero">
        <span className="muted small">Today's workout</span>
        <h1 className="big-title">{next?.name ?? 'No workout queued'}</h1>
        <span className="muted small">{routine.name}</span>
      </header>

      {next ? (
        <button className="btn primary block start-btn" onClick={start}>
          Start workout
        </button>
      ) : (
        <Link to="/routines" className="btn block">
          Pick a routine
        </Link>
      )}

      {next ? (
        <section className="card">
          <h3>What you'll do</h3>
          <ul className="hero-items">
            {next.items.map((it) => (
              <li key={it.exerciseId} className="hero-item">
                <span className="tabnum">
                  {it.targetSets} × {it.targetReps}
                </span>
                <span><ExerciseName id={it.exerciseId} /></span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="grid-2">
        <Link to="/progress" className="card stat-link">
          <span className="muted small">Bodyweight</span>
          <span className="stat-value tabnum">
            {latestBw ? kgToDisplay(latestBw.weightKg, units).toFixed(1) : '—'}
            <span className="unit">{latestBw ? units : ''}</span>
          </span>
        </Link>
        <Link to="/routines" className="card stat-link">
          <span className="muted small">Routine</span>
          <span className="stat-value-small">{routine.name}</span>
          <span className="muted small">Change →</span>
        </Link>
      </section>
    </div>
  )
}

function ActiveSessionView({
  session,
  routine,
  units,
  onFinish,
  onAbandon,
}: {
  session: Session
  routine: Routine
  units: 'kg' | 'lb'
  onFinish: (id: number) => Promise<void>
  onAbandon: (id: number) => Promise<void>
}) {
  const navigate = useNavigate()
  const setLogs = useSessionSetLogs(session.id) ?? []
  const [showSummary, setShowSummary] = useState<number | null>(null)
  const [showPlates, setShowPlates] = useState(false)

  const workingLogs = setLogs.filter((l) => !l.isWarmup)
  const totalPlanned = session.items.reduce((n, it) => n + it.targetSets, 0)
  const progress = totalPlanned > 0 ? Math.min(100, (workingLogs.length / totalPlanned) * 100) : 0

  async function swap(oldId: string, newId: string) {
    const item = session.items.find((i) => i.exerciseId === oldId)
    if (!item) return
    await swapSessionItem(session.id!, oldId, { ...item, exerciseId: newId })
  }

  return (
    <div className="page session-page">
      <header className="session-header">
        <div className="session-title-row">
          <div>
            <span className="muted small">{routine.name}</span>
            <h1 className="big-title">{session.workoutName}</h1>
          </div>
          <button className="link danger small" onClick={() => onAbandon(session.id!)}>
            Discard
          </button>
        </div>
        <div className="progress-strip">
          <div className="progress-strip-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="session-meta">
          <span className="muted small">{workingLogs.length} / {totalPlanned} working sets</span>
          <button
            className="btn small ghost"
            onClick={() => setShowPlates((v) => !v)}
            aria-pressed={showPlates}
          >
            {showPlates ? 'Hide plates' : 'Plates'}
          </button>
        </div>
      </header>

      {showPlates ? <PlateCalculator units={units} /> : null}

      {session.items.map((item) => (
        <SessionExerciseCard
          key={item.exerciseId}
          item={item}
          sessionId={session.id!}
          units={units}
          onSwap={(newId) => swap(item.exerciseId, newId)}
        />
      ))}

      <button
        className="btn primary block finish-btn"
        onClick={async () => {
          await onFinish(session.id!)
          setShowSummary(session.id!)
        }}
      >
        Finish workout
      </button>

      {showSummary !== null ? (
        <WorkoutSummary
          sessionId={showSummary}
          units={units}
          onClose={() => {
            setShowSummary(null)
            navigate('/progress')
          }}
        />
      ) : null}
    </div>
  )
}

function ExerciseName({ id }: { id: string }) {
  const ex = useLiveQuery(() => db.exercises.get(id), [id])
  return <>{ex?.name ?? id}</>
}
