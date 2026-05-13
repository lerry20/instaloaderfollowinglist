import { useEffect, useState } from 'react'
import type { Units } from '../db/schema'
import { calcPlates, displayToKg, kgToDisplay, weightIncrement } from '../lib/units'

interface Props {
  open: boolean
  units: Units
  focusedKg: number | null
  onClose: () => void
}

export default function PlateSheet({ open, units, focusedKg, onClose }: Props) {
  const inc = weightIncrement(units)
  const [display, setDisplay] = useState<number>(
    focusedKg ? Math.round(kgToDisplay(focusedKg, units) / inc) * inc : units === 'kg' ? 60 : 135,
  )
  const [barOpt, setBarOpt] = useState<'standard' | 'short'>('standard')
  const [pinned, setPinned] = useState(false)

  useEffect(() => {
    if (pinned) return
    if (focusedKg !== null) {
      setDisplay(Math.round(kgToDisplay(focusedKg, units) / inc) * inc)
    }
  }, [focusedKg, units, inc, pinned])

  if (!open) return null

  const barKg =
    barOpt === 'standard'
      ? units === 'kg'
        ? 20
        : displayToKg(45, 'lb')
      : units === 'kg'
      ? 15
      : displayToKg(35, 'lb')
  const targetKg = displayToKg(display, units)
  const result = calcPlates(targetKg, units, barKg)

  function bump(delta: number) {
    setPinned(true)
    setDisplay((d) => {
      const next = Math.max(0, Math.round((d + delta) / inc) * inc)
      return Number(next.toFixed(2))
    })
  }

  return (
    <div className="plate-sheet" role="dialog" aria-label="Plate calculator">
      <div className="plate-sheet-head">
        <h3>Plates</h3>
        <div className="seg small">
          <button
            className={barOpt === 'standard' ? 'active' : ''}
            onClick={() => setBarOpt('standard')}
          >
            {units === 'kg' ? '20 kg bar' : '45 lb bar'}
          </button>
          <button
            className={barOpt === 'short' ? 'active' : ''}
            onClick={() => setBarOpt('short')}
          >
            {units === 'kg' ? '15 kg bar' : '35 lb bar'}
          </button>
        </div>
        <button className="link" onClick={onClose} aria-label="Close plate calculator">Close</button>
      </div>

      <div className="plate-input">
        <button className="stepper-btn" onClick={() => bump(-inc * 2)}>−{inc * 2}</button>
        <button className="stepper-btn" onClick={() => bump(-inc)}>−{inc}</button>
        <input
          type="number"
          inputMode="decimal"
          value={display}
          onChange={(e) => {
            setPinned(true)
            setDisplay(Number(e.target.value) || 0)
          }}
        />
        <button className="stepper-btn" onClick={() => bump(inc)}>+{inc}</button>
        <button className="stepper-btn" onClick={() => bump(inc * 2)}>+{inc * 2}</button>
        <span className="muted small">{units}</span>
      </div>

      <p className="muted small plate-target">
        Per side, after {Math.round(kgToDisplay(barKg, units))} {units} bar:
      </p>
      {result.perSide.length === 0 ? (
        <p className="muted small">Just the bar.</p>
      ) : (
        <ul className="plate-list">
          {result.perSide.map((p, i) => (
            <li key={i}>
              <span className="plate-count">{p.count}×</span>
              <span className="plate-weight">{p.plate} {units}</span>
            </li>
          ))}
        </ul>
      )}

      {Math.abs(result.remainderKg) > 0.05 ? (
        <p className="muted small">
          Closest reachable:{' '}
          {kgToDisplay(result.totalKg, units).toFixed(1)} {units}
        </p>
      ) : null}

      {pinned && focusedKg !== null ? (
        <button
          className="link small"
          onClick={() => {
            setPinned(false)
            setDisplay(Math.round(kgToDisplay(focusedKg, units) / inc) * inc)
          }}
        >
          Reset to current exercise ({fmt(kgToDisplay(focusedKg, units), units)} {units})
        </button>
      ) : null}
    </div>
  )
}

function fmt(value: number, units: Units): string {
  if (units === 'lb') return Math.round(value).toString()
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(1)
}
