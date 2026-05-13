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
import { kgToDisplay } from '../lib/units'

export default function Dashboard() {
  const plan = usePlan()
  const settings = useSettings()
  const sessions = useRecentSessions(14)
  const bw = useBodyweightLogs()
  const dayKey = todayDayKey()
  const today = plan?.weekTemplate[dayKey] ?? null

  const weekVolumeKg = useLiveQuery(async () => {
    if (!sessions) return 0
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 6)
    const cutoffIso = cutoff.toISOString().slice(0, 10)
    const sessionsThisWeek = sessions.filter((s) => s.date >= cutoffIso)
    if (sessionsThisWeek.length === 0) return 0
    const ids = sessionsThisWeek.map((s) => s.id!).filter(Boolean)
    const logs = await db.setLogs.where('sessionId').anyOf(ids).toArray()
    return logs
      .filter((l) => !l.isWarmup)
      .reduce((sum, l) => sum + l.weight * l.reps, 0)
  }, [sessions])

  const units = settings?.units ?? 'kg'
  const todaySessionExists = sessions?.some((s) => s.date === todayISO())

  const bwSeries = (bw ?? []).slice(-30).map((b) => ({
    label: b.date.slice(5),
    value: Number(kgToDisplay(b.weightKg, units).toFixed(1)),
  }))

  const latestBw = bw && bw.length > 0 ? kgToDisplay(bw[bw.length - 1].weightKg, units) : null

  return (
    <div className="page">
      <h1>Today</h1>
      <section className="card today-card">
        <div className="today-header">
          <span className="muted">{DAY_LABEL[dayKey]}</span>
          {today ? <h2>{today.label}</h2> : <h2>Rest day</h2>}
        </div>
        {today ? (
          <>
            <ul className="today-exercises">
              {today.items.slice(0, 5).map((item) => (
                <li key={item.exerciseId}>
                  <span className="muted small">
                    {item.targetSets} × {item.targetReps}
                  </span>
                  <strong>
                    <ExerciseName id={item.exerciseId} />
                  </strong>
                </li>
              ))}
              {today.items.length > 5 ? (
                <li className="muted small">+ {today.items.length - 5} more…</li>
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
          <span className="muted small">Volume (7d)</span>
          <span className="stat-value">
            {Math.round(kgToDisplay(weekVolumeKg ?? 0, units)).toLocaleString()}
            <span className="unit">{units}·reps</span>
          </span>
        </div>
        <div className="card stat">
          <span className="muted small">Bodyweight</span>
          <span className="stat-value">
            {latestBw !== null ? latestBw.toFixed(1) : '—'}
            <span className="unit">{latestBw !== null ? units : ''}</span>
          </span>
          {latestBw === null ? (
            <Link to="/bodyweight" className="link small">Log it →</Link>
          ) : null}
        </div>
      </section>

      <section className="card">
        <h3>Bodyweight trend</h3>
        <ProgressChart data={bwSeries} unit={units} />
        <Link to="/bodyweight" className="link">Log today's bodyweight →</Link>
      </section>

      <section className="card">
        <h3>Goal · {settings?.goal === 'cut' ? 'Cutting' : settings?.goal === 'recomp' ? 'Recomp' : 'Bulking'}</h3>
        <p className="muted small">{settings?.goalNotes}</p>
      </section>
    </div>
  )
}

function ExerciseName({ id }: { id: string }) {
  const ex = useLiveQuery(() => db.exercises.get(id), [id])
  return <>{ex?.name ?? id}</>
}
