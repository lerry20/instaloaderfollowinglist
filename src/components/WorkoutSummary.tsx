import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Units } from '../db/schema'
import { sessionHasPRs } from '../db/queries'
import { kgToDisplay } from '../lib/units'

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

  useEffect(() => {
    sessionHasPRs(sessionId).then(setPrs).catch(() => setPrs([]))
  }, [sessionId, logs?.length])

  if (!session || !logs || !exercises) return null

  const working = logs.filter((l) => !l.isWarmup)
  const totalVolumeKg = working.reduce((s, l) => s + l.weight * l.reps, 0)
  const setsCount = working.length
  const exerciseIds = Array.from(new Set(working.map((l) => l.exerciseId)))

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
              const top = exLogs.reduce((m, l) => Math.max(m, l.weight), 0)
              return (
                <div key={id} className="summary-row">
                  <div>
                    <strong>{ex?.name ?? id}</strong>
                    {plan ? (
                      <span className="muted small">
                        {' · planned '}{plan.targetSets} × {plan.targetReps}
                      </span>
                    ) : null}
                  </div>
                  <div className="muted small tabnum">
                    {exLogs.length} sets · top {kgToDisplay(top, units).toFixed(units === 'kg' ? 1 : 0)} {units}
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="modal-foot">
          <button className="btn primary block" onClick={() => navigate('/progress')}>
            Done — go to Progress
          </button>
        </div>
      </div>
    </div>
  )
}

function ConfettiBanner() {
  // Pure CSS confetti — 24 absolutely-positioned squares that fall + rotate.
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
