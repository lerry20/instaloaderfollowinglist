import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, type Goal, type Units } from '../db/schema'
import { displayToKg } from '../lib/units'
import { useAllRoutines } from '../db/queries'

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [units, setUnits] = useState<Units>('kg')
  const [goal, setGoal] = useState<Goal>('bulk')
  const [bodyweight, setBodyweight] = useState<number | ''>('')
  const [routineId, setRoutineId] = useState<string>('ppl-6day')
  const routines = useAllRoutines() ?? []
  const builtIn = routines.filter((r) => r.builtIn)

  async function finish() {
    const existing = await db.settings.get(1)
    await db.settings.put({
      id: 1,
      units,
      defaultRestSec: existing?.defaultRestSec ?? 90,
      goal,
      goalNotes:
        goal === 'bulk'
          ? 'Bulk: gain ~0.25 kg / week. Push every working set to RPE 8 and add load when you hit the top of the rep range two sessions in a row.'
          : goal === 'cut'
          ? 'Cut: lose ~0.5 kg / week. Maintain working weights — strength preservation matters more than progression.'
          : 'Recomp: hold bodyweight steady, push working sets to grow muscle while body-fat slowly drops.',
      onboarded: true,
      notificationsEnabled: existing?.notificationsEnabled ?? false,
      activeRoutineId: routineId,
    })
    if (bodyweight !== '' && Number(bodyweight) > 0) {
      const d = new Date()
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      await db.bodyweight.put({
        date: iso,
        weightKg: displayToKg(Number(bodyweight), units),
      })
    }
    navigate('/')
  }

  const totalSteps = 4

  return (
    <div className="page onboarding">
      <header className="onboard-header">
        <span className="brand">
          <span className="brand-mark" aria-hidden /> BulkLog
        </span>
        <span className="muted small">Step {step + 1} of {totalSteps}</span>
      </header>

      {step === 0 ? (
        <section className="card">
          <h2>What's the goal?</h2>
          <p className="muted small">Smart defaults follow; you can change anytime.</p>
          <div className="onboard-grid">
            {(
              [
                { id: 'bulk', title: 'Bulk', sub: 'Gain muscle & weight' },
                { id: 'cut', title: 'Cut', sub: 'Lean out, keep strength' },
                { id: 'recomp', title: 'Recomp', sub: 'Build muscle, hold weight' },
              ] as { id: Goal; title: string; sub: string }[]
            ).map((g) => (
              <button
                key={g.id}
                className={`onboard-tile${goal === g.id ? ' active' : ''}`}
                onClick={() => setGoal(g.id)}
              >
                <strong>{g.title}</strong>
                <span className="muted small">{g.sub}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="card">
          <h2>Units</h2>
          <p className="muted small">Display only — weights stored canonically in kg.</p>
          <div className="seg big">
            <button className={units === 'kg' ? 'active' : ''} onClick={() => setUnits('kg')}>kg</button>
            <button className={units === 'lb' ? 'active' : ''} onClick={() => setUnits('lb')}>lb</button>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="card">
          <h2>Pick a routine</h2>
          <p className="muted small">Built-in routines — pick the one that fits your schedule.</p>
          <div className="routine-onboard-list">
            {builtIn.map((r) => (
              <button
                key={r.id}
                className={`onboard-tile wide${routineId === r.id ? ' active' : ''}`}
                onClick={() => setRoutineId(r.id)}
              >
                <strong>{r.name}</strong>
                <span className="muted small">{r.description}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="card">
          <h2>Bodyweight today</h2>
          <p className="muted small">Optional, but vital on a bulk — confirms you're actually gaining.</p>
          <div className="bw-input-row">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={bodyweight}
              placeholder={units}
              onChange={(e) => setBodyweight(e.target.value === '' ? '' : Number(e.target.value))}
            />
            <span className="muted small unit-label">{units}</span>
          </div>
          <button className="link" onClick={() => setBodyweight('')}>Skip for now</button>
        </section>
      ) : null}

      <div className="onboard-actions">
        {step > 0 ? (
          <button className="btn ghost" onClick={() => setStep((s) => s - 1)}>Back</button>
        ) : <span />}
        {step < totalSteps - 1 ? (
          <button className="btn primary" onClick={() => setStep((s) => s + 1)}>Continue</button>
        ) : (
          <button className="btn primary" onClick={finish}>Start training</button>
        )}
      </div>
    </div>
  )
}
