import { useEffect, useRef, useState } from 'react'
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
import { kgToDisplay } from '../lib/units'
import { useRestTimer } from '../state/restTimer'
import ExerciseImage from './ExerciseImage'
import OneTapSetRow from './OneTapSetRow'
import ExercisePicker from './ExercisePicker'

interface Props {
  item: PlanItem
  sessionId: number
  units: Units
  onSwap: (newId: string) => void
}

export default function SessionExerciseCard({ item, sessionId, units, onSwap }: Props) {
  const exercise = useLiveQuery(() => db.exercises.get(item.exerciseId), [item.exerciseId])
  const cardRef = useRef<HTMLElement>(null)
  const [showSwap, setShowSwap] = useState(false)

  const logs =
    useLiveQuery(
      () =>
        db.setLogs
          .where({ sessionId, exerciseId: item.exerciseId })
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

  const totalSetsPlanned = item.targetSets
  const remaining = Math.max(0, totalSetsPlanned - workingLogs.length)

  // Pre-build rows: already-logged sets + pending sets up to plan target.
  const rows: { idx: number; logged?: SetLog }[] = []
  for (let i = 0; i < Math.max(totalSetsPlanned, workingLogs.length); i++) {
    rows.push({ idx: i, logged: workingLogs[i] })
  }

  // Auto-scroll handled by parent in SessionView on log; here we just commit data.
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
    ).then(() => {
      startTimer(restSec)
      setTimeout(() => {
        const next = cardRef.current?.querySelector('.one-tap-row.pending') as HTMLElement | null
        if (next) {
          next.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else {
          const nextCard = cardRef.current?.nextElementSibling as HTMLElement | null
          nextCard?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 80)
    })
  }

  useEffect(() => {
    // no-op effect to keep TS happy
  }, [])

  return (
    <article className="session-card" ref={cardRef}>
      <header className="session-card-head">
        <Link to={`/exercise/${item.exerciseId}`} className="session-card-link">
          <ExerciseImage urls={exercise?.imageUrls ?? []} alt={exercise?.name ?? item.exerciseId} />
          <div className="session-card-titles">
            <h2>{exercise?.name ?? item.exerciseId}</h2>
            <span className="muted small">
              {exercise?.equipment ?? '—'}
            </span>
          </div>
        </Link>
        <button
          className="link small swap-link"
          onClick={() => setShowSwap(true)}
          aria-label="Swap exercise"
        >
          Swap
        </button>
      </header>

      <div className="target-line">
        <span className="muted small">Target</span>
        <strong className="tabnum">
          {item.targetSets} × {item.targetReps}
        </strong>
        <span className="muted small">@ RPE {item.targetRPE}</span>
      </div>

      <div className="last-session-line">
        {lastSession ? (
          <span className="muted small">
            Last:{' '}
            <strong className="tabnum">
              {fmt(kgToDisplay(lastSession.sets[0]?.weight ?? 0, units), units)} {units}
            </strong>{' '}
            × {lastSession.sets.map((s) => s.reps).join(', ')}
          </span>
        ) : (
          <span className="muted small">No history yet</span>
        )}
        {progression && progression.hint.kind === 'increase' ? (
          <span className="hint-pill up">↑ {progression.hint.reason}</span>
        ) : null}
        {progression && progression.hint.kind === 'reduce' ? (
          <span className="hint-pill down">↓ {progression.hint.reason}</span>
        ) : null}
        {progression && progression.hint.kind === 'hold' ? (
          <span className="hint-pill hold">→ {progression.hint.reason}</span>
        ) : null}
      </div>

      {warmupLogs.length > 0 ? (
        <div className="set-list warmups">
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
                if (w.id) await deleteSetLog(w.id)
              }}
            />
          ))}
        </div>
      ) : null}

      <div className="set-list">
        {rows.map(({ idx, logged }) => (
          <OneTapSetRow
            key={`${idx}-${logged?.id ?? 'p'}`}
            index={idx}
            units={units}
            suggestedKg={logged ? logged.weight : suggestedKg}
            suggestedReps={logged ? logged.reps : repsHigh}
            logged={logged}
            onLog={(data) =>
              handleLog(idx, data, exercise?.defaultRestSec ?? 90)
            }
            onUnlog={async () => {
              if (logged?.id) await deleteSetLog(logged.id)
            }}
          />
        ))}
      </div>

      {remaining === 0 && workingLogs.length > 0 ? (
        <p className="muted small done-line">All sets done · keep pushing 💪</p>
      ) : null}

      {showSwap ? (
        <ExercisePicker
          title={`Swap ${exercise?.name ?? 'exercise'}`}
          onClose={() => setShowSwap(false)}
          onPick={(id) => {
            onSwap(id)
            setShowSwap(false)
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
