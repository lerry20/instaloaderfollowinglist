import { useRef, useState } from 'react'
import { db, EQUIPMENT_LABEL, EQUIPMENT_TAGS, type EquipmentTag, type Settings } from '../db/schema'
import { resetDatabase } from '../db/seed'
import { useSettings } from '../db/queries'
import { ensureNotificationPermission } from '../state/restTimer'
import { toast } from '../state/toasts'
import { detectDeloadSignal, nextPhase, PHASE_DESCRIPTION, PHASE_LABEL } from '../lib/programming'
import { useT, useLocaleStore, LOCALES, LOCALE_LABEL, LOCALE_FLAG, type Locale } from '../i18n'
import { setDemoMode, useDemoMode } from '../state/demoMode'

interface Props {
  onClose: () => void
}

export default function SettingsModal({ onClose }: Props) {
  const tr = useT()
  const locale = useLocaleStore((s) => s.locale)
  const setLocale = useLocaleStore((s) => s.setLocale)
  const settings = useSettings()
  const [confirmReset, setConfirmReset] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const importInputRef = useRef<HTMLInputElement>(null)
  const [deloadInfo, setDeloadInfo] = useState<string | null>(null)
  const demoMode = useDemoMode()

  if (!settings) return null

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    if (!settings) return
    db.settings.put({ ...settings, [key]: value })
  }

  async function exportAll() {
    setExporting(true)
    try {
      // Redact the API key on export — backup files commonly get shared
      // via Slack / email / cloud storage and the key should never leave
      // this device unencrypted.
      const settingsForExport = (await db.settings.toArray()).map((s) => ({
        ...s,
        aiApiKey: undefined,
      }))
      const dump = {
        version: 5,
        exportedAt: new Date().toISOString(),
        sessions: await db.sessions.toArray(),
        setLogs: await db.setLogs.toArray(),
        bodyweight: await db.bodyweight.toArray(),
        nutrition: await db.nutrition.toArray(),
        sleep: await db.sleep.toArray(),
        measurements: await db.measurements.toArray(),
        routines: await db.routines.toArray(),
        settings: settingsForExport,
        // Coach chat history may contain personal training notes; skip it
        // from the backup. Users can clear it manually if needed.
        coachMessages: [],
      }
      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mybulklog-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast('Backup downloaded', { kind: 'success' })
    } finally {
      setExporting(false)
    }
  }

  async function importFile(file: File) {
    setImporting(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (!data || typeof data !== 'object') throw new Error('Invalid file')
      if (Array.isArray(data.sessions)) await db.sessions.bulkPut(data.sessions)
      if (Array.isArray(data.setLogs)) await db.setLogs.bulkPut(data.setLogs)
      if (Array.isArray(data.bodyweight)) await db.bodyweight.bulkPut(data.bodyweight)
      if (Array.isArray(data.nutrition)) await db.nutrition.bulkPut(data.nutrition)
      if (Array.isArray(data.sleep)) await db.sleep.bulkPut(data.sleep)
      if (Array.isArray(data.measurements)) await db.measurements.bulkPut(data.measurements)
      if (Array.isArray(data.routines)) await db.routines.bulkPut(data.routines)
      if (Array.isArray(data.coachMessages)) await db.coachMessages.bulkPut(data.coachMessages)
      // Don't overwrite settings.id=1; merge non-key fields.
      if (Array.isArray(data.settings) && data.settings[0]) {
        const imported = data.settings[0]
        const current = await db.settings.get(1)
        await db.settings.put({ ...current, ...imported, id: 1 })
      }
      toast('Backup imported', { kind: 'success' })
    } catch (e) {
      console.error(e)
      toast('Import failed — invalid file?', { kind: 'danger' })
    } finally {
      setImporting(false)
    }
  }

  async function advancePhase() {
    if (!settings) return
    const next = nextPhase(settings.periodizationPhase)
    await db.settings.put({
      ...settings,
      periodizationPhase: next,
      periodizationWeek: next === 'volume' ? 1 : settings.periodizationWeek + 1,
    })
    toast(`Phase → ${PHASE_LABEL[next]}`, { kind: 'success' })
  }

  async function checkDeload() {
    const s = await detectDeloadSignal()
    setDeloadInfo(s.shouldDeload ? `⚠ ${s.reason}` : `✓ ${s.reason}`)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <h3>{tr('settings.title')}</h3>
          <button className="link" onClick={onClose}>{tr('common.close')}</button>
        </header>

        <div className={`demo-mode-card${demoMode ? ' is-on' : ''}`}>
          <div className="demo-mode-card-body">
            <h4>{tr('demo.toggle_label')}</h4>
            <p className="muted small">{tr('demo.toggle_help')}</p>
          </div>
          <label className="demo-mode-switch">
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => {
                setDemoMode(e.target.checked)
                toast(
                  e.target.checked ? tr('demo.banner') : `${tr('demo.toggle_label')} · off`,
                  { kind: 'success', duration: 1800 },
                )
              }}
            />
            <span className="demo-mode-switch-track" aria-hidden />
          </label>
        </div>

        <Row label={tr('settings.language')}>
          <div className="seg" style={{ flexWrap: 'wrap' }}>
            {LOCALES.map((l: Locale) => (
              <button
                key={l}
                className={locale === l ? 'active' : ''}
                onClick={() => setLocale(l)}
                aria-pressed={locale === l}
              >
                {LOCALE_FLAG[l]} {LOCALE_LABEL[l]}
              </button>
            ))}
          </div>
        </Row>

        <Row label={tr('settings.theme')}>
          <div className="seg">
            {(['system', 'light', 'dark'] as const).map((th) => (
              <button key={th} className={settings.theme === th ? 'active' : ''} onClick={() => update('theme', th)}>
                {th === 'system' ? tr('settings.theme_system') : th === 'light' ? tr('settings.theme_light') : tr('settings.theme_dark')}
              </button>
            ))}
          </div>
        </Row>

        <Row label={tr('settings.skill_level')}>
          <div className="seg">
            <button className={settings.skillLevel === 'beginner' ? 'active' : ''} onClick={() => update('skillLevel', 'beginner')}>{tr('settings.skill_beginner')}</button>
            <button className={settings.skillLevel === 'advanced' ? 'active' : ''} onClick={() => update('skillLevel', 'advanced')}>{tr('settings.skill_advanced')}</button>
          </div>
        </Row>

        <Row label={tr('settings.goal')}>
          <div className="seg">
            {(['bulk', 'cut', 'recomp'] as const).map((g) => (
              <button key={g} className={settings.goal === g ? 'active' : ''} onClick={() => update('goal', g)}>
                {g === 'bulk' ? tr('settings.goal_bulk') : g === 'cut' ? tr('settings.goal_cut') : tr('settings.goal_recomp')}
              </button>
            ))}
          </div>
        </Row>

        <Row label={tr('settings.units')}>
          <div className="seg">
            <button className={settings.units === 'kg' ? 'active' : ''} onClick={() => update('units', 'kg')}>{tr('unit.kg')}</button>
            <button className={settings.units === 'lb' ? 'active' : ''} onClick={() => update('units', 'lb')}>{tr('unit.lb')}</button>
          </div>
        </Row>

        <Row label={tr('settings.default_rest')}>
          <div className="seg">
            {[60, 90, 120, 180, 240].map((s) => (
              <button key={s} className={settings.defaultRestSec === s ? 'active' : ''} onClick={() => update('defaultRestSec', s)}>{s}s</button>
            ))}
          </div>
        </Row>

        <EquipmentRow settings={settings} update={update} />


        <Row label="Notifications">
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
                }
              }}
            >
              Enable
            </button>
          )}
        </Row>

        <details className="card section-card collapsible-section">
          <summary>
            <h4>Nutrition targets</h4>
            <span className="muted small">
              {settings.kcalTarget || settings.proteinTargetG
                ? `${settings.kcalTarget ?? '—'} kcal · ${settings.proteinTargetG ?? '—'} g protein`
                : 'Not set'}
            </span>
          </summary>
          <div className="settings-grid-2">
            <label className="field">
              <span>Daily kcal target</span>
              <input
                type="number"
                inputMode="numeric"
                value={settings.kcalTarget ?? ''}
                onChange={(e) => update('kcalTarget', e.target.value === '' ? undefined : Number(e.target.value))}
                placeholder="e.g. 2800"
              />
            </label>
            <label className="field">
              <span>Daily protein (g)</span>
              <input
                type="number"
                inputMode="numeric"
                value={settings.proteinTargetG ?? ''}
                onChange={(e) => update('proteinTargetG', e.target.value === '' ? undefined : Number(e.target.value))}
                placeholder="e.g. 150"
              />
            </label>
          </div>
          <p className="muted small">
            Rough bulk targets: 1.6–2.2 g protein / kg bodyweight, +250–500 kcal above maintenance.
          </p>
        </details>

        <details className="card section-card collapsible-section">
          <summary>
            <h4>Periodization</h4>
            <span className="muted small">{PHASE_LABEL[settings.periodizationPhase]} · week {settings.periodizationWeek}</span>
          </summary>
          <p className="muted small">{PHASE_DESCRIPTION[settings.periodizationPhase]}</p>
          <div className="row">
            <button className="btn small" onClick={advancePhase}>
              Advance to {PHASE_LABEL[nextPhase(settings.periodizationPhase)]} →
            </button>
            <button className="btn small ghost" onClick={checkDeload}>
              Check deload signal
            </button>
          </div>
          {deloadInfo ? <p className="muted small" style={{ marginTop: '0.4rem' }}>{deloadInfo}</p> : null}
        </details>

        <details className="card section-card collapsible-section">
          <summary>
            <h4>AI Coach</h4>
            <span className="muted small">{settings.aiApiKey ? '✓ Key set' : 'No key'}</span>
          </summary>
          <label className="field">
            <span>Anthropic API key</span>
            <input
              type="password"
              value={settings.aiApiKey ?? ''}
              onChange={(e) => update('aiApiKey', e.target.value || undefined)}
              placeholder="sk-ant-..."
              autoComplete="off"
            />
          </label>
          <p className="muted small">
            Stored only in this browser. Calls go direct from your device to api.anthropic.com.
            Get a key at <a className="link" href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer">console.anthropic.com</a>.
            Then tap 💬 in the header to chat.
          </p>
        </details>

        <details className="card section-card collapsible-section">
          <summary>
            <h4>Backup &amp; restore</h4>
            <span className="muted small">JSON export / import</span>
          </summary>
          <div className="row">
            <button className="btn small" onClick={exportAll} disabled={exporting}>
              {exporting ? 'Exporting…' : 'Export JSON'}
            </button>
            <button
              className="btn small"
              onClick={() => importInputRef.current?.click()}
              disabled={importing}
            >
              {importing ? 'Importing…' : 'Import JSON'}
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) importFile(f)
                e.target.value = ''
              }}
            />
          </div>
          <p className="muted small">
            Use this to move data between devices, or as a safety net before clearing the app.
            Imports merge with existing data (won't wipe anything).
          </p>
        </details>

        <details className="advanced-details">
          <summary>{tr('settings.advanced')}</summary>
          <label className="field" style={{ marginTop: '0.6rem' }}>
            <span>Goal notes</span>
            <textarea rows={3} value={settings.goalNotes} onChange={(e) => update('goalNotes', e.target.value)} />
          </label>
          <div className="settings-row" style={{ marginTop: '0.6rem' }}>
            <span>{tr('settings.reset_data')}</span>
            {confirmReset ? (
              <span className="row">
                <button
                  className="btn small danger"
                  onClick={async () => {
                    await resetDatabase()
                    setConfirmReset(false)
                    toast(tr('settings.reset_data'), { kind: 'warn' })
                  }}
                >
                  {tr('common.confirm')}
                </button>
                <button className="btn small ghost" onClick={() => setConfirmReset(false)}>{tr('common.cancel')}</button>
              </span>
            ) : (
              <button className="btn small ghost" onClick={() => setConfirmReset(true)}>{tr('common.confirm')}</button>
            )}
          </div>
        </details>

        <p className="muted small about-line">
          MyBulkLog · local-only · IndexedDB · exercise data from{' '}
          <a className="link" href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noopener noreferrer">free-exercise-db</a>
        </p>
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="settings-row">
      <span>{label}</span>
      <span>{children}</span>
    </div>
  )
}

