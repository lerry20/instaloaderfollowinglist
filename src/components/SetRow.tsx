import { useEffect, useState } from 'react'
import type { Units } from '../db/schema'
import { displayToKg, kgToDisplay, weightIncrement } from '../lib/units'
import NumberStepper from './NumberStepper'

interface Props {
  index: number
  units: Units
  defaultWeightKg?: number
  defaultReps?: number
  logged?: { weight: number; reps: number; rpe: number | null; isWarmup: boolean }
  onLog: (data: { weightKg: number; reps: number; rpe: number | null; isWarmup: boolean }) => void
  onUnlog?: () => void
}

export default function SetRow({
  index,
  units,
  defaultWeightKg,
  defaultReps,
  logged,
  onLog,
  onUnlog,
}: Props) {
  const initialDisplay = defaultWeightKg ? kgToDisplay(defaultWeightKg, units) : 0
  const inc = weightIncrement(units)
  const [weight, setWeight] = useState<number>(Math.round(initialDisplay / inc) * inc)
  const [reps, setReps] = useState<number>(defaultReps ?? 0)
  const [rpe, setRpe] = useState<number | ''>('')
  const [warmup, setWarmup] = useState(false)

  useEffect(() => {
    if (logged) return
    if (defaultWeightKg) {
      const v = kgToDisplay(defaultWeightKg, units)
      setWeight(Math.round(v / inc) * inc)
    }
    if (defaultReps) setReps(defaultReps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultWeightKg, defaultReps, units])

  if (logged) {
    const displayW = kgToDisplay(logged.weight, units)
    return (
      <div className={`set-row logged${logged.isWarmup ? ' warmup' : ''}`}>
        <span className="set-pill">{logged.isWarmup ? 'W' : `S${index + 1}`}</span>
        <span className="set-data">
          <strong>
            {Number.isInteger(displayW) ? displayW : displayW.toFixed(1)} {units}
          </strong>
          <span className="muted"> × {logged.reps}</span>
          {logged.rpe !== null ? <span className="rpe">RPE {logged.rpe}</span> : null}
        </span>
        <button className="link" onClick={onUnlog} aria-label={`Undo set ${index + 1}`}>
          Undo
        </button>
      </div>
    )
  }

  const canLog = weight >= 0 && reps > 0

  return (
    <div className="set-row pending">
      <div className="set-row-head">
        <span className="set-pill">{warmup ? 'W' : `S${index + 1}`}</span>
        <label className="warmup-toggle">
          <input type="checkbox" checked={warmup} onChange={(e) => setWarmup(e.target.checked)} />
          <span>Warm-up</span>
        </label>
      </div>
      <NumberStepper
        label="Weight"
        unit={units}
        value={weight}
        onChange={(v) => setWeight(v)}
        step={inc}
        bigStep={inc * 2}
        min={0}
        decimals={2}
      />
      <NumberStepper
        label="Reps"
        value={reps}
        onChange={(v) => setReps(Math.max(0, Math.round(v)))}
        step={1}
        bigStep={5}
        min={0}
        decimals={0}
      />
      <div className="set-row-bottom">
        <label className="rpe-input">
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
          className="btn primary log-btn"
          disabled={!canLog}
          onClick={() => {
            if (!canLog) return
            onLog({
              weightKg: displayToKg(weight, units),
              reps,
              rpe: rpe === '' ? null : Number(rpe),
              isWarmup: warmup,
            })
            setWarmup(false)
          }}
        >
          Log set
        </button>
      </div>
    </div>
  )
}
