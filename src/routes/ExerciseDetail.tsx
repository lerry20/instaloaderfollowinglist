import { useNavigate, useParams } from 'react-router-dom'
import BodyDiagram from '../components/BodyDiagram'
import PostureFigure from '../components/PostureFigure'
import ProgressChart from '../components/ProgressChart'
import { exerciseSessionHistory, useExercise, useSettings } from '../db/queries'
import { useLiveQuery } from 'dexie-react-hooks'
import { kgToDisplay } from '../lib/units'

export default function ExerciseDetail() {
  const { id } = useParams<{ id: string }>()
  const ex = useExercise(id)
  const settings = useSettings()
  const navigate = useNavigate()

  const historyKg = useLiveQuery(
    () => (id ? exerciseSessionHistory(id, 12) : Promise.resolve([])),
    [id],
  )

  if (!ex) {
    return (
      <div className="page">
        <p className="muted">Exercise not found.</p>
        <button className="link" onClick={() => navigate(-1)}>← Back</button>
      </div>
    )
  }

  const units = settings?.units ?? 'kg'
  const chart = (historyKg ?? []).map((p) => ({
    label: p.label,
    value: Number(kgToDisplay(p.value, units).toFixed(units === 'kg' ? 1 : 0)),
  }))
  const isExtended = ex.source === 'extended'
  const demoHref =
    ex.videoUrl ??
    `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.youtubeQuery || ex.name + ' technique')}`

  return (
    <div className="page exercise-detail">
      <button className="link back-link" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <header className="exercise-header">
        <h1>{ex.name}</h1>
        <span className="muted small">
          {ex.primaryMuscle}
          {ex.secondaryMuscles.length > 0 ? ` · ${ex.secondaryMuscles.join(', ')}` : ''}
          {' · '}
          {ex.equipment}
        </span>
        {isExtended ? (
          <span className="ext-pill standalone">Extended catalog</span>
        ) : null}
      </header>

      <a className="btn primary block demo-btn" href={demoHref} target="_blank" rel="noopener noreferrer">
        ▶ Watch technique demo
      </a>

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
        <h3>{isExtended ? 'Instructions' : 'Technique cues'}</h3>
        <ol className="cue-list">
          {ex.cues.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ol>
      </section>

      {!isExtended && ex.bulkingTip ? (
        <section className="card bulk-tip">
          <h3>Bulking tip</h3>
          <p>{ex.bulkingTip}</p>
        </section>
      ) : null}

      {isExtended ? (
        <section className="card muted-card">
          <p className="muted small">
            Imported from the open <a className="link" href="https://github.com/exercemus/exercises" target="_blank" rel="noopener noreferrer">exercemus catalog</a>. No bulking-specific notes — the video link above is the best technique reference.
          </p>
        </section>
      ) : null}

      <section className="card">
        <h3>Top-set weight ({units})</h3>
        <ProgressChart data={chart} unit={units} />
      </section>
    </div>
  )
}
