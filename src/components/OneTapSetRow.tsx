import { useEffect, useState } from 'react'
import type { Units } from '../db/schema'
import { displayToKg, kgToDisplay, weightIncrement } from '../lib/units'

interface LoggedData {
  weight: number
  reps: number
  rpe: number | null
  isWarmup: boolean
}

interface Props {
  index: number
  units: Units
  suggestedKg: number | null
  suggestedReps: number | null
  logged?: { id?: number } & LoggedData
  onLog: (data: { weightKg: number; reps: number; rpe: number | null; isWarmup: boolean }) => void
  onUnlog?: () => void
}

export default function OneTapSetRow({
  index,
  units,
  suggestedKg,
  suggestedReps,
  logged,
  onLog,
  onUnlog,
}: Props) {
  const [editing, setEditing] = useState(false)
  const initialDisplay = logged
    ? kgToDisplay(logged.weight, units)
    : suggestedKg !== null
    ? kgToDisplay(suggestedKg, units)
    : 0
  const inc = weightIncrement(units)
  const [weight, setWeight] = useState<number>(roundTo(initialDisplay, inc))
  const [reps, setReps] = useState<number>(logged ? logged.reps : suggestedReps ?? 0)
  const [rpe, setRpe] = useState<number | ''>(logged?.rpe ?? '')
  const [warmup, setWarmup] = useState<boolean>(logged?.isWarmup ?? false)

  useEffect(() => {
    if (logged) return
    if (suggestedKg !== null) setWeight(roundTo(kgToDisplay(suggestedKg, units), inc))
    if (suggestedReps !== null) setReps(suggestedReps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedKg, suggestedReps, units])

  // --- Logged state -----------------------------------------------------
  if (logged && !editing) {
    const display = kgToDisplay(logged.weight, units)
    return (
      <button
        type="button"
        className={`one-tap-row logged${logged.isWarmup ? ' warmup' : ''}`}
        onClick={() => setEditing(true)}
        aria-label={`Edit set ${index + 1}`}
      >
        <span className="set-pill">{logged.isWarmup ? 'W' : `S${index + 1}`}</span>
        <span className="set-data">
          <strong className="tabnum">
            {fmt(display, units)} {units}
          </strong>
          <span className="muted"> × {logged.reps}</span>
          {logged.rpe !== null ? <span className="rpe">RPE {logged.rpe}</span> : null}
        </span>
        <span className="muted small">Tap to edit</span>
      </button>
    )
  }

  // --- Pending state, one-tap mode -------------------------------------
  if (!editing) {
    const ready = weight > 0 && reps > 0
    return (
      <div className="one-tap-row pending">
        <span className="set-pill">{warmup ? 'W' : `S${index + 1}`}</span>
        <div className="suggested">
          <strong className="tabnum">
            {fmt(weight, units)} {units}
          </strong>
          <span className="muted"> × {reps}</span>
        </div>
        <div className="one-tap-actions">
          <button
            type="button"
            className="link small edit-link"
            onClick={() => setEditing(true)}
            aria-label="Edit values"
          >
            Edit
          </button>
          <button
            type="button"
            className="btn primary log-tap"
            disabled={!ready}
            onClick={() =>
              onLog({
                weightKg: displayToKg(weight, units),
                reps,
                rpe: rpe === '' ? null : Number(rpe),
                isWarmup: warmup,
              })
            }
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  // --- Pending state, full edit mode -----------------------------------
  const ready = weight > 0 && reps > 0
  return (
    <div className="one-tap-row pending editing">
      <div className="edit-head">
        <span className="set-pill">{warmup ? 'W' : `S${index + 1}`}</span>
        <label className="warmup-toggle">
          <input
            type="checkbox"
            checked={warmup}
            onChange={(e) => setWarmup(e.target.checked)}
          />
          <span>Warm-up</span>
        </label>
        <button className="link small" onClick={() => setEditing(false)}>
          Close
        </button>
      </div>
      <div className="edit-fields">
        <Stepper
          label={`Weight (${units})`}
          value={weight}
          step={inc}
          bigStep={inc * 2}
          onChange={setWeight}
        />
        <Stepper label="Reps" value={reps} step={1} bigStep={5} onChange={(v) => setReps(Math.max(0, Math.round(v)))} />
        <label className="rpe-edit">
          <span className="muted small">RPE</span>
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
      </div>
      <div className="edit-foot">
        {logged ? (
          <button
            className="link danger small"
            onClick={() => {
              onUnlog?.()
              setEditing(false)
            }}
          >
            Delete set
          </button>
        ) : <span />}
        <button
          className="btn primary"
          disabled={!ready}
          onClick={() => {
            onLog({
              weightKg: displayToKg(weight, units),
              reps,
              rpe: rpe === '' ? null : Number(rpe),
              isWarmup: warmup,
            })
            setEditing(false)
          }}
        >
          {logged ? 'Save' : 'Log set'}
        </button>
      </div>
    </div>
  )
}

function Stepper({
  label,
  value,
  step,
  bigStep,
  onChange,
}: {
  label: string
  value: number
  step: number
  bigStep: number
  onChange: (v: number) => void
}) {
  function bump(delta: number) {
    const next = Math.max(0, roundTo(value + delta, Math.min(step, 0.25)))
    onChange(next)
  }
  return (
    <div className="stepper-block">
      <span className="muted small stepper-label">{label}</span>
      <div className="stepper-row">
        <button className="stepper-btn" onClick={() => bump(-bigStep)}>−{bigStep}</button>
        <button className="stepper-btn" onClick={() => bump(-step)}>−{step}</button>
        <input
          type="number"
          inputMode="decimal"
          step={step}
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        />
        <button className="stepper-btn" onClick={() => bump(step)}>+{step}</button>
        <button className="stepper-btn" onClick={() => bump(bigStep)}>+{bigStep}</button>
      </div>
    </div>
  )
}

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step
}

function fmt(value: number, units: Units): string {
  if (units === 'lb') return Math.round(value).toString()
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(1)
}
