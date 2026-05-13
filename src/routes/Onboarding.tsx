import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, type Goal, type Units } from '../db/schema'
import { displayToKg } from '../lib/units'

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [units, setUnits] = useState<Units>('kg')
  const [goal, setGoal] = useState<Goal>('bulk')
  const [bodyweight, setBodyweight] = useState<number | ''>('')
  const [defaultRestSec, setDefaultRestSec] = useState(90)

  async function finish() {
    const existing = await db.settings.get(1)
    await db.settings.put({
      id: 1,
      units,
      defaultRestSec,
      goal,
      goalNotes:
        existing?.goalNotes ||
        (goal === 'bulk'
          ? 'Bulk: gain ~0.25 kg / week. Push every working set to RPE 8 and add load when you hit the top of the rep range two sessions in a row.'
          : goal === 'cut'
          ? 'Cut: lose ~0.5 kg / week. Maintain working weights — strength preservation matters more than progression.'
          : 'Recomp: hold bodyweight steady, push working sets to grow muscle while body-fat slowly drops.'),
      onboarded: true,
      notificationsEnabled: existing?.notificationsEnabled ?? false,
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

  return (
    <div className="page onboarding">
      <header>
        <span className="brand">
          <span className="brand-mark" aria-hidden /> BulkLog
        </span>
        <span className="muted small">Setup · step {step + 1} of 4</span>
      </header>

      {step === 0 ? (
        <section className="card">
          <h2>What's the goal?</h2>
          <p className="muted small">We'll set sensible defaults — you can change them anytime.</p>
          <div className="onboard-grid">
            <button
              className={`onboard-tile${goal === 'bulk' ? ' active' : ''}`}
              onClick={() => setGoal('bulk')}
            >
              <strong>Bulk</strong>
              <span className="muted small">Gain muscle &amp; weight</span>
            </button>
            <button
              className={`onboard-tile${goal === 'cut' ? ' active' : ''}`}
              onClick={() => setGoal('cut')}
            >
              <strong>Cut</strong>
              <span className="muted small">Lean out, keep strength</span>
            </button>
            <button
              className={`onboard-tile${goal === 'recomp' ? ' active' : ''}`}
              onClick={() => setGoal('recomp')}
            >
              <strong>Recomp</strong>
              <span className="muted small">Hold weight, build muscle</span>
            </button>
          </div>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="card">
          <h2>Units</h2>
          <p className="muted small">Stored values stay in kg — this only changes the display.</p>
          <div className="seg big">
            <button className={units === 'kg' ? 'active' : ''} onClick={() => setUnits('kg')}>kg</button>
            <button className={units === 'lb' ? 'active' : ''} onClick={() => setUnits('lb')}>lb</button>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
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

      {step === 3 ? (
        <section className="card">
          <h2>Default rest</h2>
          <p className="muted small">Used for exercises without their own rest target. Compounds &amp; isolations get smart defaults regardless.</p>
          <div className="seg">
            {[60, 90, 120, 180].map((s) => (
              <button
                key={s}
                className={defaultRestSec === s ? 'active' : ''}
                onClick={() => setDefaultRestSec(s)}
              >
                {s}s
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="onboard-actions">
        {step > 0 ? (
          <button className="btn ghost" onClick={() => setStep((s) => s - 1)}>Back</button>
        ) : <span />}
        {step < 3 ? (
          <button className="btn primary" onClick={() => setStep((s) => s + 1)}>Continue</button>
        ) : (
          <button className="btn primary" onClick={finish}>Start training</button>
        )}
      </div>
    </div>
  )
}