/** Equipment availability multi-select. Default is "I have everything" —
 * undefined available, no filtering. Tapping any chip switches to the
 * explicit-list mode so the user can toggle each one off. */
function EquipmentRow({
  settings,
  update,
}: {
  settings: Settings
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void
}) {
  const available = settings.availableEquipment
  const isAll = available === undefined
  function toggle(tag: EquipmentTag) {
    const current = available ?? [...EQUIPMENT_TAGS]
    const next = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag]
    update('availableEquipment', next)
  }
  return (
    <details className="card section-card collapsible-section">
      <summary>
        <h4>Equipment</h4>
        <span className="muted small">
          {isAll
            ? 'Full gym'
            : available!.length === 0
            ? 'Bodyweight only'
            : `${available!.length} of ${EQUIPMENT_TAGS.length}`}
        </span>
      </summary>
      <p className="muted small">
        Pick what you have access to. Picker and routine recommendations
        will hide exercises that need missing equipment.
      </p>
      <div className="muscle-filters" style={{ marginTop: 'var(--space-2)' }}>
        {EQUIPMENT_TAGS.map((tag) => {
          const on = isAll || (available?.includes(tag) ?? false)
          return (
            <button
              key={tag}
              className={`chip${on ? ' active' : ''}`}
              onClick={() => toggle(tag)}
              aria-pressed={on}
            >
              {EQUIPMENT_LABEL[tag]}
            </button>
          )
        })}
      </div>
      {!isAll ? (
        <button
          className="link small"
          style={{ marginTop: 'var(--space-2)' }}
          onClick={() => update('availableEquipment', undefined)}
        >
          Reset to full gym
        </button>
      ) : null}
    </details>
  )
}

