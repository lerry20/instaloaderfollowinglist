import { useState } from 'react'
import { db } from '../db/schema'
import ProgressChart from '../components/ProgressChart'
import { todayISO, useBodyweightLogs } from '../db/queries'

export default function Bodyweight() {
  const logs = useBodyweightLogs()
  const [weight, setWeight] = useState<number | ''>('')
  const today = todayISO()
  const todayLog = logs?.find((l) => l.date === today)

  const series = (logs ?? []).slice(-60).map((l) => ({
    label: l.date.slice(5),
    value: l.weightKg,
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
            placeholder={todayLog ? String(todayLog.weightKg) : 'kg'}
            onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
          />
          <button
            className="btn primary"
            disabled={weight === '' || Number.isNaN(Number(weight))}
            onClick={async () => {
              if (weight === '') return
              await db.bodyweight.put({ date: today, weightKg: Number(weight) })
              setWeight('')
            }}
          >
            {todayLog ? 'Update' : 'Log'}
          </button>
        </div>
        {todayLog ? (
          <p className="muted small">Today: {todayLog.weightKg} kg</p>
        ) : (
          <p className="muted small">No entry for today yet.</p>
        )}
      </section>

      <section className="card">
        <h3>Trend (last 60 logs)</h3>
        <ProgressChart data={series} unit="kg" height={240} />
      </section>

      {logs && logs.length > 0 ? (
        <section className="card">
          <h3>All entries</h3>
          <ul className="bw-list">
            {[...logs].reverse().map((l) => (
              <li key={l.date}>
                <span>{l.date}</span>
                <strong>{l.weightKg} kg</strong>
                <button
                  className="link danger"
                  onClick={() => db.bodyweight.delete(l.date)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
