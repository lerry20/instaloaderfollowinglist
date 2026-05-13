import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  db,
  MUSCLE_LABEL,
  type MuscleKey,
  type Units,
} from '../db/schema'
import {
  exerciseProgression,
  sessionHasPRs,
  todayISO,
  useBodyweightLogs,
  useRecentSessions,
  useSettings,
} from '../db/queries'
import { displayToKg, kgToDisplay } from '../lib/units'
import ProgressChart from '../components/ProgressChart'
import VolumeBars from '../components/VolumeBars'
import TrainingCalendar from '../components/TrainingCalendar'
import { formatDuration } from '../lib/strength'
import { toast } from '../state/toasts'

export default function Progress() {
  const settings = useSettings()
  if (!settings) return <div className="page"><p className="muted">Loading…</p></div>
  const units = settings.units

  return (
    <div className="page">
      <h1 className="big-title">Progress</h1>
      <PRTicker units={units} />
      <section className="card">
        <header className="section-head">
          <h3>Training calendar</h3>
          <span className="muted small">last 13 weeks</span>
        </header>
        <TrainingCalendar />
      </section>
      <WeeklyVolumeBarsSection />
      <BodyweightSection units={units} />
      <TopSetCards units={units} />
      <WeeklyVolumeSection units={units} />
      <HistorySection units={units} />
    </div>
  )
}

function WeeklyVolumeBarsSection() {
  return (
    <section className="card">
      <header className="section-head">
        <h3>Weekly volume by muscle</h3>
        <span className="muted small">last 7 days · working sets vs. growth landmarks</span>
      </header>
      <VolumeBars />
      <p className="muted small">
        Each bar shows your working sets for the last 7 days against the range where growth happens.
        Grey = under-trained (not enough stimulus). Green = the sweet spot. Yellow = diminishing
        returns. Red = junk volume that won't grow anything new.
      </p>
    </section>
  )
}

