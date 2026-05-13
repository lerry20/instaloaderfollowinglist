import { useState } from 'react'
import { db } from '../db/schema'
import { resetDatabase } from '../db/seed'
import { useSettings } from '../db/queries'
import { ensureNotificationPermission } from '../state/restTimer'

export default function Settings() {
  const settings = useSettings()
  const [confirmReset, setConfirmReset] = useState(false)
  const [exportText, setExportText] = useState<string | null>(null)

  if (!settings) return <div className="page"><p className="muted">Loading…</p></div>

  return (
    <div className="page">
      <h1>Settings</h1>

      <section className="card">
        <h3>Goal</h3>
        <div className="seg">
          <button
            className={settings.goal === 'bulk' ? 'active' : ''}
            onClick={() => db.settings.put({ ...settings, goal: 'bulk' })}
          >
            Bulk
          </button>
          <button
            className={settings.goal === 'cut' ? 'active' : ''}
            onClick={() => db.settings.put({ ...settings, goal: 'cut' })}
          >
            Cut
          </button>
          <button
            className={settings.goal === 'recomp' ? 'active' : ''}
            onClick={() => db.settings.put({ ...settings, goal: 'recomp' })}
          >
            Recomp
          </button>
        </div>
        <label className="field" style={{ marginTop: '0.6rem' }}>
          <span>Notes</span>
          <textarea
            rows={4}
            value={settings.goalNotes}
            onChange={(e) => db.settings.put({ ...settings, goalNotes: e.target.value })}
          />
        </label>
      </section>

      <section className="card">
        <h3>Units (display)</h3>
        <div className="seg">
          <button
            className={settings.units === 'kg' ? 'active' : ''}
            onClick={() => db.settings.put({ ...settings, units: 'kg' })}
          >
            kg
          </button>
          <button
            className={settings.units === 'lb' ? 'active' : ''}
            onClick={() => db.settings.put({ ...settings, units: 'lb' })}
          >
            lb
          </button>
        </div>
        <p className="muted small">All weights are converted on the fly. Underlying storage stays in kg, so toggling never loses precision.</p>
      </section>

      <section className="card">
        <h3>Default rest timer</h3>
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
        <p className="muted small">Used when an exercise has no per-exercise default. Compounds get longer rests, isolations get shorter, automatically.</p>
      </section>

      <section className="card">
        <h3>Notifications</h3>
        {settings.notificationsEnabled ? (
          <p className="muted small">✓ Rest-timer notifications are enabled in this browser.</p>
        ) : (
          <button
            className="btn"
            onClick={async () => {
              const granted = await ensureNotificationPermission()
              if (granted) {
                await db.settings.put({ ...settings, notificationsEnabled: true })
              }
            }}
          >
            Enable rest-timer notifications
          </button>
        )}
        <p className="muted small">Lets BulkLog ping you when your rest is up, even if the screen has dimmed.</p>
      </section>

      <section className="card">
        <h3>Backup</h3>
        <button
          className="btn"
          onClick={async () => {
            const data = {
              exercises: await db.exercises.toArray(),
              plans: await db.plans.toArray(),
              sessions: await db.sessions.toArray(),
              setLogs: await db.setLogs.toArray(),
              bodyweight: await db.bodyweight.toArray(),
              settings: await db.settings.toArray(),
              exportedAt: new Date().toISOString(),
            }
            setExportText(JSON.stringify(data, null, 2))
          }}
        >
          Generate JSON backup
        </button>
        {exportText ? (
          <textarea
            rows={8}
            readOnly
            value={exportText}
            onFocus={(e) => e.currentTarget.select()}
          />
        ) : null}
      </section>

      <section className="card danger-zone">
        <h3>Reset</h3>
        <p className="muted small">
          Wipes all your sessions, set logs, bodyweight entries, and custom plan edits, then reseeds the default plan.
        </p>
        {confirmReset ? (
          <div className="row">
            <button
              className="btn danger"
              onClick={async () => {
                await resetDatabase()
                setConfirmReset(false)
              }}
            >
              Confirm reset
            </button>
            <button className="btn ghost" onClick={() => setConfirmReset(false)}>Cancel</button>
          </div>
        ) : (
          <button className="btn ghost" onClick={() => setConfirmReset(true)}>Reset database</button>
        )}
      </section>

      <section className="card">
        <h3>About</h3>
        <p className="muted small">
          BulkLog — local-only workout dashboard for hypertrophy training. Your data stays in this browser (IndexedDB).
          No accounts, no sync, fully offline once installed.
        </p>
      </section>
    </div>
  )
}
