import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import {
  db,
  MUSCLE_LABEL,
  type PlanItem,
  type SetLog,
  type Units,
  WEIGHT_FORMAT_LABEL,
} from '../db/schema'
import {
  deleteSetLog,
  exerciseProgression,
  lastWorkingSetsForExercise,
  logSet,
  suggestProgression,
  useSettings,
} from '../db/queries'
import { useRestTimer } from '../state/restTimer'
import { toast } from '../state/toasts'
import { haptics } from '../lib/haptics'
import { kgToDisplay } from '../lib/units'
import ExerciseImage from './ExerciseImage'
import OneTapSetRow from './OneTapSetRow'
import ExercisePicker from './ExercisePicker'
import MiniSparkline from './MiniSparkline'

interface Props {
  item: PlanItem
  sessionId: number
  units: Units
  positionIndex: number
  totalExercises: number
  onSwap: (newId: string) => void
  onSkip: () => void
  onFocus: (suggestedKg: number | null) => void
  onAdvance?: () => void
}

export default function SessionExerciseCard({
  item,
  sessionId,
  units,
  positionIndex,
  totalExercises,
  onSwap,
  onSkip,
  onFocus,
  onAdvance,
}: Props) {
  const settings = useSettings()
  const exercise = useLiveQuery(() => db.exercises.get(item.exerciseId), [item.exerciseId])
  const [showSwap, setShowSwap] = useState(false)
  const [pendingWarmup, setPendingWarmup] = useState(false)
  const [showAllCues, setShowAllCues] = useState(false)
  const [showImageZoom, setShowImageZoom] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [repeating, setRepeating] = useState(false)
  const [showQuickSwap, setShowQuickSwap] = useState(false)

  // Same-muscle alternatives, curated-first then by recent usage.
  const suggestions = useLiveQuery(async () => {
    if (!exercise) return []
    const all = await db.exercises.toArray()
    const candidates = all.filter(
      (e) => e.id !== exercise.id && e.primaryMuscle === exercise.primaryMuscle,
    )
    const cutoff = Date.now() - 30 * 24 * 3600 * 1000
    const recentLogs = await db.setLogs.where('loggedAt').above(cutoff).toArray()
    const usage = new Map<string, number>()
    for (const l of recentLogs) {
      if (!l.isWarmup) usage.set(l.exerciseId, (usage.get(l.exerciseId) ?? 0) + 1)
    }
    candidates.sort((a, b) => {
      if (a.isCurated !== b.isCurated) return a.isCurated ? -1 : 1
      const ua = usage.get(a.id) ?? 0
      const ub = usage.get(b.id) ?? 0
      if (ua !== ub) return ub - ua
      return a.name.localeCompare(b.name)
    })
    return candidates.slice(0, 6)
  }, [exercise?.id, exercise?.primaryMuscle])

  const logs =
    useLiveQuery(
      () =>
        db.setLogs
          .where('sessionId')
          .equals(sessionId)
          .filter((l) => l.exerciseId === item.exerciseId)
          .toArray()
          .then((arr) => arr.sort((a, b) => a.loggedAt - b.loggedAt)),
      [sessionId, item.exerciseId],
    ) ?? []

  const progression = useLiveQuery(
    () => suggestProgression(item.exerciseId, item, sessionId),
    [item.exerciseId, sessionId, item.targetReps],
  )

  const lastSession = useLiveQuery(
    () => lastWorkingSetsForExercise(item.exerciseId, sessionId, 1),
    [item.exerciseId, sessionId],
  )

  // Mini sparkline of last 5 top-set weights
  const sparklineData = useLiveQuery(
    () => exerciseProgression(item.exerciseId, 5),
    [item.exerciseId],
  )

  const startTimer = useRestTimer((s) => s.start)

  const workingLogs = logs.filter((l) => !l.isWarmup)
  const warmupLogs = logs.filter((l) => l.isWarmup)
  const skillLevel = settings?.skillLevel ?? 'beginner'

  const repsLow = Number(String(item.targetReps).split(/[–\-]/)[0]) || null
  const repsHigh =
    Number(String(item.targetReps).split(/[–\-]/)[1] || String(item.targetReps).split(/[–\-]/)[0]) ||
    repsLow

  const suggestedKg =
    workingLogs.length > 0
      ? workingLogs[workingLogs.length - 1].weight
      : progression?.suggestedKg ?? null

  const lastSessionTopKg = lastSession?.sets[0]?.weight ?? null

  const totalSetsPlanned = item.targetSets
  const remaining = Math.max(0, totalSetsPlanned - workingLogs.length)

  const rows: { idx: number; logged?: SetLog }[] = []
  for (let i = 0; i < Math.max(totalSetsPlanned, workingLogs.length); i++) {
    rows.push({ idx: i, logged: workingLogs[i] })
  }

  // Auto-advance when the last set of the exercise is logged.
  // Use refs to avoid re-scheduling the timer on every parent re-render
  // (onAdvance is typically a fresh closure each render).
  const onAdvanceRef = useRef(onAdvance)
  useEffect(() => {
    onAdvanceRef.current = onAdvance
  })
  const lastAdvanceTriggerRef = useRef<number | null>(null)
  const lastLogTime = workingLogs[workingLogs.length - 1]?.loggedAt ?? null

  useEffect(() => {
    if (!onAdvanceRef.current) return
    if (workingLogs.length === 0) return
    if (workingLogs.length < totalSetsPlanned) return
    if (lastLogTime === null) return
    if (lastAdvanceTriggerRef.current === lastLogTime) return
    if (Date.now() - lastLogTime > 3000) return
    lastAdvanceTriggerRef.current = lastLogTime
    const t = window.setTimeout(() => onAdvanceRef.current?.(), 1400)
    return () => window.clearTimeout(t)
  }, [workingLogs.length, totalSetsPlanned, lastLogTime])

  async function handleLog(
    rowIdx: number,
    data: { weightKg: number; reps: number; rpe: number | null; isWarmup: boolean },
    restSec: number,
  ) {
    // Detect a working-set PR BEFORE the new log lands: if this weight beats
    // the user's prior all-time top working weight for this exercise, it's a PR.
    let isPR = false
    if (!data.isWarmup) {
      const priorWorking = await db.setLogs
        .where('exerciseId')
        .equals(item.exerciseId)
        .filter((l) => !l.isWarmup && l.sessionId !== sessionId)
        .toArray()
      const priorTop = priorWorking.reduce((m, l) => Math.max(m, l.weight), 0)
      if (priorTop > 0 && data.weightKg > priorTop) isPR = true
    }

    await logSet(
      sessionId,
      item.exerciseId,
      rowIdx,
      data.weightKg,
      data.reps,
      data.rpe,
      data.isWarmup,
    )
    if (data.isWarmup) {
      haptics.pop()
      toast('Warm-up logged', { kind: 'info', duration: 1800 })
    } else {
      if (isPR) {
        haptics.pr()
        toast(
          `🥇 NEW PR · ${exercise?.name ?? 'Exercise'} · ${fmt(kgToDisplay(data.weightKg, units), units)} ${units}`,
          { kind: 'success', duration: 4500 },
        )
      } else {
        haptics.tap()
      }
      startTimer(restSec)
    }
    setPendingWarmup(false)
    onFocus(data.weightKg)
  }

  const sparkValues = (sparklineData ?? []).map((p) => p.value)
  const repsContainsAmrap = /amrap/i.test(item.targetReps)

  async function repeatLastSet() {
    if (repeating) return
    const lastWorking = workingLogs[workingLogs.length - 1]
    if (!lastWorking) return
    setRepeating(true)
    try {
      const pendingCount = Math.max(0, totalSetsPlanned - workingLogs.length)
      // Walk through each pending working slot and log identical numbers.
      let nextIdx = workingLogs.length
      for (let i = 0; i < pendingCount; i++) {
        await logSet(
          sessionId,
          item.exerciseId,
          nextIdx,
          lastWorking.weight,
          lastWorking.reps,
          lastWorking.rpe,
          false,
        )
        nextIdx += 1
      }
      haptics.double()
      startTimer(exercise?.defaultRestSec ?? 90)
      toast(`Logged ${pendingCount} more at ${lastWorking.weight} × ${lastWorking.reps}`, { kind: 'success' })
    } finally {
      setRepeating(false)
    }
  }

  return (
    <article className="session-card v2" data-exercise-card={item.exerciseId}>
      <header className="session-card-head">
        <button
          type="button"
          className="exercise-thumb-btn"
          onClick={() => setShowImageZoom(true)}
          aria-label={`View ${exercise?.name ?? 'exercise'} demo image`}
          disabled={!exercise?.imageUrls || exercise.imageUrls.length === 0}
        >
          <ExerciseImage urls={exercise?.imageUrls ?? []} alt={exercise?.name ?? item.exerciseId} />
        </button>
        <Link
          to={`/exercise/${item.exerciseId}`}
          className="session-card-link-text"
          onFocus={() => onFocus(suggestedKg)}
        >
          <span className="position-tag muted small">
            Exercise {positionIndex + 1} of {totalExercises}
          </span>
          <h2>{exercise?.name ?? item.exerciseId}</h2>
          <span className="muted small">
            {exercise?.equipment ?? '—'}
          </span>
        </Link>
        {sparkValues.length >= 2 ? (
          <div className="sparkline-cell" title="Last 5 top-set weights">
            <MiniSparkline values={sparkValues} />
            <span className="muted small">progression</span>
          </div>
        ) : null}
      </header>

      <div className="target-line">
        <span className="muted small">Target</span>
        <strong className="tabnum">
          {item.targetSets} ×{' '}
          {repsContainsAmrap ? (
            <span
              className="explain-pill"
              title="AMRAP = as many reps as possible. Do as many clean reps as you can on this set."
            >
              {item.targetReps}
            </span>
          ) : (
            item.targetReps
          )}
        </strong>
        <span
          className="muted small explain-pill"
          title={rpeExplainer(item.targetRPE)}
        >
          @ RPE {item.targetRPE}
        </span>
      </div>

      {exercise?.weightFormat && exercise.weightFormat !== 'generic' ? (
        <p className="weight-format-hint muted small">
          ⓘ {WEIGHT_FORMAT_LABEL[exercise.weightFormat]}
        </p>
      ) : null}

      {lastSession ? (
        <div className="last-session-line muted small">
          Last:{' '}
          <strong className="tabnum">
            {lastSession.sets
              .map((s) => `${fmt(kgToDisplay(s.weight, units), units)}×${s.reps}`)
              .join(', ')}
          </strong>
        </div>
      ) : (
        <div className="last-session-line muted small">No history for this lift yet.</div>
      )}

      {progression && (progression.hint.kind === 'increase' ||
        progression.hint.kind === 'reduce' ||
        progression.hint.kind === 'hold') ? (
        <div className="hint-line">
          <span
            className={`hint-pill ${
              progression.hint.kind === 'increase'
                ? 'up'
                : progression.hint.kind === 'reduce'
                ? 'down'
                : 'hold'
            }`}
          >
            {progression.hint.kind === 'increase'
              ? '↑'
              : progression.hint.kind === 'reduce'
              ? '↓'
              : '→'}{' '}
            {progression.hint.reason}
          </span>
        </div>
      ) : null}

      {warmupLogs.length > 0 ? (
        <div className="set-list warmups" aria-label="Warm-up sets">
          {warmupLogs.map((w, i) => (
            <OneTapSetRow
              key={`w-${w.id}`}
              index={i}
              units={units}
              suggestedKg={w.weight}
              suggestedReps={w.reps}
              logged={w}
              onLog={() => {}}
              onUnlog={async () => {
                if (w.id) {
                  await deleteSetLog(w.id)
                  toast('Warm-up removed', { kind: 'info', duration: 1500 })
                }
              }}
            />
          ))}
        </div>
      ) : null}

      {pendingWarmup ? (
        <OneTapSetRow
          key="pending-warmup"
          index={warmupLogs.length}
          units={units}
          suggestedKg={suggestedKg !== null ? suggestedKg * 0.5 : null}
          suggestedReps={Math.max(5, Math.round((repsLow ?? 6) / 2))}
          prefillWarmup
          onLog={(data) => handleLog(warmupLogs.length, { ...data, isWarmup: true }, 0)}
          onUnlog={() => setPendingWarmup(false)}
        />
      ) : null}

      <div className="set-list">
        {rows.map(({ idx, logged }) => (
          <OneTapSetRow
            key={`${idx}-${logged?.id ?? 'p'}`}
            index={idx}
            units={units}
            suggestedKg={logged ? logged.weight : suggestedKg}
            suggestedReps={logged ? logged.reps : repsHigh}
            lastSessionTopKg={lastSessionTopKg}
            logged={logged}
            onLog={(data) =>
              handleLog(idx, data, exercise?.defaultRestSec ?? 90)
            }
            onUnlog={async () => {
              if (logged?.id) {
                await deleteSetLog(logged.id)
                toast('Set deleted', { kind: 'info', duration: 1500 })
              }
            }}
          />
        ))}
      </div>

      {workingLogs.length > 0 && remaining > 0 ? (
        <button
          type="button"
          className="btn small repeat-last-btn"
          disabled={repeating}
          onClick={repeatLastSet}
        >
          ↺ Repeat last set × {remaining} more
        </button>
      ) : null}

      <div className="card-actions">
        {!pendingWarmup ? (
          <button
            type="button"
            className="btn small ghost"
            onClick={() => setPendingWarmup(true)}
          >
            + Add warm-up
          </button>
        ) : null}
        <div className="more-wrap">
          <button
            type="button"
            className="btn small ghost"
            onClick={() => setShowQuickSwap((v) => !v)}
            aria-expanded={showQuickSwap}
            aria-haspopup="menu"
            disabled={!suggestions || suggestions.length === 0}
          >
            ⇄ Quick swap
          </button>
          {showQuickSwap && suggestions && suggestions.length > 0 ? (
            <div className="more-menu quick-swap-menu" role="menu">
              <div className="quick-swap-header muted small">
                Other {exercise?.primaryMuscle ? MUSCLE_LABEL[exercise.primaryMuscle].toLowerCase() : 'similar'} moves
              </div>
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="menuitem"
                  className="quick-swap-item"
                  onClick={() => {
                    setShowQuickSwap(false)
                    onSwap(s.id)
                    toast(`Swapped to ${s.name}`, { kind: 'success', duration: 2000 })
                  }}
                >
                  <strong>{s.name}</strong>
                  <span className="muted small">
                    {s.equipment}
                    {s.isCurated ? ' · ★ Core' : ''}
                  </span>
                </button>
              ))}
              <button
                type="button"
                role="menuitem"
                className="quick-swap-browse"
                onClick={() => {
                  setShowQuickSwap(false)
                  setShowSwap(true)
                }}
              >
                Browse all options →
              </button>
            </div>
          ) : null}
        </div>
        <div className="more-wrap">
          <button
            type="button"
            className="btn small ghost"
            onClick={() => setShowMore((v) => !v)}
            aria-expanded={showMore}
            aria-haspopup="menu"
          >
            ⋯ More
          </button>
          {showMore ? (
            <div className="more-menu" role="menu">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setShowMore(false)
                  if (workingLogs.length > 0) {
                    if (!confirm('Skip this exercise? Your logged sets will remain.')) return
                  }
                  onSkip()
                  toast(`${exercise?.name ?? 'Exercise'} skipped`, { kind: 'info', duration: 2000 })
                }}
              >
                ⤼ Skip exercise
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Beginner-only: collapsible cues inline */}
      {skillLevel === 'beginner' && exercise?.cues && exercise.cues.length > 0 ? (
        <details
          className="inline-cues"
          open={showAllCues}
          onToggle={(e) => setShowAllCues((e.target as HTMLDetailsElement).open)}
        >
          <summary>How to do this exercise</summary>
          <ol className="inline-cue-list">
            {exercise.cues.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ol>
          {exercise.isCurated && exercise.bulkingTip ? (
            <p className="inline-tip muted small">💡 {exercise.bulkingTip}</p>
          ) : null}
        </details>
      ) : null}

      {remaining === 0 && workingLogs.length > 0 ? (
        <p className="muted small done-line">All sets done · 💪 advancing to next…</p>
      ) : null}

      {showSwap ? (
        <ExercisePicker
          title={`Swap ${exercise?.name ?? 'exercise'}`}
          onClose={() => setShowSwap(false)}
          initialMuscle={exercise?.primaryMuscle}
          onPick={(id) => {
            onSwap(id)
            setShowSwap(false)
            toast('Exercise swapped', { kind: 'success', duration: 2000 })
          }}
        />
      ) : null}

      {showImageZoom && exercise?.imageUrls && exercise.imageUrls.length > 0 ? (
        <div className="modal-backdrop image-zoom-backdrop" onClick={() => setShowImageZoom(false)}>
          <div className="image-zoom-container" onClick={(e) => e.stopPropagation()}>
            <button
              className="image-zoom-close"
              onClick={() => setShowImageZoom(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <ExerciseImage urls={exercise.imageUrls} alt={exercise.name} className="image-zoom-image" />
            <div className="image-zoom-caption">
              <strong>{exercise.name}</strong>
              <span className="muted small">{exercise.equipment}</span>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  )
}

function fmt(value: number, units: Units): string {
  if (units === 'lb') return Math.round(value).toString()
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(1)
}

function rpeExplainer(rpe: number): string {
  if (rpe >= 10) return 'RPE 10 = total failure. No reps left in the tank.'
  if (rpe >= 9) return 'RPE 9 = 1 rep short of failure. Save for finishers.'
  if (rpe >= 8) return 'RPE 8 = 2 reps short of failure. The hypertrophy sweet spot.'
  if (rpe >= 7) return 'RPE 7 = 3 reps short of failure. Warm-ups or speed work.'
  return 'RPE 6 or lower = 4+ reps in reserve. Light work.'
}
