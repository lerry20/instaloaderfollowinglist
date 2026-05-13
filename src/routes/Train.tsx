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
import PlateSheet from '../components/PlateSheet'
import { kgToDisplay } from '../lib/units'
import { ensureNotificationPermission } from '../state/restTimer'
import { toast } from '../state/toasts'

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
        onAbandon={async (id) => {
          if (confirm('Discard this in-progress workout? All logged sets will be removed.')) {
            await abandonSession(id)
            toast('Workout discarded', { kind: 'warn' })
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
    await startSession(routine, next)
    void ensureNotificationPermission()
    navigate(`/train`)
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
          <header className="section-head">
            <h3>What you'll do</h3>
            <span className="muted small">{next.items.length} exercises</span>
          </header>
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
          {!latestBw ? <span className="link small">Log it →</span> : null}
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
  onAbandon,
}: {
  session: Session
  routine: Routine
  units: 'kg' | 'lb'
  onAbandon: (id: number) => Promise<void>
}) {
  const navigate = useNavigate()
  const setLogs = useSessionSetLogs(session.id) ?? []
  const [showSummary, setShowSummary] = useState<number | null>(null)
  const [showPlates, setShowPlates] = useState(false)
  const [focusedKg, setFocusedKg] = useState<number | null>(null)
  const [confirmFinish, setConfirmFinish] = useState(false)

  const workingLogs = setLogs.filter((l) => !l.isWarmup)
  const totalPlanned = session.items.reduce((n, it) => n + it.targetSets, 0)
  const progress = totalPlanned > 0 ? Math.min(100, (workingLogs.length / totalPlanned) * 100) : 0
  const unloggedSets = Math.max(0, totalPlanned - workingLogs.length)

  async function swap(oldId: string, newId: string) {
    const item = session.items.find((i) => i.exerciseId === oldId)
    if (!item) return
    await swapSessionItem(session.id!, oldId, { ...item, exerciseId: newId })
  }

  async function skipExercise(exerciseId: string) {
    const items = session.items.filter((i) => i.exerciseId !== exerciseId)
    await db.sessions.update(session.id!, { items })
  }

  async function finish() {
    await markSessionComplete(session.id!)
    setConfirmFinish(false)
    setShowSummary(session.id!)
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
            className={`btn small ${showPlates ? '' : 'ghost'}`}
            onClick={() => setShowPlates((v) => !v)}
            aria-pressed={showPlates}
          >
            {showPlates ? '✕ Plates' : '⚖ Plates'}
          </button>
        </div>
      </header>

      {session.items.length === 0 ? (
        <section className="card">
          <p className="muted">All exercises skipped or removed. Finish or discard the workout.</p>
        </section>
      ) : (
        session.items.map((item, idx) => (
          <SessionExerciseCard
            key={item.exerciseId}
            item={item}
            sessionId={session.id!}
            units={units}
            positionIndex={idx}
            totalExercises={session.items.length}
            onSwap={(newId) => swap(item.exerciseId, newId)}
            onSkip={() => skipExercise(item.exerciseId)}
            onFocus={(kg) => setFocusedKg(kg)}
          />
        ))
      )}

      <button
        className="btn primary block finish-btn"
        onClick={() => {
          if (unloggedSets > 0 && workingLogs.length > 0) {
            setConfirmFinish(true)
          } else {
            finish()
          }
        }}
      >
        Finish workout
      </button>

      {confirmFinish ? (
        <div className="modal-backdrop" onClick={() => setConfirmFinish(false)}>
          <div className="modal small-modal" onClick={(e) => e.stopPropagation()}>
            <header className="modal-head">
              <h3>Finish early?</h3>
              <button className="link" onClick={() => setConfirmFinish(false)}>Cancel</button>
            </header>
            <p>
              You have <strong>{unloggedSets}</strong> planned set{unloggedSets === 1 ? '' : 's'} left.
              You can come back to this session anytime — or finish it now.
            </p>
            <div className="modal-foot">
              <button className="btn primary block" onClick={finish}>Finish anyway</button>
              <button className="btn ghost block" onClick={() => setConfirmFinish(false)}>Keep going</button>
            </div>
          </div>
        </div>
      ) : null}

      <PlateSheet
        open={showPlates}
        units={units}
        focusedKg={focusedKg}
        onClose={() => setShowPlates(false)}
      />

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
