import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { MUSCLE_LABEL, db } from '../db/schema'
import { exerciseProgression, useExercise, useSettings } from '../db/queries'
import { kgToDisplay } from '../lib/units'
import { estimateOneRepMax } from '../lib/strength'
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
  const bestE1rm = useLiveQuery(async () => {
    if (!id) return null
    const allLogs = await db.setLogs.where('exerciseId').equals(id).filter((l) => !l.isWarmup).toArray()
    let best: { kg: number; weight: number; reps: number } | null = null
    for (const l of allLogs) {
      const e = estimateOneRepMax(l.weight, l.reps)
      if (e !== null && (best === null || e > best.kg)) {
        best = { kg: e, weight: l.weight, reps: l.reps }
      }
    }
    return best
  }, [id])

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
  const query = ex.videoQuery || `${ex.name} technique form`
  // sp=EgIQAQ filters YouTube search results to "videos only".
  const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`
  const ytEmbedUrl = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query)}&rel=0`

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

      <section className="card video-card">
        <header className="section-head">
          <h3>Video demo</h3>
          <a
            className="link small"
            href={ytSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open on YouTube →
          </a>
        </header>
        <div className="video-frame">
          <iframe
            src={ytEmbedUrl}
            title={`Demo videos for ${ex.name}`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
        <p className="muted small">
          First few search results for{' '}
          <em>{query}</em>
          . If the player doesn't load, tap "Open on YouTube" above.
        </p>
      </section>

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

      {bestE1rm ? (
        <section className="card">
          <header className="section-head">
            <h3>Estimated max single rep</h3>
            <span className="muted small">what you'd lift for 1 hard rep</span>
          </header>
          <p className="tabnum stat-big" style={{ marginBottom: '0.3rem' }}>
            {kgToDisplay(bestE1rm.kg, units).toFixed(units === 'kg' ? 1 : 0)} {units}
          </p>
          <p className="muted small">
            Calculated from your best logged set ({kgToDisplay(bestE1rm.weight, units).toFixed(units === 'kg' ? 1 : 0)} {units} × {bestE1rm.reps} reps).
            This is an estimate using the Brzycki formula — not a tested max. Most accurate for sets of 3–8 reps;
            less accurate above that.
          </p>
        </section>
      ) : null}
    </div>
  )
}
