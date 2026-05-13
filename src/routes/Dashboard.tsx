import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/schema'
import {
  todayDayKey,
  todayISO,
  useBodyweightLogs,
  usePlan,
  useRecentSessions,
  useSettings,
} from '../db/queries'
import { DAY_LABEL } from '../db/schema'
import ProgressChart from '../components/ProgressChart'

export default function Dashboard() {
  const plan = usePlan()
  const settings = useSettings()
  const sessions = useRecentSessions(7)
  const bw = useBodyweightLogs()
  const dayKey = todayDayKey()
  const today = plan?.weekTemplate[dayKey] ?? null
  const weekVolume = useLiveQuery(async () => {
    const sevenAgo = new Date()
    sevenAgo.setDate(sevenAgo.getDate() - 6)
    const cutoff = sevenAgo.toISOString().slice(0, 10)
    const recent = await db.setLogs.where('loggedAt').above(0).toArray()
    return recent
      .filter((l) => {
        const session = sessions?.find((s) => s.id === l.sessionId)
        return session && session.date >= cutoff
      })
      .reduce((sum, l) => sum + l.weight * l.reps, 0)
  }, [sessions])

  const units = settings?.units ?? 'kg'
  const todaySessionExists = sessions?.some((s) => s.date === todayISO())

  const bwSeries = (bw ?? []).slice(-30).map((b) => ({ label: b.date.slice(5), value: b.weightKg }))

  return (
    <div className="page">
      <h1>Today</h1>
      <section className="card today-card">
        <div className="today-header">
          <span className="muted">{DAY_LABEL[dayKey]}</span>
          {today ? (
            <h2>{today.label}</h2>
          ) : (
            <h2>Rest day</h2>
          )}
        </div>
        {today ? (
          <>
            <ul className="today-exercises">
              {today.items.slice(0, 4).map((item) => (
                <li key={item.exerciseId}>
                  <span>{item.targetSets} × {item.targetReps}</span>
                  <strong>
                    <ExerciseName id={item.exerciseId} />
                  </strong>
                </li>
              ))}
              {today.items.length > 4 ? (
                <li className="muted">+ {today.items.length - 4} more…</li>
              ) : null}
            </ul>
            <Link to={`/workout/${dayKey}`} className="btn primary block">
              {todaySessionExists ? 'Continue workout' : 'Start workout'}
            </Link>
          </>
        ) : (
          <p className="muted">No exercises planned today — recover, eat, sleep.</p>
        )}
      </section>

      <section className="grid-2">
        <div className="card stat">
          <span className="muted">Volume (7d)</span>
          <span className="stat-value">
            {(weekVolume ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            <span className="unit">{units}·reps</span>
          </span>
        </div>
        <div className="card stat">
          <span className="muted">Bodyweight</span>
          <span className="stat-value">
            {bw && bw.length > 0 ? bw[bw.length - 1].weightKg : '—'}
            <span className="unit">{bw && bw.length > 0 ? 'kg' : ''}</span>
          </span>
        </div>
      </section>

      <section className="card">
        <h3>Bodyweight (last 30 logs)</h3>
        <ProgressChart data={bwSeries} unit="kg" />
        <Link to="/bodyweight" className="link">Log today's bodyweight →</Link>
      </section>

      <section className="card">
        <h3>Goal</h3>
        <p className="muted small">{settings?.goalNotes}</p>
      </section>
    </div>
  )
}

function ExerciseName({ id }: { id: string }) {
  const ex = useLiveQuery(() => db.exercises.get(id), [id])
  return <>{ex?.name ?? id}</>
}
