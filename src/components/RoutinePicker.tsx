import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, type Routine, type RoutineFocus, type RoutineLevel } from '../db/schema'
import { useAllRoutines, useSettings } from '../db/queries'
import { useT } from '../i18n'
import { toast } from '../state/toasts'

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

  const matches = useMemo(() => {
    if (days === null || level === null || focus === null) return []
    // Pick built-in routines that match days exactly, level ≤ user's level,
    // and either match the focus or are balanced.
    const levelOrder: Record<RoutineLevel, number> = { beginner: 1, intermediate: 2, advanced: 3 }
    return allRoutines
      .filter((r) => r.builtIn && r.daysPerWeek === days)
      .filter((r) => {
        if (!r.level) return true
        return levelOrder[r.level] <= levelOrder[level]
      })
      .filter((r) => {
        if (focus === 'balanced') return true
        if (!r.focus || r.focus === 'balanced') return true
        return r.focus === focus
      })
      .slice(0, 3)
  }, [allRoutines, days, level, focus])

  // If no exact match, soften the days filter by ±1
  const softMatches = useMemo(() => {
    if (matches.length > 0 || days === null) return []
    return allRoutines
      .filter((r) => r.builtIn && r.daysPerWeek != null)
      .filter((r) => Math.abs((r.daysPerWeek ?? 0) - days) <= 1)
      .slice(0, 3)
  }, [allRoutines, days, matches.length])

  const allAnswered = days !== null && level !== null && focus !== null
  const shown = matches.length > 0 ? matches : softMatches

  async function activate(r: Routine) {
    if (!settings) return
    await db.settings.put({ ...settings, activeRoutineId: r.id })
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
          <div className="seg big" style={{ marginTop: 'var(--space-2)' }}>
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
              Back / legs
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
              <h4>
                {matches.length > 0
                  ? `Best matches (${matches.length})`
                  : `Closest matches (${softMatches.length})`}
              </h4>
              <div className="picker-results">
                {shown.map((r) => (
                  <article key={r.id} className="picker-result">
                    <div>
                      <strong>{r.name}</strong>
                      <span className="muted small">
                        {r.daysPerWeek} days/wk · {r.level ?? '—'}
                      </span>
                      <p className="muted small">{r.description}</p>
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
                ))}
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
