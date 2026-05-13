import { useState } from 'react'
import type { Units } from '../db/schema'
import { calcPlates, displayToKg, kgToDisplay, weightIncrement } from '../lib/units'

interface Props {
  units: Units
  initialKg?: number
}

export default function PlateCalculator({ units, initialKg }: Props) {
  const inc = weightIncrement(units)
  const [display, setDisplay] = useState<number>(
    initialKg ? Math.round(kgToDisplay(initialKg, units) / inc) * inc : units === 'kg' ? 60 : 135,
  )
  const [barOpt, setBarOpt] = useState<'standard' | 'short'>('standard')
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
    setDisplay((d) => {
      const next = Math.max(0, Math.round((d + delta) / inc) * inc)
      return Number(next.toFixed(2))
    })
  }

  return (
    <div className="plate-calc card">
      <div className="plate-calc-head">
        <h3>Plate calculator</h3>
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
      </div>

      <div className="plate-input">
        <button className="stepper-btn" onClick={() => bump(-inc * 2)}>
          −{inc * 2}
        </button>
        <button className="stepper-btn" onClick={() => bump(-inc)}>
          −{inc}
        </button>
        <input
          type="number"
          inputMode="decimal"
          value={display}
          onChange={(e) => setDisplay(Number(e.target.value) || 0)}
        />
        <button className="stepper-btn" onClick={() => bump(inc)}>
          +{inc}
        </button>
        <button className="stepper-btn" onClick={() => bump(inc * 2)}>
          +{inc * 2}
        </button>
        <span className="muted small">{units}</span>
      </div>

      <p className="muted small plate-target">
        Target {display} {units} → per side:
      </p>

      {result.perSide.length === 0 ? (
        <p className="muted small">Just the bar.</p>
      ) : (
        <ul className="plate-list">
          {result.perSide.map((p, i) => (
            <li key={i}>
              <span className="plate-count">{p.count}×</span>
              <span className="plate-weight">
                {p.plate} {units}
              </span>
            </li>
          ))}
        </ul>
      )}

      {Math.abs(result.remainderKg) > 0.05 ? (
        <p className="muted small">
          Closest possible:{' '}
          {(units === 'kg'
            ? result.totalKg
            : result.totalKg / 0.45359237
          ).toFixed(1)}{' '}
          {units}
          {result.remainderKg > 0
            ? ` (${(result.remainderKg / (units === 'kg' ? 1 : 0.45359237)).toFixed(1)} ${units} short)`
            : ''}
        </p>
      ) : null}
    </div>
  )
}
