import { useEffect, useRef, useState } from 'react'
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
  lastSessionTopKg?: number | null
  logged?: { id?: number } & LoggedData
  prefillWarmup?: boolean
  onLog: (data: { weightKg: number; reps: number; rpe: number | null; isWarmup: boolean }) => void
  onUnlog?: () => void
}

export default function OneTapSetRow({
  index,
  units,
  suggestedKg,
  suggestedReps,
  lastSessionTopKg,
  logged,
  prefillWarmup = false,
  onLog,
  onUnlog,
}: Props) {
  const [editing, setEditing] = useState(false)
  const inc = weightIncrement(units)
  const initialDisplay =
    logged?.weight !== undefined
      ? kgToDisplay(logged.weight, units)
      : suggestedKg !== null
      ? kgToDisplay(suggestedKg, units)
      : 0
  const [weight, setWeight] = useState<number>(roundTo(initialDisplay, inc))
  const [reps, setReps] = useState<number>(logged ? logged.reps : suggestedReps ?? 0)
  const [rpe, setRpe] = useState<number | ''>(logged?.rpe ?? '')
  const [warmup, setWarmup] = useState<boolean>(logged?.isWarmup ?? prefillWarmup)
  const longPressTimer = useRef<number | null>(null)

  useEffect(() => {
    if (logged) return
    if (suggestedKg !== null) setWeight(roundTo(kgToDisplay(suggestedKg, units), inc))
    if (suggestedReps !== null) setReps(suggestedReps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedKg, suggestedReps, units])

  // --- Logged state -----------------------------------------------------
  if (logged && !editing) {
    const display = kgToDisplay(logged.weight, units)
    const delta = lastSessionTopKg ? logged.weight - lastSessionTopKg : null
    const deltaPill = renderDelta(delta, units)
    return (
      <button
        type="button"
        className={`set-row-v2 logged${logged.isWarmup ? ' warmup' : ''}`}
        onClick={() => setEditing(true)}
        onTouchStart={() => {
          longPressTimer.current = window.setTimeout(() => {
            if (window.confirm('Delete this set?')) onUnlog?.()
          }, 600)
        }}
        onTouchEnd={() => {
          if (longPressTimer.current) {
            window.clearTimeout(longPressTimer.current)
            longPressTimer.current = null
          }
        }}
        onTouchCancel={() => {
          if (longPressTimer.current) {
            window.clearTimeout(longPressTimer.current)
            longPressTimer.current = null
          }
        }}
        aria-label={`Edit set ${index + 1}`}
      >
        <span className="set-pill done">{logged.isWarmup ? 'W' : `S${index + 1}`}</span>
        <div className="set-row-main">
          <div className="set-row-numbers tabnum">
            <strong>{fmt(display, units)}</strong>
            <span className="muted unit-suffix">{units}</span>
            <span className="muted">×</span>
            <strong>{logged.reps}</strong>
            {logged.rpe !== null ? <span className="muted rpe-suffix">RPE {logged.rpe}</span> : null}
          </div>
          <div className="set-row-meta">
            {deltaPill}
            <span className="muted small">Tap to edit</span>
          </div>
        </div>
      </button>
    )
  }

  // --- Pending one-tap state -------------------------------------------
  if (!editing) {
    const hasSuggestion = weight > 0 && reps > 0
    return (
      <div className={`set-row-v2 pending${warmup ? ' warmup' : ''}`}>
        <span className="set-pill">{warmup ? 'W' : `S${index + 1}`}</span>
        <div className="set-row-main">
          <button
            type="button"
            className="big-tap-button"
            disabled={!hasSuggestion}
            onClick={() =>
              onLog({
                weightKg: displayToKg(weight, units),
                reps,
                rpe: rpe === '' ? null : Number(rpe),
                isWarmup: warmup,
              })
            }
          >
            {hasSuggestion ? (
              <>
                <span className="big-tap-action">Tap to log</span>
                <span className="big-tap-numbers tabnum">
                  <strong>{fmt(weight, units)}</strong>
                  <span className="muted unit-suffix">{units}</span>
                  <span className="muted">×</span>
                  <strong>{reps}</strong>
                </span>
              </>
            ) : (
              <span className="big-tap-action">Set weight & reps →</span>
            )}
          </button>
          <button
            type="button"
            className="edit-tap-btn"
            onClick={() => setEditing(true)}
            aria-label="Edit weight or reps"
          >
            Edit
          </button>
        </div>
      </div>
    )
  }

  // --- Edit mode -------------------------------------------------------
  const ready = weight > 0 && reps > 0
  return (
    <div className="set-row-v2 pending editing">
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
        <Stepper
          label="Reps"
          value={reps}
          step={1}
          bigStep={5}
          onChange={(v) => setReps(Math.max(0, Math.round(v)))}
        />
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
          {logged ? 'Save changes' : 'Log set'}
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
        <button className="stepper-btn" onClick={() => bump(-bigStep)} aria-label={`${label} minus ${bigStep}`}>−{bigStep}</button>
        <button className="stepper-btn" onClick={() => bump(-step)} aria-label={`${label} minus ${step}`}>−{step}</button>
        <input
          type="number"
          inputMode="decimal"
          step={step}
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        />
        <button className="stepper-btn" onClick={() => bump(step)} aria-label={`${label} plus ${step}`}>+{step}</button>
        <button className="stepper-btn" onClick={() => bump(bigStep)} aria-label={`${label} plus ${bigStep}`}>+{bigStep}</button>
      </div>
    </div>
  )
}

function renderDelta(deltaKg: number | null, units: Units) {
  if (deltaKg === null) return null
  if (Math.abs(deltaKg) < 0.05) {
    return <span className="delta-pill same">→ same</span>
  }
  const disp = kgToDisplay(Math.abs(deltaKg), units)
  const sign = deltaKg > 0 ? '↑' : '↓'
  const cls = deltaKg > 0 ? 'up' : 'down'
  return (
    <span className={`delta-pill ${cls}`}>
      {sign} {disp.toFixed(units === 'kg' ? 1 : 0)} {units}
    </span>
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
