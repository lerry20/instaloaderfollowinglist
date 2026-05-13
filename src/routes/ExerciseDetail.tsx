import { Link, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/schema'
import BodyDiagram from '../components/BodyDiagram'
import PostureFigure from '../components/PostureFigure'
import ProgressChart from '../components/ProgressChart'
import { useExercise, useSettings } from '../db/queries'

export default function ExerciseDetail() {
  const { id } = useParams<{ id: string }>()
  const ex = useExercise(id)
  const settings = useSettings()
  const sessionsByTopSet = useLiveQuery(async () => {
    if (!id) return []
    const logs = await db.setLogs.where('exerciseId').equals(id).toArray()
    const bySession = new Map<number, { weight: number; date?: string }>()
    for (const l of logs) {
      const cur = bySession.get(l.sessionId)
      if (!cur || l.weight > cur.weight) bySession.set(l.sessionId, { weight: l.weight })
    }
    const sessions = await db.sessions
      .where('id')
      .anyOf(Array.from(bySession.keys()))
      .toArray()
    sessions.sort((a, b) => (a.date < b.date ? -1 : 1))
    return sessions.slice(-12).map((s) => ({
      label: s.date.slice(5),
      value: bySession.get(s.id!)!.weight,
    }))
  }, [id])

  if (!ex) {
    return (
      <div className="page">
        <p className="muted">Exercise not found.</p>
        <Link to="/plan" className="link">Back to plan</Link>
      </div>
    )
  }

  const units = settings?.units ?? 'kg'

  return (
    <div className="page exercise-detail">
      <Link to={-1 as unknown as string} className="link back-link">← Back</Link>
      <header className="exercise-header">
        <h1>{ex.name}</h1>
        <span className="muted small">
          {ex.primaryMuscle}
          {ex.secondaryMuscles.length > 0 ? ` · ${ex.secondaryMuscles.join(', ')}` : ''}
          {' · '}
          {ex.equipment}
        </span>
      </header>

      <section className="card visuals">
        <div className="visual-grid">
          <div className="visual-cell">
            <h4>Position</h4>
            <PostureFigure posture={ex.postureKey} />
          </div>
          <div className="visual-cell">
            <h4>Worked muscles</h4>
            <BodyDiagram highlights={ex.muscleHighlights} />
          </div>
        </div>
      </section>

      <section className="card">
        <h3>Technique cues</h3>
        <ol className="cue-list">
          {ex.cues.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ol>
      </section>

      <section className="card bulk-tip">
        <h3>Bulking tip</h3>
        <p>{ex.bulkingTip}</p>
      </section>

      <section className="card">
        <h3>Top-set weight progression</h3>
        <ProgressChart data={sessionsByTopSet ?? []} unit={units} />
      </section>
    </div>
  )
}
