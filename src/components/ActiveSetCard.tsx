import { useEffect, useState } from 'react'
import type { Units } from '../db/schema'
import { displayToKg, kgToDisplay, weightIncrement } from '../lib/units'
import { haptics } from '../lib/haptics'

interface Props {
  setNumber: number
  totalSets: number
  units: Units
  /** Suggested starting weight in kg. Used to seed the editor. */
  suggestedKg: number | null
  suggestedReps: number | null
  /** A single coaching cue shown above the LOG button — rotates between
   * the exercise's cues across sets so the lifter sees every cue across
   * a session. Pass `null` to hide. */
  cue?: string | null
  /** All-time max working weight (kg) for this exercise, excluding the
   * current session. Drives the "PR territory" chip when the user's
   * current weight would beat it. */
  priorTopKg?: number | null
  /** Fires when the user taps the giant LOG button. */
  onLog: (data: { weightKg: number; reps: number; rpe: number | null; isWarmup: boolean }) => void
  /** Optional default warm-up state (used when adding a warm-up). */
  defaultWarmup?: boolean
  /** Optional callback when the user cancels a pending warm-up. */
  onCancelWarmup?: () => void
}

/** Active-set editor: the next pending set is always displayed with its
 * weight and reps as two big editable cells, steppers always visible
 * (no "tap Edit first" step), and a single giant LOG button.
 *
 * Pull-up tweaks here change every active set across the app, so be careful. */
export default function ActiveSetCard({
  setNumber,
  totalSets,
  units,
  suggestedKg,
  suggestedReps,
  cue,
  priorTopKg,
  onLog,
  defaultWarmup = false,
  onCancelWarmup,
}: Props) {
  const inc = weightIncrement(units)
  // Round to a fine 0.25 grid so float artifacts get cleaned up but an
  // exact prior log like 8 kg stays 8 kg (not snapped to the 2.5-kg
  // stepper grid → 7.5).
  const seedWeight = (kg: number) => roundTo(kgToDisplay(kg, units), 0.25)
  const [weight, setWeight] = useState<number>(suggestedKg !== null ? seedWeight(suggestedKg) : 0)
  const [reps, setReps] = useState<number>(suggestedReps ?? 0)
  const [rpe, setRpe] = useState<number | ''>('')
  const [warmup, setWarmup] = useState<boolean>(defaultWarmup)
  const [showRpe, setShowRpe] = useState(false)

  // Re-seed when the suggestion changes (e.g. after logging set 1, set 2's
  // suggestion is set-1's actual values).
  useEffect(() => {
    if (suggestedKg !== null) setWeight(seedWeight(suggestedKg))
    if (suggestedReps !== null) setReps(suggestedReps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedKg, suggestedReps, units])

  const canLog = weight > 0 && reps > 0

  function bumpWeight(delta: number) {
    haptics.subtle()
    setWeight((w) => Math.max(0, roundTo(w + delta, Math.min(inc, 0.25))))
  }
  function bumpReps(delta: number) {
    haptics.subtle()
    setReps((r) => Math.max(0, Math.round(r + delta)))
  }

  function submit() {
    if (!canLog) return
    onLog({
      weightKg: displayToKg(weight, units),
      reps,
      rpe: rpe === '' ? null : Number(rpe),
      isWarmup: warmup,
    })
  }

  return (
    <div className={`active-set-card${warmup ? ' warmup' : ''}`}>
      <div className="active-set-head">
        <span className="active-set-pill">
          {warmup ? 'WARM-UP' : `SET ${setNumber} OF ${totalSets}`}
        </span>
        {onCancelWarmup ? (
          <button type="button" className="link small" onClick={onCancelWarmup}>
            Cancel warm-up
          </button>
        ) : null}
      </div>

      <div className="active-values">
        <div className="active-value-cell">
          <label className="active-value-label">Weight ({units})</label>
          <input
            type="number"
            inputMode="decimal"
            className="active-value-input"
            step={inc}
            min={0}
            value={weight}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => setWeight(Math.max(0, Number(e.target.value) || 0))}
          />
          <div className="active-stepper-row">
            <button type="button" className="active-stepper" onClick={() => bumpWeight(-inc * 2)}>−{inc * 2}</button>
            <button type="button" className="active-stepper" onClick={() => bumpWeight(-inc)}>−{inc}</button>
            <button type="button" className="active-stepper" onClick={() => bumpWeight(inc)}>+{inc}</button>
            <button type="button" className="active-stepper" onClick={() => bumpWeight(inc * 2)}>+{inc * 2}</button>
          </div>
        </div>

        <span className="active-times">×</span>

        <div className="active-value-cell">
          <label className="active-value-label">Reps</label>
          <input
            type="number"
            inputMode="numeric"
            className="active-value-input"
            step={1}
            min={0}
            value={reps}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => setReps(Math.max(0, Math.round(Number(e.target.value) || 0)))}
          />
          <div className="active-stepper-row">
            <button type="button" className="active-stepper" onClick={() => bumpReps(-1)}>−1</button>
            <button type="button" className="active-stepper" onClick={() => bumpReps(1)}>+1</button>
          </div>
        </div>
      </div>

      {!warmup && priorTopKg !== null && priorTopKg !== undefined && priorTopKg > 0
        && displayToKg(weight, units) > priorTopKg ? (
        <p className="active-set-pr">
          <span aria-hidden>🥇</span>
          <span>PR territory — heaviest you\'ve ever pushed</span>
        </p>
      ) : null}

      {cue && !warmup ? (
        <p className="active-set-cue">
          <span className="active-set-cue-icon" aria-hidden>💡</span>
          <span>{cue}</span>
        </p>
      ) : null}

      <button
        type="button"
        className="active-log-btn"
        onClick={submit}
        disabled={!canLog}
      >
        <span className="active-log-tick" aria-hidden>✓</span>
        <span className="active-log-text">
          Log {warmup ? 'warm-up' : `set ${setNumber}`} · <strong>{fmt(weight, units)} {units} × {reps}</strong>
        </span>
      </button>

      <div className="active-secondary-row">
        {!warmup ? (
          <label className="active-warmup-toggle">
            <input
              type="checkbox"
              checked={warmup}
              onChange={(e) => setWarmup(e.target.checked)}
            />
            <span>Warm-up</span>
          </label>
        ) : <span />}
        {!showRpe ? (
          <button type="button" className="link small" onClick={() => setShowRpe(true)}>
            + Add RPE
          </button>
        ) : (
          <label className="active-rpe">
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
            <button type="button" className="link small" onClick={() => { setShowRpe(false); setRpe('') }}>
              Remove
            </button>
          </label>
        )}
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
