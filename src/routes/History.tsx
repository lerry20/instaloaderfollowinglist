import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/schema'
import { useRecentSessions } from '../db/queries'

export default function History() {
  const sessions = useRecentSessions(60)
  const allLogs = useLiveQuery(() => db.setLogs.toArray(), [])
  const exercises = useLiveQuery(() => db.exercises.toArray(), [])

  if (!sessions) return <div className="page"><p className="muted">Loading…</p></div>
  if (sessions.length === 0) {
    return (
      <div className="page">
        <h1>History</h1>
        <p className="muted">No sessions logged yet. Start a workout from <Link to="/" className="link">Today</Link>.</p>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>History</h1>
      <ul className="history-list">
        {sessions.map((s) => {
          const logs = (allLogs ?? []).filter((l) => l.sessionId === s.id)
          const volume = logs.reduce((sum, l) => sum + l.weight * l.reps, 0)
          const exerciseIds = Array.from(new Set(logs.map((l) => l.exerciseId)))
          return (
            <li key={s.id} className="card history-card">
              <header>
                <strong>{s.date}</strong>
                <span className="muted small">{s.planDayLabel}</span>
              </header>
              <p className="muted small">
                {logs.length} sets · volume {Math.round(volume)} kg·reps
              </p>
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
              {!s.completedAt ? <span className="badge">In progress</span> : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
