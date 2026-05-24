import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import {
  db,
  type PlanItem,
  type SetLog,
  type Units,
  WEIGHT_FORMAT_LABEL,
} from '../db/schema'
import {
  deleteSetLog,
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
import ActiveSetCard from './ActiveSetCard'
import ExercisePicker from './ExercisePicker'

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

  const startTimer = useRestTimer((s) => s.start)

  const workingLogs = logs.filter((l) => !l.isWarmup)
  const warmupLogs = logs.filter((l) => l.isWarmup)
  const skillLevel = settings?.skillLevel ?? 'beginner'

  const repsLow = Number(String(item.targetReps).split(/[–\-]/)[0]) || null
  const repsHigh =
    Number(String(item.targetReps).split(/[–\-]/)[1] || String(item.targetReps).split(/[–\-]/)[0]) ||
    repsLow

  const lastWorking = workingLogs[workingLogs.length - 1]
  const suggestedKg =
    lastWorking?.weight ?? progression?.suggestedKg ?? null
  // After the first set, default the next set's reps to what you just did.
  // Otherwise aim for the top of the target range.
  const suggestedReps = lastWorking?.reps ?? repsHigh

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

  const hintKind = progression?.hint.kind
  const hintActive = hintKind === 'increase' || hintKind === 'reduce' || hintKind === 'hold'

  return (
    <article className="session-card v3" data-exercise-card={item.exerciseId}>
      <header className="card-v3-head">
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
          className="card-v3-title"
          onFocus={() => onFocus(suggestedKg)}
        >
          <h2>{exercise?.name ?? item.exerciseId}</h2>
          <span className="card-v3-subtitle">
            Exercise {positionIndex + 1} of {totalExercises}
            {exercise?.equipment ? ` · ${exercise.equipment}` : ''}
          </span>
        </Link>
        <div className="card-v3-head-actions">
          <button
            type="button"
            className="card-v3-swap"
            onClick={() => setShowQuickSwap((v) => !v)}
            disabled={!suggestions || suggestions.length === 0}
            aria-expanded={showQuickSwap}
            aria-label="Swap exercise for a similar one"
            title="Swap for a similar exercise"
          >
            ⇄
          </button>
          <div className="more-wrap">
            <button
              type="button"
              className="card-v3-more"
              onClick={() => setShowMore((v) => !v)}
              aria-expanded={showMore}
              aria-haspopup="menu"
              aria-label="Exercise actions"
            >
              ⋯
            </button>
            {showMore ? (
              <div className="more-menu card-v3-more-menu" role="menu">
                {!pendingWarmup ? (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { setShowMore(false); setPendingWarmup(true) }}
                  >
                    + Add warm-up set
                  </button>
                ) : null}
                <button
                  type="button"
                  role="menuitem"
                  disabled={!suggestions || suggestions.length === 0}
                  onClick={() => { setShowMore(false); setShowQuickSwap(true) }}
                >
                  ⇄ Swap exercise
                </button>
                {exercise ? (
                <a
                  role="menuitem"
                  href={demoSearchUrl(exercise.videoQuery, exercise.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowMore(false)}
                >
                  ▶ Watch demo on YouTube
                </a>
              ) : null}
                <button
                  type="button"
                  role="menuitem"
                  className="danger"
                  onClick={() => {
                    setShowMore(false)
                    if (workingLogs.length > 0 && !confirm('Skip this exercise? Your logged sets will remain.')) return
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
      </header>

      {showQuickSwap && suggestions && suggestions.length > 0 ? (
        <div className="card-v3-suggest" role="menu">
          <div className="card-v3-suggest-head">
            <span className="card-v3-info-label">Swap to</span>
            <button type="button" className="link" onClick={() => setShowQuickSwap(false)}>Close</button>
          </div>
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              role="menuitem"
              className="card-v3-suggest-item"
              onClick={() => {
                setShowQuickSwap(false)
                onSwap(s.id)
                toast(`Swapped to ${s.name}`, { kind: 'success', duration: 2000 })
              }}
            >
              <strong>{s.name}</strong>
              <span>{s.equipment}{s.isCurated ? ' · ★ Core' : ''}</span>
            </button>
          ))}
          <button
            type="button"
            role="menuitem"
            className="card-v3-suggest-browse"
            onClick={() => { setShowQuickSwap(false); setShowSwap(true) }}
          >
            Browse all exercises →
          </button>
        </div>
      ) : null}

      <div className="card-v3-info">
        <div className="card-v3-info-row">
          <span className="card-v3-info-label">Target</span>
          <strong className="tabnum">
            {item.targetSets} ×{' '}
            {repsContainsAmrap ? (
              <span className="explain-pill" title="AMRAP = as many reps as possible.">
                {item.targetReps}
              </span>
            ) : (
              item.targetReps
            )}
          </strong>
          <span className="card-v3-info-meta tabnum" title={rpeExplainer(item.targetRPE)}>
            @ RPE {item.targetRPE}
          </span>
          {hintActive ? (
            <span
              className={`hint-pill ${
                hintKind === 'increase' ? 'up' : hintKind === 'reduce' ? 'down' : 'hold'
              }`}
              title={progression?.hint.reason}
            >
              {hintKind === 'increase' ? '↑' : hintKind === 'reduce' ? '↓' : '→'}{' '}
              {progression?.hint.reason}
            </span>
          ) : null}
        </div>
        {lastSession ? (
          <div className="card-v3-info-row">
            <span className="card-v3-info-label">Last</span>
            <strong className="tabnum">
              {lastSession.sets
                .map((s) => `${fmt(kgToDisplay(s.weight, units), units)}×${s.reps}`)
                .join(' · ')}
            </strong>
          </div>
        ) : null}
        {exercise?.weightFormat && exercise.weightFormat !== 'generic' ? (
          <span className="card-v3-info-format">
            ⓘ {WEIGHT_FORMAT_LABEL[exercise.weightFormat]}
          </span>
        ) : null}
      </div>

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
        <ActiveSetCard
          key="pending-warmup"
          setNumber={warmupLogs.length + 1}
          totalSets={warmupLogs.length + 1}
          units={units}
          suggestedKg={suggestedKg !== null ? suggestedKg * 0.5 : null}
          suggestedReps={Math.max(5, Math.round((repsLow ?? 6) / 2))}
          defaultWarmup
          onLog={(data) => handleLog(warmupLogs.length, { ...data, isWarmup: true }, 0)}
          onCancelWarmup={() => setPendingWarmup(false)}
        />
      ) : null}

      <div className="set-list">
        {/* Logged working sets — compact, tap to edit. */}
        {workingLogs.map((logged, idx) => (
          <OneTapSetRow
            key={`done-${idx}-${logged.id}`}
            index={idx}
            units={units}
            suggestedKg={logged.weight}
            suggestedReps={logged.reps}
            lastSessionTopKg={lastSessionTopKg}
            logged={logged}
            onLog={() => {}}
            onUnlog={async () => {
              if (logged.id) {
                await deleteSetLog(logged.id)
                toast('Set deleted', { kind: 'info', duration: 1500 })
              }
            }}
          />
        ))}

        {/* Active set — values + steppers + giant LOG button, all visible
           at once. Adjust weight without first tapping "Edit". */}
        {remaining > 0 ? (
          <ActiveSetCard
            key={`active-${workingLogs.length}`}
            setNumber={workingLogs.length + 1}
            totalSets={totalSetsPlanned}
            units={units}
            suggestedKg={suggestedKg}
            suggestedReps={suggestedReps}
            onLog={(data) =>
              handleLog(workingLogs.length, data, exercise?.defaultRestSec ?? 90)
            }
          />
        ) : null}

        {/* Upcoming sets collapse into one tiny placeholder line. */}
        {remaining > 1 ? (
          <div className="upcoming-sets">
            + {remaining - 1} more set{remaining - 1 === 1 ? '' : 's'} to go
            {suggestedKg ? ` · target ${kgToDisplay(suggestedKg, units).toFixed(units === 'kg' ? 1 : 0)} ${units} × ${repsHigh ?? '?'}` : ''}
          </div>
        ) : null}
      </div>

      {workingLogs.length > 0 && remaining > 0 ? (
        <button
          type="button"
          className="repeat-last-strip"
          disabled={repeating}
          onClick={repeatLastSet}
        >
          ↺ Repeat last set × {remaining} more
        </button>
      ) : null}

      {/* Cues collapsed at the bottom — out of the way until needed. */}
      {exercise?.cues && exercise.cues.length > 0 ? (
        <details
          className="card-v3-cues"
          open={showAllCues}
          onToggle={(e) => setShowAllCues((e.target as HTMLDetailsElement).open)}
        >
          <summary>
            {showAllCues
              ? 'Hide form cues'
              : `Form cues · ${exercise.cues.length}${
                  skillLevel === 'beginner' && exercise.isCurated && exercise.bulkingTip ? ' + tip' : ''
                }`}
          </summary>
          <ol className="card-v3-cue-list">
            {exercise.cues.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ol>
          {skillLevel === 'beginner' && exercise.isCurated && exercise.bulkingTip ? (
            <p className="card-v3-cue-tip">💡 {exercise.bulkingTip}</p>
          ) : null}
        </details>
      ) : null}

      {remaining === 0 && workingLogs.length > 0 ? (
        <p className="muted small done-line">All sets done · advancing to next…</p>
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

function demoSearchUrl(query: string | undefined, fallback: string): string {
  const q = query || `${fallback} technique form`
  // sp=EgIQAQ filters YouTube search to videos only.
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&sp=EgIQAQ%253D%253D`
}

function rpeExplainer(rpe: number): string {
  if (rpe >= 10) return 'RPE 10 = total failure. No reps left in the tank.'
  if (rpe >= 9) return 'RPE 9 = 1 rep short of failure. Save for finishers.'
  if (rpe >= 8) return 'RPE 8 = 2 reps short of failure. The hypertrophy sweet spot.'
  if (rpe >= 7) return 'RPE 7 = 3 reps short of failure. Warm-ups or speed work.'
  return 'RPE 6 or lower = 4+ reps in reserve. Light work.'
}
