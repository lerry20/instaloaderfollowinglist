import { useEffect, useState } from 'react'
import { db } from '../db/schema'
import { resetDatabase } from '../db/seed'

interface DbStats {
  exercises: number
  routines: number
  sessions: number
  setLogs: number
  bodyweight: number
  nutrition: number
  sleep: number
  measurements: number
  coachMessages: number
  activeSessions: number
}

/** Hidden dev/diagnostic panel. Open with Cmd+D (Mac) or Ctrl+D (others).
 * Shows DB counts, active session, last error, and gives a quick path to
 * abandon stuck sessions or paste state into a bug report. */
export default function DebugPanel() {
  const [open, setOpen] = useState(false)
  const [stats, setStats] = useState<DbStats | null>(null)
  const [activeSummary, setActiveSummary] = useState<string>('')

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Cmd+D on Mac, Ctrl+D elsewhere. Capital D to require Shift on some keymaps.
      const mod = e.metaKey || e.ctrlKey
      if (mod && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    void (async () => {
      const [
        exercises, routines, sessions, setLogs, bodyweight,
        nutrition, sleep, measurements, coachMessages,
      ] = await Promise.all([
        db.exercises.count(), db.routines.count(), db.sessions.count(),
        db.setLogs.count(), db.bodyweight.count(), db.nutrition.count(),
        db.sleep.count(), db.measurements.count(), db.coachMessages.count(),
      ])
      const active = await db.sessions.toArray().then((arr) =>
        arr.filter((s) => s.completedAt === null),
      )
      if (cancelled) return
      setStats({
        exercises, routines, sessions, setLogs, bodyweight,
        nutrition, sleep, measurements, coachMessages,
        activeSessions: active.length,
      })
      setActiveSummary(
        active.length === 0
          ? 'No active session.'
          : active
              .map((s) => `#${s.id}  ${s.workoutName}  started ${new Date(s.startedAt).toISOString()}`)
              .join('\n'),
      )
    })()
    return () => {
      cancelled = true
    }
  }, [open])

  async function copyState() {
    if (!stats) return
    const payload = {
      ts: new Date().toISOString(),
      stats,
      activeSessions: activeSummary,
      ua: navigator.userAgent,
      url: window.location.href,
    }
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
      // eslint-disable-next-line no-alert
      alert('Debug snapshot copied.')
    } catch {
      // eslint-disable-next-line no-alert
      alert('Copy failed — open devtools console to read the snapshot.')
      console.log('[debug-snapshot]', payload)
    }
  }

  async function abandonActive() {
    const active = await db.sessions.toArray().then((arr) =>
      arr.filter((s) => s.completedAt === null),
    )
    for (const s of active) {
      await db.setLogs.where('sessionId').equals(s.id!).delete()
      await db.sessions.delete(s.id!)
    }
    window.location.reload()
  }

  async function wipe() {
    if (!confirm('Wipe ALL local data?')) return
    await resetDatabase()
    window.location.reload()
  }

  if (!open) return null

  return (
    <div className="debug-overlay" role="dialog" aria-label="Debug panel">
      <div className="debug-panel">
        <div className="debug-head">
          <strong>Debug</strong>
          <button className="link" onClick={() => setOpen(false)}>
            Close ✕
          </button>
        </div>
        {stats ? (
          <table className="debug-table">
            <tbody>
              <tr><td>exercises</td><td>{stats.exercises}</td></tr>
              <tr><td>routines</td><td>{stats.routines}</td></tr>
              <tr><td>sessions</td><td>{stats.sessions}</td></tr>
              <tr><td>setLogs</td><td>{stats.setLogs}</td></tr>
              <tr><td>bodyweight</td><td>{stats.bodyweight}</td></tr>
              <tr><td>nutrition</td><td>{stats.nutrition}</td></tr>
              <tr><td>sleep</td><td>{stats.sleep}</td></tr>
              <tr><td>measurements</td><td>{stats.measurements}</td></tr>
              <tr><td>coachMessages</td><td>{stats.coachMessages}</td></tr>
              <tr><td className="muted">active sessions</td><td>{stats.activeSessions}</td></tr>
            </tbody>
          </table>
        ) : (
          <p className="muted small">Loading…</p>
        )}
        <pre className="debug-pre">{activeSummary || '—'}</pre>
        <div className="debug-actions">
          <button className="btn small" onClick={copyState}>Copy snapshot</button>
          <button className="btn small" onClick={abandonActive}>Abandon active</button>
          <button className="btn small danger" onClick={wipe}>Wipe DB</button>
        </div>
        <p className="muted small">Toggle with ⌘D / Ctrl+D</p>
      </div>
    </div>
  )
}
