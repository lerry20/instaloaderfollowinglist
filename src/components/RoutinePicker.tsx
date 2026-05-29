import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, type Routine, type RoutineFocus, type RoutineLevel } from '../db/schema'
import { useAllRoutines, useSettings } from '../db/queries'
import { useT } from '../i18n'
import { toast } from '../state/toasts'
import { rankRoutines, type ScoredRoutine } from '../lib/recommender'

interface Props {
  onClose: () => void
}

export default function RoutinePicker({ onClose }: Props) {
  const t = useT()
  const navigate = useNavigate()
  const settings = useSettings()
  const allRoutines = useAllRoutines() ?? []
  const [days, setDays] = useState<number | null>(null)
  const [level, setLevel] = useState<RoutineLevel | null>(null)
  const [focus, setFocus] = useState<RoutineFocus | null>(null)

  const matches: ScoredRoutine[] = useMemo(() => {
    if (days === null || level === null || focus === null) return []
    return rankRoutines(
      allRoutines,
      {
        days,
        level,
        focus,
        excludeRoutineId: settings?.activeRoutineId,
      },
      3,
    )
  }, [allRoutines, days, level, focus, settings?.activeRoutineId])

  const allAnswered = days !== null && level !== null && focus !== null
  const shown = matches

  async function activate(r: Routine) {
    const fresh = await db.settings.get(1)
    if (!fresh) return
    await db.settings.put({ ...fresh, activeRoutineId: r.id })
    toast(`Activated: ${r.name}`, { kind: 'success' })
    onClose()
    navigate('/train')
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal big" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <h3>{t('routines.find_program')}</h3>
          <button className="link" onClick={onClose}>{t('common.close')}</button>
        </header>

        <div className="picker-question">
          <h4>1. How many days/week can you HONESTLY commit?</h4>
          <p className="muted small">Not what you wish — what you actually train.</p>
          <div className="seg big" style={{ marginTop: 'var(--space-2)' }}>
            {[3, 4, 5, 6].map((d) => (
              <button
                key={d}
                className={days === d ? 'active' : ''}
                onClick={() => setDays(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="picker-question">
          <h4>2. How long have you been training consistently?</h4>
          <div className="seg big" style={{ marginTop: 'var(--space-2)' }}>
            <button
              className={level === 'beginner' ? 'active' : ''}
              onClick={() => setLevel('beginner')}
            >
              &lt; 6 months
            </button>
            <button
              className={level === 'intermediate' ? 'active' : ''}
              onClick={() => setLevel('intermediate')}
            >
              6-24 months
            </button>
            <button
              className={level === 'advanced' ? 'active' : ''}
              onClick={() => setLevel('advanced')}
            >
              2+ years
            </button>
          </div>
        </div>

        <div className="picker-question">
          <h4>3. Pick one priority</h4>
          <div className="seg big" style={{ marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
            <button
              className={focus === 'chest' ? 'active' : ''}
              onClick={() => setFocus('chest')}
            >
              Chest / arms
            </button>
            <button
              className={focus === 'back' ? 'active' : ''}
              onClick={() => setFocus('back')}
            >
              Back
            </button>
            <button
              className={focus === 'legs' ? 'active' : ''}
              onClick={() => setFocus('legs')}
            >
              Legs / glutes
            </button>
            <button
              className={focus === 'balanced' ? 'active' : ''}
              onClick={() => setFocus('balanced')}
            >
              Balanced
            </button>
          </div>
        </div>

        {allAnswered ? (
          shown.length > 0 ? (
            <div>
              <h4>Best matches ({shown.length})</h4>
              <div className="picker-results">
                {shown.map((scored, idx) => {
                  const r = scored.routine
                  return (
                  <article key={r.id} className={`picker-result${idx === 0 ? ' top-pick' : ''}`}>
                    {idx === 0 ? <span className="picker-result-badge">Top pick</span> : null}
                    <div>
                      <strong>{r.name}</strong>
                      <span className="muted small">
                        {r.daysPerWeek} days/wk · {r.level ?? '—'}
                      </span>
                      <p className="muted small">{r.description}</p>
                      {scored.reasons.length > 0 ? (
                        <ul className="picker-reasons">
                          {scored.reasons.map((reason, i) => (
                            <li key={i}>✓ {reason}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                    <div className="row">
                      <button
                        className="btn small"
                        onClick={() => {
                          onClose()
                          navigate(`/routines/${r.id}`)
                        }}
                      >
                        {t('routines.preview')}
                      </button>
                      <button className="btn primary small" onClick={() => activate(r)}>
                        {t('common.activate')}
                      </button>
                    </div>
                  </article>
                  )
                })}
              </div>
            </div>
          ) : (
            <p className="muted small">No matches — try adjusting your answers.</p>
          )
        ) : null}
      </div>
    </div>
  )
}
