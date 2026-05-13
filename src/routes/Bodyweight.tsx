import { useState } from 'react'
import { db } from '../db/schema'
import ProgressChart from '../components/ProgressChart'
import { todayISO, useBodyweightLogs, useSettings } from '../db/queries'
import { displayToKg, kgToDisplay } from '../lib/units'

export default function Bodyweight() {
  const logs = useBodyweightLogs()
  const settings = useSettings()
  const [weight, setWeight] = useState<number | ''>('')
  const today = todayISO()
  const units = settings?.units ?? 'kg'
  const todayLog = logs?.find((l) => l.date === today)
  const todayDisplay = todayLog ? kgToDisplay(todayLog.weightKg, units) : null

  const series = (logs ?? []).slice(-60).map((l) => ({
    label: l.date.slice(5),
    value: Number(kgToDisplay(l.weightKg, units).toFixed(1)),
  }))

  return (
    <div className="page">
      <h1>Bodyweight</h1>
      <section className="card">
        <h3>Log today ({today})</h3>
        <div className="bw-input-row">
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={weight}
            placeholder={todayDisplay !== null ? todayDisplay.toFixed(1) : units}
            onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
          />
          <span className="muted small unit-label">{units}</span>
          <button
            className="btn primary"
            disabled={weight === '' || Number.isNaN(Number(weight))}
            onClick={async () => {
              if (weight === '') return
              const kg = displayToKg(Number(weight), units)
              await db.bodyweight.put({ date: today, weightKg: kg })
              setWeight('')
            }}
          >
            {todayLog ? 'Update' : 'Log'}
          </button>
        </div>
        {todayDisplay !== null ? (
          <p className="muted small">Today: {todayDisplay.toFixed(1)} {units}</p>
        ) : (
          <p className="muted small">No entry for today yet.</p>
        )}
      </section>

      <section className="card">
        <h3>Trend ({units}) — last 60 entries</h3>
        <ProgressChart data={series} unit={units} height={240} />
      </section>

      {logs && logs.length > 0 ? (
        <section className="card">
          <h3>All entries</h3>
          <ul className="bw-list">
            {[...logs].reverse().map((l) => {
              const v = kgToDisplay(l.weightKg, units)
              return (
                <li key={l.date}>
                  <span>{l.date}</span>
                  <strong>{v.toFixed(1)} {units}</strong>
                  <button
                    className="link danger"
                    onClick={() => db.bodyweight.delete(l.date)}
                  >
                    Delete
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