function PRTicker({ units }: { units: Units }) {
  const sessions = useRecentSessions(40)
  const exercises = useLiveQuery(() => db.exercises.toArray(), [])
  const [prs, setPrs] = useState<{ name: string; weight: number; date: string }[]>([])

  useEffect(() => {
    if (!sessions || !exercises) return
    let cancelled = false
    ;(async () => {
      const found: { name: string; weight: number; date: string }[] = []
      for (const s of sessions) {
        if (cancelled) return
        const ids = await sessionHasPRs(s.id!)
        if (ids.length === 0) continue
        const logs = await db.setLogs.where('sessionId').equals(s.id!).toArray()
        for (const id of ids) {
          const top = logs
            .filter((l) => l.exerciseId === id && !l.isWarmup)
            .reduce((m, l) => Math.max(m, l.weight), 0)
          found.push({
            name: exercises.find((e) => e.id === id)?.name ?? id,
            weight: top,
            date: s.date,
          })
          if (found.length >= 4) break
        }
        if (found.length >= 4) break
      }
      if (!cancelled) setPrs(found)
    })()
    return () => {
      cancelled = true
    }
  }, [sessions, exercises])

  if (prs.length === 0) return null

  return (
    <section className="card pr-ticker">
      <header className="section-head">
        <h3>🥇 Recent PRs</h3>
      </header>
      <ul className="pr-ticker-list">
        {prs.map((p, i) => (
          <li key={i}>
            <strong>{p.name}</strong>
            <span className="tabnum">{kgToDisplay(p.weight, units).toFixed(units === 'kg' ? 1 : 0)} {units}</span>
            <span className="muted small">{p.date.slice(5)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function BodyweightSection({ units }: { units: Units }) {
  const logs = useBodyweightLogs()
  const [weight, setWeight] = useState<number | ''>('')
  const [editing, setEditing] = useState(false)
  const today = todayISO()
  const todayLog = logs?.find((l) => l.date === today)
  const series = (logs ?? [])
    .slice(-60)
    .map((l) => ({ label: l.date.slice(5), value: Number(kgToDisplay(l.weightKg, units).toFixed(1)) }))

  const showInput = !todayLog || editing

  return (
    <section className="card">
      <header className="section-head">
        <h3>Bodyweight</h3>
        <span className="muted small">
          {logs && logs.length > 0
            ? `${kgToDisplay(logs[logs.length - 1].weightKg, units).toFixed(1)} ${units}`
            : 'No entries'}
        </span>
      </header>
      {showInput ? (
        <div className="bw-input-row">
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={weight}
            placeholder={todayLog ? kgToDisplay(todayLog.weightKg, units).toFixed(1) : units}
            onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
          />
          <span className="muted small unit-label">{units}</span>
          <button
            className="btn primary"
            disabled={weight === '' || Number.isNaN(Number(weight))}
            onClick={async () => {
              if (weight === '') return
              await db.bodyweight.put({ date: today, weightKg: displayToKg(Number(weight), units) })
              setWeight('')
              setEditing(false)
              toast(todayLog ? 'Bodyweight updated' : 'Bodyweight logged', { kind: 'success' })
            }}
          >
            {todayLog ? 'Update' : 'Log'}
          </button>
        </div>
      ) : (
        <div className="bw-logged-row">
          <p>
            Today: <strong className="tabnum">{kgToDisplay(todayLog!.weightKg, units).toFixed(1)} {units}</strong>{' '}
            <span className="muted small">✓ logged</span>
          </p>
          <button className="link small" onClick={() => setEditing(true)}>Edit</button>
        </div>
      )}
      <ProgressChart data={series} unit={units} />
    </section>
  )
}

function TopSetCards({ units }: { units: Units }) {
  const allLogs = useLiveQuery(() => db.setLogs.toArray(), [])
  const exercises = useLiveQuery(() => db.exercises.toArray(), [])
  const [series, setSeries] = useState<
    { id: string; name: string; data: { label: string; value: number }[] }[]
  >([])

  useEffect(() => {
    if (!allLogs || !exercises) return
    let cancelled = false
    const working = allLogs.filter((l) => !l.isWarmup)
    const freq = new Map<string, number>()
    for (const l of working) freq.set(l.exerciseId, (freq.get(l.exerciseId) ?? 0) + 1)
    const topIds = Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([id]) => id)
    ;(async () => {
      const out: { id: string; name: string; data: { label: string; value: number }[] }[] = []
      for (const id of topIds) {
        const data = await exerciseProgression(id, 12)
        out.push({
          id,
          name: exercises.find((e) => e.id === id)?.name ?? id,
          data: data.map((p) => ({
            label: p.label,
            value: Number(kgToDisplay(p.value, units).toFixed(units === 'kg' ? 1 : 0)),
          })),
        })
      }
      if (!cancelled) setSeries(out)
    })()
    return () => {
      cancelled = true
    }
  }, [allLogs, exercises, units])

  if (series.length === 0) return null

  return (
    <section className="card">
      <header className="section-head">
        <h3>Top sets — your most-trained lifts</h3>
      </header>
      <div className="top-set-grid">
        {series.map((s) => (
          <Link to={`/exercise/${s.id}`} key={s.id} className="top-set-cell">
            <span className="muted small">{s.name}</span>
            <ProgressChart data={s.data} unit={units} height={120} />
          </Link>
        ))}
      </div>
    </section>
  )
}

function WeeklyVolumeSection({ units }: { units: Units }) {
  const sessions = useRecentSessions(30)
  const allLogs = useLiveQuery(() => db.setLogs.toArray(), [])
  const exercises = useLiveQuery(() => db.exercises.toArray(), [])

  const data = useMemo(() => {
    if (!sessions || !allLogs || !exercises) return []
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 6)
    const cutoffIso = cutoff.toISOString().slice(0, 10)
    const recentIds = sessions.filter((s) => s.date >= cutoffIso).map((s) => s.id!)
    const volumes = new Map<MuscleKey, number>()
    for (const l of allLogs) {
      if (l.isWarmup) continue
      if (!recentIds.includes(l.sessionId)) continue
      const ex = exercises.find((e) => e.id === l.exerciseId)
      if (!ex) continue
      const v = l.weight * l.reps
      volumes.set(ex.primaryMuscle, (volumes.get(ex.primaryMuscle) ?? 0) + v)
    }
    return Array.from(volumes.entries())
      .map(([m, v]) => ({
        muscle: MUSCLE_LABEL[m],
        value: Math.round(kgToDisplay(v, units)),
      }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [sessions, allLogs, exercises, units])

  if (data.length === 0) return null

  return (
    <section className="card">
      <header className="section-head">
        <h3>Weekly volume by muscle (7 days)</h3>
        <span className="muted small">{units}·reps</span>
      </header>
      <div style={{ width: '100%', height: Math.max(180, data.length * 26) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, bottom: 4, left: 4 }}>
            <CartesianGrid stroke="#1d2547" strokeDasharray="3 3" />
            <XAxis type="number" stroke="#7d88c0" fontSize={11} />
            <YAxis dataKey="muscle" type="category" width={88} stroke="#7d88c0" fontSize={11} />
            <Tooltip
              contentStyle={{
                background: '#131a3a',
                border: '1px solid #2a3566',
                borderRadius: 8,
                color: '#e7ecff',
              }}
              labelStyle={{ color: '#7d88c0' }}
              cursor={{ fill: 'rgba(122,162,255,0.08)' }}
            />
            <Bar dataKey="value" fill="#7aa2ff" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

function HistorySection({ units }: { units: Units }) {
  const sessions = useRecentSessions(30)
  const allLogs = useLiveQuery(() => db.setLogs.toArray(), [])
  const exercises = useLiveQuery(() => db.exercises.toArray(), [])
  const [prMap, setPrMap] = useState<Record<number, string[]>>({})

  useEffect(() => {
    if (!sessions) return
    let cancelled = false
    Promise.all(sessions.map((s) => sessionHasPRs(s.id!))).then((arr) => {
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

  if (!sessions || sessions.length === 0) {
    return (
      <section className="card">
        <h3>Recent sessions</h3>
        <p className="muted">No sessions yet. <Link to="/" className="link">Start one →</Link></p>
      </section>
    )
  }

  return (
    <section className="card">
      <h3>Recent sessions</h3>
      <ul className="session-history">
        {sessions.map((s) => {
          const logs = (allLogs ?? []).filter((l) => l.sessionId === s.id)
          const working = logs.filter((l) => !l.isWarmup)
          const volume = working.reduce((sum, l) => sum + l.weight * l.reps, 0)
          const prs = prMap[s.id!] ?? []
          const exerciseIds = Array.from(new Set(working.map((l) => l.exerciseId)))
          return (
            <li key={s.id} className="session-history-row">
              <header>
                <div>
                  <strong>{s.workoutName}</strong>
                  <span className="muted small"> · {s.date}</span>
                </div>
                {!s.completedAt ? <span className="badge">In progress</span> : null}
              </header>
              <span className="muted small">
                {working.length} working sets · volume {Math.round(kgToDisplay(volume, units)).toLocaleString()} {units}·reps
                {s.completedAt && s.startedAt ? ` · ${formatDuration(s.completedAt - s.startedAt)}` : ''}
              </span>
              {prs.length > 0 ? (
                <div className="pr-pills">
                  {prs.map((id) => {
                    const ex = exercises?.find((e) => e.id === id)
                    return <span key={id} className="pr-pill">🥇 {ex?.name ?? id}</span>
                  })}
                </div>
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
            </li>
          )
        })}
      </ul>
    </section>
  )
}
