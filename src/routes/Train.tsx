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
import { buildProactiveMessage, currentStreak, type ProactiveMessage } from '../lib/streak'
import { computeAdherence } from '../lib/adherence'
import { computeFitnessSignal, type FitnessSignal } from '../lib/fitnessSignal'
import Skeleton from '../components/Skeleton'
import { useT, useLocaleStore, type Locale } from '../i18n'
import { useLocalizedExercise } from '../lib/exercise'

const LOCALE_BCP47: Record<Locale, string> = {
  en: 'en-US',
  it: 'it-IT',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  pt: 'pt-BR',
}

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
  const locale = useLocaleStore((s) => s.locale)
  const navigate = useNavigate()
  const settings = useSettings()
  const bw = useBodyweightLogs()
  const latestBw = bw && bw.length > 0 ? bw[bw.length - 1] : null
  const units = settings?.units ?? 'kg'
  const [starting, setStarting] = useState(false)
  const [proactive, setProactive] = useState<ProactiveMessage | null>(null)
  const [streak, setStreak] = useState(0)
  const [thisWeek, setThisWeek] = useState(0)
  const [prescribed, setPrescribed] = useState(routine.daysPerWeek ?? routine.workouts.length)
  const [adherenceRatio, setAdherenceRatio] = useState(1)
  const [signal, setSignal] = useState<FitnessSignal | null>(null)
  // Quick time budget for today (minutes). null = full session.
  const [quickBudget, setQuickBudget] = useState<number | null>(null)

  // Most recent completed session — for the "Last session" stat.
  const lastSession = useLiveQuery(async () => {
    const all = await db.sessions.toArray()
    const completed = all.filter((s) => s.completedAt !== null)
    completed.sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
    return completed[0] ?? null
  }, [])

  useEffect(() => {
    let cancelled = false
    buildProactiveMessage()
      .then((m) => !cancelled && setProactive(m))
      .catch(() => {})
    currentStreak()
      .then((n) => !cancelled && setStreak(n))
      .catch(() => {})
    computeAdherence(routine)
      .then((a) => {
        if (cancelled) return
        setThisWeek(a.thisWeek)
        setPrescribed(a.prescribedPerWeek)
        setAdherenceRatio(a.ratio)
      })
      .catch(() => {})
    computeFitnessSignal(routine)
      .then((s) => { if (!cancelled) setSignal(s) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [routine.id])

  async function start() {
    if (!next || starting) return
    setStarting(true)
    try {
      // If the user has trimmed the session via the time-budget pills,
      // pass a workout-shaped object with the trimmed items instead of
      // the routine's full item list.
      const workoutToStart =
        trimmedItems.length === next.items.length
          ? next
          : { ...next, items: trimmedItems }
      await startSession(routine, workoutToStart)
      void ensureNotificationPermission()
      navigate(`/train`)
    } catch (err) {
      console.error('startSession failed', err)
      toast(t('toast.could_not_start'), { kind: 'danger' })
      setStarting(false)
    }
  }

  // Where is the suggested next workout inside the routine cycle?
  const nextIdx = next ? routine.workouts.findIndex((w) => w.id === next.id) : -1
  const position = nextIdx >= 0 ? nextIdx + 1 : 1
  const totalWorkouts = routine.workouts.length
  // The remaining workouts in this pass through the cycle (today + after).
  // We stop at the end of the routine sequence rather than wrapping, so the
  // user sees a finite list of "what's left to finish this cycle".
  const restOfCycle = nextIdx >= 0
    ? routine.workouts.slice(nextIdx).slice(0, 6)
    : []

  // Trim today's items to fit `quickBudget` minutes (null = full workout).
  // 3 min/set + 10 min fixed warm-up overhead; walks exercises in routine
  // order, stops when budget is hit. Always keeps at least one exercise so
  // the user never sees an empty card.
  const trimmedItems = useMemo(() => {
    if (!next) return []
    if (quickBudget === null) return next.items
    const budgetSets = Math.max(3, Math.floor((quickBudget - 10) / 3))
    const out: typeof next.items = []
    let used = 0
    for (const it of next.items) {
      if (out.length > 0 && used + it.targetSets > budgetSets) break
      out.push(it)
      used += it.targetSets
    }
    return out
  }, [next, quickBudget])

  // Time estimate from sets × ~3 min + small fixed warm-up.
  const totalSets = trimmedItems.reduce((a, it) => a + it.targetSets, 0)
  const minEstimate = totalSets > 0 ? Math.max(30, Math.round(totalSets * 3 + 10)) : null
  const fullCount = next ? next.items.length : 0
  const skippedCount = fullCount - trimmedItems.length

  const dateFmt = new Intl.DateTimeFormat(LOCALE_BCP47[locale], {
    weekday: 'long', month: 'long', day: 'numeric',
  })
  const lastSessionDateFmt = new Intl.DateTimeFormat(LOCALE_BCP47[locale], {
    weekday: 'short', month: 'short', day: 'numeric',
  })

  return (
    <div className="page train-dashboard">
      {proactive ? (
        <div className={`proactive proactive-${proactive.kind}`}>{proactive.text}</div>
      ) : null}

      <header className="dashboard-head">
        <div className="dashboard-date-row">
          <span className="muted small">{dateFmt.format(new Date())}</span>
          {streak >= 2 ? (
            <span className="streak-badge tabnum" title={`${streak}-day streak`}>
              🔥 {streak}
            </span>
          ) : null}
        </div>
        <Link to="/routines" className="dashboard-routine">
          <div className="dashboard-routine-meta">
            {routine.level ? (
              <span className="dashboard-chip">
                {t(`routines.level_${routine.level}` as 'routines.level_beginner')}
              </span>
            ) : null}
            <span className="dashboard-chip">
              {t('routines.days_per_week', { n: routine.daysPerWeek ?? routine.workouts.length })}
            </span>
          </div>
          <h2>{routine.name}</h2>
          {totalWorkouts > 0 ? (
            <span className="muted small">
              Day {position} of {totalWorkouts} in the cycle
            </span>
          ) : null}
        </Link>
      </header>

      {signal && signal.score > 0 ? (
        <div className={`fitness-signal trend-${signal.trend}`}>
          <div className="fitness-signal-num">
            <span className="fitness-signal-value tabnum">{signal.score}</span>
            <span className="fitness-signal-label">
              <span className="muted small">Fitness signal</span>
              <strong className={`fitness-signal-trend trend-${signal.trend}`}>
                {signal.trend === 'climbing' ? '↑ climbing' :
                 signal.trend === 'steady'   ? '→ steady'   :
                                                '↓ easing'}
              </strong>
            </span>
          </div>
          <p className="fitness-signal-reason">{signal.reason}</p>
        </div>
      ) : null}

      {next ? (
        <article className="today-card">
          <header className="today-card-head">
            <span className="muted small">{t('train.todays_workout')}</span>
            <h1 className="big-title">
              {next.name}
              {quickBudget !== null ? <span className="quick-tag"> · quick</span> : null}
            </h1>
            <span className="muted small">
              {t('train.n_exercises', { n: trimmedItems.length })}
              {minEstimate ? ` · ${t('routines.min_per_session', { n: minEstimate })}` : ''}
            </span>
          </header>

          {/* Quick time budget pills — trim today's session to fit
              30/45/60/90 min. Adherence-aware nudge highlights one of
              them when the user has been short on training. */}
          <div className="time-budget">
            {adherenceRatio < 0.7 && adherenceRatio > 0 && quickBudget === null ? (
              <p className="time-budget-hint">
                You\'ve been short on training — a lighter session today might be
                more sustainable than skipping again.
              </p>
            ) : null}
            <div className="time-budget-pills">
              <button
                type="button"
                className={`time-budget-pill${quickBudget === null ? ' active' : ''}`}
                onClick={() => setQuickBudget(null)}
              >Full</button>
              {[30, 45, 60, 90].map((m) => {
                const suggested = adherenceRatio < 0.7 && adherenceRatio > 0 && m === 45
                return (
                  <button
                    key={m}
                    type="button"
                    className={`time-budget-pill${quickBudget === m ? ' active' : ''}${suggested && quickBudget === null ? ' suggested' : ''}`}
                    onClick={() => setQuickBudget(m)}
                  >
                    {m}m
                  </button>
                )
              })}
            </div>
          </div>

          <ul className="today-card-exercises">
            {trimmedItems.slice(0, 5).map((it) => (
              <li key={it.exerciseId} className="today-card-exercise">
                <span className="today-card-exercise-name">
                  <ExerciseName id={it.exerciseId} />
                </span>
                <span className="today-card-exercise-prescription tabnum">
                  {it.targetSets} × {it.targetReps}
                </span>
              </li>
            ))}
            {trimmedItems.length > 5 ? (
              <li className="today-card-exercise more">
                <span className="muted small">+ {trimmedItems.length - 5} more</span>
              </li>
            ) : null}
            {skippedCount > 0 ? (
              <li className="today-card-exercise more">
                <span className="muted small">
                  ↪ {skippedCount} exercise{skippedCount === 1 ? '' : 's'} trimmed for today
                </span>
              </li>
            ) : null}
          </ul>

          <button
            className="btn primary block today-card-cta"
            onClick={start}
            disabled={starting}
          >
            {starting ? t('common.starting') : t('train.start_workout')} →
          </button>
        </article>
      ) : (
        <div className="card">
          <h2>{t('train.no_workout_queued')}</h2>
          <p className="muted small">{t('train.pick_routine_title')}</p>
          <Link to="/routines" className="btn block">
            {t('train.browse_routines')}
          </Link>
        </div>
      )}

      <section className="dashboard-stats">
        <div className="dashboard-stat">
          <span className="muted small">This week</span>
          <span className="dashboard-stat-value tabnum">
            {thisWeek}
            <span className="muted">/ {prescribed}</span>
          </span>
          <span className="muted small">sessions</span>
        </div>
        <Link to="/progress" className="dashboard-stat">
          <span className="muted small">Last session</span>
          {lastSession ? (
            <>
              <span className="dashboard-stat-value-text">{lastSession.workoutName}</span>
              <span className="muted small">
                {lastSessionDateFmt.format(new Date(lastSession.completedAt ?? lastSession.startedAt))}
              </span>
            </>
          ) : (
            <>
              <span className="dashboard-stat-value-text">—</span>
              <span className="muted small">No history yet</span>
            </>
          )}
        </Link>
        <Link to="/progress" className="dashboard-stat">
          <span className="muted small">{t('train.bodyweight')}</span>
          <span className="dashboard-stat-value tabnum">
            {latestBw ? kgToDisplay(latestBw.weightKg, units).toFixed(1) : '—'}
            <span className="unit">{latestBw ? ` ${units}` : ''}</span>
          </span>
          <span className="muted small">
            {latestBw ? lastSessionDateFmt.format(new Date(latestBw.date)) : t('train.log_it')}
          </span>
        </Link>
      </section>

      {restOfCycle.length > 1 ? (
        <section className="dashboard-cycle">
          <header className="dashboard-cycle-head">
            <span className="muted small">Rest of the cycle</span>
            <Link to={`/routines/${routine.id}`} className="link small">
              View full routine →
            </Link>
          </header>
          <ol className="dashboard-cycle-list">
            {restOfCycle.map((w, i) => {
              const isToday = i === 0
              return (
                <li
                  key={w.id}
                  className={`dashboard-cycle-row${isToday ? ' today' : ''}`}
                >
                  <span className="dashboard-cycle-marker" aria-hidden>
                    {isToday ? '●' : '○'}
                  </span>
                  <span className="dashboard-cycle-name">{w.name}</span>
                  <span className="dashboard-cycle-meta tabnum">
                    {isToday ? 'TODAY' : t('train.n_exercises', { n: w.items.length })}
                  </span>
                </li>
              )
            })}
            {nextIdx + restOfCycle.length < totalWorkouts ? (
              <li className="dashboard-cycle-row more">
                <span className="dashboard-cycle-marker" aria-hidden>+</span>
                <span className="dashboard-cycle-name muted">
                  {totalWorkouts - (nextIdx + restOfCycle.length)} more after this
                </span>
              </li>
            ) : null}
          </ol>
        </section>
      ) : null}
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
  const local = useLocalizedExercise(ex)
  return <>{local?.name ?? ex?.name ?? id}</>
}
