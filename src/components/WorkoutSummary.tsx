import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Units } from '../db/schema'
import { sessionHasPR } from '../db/queries'
import { kgToDisplay } from '../lib/units'

interface Props {
  sessionId: number
  units: Units
  onClose: () => void
}

export default function WorkoutSummary({ sessionId, units, onClose }: Props) {
  const navigate = useNavigate()
  const session = useLiveQuery(() => db.sessions.get(sessionId), [sessionId])
  const logs = useLiveQuery(() => db.setLogs.where('sessionId').equals(sessionId).toArray(), [sessionId])
  const exercises = useLiveQuery(() => db.exercises.toArray(), [])
  const [prs, setPrs] = useState<string[]>([])

  useEffect(() => {
    sessionHasPR(sessionId).then(setPrs).catch(() => setPrs([]))
  }, [sessionId, logs?.length])

  if (!session || !logs || !exercises) return null

  const working = logs.filter((l) => !l.isWarmup)
  const totalVolumeKg = working.reduce((s, l) => s + l.weight * l.reps, 0)
  const setsCount = working.length
  const planned = session.items ?? []
  const exerciseIds = Array.from(new Set(working.map((l) => l.exerciseId)))

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal summary" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <div>
            <span className="muted small">{session.date}</span>
            <h3>{session.planDayLabel} — done</h3>
          </div>
          <button className="link" onClick={onClose} aria-label="Close summary">
            Close
          </button>
        </header>

        <div className="summary-stats">
          <div>
            <span className="muted small">Working sets</span>
            <strong>{setsCount}</strong>
          </div>
          <div>
            <span className="muted small">Volume</span>
            <strong>
              {Math.round(kgToDisplay(totalVolumeKg, units))} {units}·reps
            </strong>
          </div>
          <div>
            <span className="muted small">PRs</span>
            <strong>{prs.length}</strong>
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
            <p className="muted">No sets logged.</p>
          ) : (
            exerciseIds.map((id) => {
              const ex = exercises.find((e) => e.id === id)
              const plan = planned.find((p) => p.exerciseId === id)
              const exLogs = working.filter((l) => l.exerciseId === id)
              const top = exLogs.reduce((m, l) => Math.max(m, l.weight), 0)
              return (
                <div key={id} className="summary-row">
                  <div>
                    <strong>{ex?.name ?? id}</strong>
                    {plan ? (
                      <span className="muted small">
                        {' '}
                        · planned {plan.targetSets} × {plan.targetReps}
                      </span>
                    ) : null}
                  </div>
                  <div className="muted small">
                    {exLogs.length} sets · top {kgToDisplay(top, units).toFixed(1)} {units}
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="modal-foot">
          <button className="btn primary block" onClick={() => navigate('/history')}>
            Done — go to History
          </button>
        </div>
      </div>
    </div>
  )
}
