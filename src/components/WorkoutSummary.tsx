import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Units } from '../db/schema'
import { sessionHasPRs } from '../db/queries'
import { kgToDisplay } from '../lib/units'
import { estimateOneRepMax, formatDuration } from '../lib/strength'
import { shareWorkoutImage } from '../lib/shareImage'
import { toast } from '../state/toasts'

interface Props {
  sessionId: number
  units: Units
  onClose: () => void
}

export default function WorkoutSummary({ sessionId, units, onClose }: Props) {
  const navigate = useNavigate()
  const session = useLiveQuery(() => db.sessions.get(sessionId), [sessionId])
  const logs = useLiveQuery(
    () => db.setLogs.where('sessionId').equals(sessionId).toArray(),
    [sessionId],
  )
  const exercises = useLiveQuery(() => db.exercises.toArray(), [])
  const [prs, setPrs] = useState<string[]>([])
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    sessionHasPRs(sessionId).then(setPrs).catch(() => setPrs([]))
  }, [sessionId, logs?.length])

  if (!session || !logs || !exercises) return null

  const working = logs.filter((l) => !l.isWarmup)
  const totalVolumeKg = working.reduce((s, l) => s + l.weight * l.reps, 0)
  const setsCount = working.length
  const exerciseIds = Array.from(new Set(working.map((l) => l.exerciseId)))
  const durationMs =
    session.completedAt && session.startedAt ? session.completedAt - session.startedAt : 0

  async function onShare() {
    setSharing(true)
    try {
      await shareWorkoutImage(sessionId)
      toast('Workout image ready', { kind: 'success' })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      toast(`Share failed: ${msg}`, { kind: 'danger' })
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal summary" onClick={(e) => e.stopPropagation()}>
        {prs.length > 0 ? <ConfettiBanner /> : null}
        <header className="modal-head">
          <div>
            <span className="muted small">{session.date}</span>
            <h3>
              {prs.length > 0 ? '🥇 ' : '💪 '}
              {session.workoutName} — done
            </h3>
          </div>
          <button className="link" onClick={onClose}>Close</button>
        </header>

        <div className="summary-stats big">
          <div>
            <span className="muted small">Working sets</span>
            <strong className="tabnum stat-big">{setsCount}</strong>
          </div>
          <div>
            <span className="muted small">Volume ({units}·reps)</span>
            <strong className="tabnum stat-big">
              {Math.round(kgToDisplay(totalVolumeKg, units)).toLocaleString()}
            </strong>
          </div>
          <div>
            <span className="muted small">Duration</span>
            <strong className="tabnum stat-big">{durationMs > 0 ? formatDuration(durationMs) : '—'}</strong>
          </div>
          <div>
            <span className="muted small">PRs</span>
            <strong className={`tabnum stat-big${prs.length > 0 ? ' stat-pr' : ''}`}>{prs.length}</strong>
          </div>
        </div>

        {prs.length > 0 ? (
          <div className="card pr-card">
            <h4>🥇 New PRs</h4>
            <ul>
              {prs.map((id) => {
                const ex = exercises.find((e) => e.id === id)
                return <li key={id}>{ex?.name ?? id}</li>
              })}
            </ul>
            <p className="muted small" style={{ marginTop: '0.4rem' }}>
              A PR fires when the heaviest working set you logged today beats your
              all-time top working set for that exercise — same weight-logging convention as before.
            </p>
          </div>
        ) : null}

        <div className="summary-list">
          {exerciseIds.length === 0 ? (
            <p className="muted">No working sets logged.</p>
          ) : (
            exerciseIds.map((id) => {
              const ex = exercises.find((e) => e.id === id)
              const plan = session.items.find((p) => p.exerciseId === id)
              const exLogs = working.filter((l) => l.exerciseId === id)
              const top = exLogs.reduce(
                (best, l) =>
                  best === null || l.weight > best.weight
                    ? { weight: l.weight, reps: l.reps }
                    : best,
                null as { weight: number; reps: number } | null,
              )
              const isPR = prs.includes(id)
              const e1rmKg = top ? estimateOneRepMax(top.weight, top.reps) : null
              return (
                <div key={id} className="summary-row">
                  <div>
                    <strong>{isPR ? '🥇 ' : ''}{ex?.name ?? id}</strong>
                    {plan ? (
                      <span className="muted small">
                        {' · planned '}{plan.targetSets} × {plan.targetReps}
                      </span>
                    ) : null}
                  </div>
                  <div className="muted small tabnum">
                    {exLogs.length} sets · top {top ? kgToDisplay(top.weight, units).toFixed(units === 'kg' ? 1 : 0) : '—'} {units}
                    {e1rmKg ? ` · est max ${kgToDisplay(e1rmKg, units).toFixed(units === 'kg' ? 1 : 0)} ${units}` : ''}
                  </div>
                </div>
              )
            })
          )}
        </div>

        <SessionRpePrompt sessionId={sessionId} current={session.overallRPE} />

        <div className="modal-foot">
          <button className="btn block" onClick={onShare} disabled={sharing}>
            {sharing ? 'Generating image…' : '📤 Share as image'}
          </button>
          <button className="btn primary block" onClick={() => navigate('/progress')}>
            Done — go to Progress
          </button>
        </div>
      </div>
    </div>
  )
}

function ConfettiBanner() {
  const pieces = Array.from({ length: 24 })
  const colors = [
    'var(--primary)',
    'var(--good)',
    'var(--gold)',
    'var(--accent)',
    'var(--warning)',
  ]
  return (
    <div className="confetti" aria-hidden>
      {pieces.map((_, i) => {
        const left = (i / pieces.length) * 100
        const delay = (i % 8) * 0.12
        const dur = 1.6 + ((i * 7) % 9) / 10
        const bg = colors[i % colors.length]
        return (
          <span
            key={i}
            className="confetti-piece"
            style={{
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${dur}s`,
              background: bg,
            }}
          />
        )
      })}
    </div>
  )
}

/** Post-session intensity rating — collapsed by default. Tap "Rate intensity"
 * to expand to a 1-10 row. Stored on the session for future adaptive logic.
 * Completely optional, never blocks closing the summary. */
function SessionRpePrompt({ sessionId, current }: { sessionId: number; current?: number }) {
  const [picked, setPicked] = useState<number | null>(current ?? null)
  async function rate(n: number) {
    setPicked(n)
    await db.sessions.update(sessionId, { overallRPE: n })
  }
  return (
    <details className="session-rpe-prompt" open={picked !== null}>
      <summary>
        <span className="session-rpe-summary-label">
          {picked !== null ? `Intensity: ${picked} / 10` : 'Rate intensity'}
        </span>
        <span className="muted small">optional</span>
      </summary>
      <div className="session-rpe-scale">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <button
            key={n}
            type="button"
            className={`session-rpe-btn${picked === n ? ' active' : ''}`}
            aria-label={`Rate ${n} out of 10`}
            onClick={() => rate(n)}
          >
            {n}
          </button>
        ))}
      </div>
      <span className="session-rpe-hint muted small">
        1 = barely felt it · 5 = challenging · 10 = brutal
      </span>
    </details>
  )
}
