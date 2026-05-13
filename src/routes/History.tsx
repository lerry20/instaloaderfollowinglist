import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/schema'
import { sessionHasPR, useRecentSessions, useSettings } from '../db/queries'
import { kgToDisplay } from '../lib/units'

export default function History() {
  const sessions = useRecentSessions(60)
  const allLogs = useLiveQuery(() => db.setLogs.toArray(), [])
  const exercises = useLiveQuery(() => db.exercises.toArray(), [])
  const settings = useSettings()
  const units = settings?.units ?? 'kg'
  const [prMap, setPrMap] = useState<Record<number, string[]>>({})

  useEffect(() => {
    if (!sessions) return
    let cancelled = false
    Promise.all(sessions.map((s) => sessionHasPR(s.id!))).then((arr) => {
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
          const working = logs.filter((l) => !l.isWarmup)
          const volume = working.reduce((sum, l) => sum + l.weight * l.reps, 0)
          const exerciseIds = Array.from(new Set(working.map((l) => l.exerciseId)))
          const prs = prMap[s.id!] ?? []
          return (
            <li key={s.id} className="card history-card">
              <header>
                <strong>{s.date}</strong>
                <span className="muted small">{s.planDayLabel}</span>
              </header>
              <p className="muted small">
                {working.length} working sets · volume {Math.round(kgToDisplay(volume, units))} {units}·reps
              </p>
              {prs.length > 0 ? (
                <p className="pr-pills">
                  {prs.map((id) => {
                    const ex = exercises?.find((e) => e.id === id)
                    return (
                      <span key={id} className="pr-pill">🥇 PR · {ex?.name ?? id}</span>
                    )
                  })}
                </p>
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
              {!s.completedAt ? <span className="badge">In progress</span> : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
