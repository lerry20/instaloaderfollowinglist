import { useEffect, useMemo, useState } from 'react'
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
import SessionPager from '../components/SessionPager'
import WorkoutSummary from '../components/WorkoutSummary'
import PlateSheet from '../components/PlateSheet'
import { kgToDisplay } from '../lib/units'
import { ensureNotificationPermission } from '../state/restTimer'
import { toast } from '../state/toasts'
import { haptics } from '../lib/haptics'
import { buildProactiveMessage, type ProactiveMessage } from '../lib/streak'
import Skeleton from '../components/Skeleton'
import { useT } from '../i18n'

export default function Train() {
  const t = useT()
  const settings = useSettings()
  const routine = useActiveRoutine()
  const session = useActiveSession()
  const navigate = useNavigate()
  const [next, setNext] = useState<WorkoutDef | null>(null)

  useEffect(() => {
    if (!routine) return
    suggestNextWorkout(routine).then(setNext)
  }, [routine, session?.id, session?.completedAt])

  if (!settings) {
    return (
      <div className="page">
        <Skeleton rows={4} height={22} />
      </div>
    )
  }

  if (!routine) {
    // Active routine id points to a routine that doesn't exist — graceful empty state
    // instead of an infinite "Loading…".
    return (
      <div className="page">
        <header className="hero">
          <span className="muted small">{t('train.no_routine_selected')}</span>
          <h1 className="big-title">{t('train.pick_routine_title')}</h1>
        </header>
        <Link to="/routines" className="btn primary block">
          {t('train.browse_routines')}
        </Link>
      </div>
    )
  }

  if (session) {
    return (
      <ActiveSessionView
        session={session}
        routine={routine}
        units={settings.units}
        onAbandon={async (id) => {
          if (confirm(t('session.discard_confirm'))) {
            await abandonSession(id)
            toast(t('toast.workout_discarded'), { kind: 'warn' })
            navigate('/')
          }
        }}
      />
    )
  }

  return <StartScreen routine={routine} next={next} />
}

function StartScreen({ routine, next }: { routine: Routine; next: WorkoutDef | null }) {
  const t = useT()
  const navigate = useNavigate()
  const settings = useSettings()
  const bw = useBodyweightLogs()
  const latestBw = bw && bw.length > 0 ? bw[bw.length - 1] : null
  const units = settings?.units ?? 'kg'
  const [starting, setStarting] = useState(false)
  const [proactive, setProactive] = useState<ProactiveMessage | null>(null)

  useEffect(() => {
    let cancelled = false
    buildProactiveMessage()
      .then((m) => !cancelled && setProactive(m))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  async function start() {
    if (!next || starting) return
    setStarting(true)
    try {
      await startSession(routine, next)
      void ensureNotificationPermission()
      navigate(`/train`)
    } catch (err) {
      console.error('startSession failed', err)
      toast(t('toast.could_not_start'), { kind: 'danger' })
      setStarting(false)
    }
  }

  return (
    <div className="page train-start">
      {proactive ? (
        <div className={`proactive proactive-${proactive.kind}`}>{proactive.text}</div>
      ) : null}
      <header className="hero">
        <span className="muted small">{t('train.todays_workout')}</span>
        <h1 className="big-title">{next?.name ?? t('train.no_workout_queued')}</h1>
        <span className="muted small">{routine.name}</span>
      </header>

      {next ? (
        <button className="btn primary block start-btn" onClick={start} disabled={starting}>
          {starting ? t('common.starting') : t('train.start_workout')}
        </button>
      ) : (
        <Link to="/routines" className="btn block">
          {t('train.browse_routines')}
        </Link>
      )}

      {next ? (
        <section className="card">
          <header className="section-head">
            <h3>{t('train.what_youll_do')}</h3>
            <span className="muted small">{t('train.n_exercises', { n: next.items.length })}</span>
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
          <span className="muted small">{t('train.bodyweight')}</span>
          <span className="stat-value tabnum">
            {latestBw ? kgToDisplay(latestBw.weightKg, units).toFixed(1) : '—'}
            <span className="unit">{latestBw ? units : ''}</span>
          </span>
          {!latestBw ? <span className="link small">{t('train.log_it')}</span> : null}
        </Link>
        <Link to="/routines" className="card stat-link">
          <span className="muted small">{t('train.routine')}</span>
          <span className="stat-value-small">{routine.name}</span>
          <span className="muted small">{t('train.change')}</span>
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
  const t = useT()
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

  const workingLogsByExercise = useMemo(() => {
    const map: Record<string, number> = {}
    for (const l of workingLogs) {
      map[l.exerciseId] = (map[l.exerciseId] ?? 0) + 1
    }
    return map
  }, [workingLogs])

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
    haptics.finish()
    setConfirmFinish(false)
    setShowSummary(session.id!)
  }

  return (
    <div className="page session-page-shell">
      <header className="session-header compact">
        <div className="session-title-row">
          <div>
            <span className="muted small">{routine.name}</span>
            <h1 className="big-title">{session.workoutName}</h1>
          </div>
          <button className="link danger small" onClick={() => onAbandon(session.id!)}>
            {t('session.discard')}
          </button>
        </div>
        <div className="progress-strip">
          <div className="progress-strip-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="session-meta">
          <span className="muted small">{t('session.working_sets', { done: workingLogs.length, total: totalPlanned })}</span>
          <button
            className={`btn small ${showPlates ? '' : 'ghost'}`}
            onClick={() => setShowPlates((v) => !v)}
            aria-pressed={showPlates}
          >
            {showPlates ? `✕ ${t('session.plates')}` : `⚖ ${t('session.plates')}`}
          </button>
        </div>
      </header>

      {session.items.length === 0 ? (
        <section className="card">
          <p className="muted">All exercises skipped or removed. Finish or discard the workout.</p>
        </section>
      ) : (
        <SessionPager
          items={session.items}
          sessionId={session.id!}
          units={units}
          onSwap={swap}
          onSkip={skipExercise}
          onFocus={(kg) => setFocusedKg(kg)}
          workingLogsByExercise={workingLogsByExercise}
        />
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
        {t('session.finish_workout')}
      </button>

      {confirmFinish ? (
        <div className="modal-backdrop" onClick={() => setConfirmFinish(false)}>
          <div className="modal small-modal" onClick={(e) => e.stopPropagation()}>
            <header className="modal-head">
              <h3>{t('session.finish_early')}</h3>
              <button className="link" onClick={() => setConfirmFinish(false)}>{t('common.cancel')}</button>
            </header>
            <p>{t('session.sets_left', { n: unloggedSets, plural: unloggedSets === 1 ? '' : 's' })}</p>
            <div className="modal-foot">
              <button className="btn primary block" onClick={finish}>{t('session.finish_anyway')}</button>
              <button className="btn ghost block" onClick={() => setConfirmFinish(false)}>{t('session.keep_going')}</button>
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
