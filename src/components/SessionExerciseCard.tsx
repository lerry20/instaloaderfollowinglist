import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import {
  db,
  type PlanItem,
  type SetLog,
  type Units,
} from '../db/schema'
import {
  deleteSetLog,
  lastWorkingSetsForExercise,
  logSet,
  suggestProgression,
} from '../db/queries'
import { useRestTimer } from '../state/restTimer'
import { toast } from '../state/toasts'
import ExerciseImage from './ExerciseImage'
import OneTapSetRow from './OneTapSetRow'
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
}: Props) {
  const exercise = useLiveQuery(() => db.exercises.get(item.exerciseId), [item.exerciseId])
  const [showSwap, setShowSwap] = useState(false)
  const [pendingWarmup, setPendingWarmup] = useState(false)

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

  const repsLow =
    Number(String(item.targetReps).split(/[–\-]/)[0]) || null
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

  function handleLog(
    rowIdx: number,
    data: { weightKg: number; reps: number; rpe: number | null; isWarmup: boolean },
    restSec: number,
  ) {
    logSet(
      sessionId,
      item.exerciseId,
      rowIdx,
      data.weightKg,
      data.reps,
      data.rpe,
      data.isWarmup,
    ).then((id) => {
      if (!data.isWarmup) startTimer(restSec)
      setPendingWarmup(false)
      setTimeout(() => {
        scrollToNext()
      }, 80)
      if (data.isWarmup) {
        toast('Warm-up logged', { kind: 'info', duration: 1800 })
      }
      // Side effect: pass focus to parent so plate calc can update.
      onFocus(data.weightKg)
      void id
    })
  }

  function scrollToNext() {
    const card = document.querySelector(`[data-exercise-card="${item.exerciseId}"]`)
    const next = card?.querySelector('.set-row-v2.pending') as HTMLElement | null
    if (next) {
      next.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else {
      const sibling = card?.nextElementSibling as HTMLElement | null
      sibling?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <article className="session-card" data-exercise-card={item.exerciseId}>
      <header className="session-card-head">
        <Link
          to={`/exercise/${item.exerciseId}`}
          className="session-card-link"
          onFocus={() => onFocus(suggestedKg)}
        >
          <ExerciseImage urls={exercise?.imageUrls ?? []} alt={exercise?.name ?? item.exerciseId} />
          <div className="session-card-titles">
            <span className="position-tag muted small">
              {positionIndex + 1} / {totalExercises}
            </span>
            <h2>{exercise?.name ?? item.exerciseId}</h2>
            <span className="muted small">
              {exercise?.equipment ?? '—'}
            </span>
          </div>
        </Link>
      </header>

      <div className="target-line">
        <span className="muted small">Target</span>
        <strong className="tabnum">
          {item.targetSets} × {item.targetReps}
        </strong>
        <span className="muted small">@ RPE {item.targetRPE}</span>
      </div>

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
        <button
          type="button"
          className="btn small ghost"
          onClick={() => setShowSwap(true)}
        >
          ⇄ Swap exercise
        </button>
        <button
          type="button"
          className="btn small ghost"
          onClick={() => {
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

      {remaining === 0 && workingLogs.length > 0 ? (
        <p className="muted small done-line">All sets done · 💪</p>
      ) : null}

      {showSwap ? (
        <ExercisePicker
          title={`Swap ${exercise?.name ?? 'exercise'}`}
          onClose={() => setShowSwap(false)}
          onPick={(id) => {
            onSwap(id)
            setShowSwap(false)
            toast('Exercise swapped', { kind: 'success', duration: 2000 })
          }}
        />
      ) : null}
    </article>
  )
}

function fmt(value: number, units: Units): string {
  if (units === 'lb') return Math.round(value).toString()
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(1)
}

function kgToDisplay(kg: number, units: Units): number {
  return units === 'kg' ? kg : kg / 0.45359237
}
