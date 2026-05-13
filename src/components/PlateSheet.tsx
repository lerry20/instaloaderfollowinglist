import { useEffect, useState } from 'react'
import type { Units } from '../db/schema'
import { calcPlates, displayToKg, kgToDisplay, weightIncrement } from '../lib/units'

interface Props {
  open: boolean
  units: Units
  focusedKg: number | null
  onClose: () => void
}

// Common gym colour conventions per plate weight (kg/lb).
const PLATE_COLOR_KG: Record<number, string> = {
  25: '#e54545',
  20: '#3a6df0',
  15: '#f2c94c',
  10: '#3fbd6a',
  5: '#dfe3f5',
  2.5: '#c45050',
  1.25: '#b9c0d4',
  0.5: '#9aa4c1',
}
const PLATE_COLOR_LB: Record<number, string> = {
  45: '#3a6df0',
  35: '#f2c94c',
  25: '#3fbd6a',
  10: '#dfe3f5',
  5: '#c45050',
  2.5: '#b9c0d4',
  1.25: '#9aa4c1',
}

function colorFor(plate: number, units: Units): string {
  const map = units === 'kg' ? PLATE_COLOR_KG : PLATE_COLOR_LB
  return map[plate] ?? '#7aa2ff'
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
  const barDisplay = Math.round(kgToDisplay(barKg, units))
  const targetKg = displayToKg(display, units)
  const result = calcPlates(targetKg, units, barKg)
  const perSideTotalKg = result.totalKg - barKg
  const perSideTotalDisplay = kgToDisplay(perSideTotalKg / 2, units)
  const actualTotalDisplay = kgToDisplay(result.totalKg, units)
  const matches = Math.abs(result.totalKg - targetKg) < 0.05

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

      <div className="plate-target-row">
        <span className="muted small">Target</span>
        <div className="plate-input-controls">
          <button className="step-btn small-step" onClick={() => bump(-inc * 2)}>−{inc * 2}</button>
          <button className="step-btn small-step" onClick={() => bump(-inc)}>−{inc}</button>
          <input
            type="number"
            inputMode="decimal"
            value={display}
            onChange={(e) => {
              setPinned(true)
              setDisplay(Number(e.target.value) || 0)
            }}
          />
          <button className="step-btn small-step" onClick={() => bump(inc)}>+{inc}</button>
          <button className="step-btn small-step" onClick={() => bump(inc * 2)}>+{inc * 2}</button>
          <span className="muted small">{units}</span>
        </div>
      </div>

      {result.perSide.length === 0 ? (
        <p className="muted small plate-empty">Just the bar. ({barDisplay} {units})</p>
      ) : (
        <>
          <div className="plate-bar-viz" aria-hidden>
            <span className="plate-bar-end" />
            {result.perSide.flatMap((p) =>
              Array.from({ length: p.count }).map((_, i) => (
                <span
                  key={`${p.plate}-${i}`}
                  className="plate-disc"
                  style={{
                    background: colorFor(p.plate, units),
                    width: plateWidthPx(p.plate, units),
                    height: plateHeightPx(p.plate, units),
                  }}
                  title={`${p.plate} ${units}`}
                />
              )),
            )}
            <span className="plate-bar-mid" />
            {[...result.perSide]
              .slice()
              .reverse()
              .flatMap((p) =>
                Array.from({ length: p.count }).map((_, i) => (
                  <span
                    key={`r-${p.plate}-${i}`}
                    className="plate-disc"
                    style={{
                      background: colorFor(p.plate, units),
                      width: plateWidthPx(p.plate, units),
                      height: plateHeightPx(p.plate, units),
                    }}
                    title={`${p.plate} ${units}`}
                  />
                )),
              )}
            <span className="plate-bar-end" />
          </div>

          <div className="plate-breakdown">
            <span className="muted small">Per side</span>
            <ul className="plate-list">
              {result.perSide.map((p, i) => (
                <li key={i}>
                  <span
                    className="plate-color-dot"
                    style={{ background: colorFor(p.plate, units) }}
                    aria-hidden
                  />
                  <strong className="tabnum">{p.count}×</strong>
                  <span className="tabnum">{p.plate} {units}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="plate-math muted small">
            <strong className="tabnum">{barDisplay} {units}</strong> bar
            {' + 2 ×'}{' '}
            <strong className="tabnum">{fmt(perSideTotalDisplay, units)} {units}</strong>
            {' = '}
            <strong className="tabnum" style={{ color: 'var(--text)' }}>
              {fmt(actualTotalDisplay, units)} {units}
            </strong>
          </p>

          {!matches ? (
            <p className="muted small">
              ⚠ Can't make {fmt(display, units)} {units} exactly with your plates.
              Closest is {fmt(actualTotalDisplay, units)} {units}.
            </p>
          ) : null}
        </>
      )}

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

function plateWidthPx(plate: number, units: Units): string {
  // Bigger plates get visually wider chips.
  const ref = units === 'kg' ? 25 : 45
  const ratio = Math.max(0.35, Math.min(1, plate / ref))
  return `${Math.round(10 + ratio * 14)}px`
}

function plateHeightPx(plate: number, units: Units): string {
  const ref = units === 'kg' ? 25 : 45
  const ratio = Math.max(0.45, Math.min(1, plate / ref))
  return `${Math.round(28 + ratio * 30)}px`
}

function fmt(value: number, units: Units): string {
  if (units === 'lb') return Math.round(value).toString()
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(1)
}
