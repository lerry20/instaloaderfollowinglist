import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Units } from '../db/schema'
import {
  sessionHasPRs,
  todayISO,
  useBodyweightLogs,
  useRecentSessions,
  useSettings,
} from '../db/queries'
import { resetDatabase } from '../db/seed'
import { displayToKg, kgToDisplay } from '../lib/units'
import { ensureNotificationPermission } from '../state/restTimer'
import ProgressChart from '../components/ProgressChart'

export default function Progress() {
  const settings = useSettings()
  if (!settings) return <div className="page"><p className="muted">Loading…</p></div>
  const units = settings.units

  return (
    <div className="page">
      <h1 className="big-title">Progress</h1>
      <BodyweightSection units={units} />
      <HistorySection units={units} />
      <SettingsSection units={units} />
    </div>
  )
}

function BodyweightSection({ units }: { units: Units }) {
  const logs = useBodyweightLogs()
  const [weight, setWeight] = useState<number | ''>('')
  const today = todayISO()
  const todayLog = logs?.find((l) => l.date === today)
  const series = (logs ?? [])
    .slice(-60)
    .map((l) => ({ label: l.date.slice(5), value: Number(kgToDisplay(l.weightKg, units).toFixed(1)) }))

  return (
    <section className="card">
      <header className="section-head">
        <h3>Bodyweight</h3>
        <span className="muted small">
          {logs && logs.length > 0
            ? `${kgToDisplay(logs[logs.length - 1].weightKg, units).toFixed(1)} ${units}`
            : 'No entries'}
        </span>
      </header>
      <div className="bw-input-row">
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          value={weight}
          placeholder={todayLog ? kgToDisplay(todayLog.weightKg, units).toFixed(1) : units}
          onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
        />
        <span className="muted small unit-label">{units}</span>
        <button
          className="btn primary"
          disabled={weight === '' || Number.isNaN(Number(weight))}
          onClick={async () => {
            if (weight === '') return
            await db.bodyweight.put({ date: today, weightKg: displayToKg(Number(weight), units) })
            setWeight('')
          }}
        >
          {todayLog ? 'Update today' : 'Log today'}
        </button>
      </div>
      <ProgressChart data={series} unit={units} />
    </section>
  )
}

function HistorySection({ units }: { units: Units }) {
  const sessions = useRecentSessions(30)
  const allLogs = useLiveQuery(() => db.setLogs.toArray(), [])
  const exercises = useLiveQuery(() => db.exercises.toArray(), [])
  const [prMap, setPrMap] = useState<Record<number, string[]>>({})

  useEffect(() => {
    if (!sessions) return
    let cancelled = false
    Promise.all(sessions.map((s) => sessionHasPRs(s.id!))).then((arr) => {
      if (cancelled) return
      const next: Record<number, string[]> = {}
      sessions.forEach((s, i) => {
        next[s.id!] = arr[i]
      })
      setPrMap(next)
    })
    return () => {
      cancelled = true
    }
  }, [sessions])

  if (!sessions || sessions.length === 0) {
    return (
      <section className="card">
        <h3>Recent sessions</h3>
        <p className="muted">No sessions yet. <Link to="/" className="link">Start one →</Link></p>
      </section>
    )
  }

  return (
    <section className="card">
      <h3>Recent sessions</h3>
      <ul className="session-history">
        {sessions.map((s) => {
          const logs = (allLogs ?? []).filter((l) => l.sessionId === s.id)
          const working = logs.filter((l) => !l.isWarmup)
          const volume = working.reduce((sum, l) => sum + l.weight * l.reps, 0)
          const prs = prMap[s.id!] ?? []
          const exerciseIds = Array.from(new Set(working.map((l) => l.exerciseId)))
          return (
            <li key={s.id} className="session-history-row">
              <header>
                <div>
                  <strong>{s.workoutName}</strong>
                  <span className="muted small"> · {s.date}</span>
                </div>
                {!s.completedAt ? <span className="badge">In progress</span> : null}
              </header>
              <span className="muted small">
                {working.length} working sets · volume {Math.round(kgToDisplay(volume, units)).toLocaleString()} {units}·reps
              </span>
              {prs.length > 0 ? (
                <div className="pr-pills">
                  {prs.map((id) => {
                    const ex = exercises?.find((e) => e.id === id)
                    return <span key={id} className="pr-pill">🥇 {ex?.name ?? id}</span>
                  })}
                </div>
              ) : null}
              <ul className="exercise-chips">
                {exerciseIds.map((id) => {
                  const ex = exercises?.find((e) => e.id === id)
                  return (
                    <li key={id}>
                      <Link to={`/exercise/${id}`}>{ex?.name ?? id}</Link>
                    </li>
                  )
                })}
              </ul>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function SettingsSection({ units }: { units: Units }) {
  const settings = useSettings()
  const [confirmReset, setConfirmReset] = useState(false)

  if (!settings) return null

  return (
    <section className="card">
      <header className="section-head">
        <h3>Settings</h3>
      </header>

      <div className="settings-row">
        <span>Goal</span>
        <div className="seg">
          {(['bulk', 'cut', 'recomp'] as const).map((g) => (
            <button
              key={g}
              className={settings.goal === g ? 'active' : ''}
              onClick={() => db.settings.put({ ...settings, goal: g })}
            >
              {g[0].toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-row">
        <span>Units</span>
        <div className="seg">
          <button
            className={units === 'kg' ? 'active' : ''}
            onClick={() => db.settings.put({ ...settings, units: 'kg' })}
          >
            kg
          </button>
          <button
            className={units === 'lb' ? 'active' : ''}
            onClick={() => db.settings.put({ ...settings, units: 'lb' })}
          >
            lb
          </button>
        </div>
      </div>

      <div className="settings-row">
        <span>Default rest</span>
        <div className="seg">
          {[60, 90, 120, 180, 240].map((s) => (
            <button
              key={s}
              className={settings.defaultRestSec === s ? 'active' : ''}
              onClick={() => db.settings.put({ ...settings, defaultRestSec: s })}
            >
              {s}s
            </button>
          ))}
        </div>
      </div>

      <div className="settings-row">
        <span>Notifications</span>
        {settings.notificationsEnabled ? (
          <span className="muted small">✓ Enabled</span>
        ) : (
          <button
            className="btn small"
            onClick={async () => {
              const granted = await ensureNotificationPermission()
              if (granted) {
                await db.settings.put({ ...settings, notificationsEnabled: true })
              }
            }}
          >
            Enable
          </button>
        )}
      </div>

      <details className="advanced-details">
        <summary>Advanced</summary>
        <label className="field" style={{ marginTop: '0.6rem' }}>
          <span>Goal notes</span>
          <textarea
            rows={3}
            value={settings.goalNotes}
            onChange={(e) => db.settings.put({ ...settings, goalNotes: e.target.value })}
          />
        </label>
        <div className="settings-row" style={{ marginTop: '0.6rem' }}>
          <span>Reset database</span>
          {confirmReset ? (
            <span className="row">
              <button
                className="btn small danger"
                onClick={async () => {
                  await resetDatabase()
                  setConfirmReset(false)
                }}
              >
                Confirm
              </button>
              <button className="btn small ghost" onClick={() => setConfirmReset(false)}>
                Cancel
              </button>
            </span>
          ) : (
            <button className="btn small ghost" onClick={() => setConfirmReset(true)}>
              Reset
            </button>
          )}
        </div>
      </details>
    </section>
  )
}
