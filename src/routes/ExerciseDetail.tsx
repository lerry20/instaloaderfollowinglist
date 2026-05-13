import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { MUSCLE_LABEL } from '../db/schema'
import { exerciseProgression, useExercise, useSettings } from '../db/queries'
import { kgToDisplay } from '../lib/units'
import ProgressChart from '../components/ProgressChart'
import ExerciseImage from '../components/ExerciseImage'

export default function ExerciseDetail() {
  const { id } = useParams<{ id: string }>()
  const ex = useExercise(id)
  const settings = useSettings()
  const navigate = useNavigate()
  const history = useLiveQuery(
    () => (id ? exerciseProgression(id, 12) : Promise.resolve([])),
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
  const chart = (history ?? []).map((p) => ({
    label: p.label,
    value: Number(kgToDisplay(p.value, units).toFixed(units === 'kg' ? 1 : 0)),
  }))
  const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.videoQuery || ex.name + ' technique')}`

  return (
    <div className="page exercise-detail">
      <button className="link back-link" onClick={() => navigate(-1)}>← Back</button>

      <header className="exercise-header">
        <h1 className="big-title">{ex.name}</h1>
        <span className="muted small">
          {MUSCLE_LABEL[ex.primaryMuscle]}
          {ex.secondaryMuscles.length > 0
            ? ` · ${ex.secondaryMuscles.map((m) => MUSCLE_LABEL[m]).join(', ')}`
            : ''}
          {' · '}
          {ex.equipment}
        </span>
        {!ex.isCurated ? <span className="ext-pill standalone">Extended catalog</span> : null}
      </header>

      <div className="exercise-image-large">
        <ExerciseImage urls={ex.imageUrls ?? []} alt={ex.name} />
      </div>

      <a
        className="btn primary block demo-btn"
        href={ytUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        ▶ Watch technique demo
      </a>

      <section className="card">
        <h3>{ex.isCurated ? 'Technique cues' : 'Instructions'}</h3>
        <ol className="cue-list">
          {ex.cues.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ol>
      </section>

      {ex.isCurated && ex.bulkingTip ? (
        <section className="card bulk-tip">
          <h3>Bulking tip</h3>
          <p>{ex.bulkingTip}</p>
        </section>
      ) : null}

      <section className="card">
        <h3>Top-set progression ({units})</h3>
        <ProgressChart data={chart} unit={units} />
      </section>
    </div>
  )
}
