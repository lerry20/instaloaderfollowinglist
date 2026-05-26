import { useMemo, useState } from 'react'
import { db, type Routine } from '../db/schema'
import { useAllRoutines } from '../db/queries'
import { useT } from '../i18n'

interface Props {
  onClose: () => void
  onCreated: (routine: Routine) => void
}

type StartMode = 'template' | 'closest' | 'empty'

export default function NewRoutineModal({ onClose, onCreated }: Props) {
  const t = useT()
  const routines = useAllRoutines() ?? []
  const [name, setName] = useState('')
  const [days, setDays] = useState<number>(4)
  const [mode, setMode] = useState<StartMode>('template')

  // Find the best built-in match for the selected days/week.
  const templateMatch = useMemo(() => {
    const builtins = routines.filter((r) => r.builtIn && r.daysPerWeek === days)
    if (builtins.length > 0) {
      // Prefer "intermediate" as the default level — the broadest fit.
      const intermediate = builtins.find((r) => r.level === 'intermediate')
      return intermediate ?? builtins[0]
    }
    // Fall back to closest match by absolute distance.
    const closest = routines
      .filter((r) => r.builtIn && r.daysPerWeek != null)
      .sort(
        (a, b) => Math.abs((a.daysPerWeek ?? 0) - days) - Math.abs((b.daysPerWeek ?? 0) - days),
      )[0]
    return closest ?? null
  }, [routines, days])

  async function create() {
    const id = `custom-${Date.now()}`
    let r: Routine

    if (mode === 'template' && templateMatch) {
      r = {
        ...templateMatch,
        id,
        name: name.trim() || `${templateMatch.name} (mine)`,
        builtIn: false,
        // Refresh workout ids so they don't clash if the template is re-imported
        workouts: templateMatch.workouts.map((w, i) => ({
          ...w,
          id: `${id}-w${i + 1}`,
          items: [...w.items],
        })),
      }
    } else if (mode === 'closest' && templateMatch) {
      r = {
        ...templateMatch,
        id,
        name: name.trim() || `${templateMatch.name} (mine)`,
        builtIn: false,
        workouts: templateMatch.workouts.map((w, i) => ({
          ...w,
          id: `${id}-w${i + 1}`,
          items: [...w.items],
        })),
      }
    } else {
      r = {
        id,
        name: name.trim() || 'My program',
        description: '',
        builtIn: false,
        daysPerWeek: days,
        workouts: Array.from({ length: days }, (_, i) => ({
          id: `${id}-w${i + 1}`,
          name: `Day ${i + 1}`,
          items: [],
        })),
      }
    }

    await db.routines.put(r)
    onCreated(r)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal small-modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <h3>{t('routines.new_program')}</h3>
          <button className="link" onClick={onClose}>{t('common.close')}</button>
        </header>

        <label className="field">
          <span>{t('common.add')}</span>
          <input
            type="text"
            value={name}
            placeholder={t('routines.new_name_placeholder')}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <div>
          <h4>{t('routines.how_many_days')}</h4>
          <div className="seg big">
            {[3, 4, 5, 6].map((d) => (
              <button
                key={d}
                className={days === d ? 'active' : ''}
                onClick={() => setDays(d)}
                aria-pressed={days === d}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4>{t('routines.start_from')}</h4>
          <div className="new-routine-start-options">
            <label className={`onboard-tile wide${mode === 'template' ? ' active' : ''}`}>
              <input
                type="radio"
                name="start"
                checked={mode === 'template'}
                onChange={() => setMode('template')}
                style={{ display: 'none' }}
              />
              <strong>{t('routines.start_template')}</strong>
              {templateMatch ? (
                <span className="muted small">{templateMatch.name}</span>
              ) : null}
            </label>
            <label className={`onboard-tile wide${mode === 'empty' ? ' active' : ''}`}>
              <input
                type="radio"
                name="start"
                checked={mode === 'empty'}
                onChange={() => setMode('empty')}
                style={{ display: 'none' }}
              />
              <strong>{t('routines.start_empty')}</strong>
              <span className="muted small">{days} blank days · Day 1, Day 2, …</span>
            </label>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn primary block" onClick={create}>
            {t('routines.create')}
          </button>
        </div>
      </div>
    </div>
  )
}
