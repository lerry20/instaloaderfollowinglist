import { useState } from 'react'
import { db, type Settings } from '../db/schema'
import { resetDatabase } from '../db/seed'
import { useSettings } from '../db/queries'
import { ensureNotificationPermission } from '../state/restTimer'
import { toast } from '../state/toasts'

interface Props {
  onClose: () => void
}

export default function SettingsModal({ onClose }: Props) {
  const settings = useSettings()
  const [confirmReset, setConfirmReset] = useState(false)

  if (!settings) return null

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    if (!settings) return
    db.settings.put({ ...settings, [key]: value }).then(() => {
      toast('Saved', { kind: 'success', duration: 1200 })
    })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <h3>Settings</h3>
          <button className="link" onClick={onClose}>Close</button>
        </header>

        <SettingsRow label="Theme">
          <div className="seg">
            {(['system', 'light', 'dark'] as const).map((t) => (
              <button
                key={t}
                className={settings.theme === t ? 'active' : ''}
                onClick={() => update('theme', t)}
              >
                {t === 'system' ? 'Auto' : t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </SettingsRow>

        <SettingsRow label="Detail level">
          <div className="seg">
            <button
              className={settings.skillLevel === 'beginner' ? 'active' : ''}
              onClick={() => update('skillLevel', 'beginner')}
            >
              Beginner
            </button>
            <button
              className={settings.skillLevel === 'advanced' ? 'active' : ''}
              onClick={() => update('skillLevel', 'advanced')}
            >
              Advanced
            </button>
          </div>
        </SettingsRow>
        <p className="muted small inline-explainer">
          Beginner shows technique cues + bulking tips on each exercise. Advanced hides them for a cleaner session screen.
        </p>

        <SettingsRow label="Goal">
          <div className="seg">
            {(['bulk', 'cut', 'recomp'] as const).map((g) => (
              <button
                key={g}
                className={settings.goal === g ? 'active' : ''}
                onClick={() => update('goal', g)}
              >
                {g[0].toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
        </SettingsRow>

        <SettingsRow label="Units">
          <div className="seg">
            <button
              className={settings.units === 'kg' ? 'active' : ''}
              onClick={() => update('units', 'kg')}
            >
              kg
            </button>
            <button
              className={settings.units === 'lb' ? 'active' : ''}
              onClick={() => update('units', 'lb')}
            >
              lb
            </button>
          </div>
        </SettingsRow>

        <SettingsRow label="Default rest">
          <div className="seg">
            {[60, 90, 120, 180, 240].map((s) => (
              <button
                key={s}
                className={settings.defaultRestSec === s ? 'active' : ''}
                onClick={() => update('defaultRestSec', s)}
              >
                {s}s
              </button>
            ))}
          </div>
        </SettingsRow>

        <SettingsRow label="Notifications">
          {settings.notificationsEnabled ? (
            <span className="muted small">✓ Enabled</span>
          ) : (
            <button
              className="btn small"
              onClick={async () => {
                const granted = await ensureNotificationPermission()
                if (granted) {
                  await db.settings.put({ ...settings, notificationsEnabled: true })
                  toast('Notifications enabled', { kind: 'success' })
                } else {
                  toast('Permission denied', { kind: 'warn' })
                }
              }}
            >
              Enable
            </button>
          )}
        </SettingsRow>

        <details className="advanced-details">
          <summary>Advanced</summary>
          <label className="field" style={{ marginTop: '0.6rem' }}>
            <span>Goal notes</span>
            <textarea
              rows={3}
              value={settings.goalNotes}
              onChange={(e) => update('goalNotes', e.target.value)}
            />
          </label>
          <div className="settings-row" style={{ marginTop: '0.6rem' }}>
            <span>Reset all data</span>
            {confirmReset ? (
              <span className="row">
                <button
                  className="btn small danger"
                  onClick={async () => {
                    await resetDatabase()
                    setConfirmReset(false)
                    toast('Database reset', { kind: 'warn' })
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

        <p className="muted small about-line">
          BulkLog · local-only · IndexedDB · open-source data from{' '}
          <a className="link" href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noopener noreferrer">free-exercise-db</a>
        </p>
      </div>
    </div>
  )
}

function SettingsRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="settings-row">
      <span>{label}</span>
      <span>{children}</span>
    </div>
  )
}
