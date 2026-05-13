import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, type Goal, type Units } from '../db/schema'
import { useAllRoutines, useSettings } from '../db/queries'

export default function Onboarding() {
  const navigate = useNavigate()
  const settings = useSettings()
  const [step, setStep] = useState(0)
  const [units, setUnits] = useState<Units>('kg')
  const [goal, setGoal] = useState<Goal>('bulk')
  const [routineId, setRoutineId] = useState<string>('ppl-6day')
  const routines = useAllRoutines() ?? []
  const builtIn = routines.filter((r) => r.builtIn)

  // If user is already onboarded (e.g. opened /welcome by mistake or after
  // re-install), bounce them to the main app.
  useEffect(() => {
    if (settings?.onboarded) navigate('/', { replace: true })
  }, [settings?.onboarded, navigate])

  async function finish() {
    const existing = await db.settings.get(1)
    await db.settings.put({
      id: 1,
      units,
      defaultRestSec: existing?.defaultRestSec ?? 90,
      goal,
      goalNotes:
        goal === 'bulk'
          ? 'Bulk: gain ~0.25 kg / week. Push every working set hard, stop one rep short of failure, and add 2.5 kg whenever you hit the top of the rep range two sessions in a row.'
          : goal === 'cut'
          ? 'Cut: lose ~0.5 kg / week. Maintain working weights — strength preservation matters more than progression.'
          : 'Recomp: hold bodyweight steady, push working sets to grow muscle while body-fat slowly drops.',
      onboarded: true,
      notificationsEnabled: existing?.notificationsEnabled ?? false,
      activeRoutineId: routineId,
      skillLevel: existing?.skillLevel ?? 'beginner',
      theme: existing?.theme ?? 'system',
    })
    navigate('/')
  }

  const totalSteps = 2

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
          <h2>Let's set up your training</h2>
          <p className="muted small">Two quick choices. You can change everything in Settings.</p>

          <h4 style={{ marginTop: '0.8rem' }}>Goal</h4>
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

          <h4 style={{ marginTop: '1rem' }}>Units</h4>
          <div className="seg big">
            <button className={units === 'kg' ? 'active' : ''} onClick={() => setUnits('kg')}>kg</button>
            <button className={units === 'lb' ? 'active' : ''} onClick={() => setUnits('lb')}>lb</button>
          </div>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="card">
          <h2>Pick a routine</h2>
          <p className="muted small">Use a proven preset — you can always swap or customize later.</p>
          <div className="routine-onboard-list">
            {builtIn.map((r) => (
              <button
                key={r.id}
                className={`onboard-tile wide${routineId === r.id ? ' active' : ''}`}
                onClick={() => setRoutineId(r.id)}
              >
                <strong>{r.name}</strong>
                <span className="muted small">{r.description}</span>
                <span className="muted small">{r.workouts.length} workouts in cycle</span>
              </button>
            ))}
          </div>
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
