import { useEffect, useState } from 'react'

export interface PendingSet {
  weight: number | ''
  reps: number | ''
  rpe: number | ''
}

interface Props {
  index: number
  initial?: PendingSet
  defaultWeight?: number
  defaultReps?: number
  units: string
  onLog: (data: { weight: number; reps: number; rpe: number | null }) => void
  logged?: { weight: number; reps: number; rpe: number | null }
  onUnlog?: () => void
}

export default function SetRow({
  index,
  initial,
  defaultWeight,
  defaultReps,
  units,
  onLog,
  logged,
  onUnlog,
}: Props) {
  const [weight, setWeight] = useState<number | ''>(initial?.weight ?? defaultWeight ?? '')
  const [reps, setReps] = useState<number | ''>(initial?.reps ?? defaultReps ?? '')
  const [rpe, setRpe] = useState<number | ''>(initial?.rpe ?? '')

  useEffect(() => {
    if (!logged) {
      if (weight === '' && defaultWeight) setWeight(defaultWeight)
      if (reps === '' && defaultReps) setReps(defaultReps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultWeight, defaultReps])

  if (logged) {
    return (
      <div className="set-row logged">
        <span className="set-pill">Set {index + 1}</span>
        <span className="set-data">
          {logged.weight}
          {units} × {logged.reps}
          {logged.rpe !== null ? <span className="rpe">RPE {logged.rpe}</span> : null}
        </span>
        <button className="link" onClick={onUnlog}>
          Undo
        </button>
      </div>
    )
  }

  const canLog = typeof weight === 'number' && typeof reps === 'number' && weight >= 0 && reps > 0

  return (
    <div className="set-row pending">
      <span className="set-pill">Set {index + 1}</span>
      <label className="set-field">
        <span>Weight ({units})</span>
        <input
          type="number"
          inputMode="decimal"
          step="0.5"
          min={0}
          value={weight}
          onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
        />
      </label>
      <label className="set-field">
        <span>Reps</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={reps}
          onChange={(e) => setReps(e.target.value === '' ? '' : Number(e.target.value))}
        />
      </label>
      <label className="set-field rpe-field">
        <span>RPE</span>
        <input
          type="number"
          inputMode="decimal"
          step="0.5"
          min={1}
          max={10}
          value={rpe}
          placeholder="—"
          onChange={(e) => setRpe(e.target.value === '' ? '' : Number(e.target.value))}
        />
      </label>
      <button
        className="primary"
        disabled={!canLog}
        onClick={() => {
          if (!canLog) return
          onLog({
            weight: Number(weight),
            reps: Number(reps),
            rpe: rpe === '' ? null : Number(rpe),
          })
        }}
      >
        Log
      </button>
    </div>
  )
}
