import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Routine } from '../db/schema'
import { useActiveRoutine, useAllRoutines, useSettings } from '../db/queries'
import { routineMissingCount } from '../lib/equipment'
import ActiveRoutineCard from '../components/ActiveRoutineCard'
import NewRoutineModal from '../components/NewRoutineModal'
import RoutinePicker from '../components/RoutinePicker'
import { toast } from '../state/toasts'
import { useT } from '../i18n'

export default function Routines() {
  const t = useT()
  const navigate = useNavigate()
  const routines = useAllRoutines()
  const active = useActiveRoutine()
  const settings = useSettings()
  const [showAll, setShowAll] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [params, setParams] = useSearchParams()

  // ?new=1 in the URL opens the new-routine modal — used by the Train
  // empty state's "Build your own" card so the user lands straight in
  // the creation flow.
  useEffect(() => {
    if (params.get('new') === '1') {
      setShowNew(true)
      params.delete('new')
      setParams(params, { replace: true })
    }
    if (params.get('pick') === '1') {
      setShowPicker(true)
      params.delete('pick')
      setParams(params, { replace: true })
    }
  }, [params, setParams])

  if (!routines || !settings) return <div className="page"><p className="muted">{t('common.loading')}</p></div>

  async function activate(id: string) {
    // Always read settings fresh from the DB before merging — using the
    // hook value (closure) risks clobbering other fields with stale
    // values if the user toggled something else in the same render.
    const fresh = await db.settings.get(1)
    if (!fresh) return
    const r = routines?.find((x) => x.id === id)
    await db.settings.put({ ...fresh, activeRoutineId: id })
    toast(`Activated: ${r?.name ?? id}`, { kind: 'success' })
  }

  async function clone(r: Routine) {
    const id = `custom-${Date.now()}`
    const dup: Routine = {
      ...r,
      id,
      name: `${r.name} (copy)`,
      builtIn: false,
    }
    await db.routines.put(dup)
    await activate(id)
    navigate(`/routines/${id}/edit`)
  }

  async function deleteRoutine(r: Routine) {
    if (r.builtIn) return
    if (!confirm(`Delete "${r.name}"? This cannot be undone.`)) return
    await db.routines.delete(r.id)
    if (active?.id === r.id) {
      const fallback = routines?.find((x) => x.id !== r.id)
      if (fallback) await activate(fallback.id)
    }
    toast('Routine deleted', { kind: 'warn' })
  }

  const otherRoutines = routines.filter((r) => r.id !== active?.id)

  return (
    <div className="page">
      <h1 className="big-title">{t('nav.routines')}</h1>

      {active ? (
        <>
          <h4>{t('routines.your_program')}</h4>
          <ActiveRoutineCard
            routine={active}
            onSwitch={() => setShowAll(true)}
            onEdit={async () => {
              if (!active) return
              // Built-in routines can't be edited in place. Auto-clone, swap
              // the active routine to the copy, and open the editor on it —
              // one tap, no dead-end.
              if (active.builtIn) {
                const cloneId = `custom-${Date.now()}`
                const dup: Routine = {
                  ...active,
                  id: cloneId,
                  name: `${active.name} (mine)`,
                  builtIn: false,
                  workouts: active.workouts.map((w, i) => ({
                    ...w,
                    id: `${cloneId}-w${i + 1}`,
                    items: [...w.items],
                  })),
                }
                await db.routines.put(dup)
                await activate(cloneId)
                navigate(`/routines/${cloneId}/edit`)
                toast('Made a copy of this routine for you to edit', { kind: 'info', duration: 2500 })
              } else {
                navigate(`/routines/${active.id}/edit`)
              }
            }}
          />
        </>
      ) : null}

      <div className="row" style={{ marginTop: 'var(--space-3)' }}>
        <button className="btn primary" onClick={() => setShowPicker(true)}>
          {t('routines.find_program')}
        </button>
        <button className="btn" onClick={() => setShowNew(true)}>
          + {t('routines.new_program')}
        </button>
      </div>

      <div className="section-head" style={{ marginTop: 'var(--space-5)' }}>
        <h4>{t('routines.all_programs')}</h4>
        {otherRoutines.length > 3 ? (
          <button className="link small" onClick={() => setShowAll((v) => !v)}>
            {showAll ? '−' : `+ ${otherRoutines.length - 3}`}
          </button>
        ) : null}
      </div>

      <div className="routine-list">
        {(showAll ? otherRoutines : otherRoutines.slice(0, 3)).map((r) => (
          <RoutineCardV2
            key={r.id}
            routine={r}
            isActive={active?.id === r.id}
            onActivate={() => activate(r.id)}
            onPreview={() => navigate(`/routines/${r.id}`)}
            onClone={() => clone(r)}
            onEdit={() => navigate(`/routines/${r.id}/edit`)}
            onDelete={() => deleteRoutine(r)}
          />
        ))}
      </div>

      <details className="glossary-card" style={{ marginTop: 'var(--space-4)' }}>
        <summary>What do <strong>RPE</strong>, <strong>RIR</strong>, and <strong>AMRAP</strong> mean?</summary>
        <ul className="glossary-list">
          <li><strong>RPE 7</strong> — effort 7 out of 10. About <em>3 reps short of failure</em>.</li>
          <li><strong>RPE 8</strong> — about <em>2 reps short of failure</em>. The sweet spot for most sets.</li>
          <li><strong>RPE 9</strong> — about <em>1 rep short of failure</em>. For your last set or two.</li>
          <li><strong>RPE 10</strong> — total failure. Save for occasional finishers.</li>
          <li><strong>RIR</strong> — same idea, reverse number. "RIR 2" = 2 reps in reserve = RPE 8.</li>
          <li><strong>AMRAP</strong> — "as many reps as possible." Do as many clean reps as you can.</li>
          <li><strong>PR</strong> — personal record. A new heaviest weight or rep total for that lift.</li>
        </ul>
      </details>

      {showNew ? (
        <NewRoutineModal
          onClose={() => setShowNew(false)}
          onCreated={async (r) => {
            setShowNew(false)
            await activate(r.id)
            navigate(`/routines/${r.id}/edit`)
          }}
        />
      ) : null}

      {showPicker ? <RoutinePicker onClose={() => setShowPicker(false)} /> : null}
    </div>
  )
}

interface RoutineCardV2Props {
  routine: Routine
  isActive: boolean
  onActivate: () => void
  onPreview: () => void
  onClone: () => void
  onEdit: () => void
  onDelete: () => void
}

function RoutineCardV2({ routine, isActive, onActivate, onPreview, onClone, onEdit, onDelete }: RoutineCardV2Props) {
  const t = useT()
  const settings = useSettings()
  const exercises = useLiveQuery(() => db.exercises.toArray(), [])
  const exById = new Map((exercises ?? []).map((e) => [e.id, e]))
  const missingCount = routineMissingCount(routine, exById, settings?.availableEquipment)
  const days = routine.daysPerWeek ?? routine.workouts.length
  const sched = buildScheduleStrip(days)
  // Rough estimate: total working sets across all workouts × 3 min per set.
  // Falls back to a generic ~60min when items are empty.
  const totalSets = routine.workouts.reduce(
    (acc, w) => acc + w.items.reduce((a, i) => a + i.targetSets, 0),
    0,
  )
  const minPerSession = routine.workouts.length > 0
    ? Math.max(30, Math.round((totalSets / routine.workouts.length) * 3 + 10))
    : 60

  return (
    <article className={`routine-card-v2${isActive ? ' active' : ''}${missingCount > 0 ? ' missing-equipment' : ''}`}>
      <header className="routine-card-v2-head">
        <div>
          <h3>{routine.name}</h3>
          {routine.level ? (
            <span className="routine-card-v2-meta">
              {t(`routines.level_${routine.level}` as 'routines.level_beginner')}
            </span>
          ) : null}
        </div>
      </header>

      <div className="routine-card-v2-stats">
        <span>{t('routines.days_per_week', { n: days })}</span>
        <span className="dot">·</span>
        <span>{t('routines.min_per_session', { n: minPerSession })}</span>
      </div>

      {missingCount > 0 ? (
        <p className="routine-equipment-warning">
          ⚠ {missingCount} exercise{missingCount === 1 ? '' : 's'} need equipment
          you don\'t have. Swap them or update equipment in Settings.
        </p>
      ) : null}

      <ul className="routine-card-v2-schedule" aria-label="Weekly schedule">
        {sched.map((s, i) => (
          <li key={i} className={`sched-day${s.train ? ' train' : ''}`}>
            <span className="sched-day-letter">{s.letter}</span>
            <span className="sched-day-code">{s.code}</span>
          </li>
        ))}
      </ul>

      <p className="routine-card-v2-description">{routine.description}</p>

      <div className="routine-card-v2-actions">
        {!isActive ? (
          <button className="btn primary small" onClick={onActivate}>{t('common.activate')}</button>
        ) : null}
        <button className="btn small" onClick={onPreview}>{t('routines.preview')}</button>
        {routine.builtIn ? (
          <button className="btn small ghost" onClick={onClone}>{t('routines.use_template')}</button>
        ) : (
          <>
            <button className="btn small" onClick={onEdit}>{t('common.edit')}</button>
            <button className="btn small danger" onClick={onDelete}>{t('common.delete')}</button>
          </>
        )}
      </div>
    </article>
  )
}

// Build a 7-day visual schedule (M T W T F S S) with train-day shading.
// Even distribution heuristic — close enough for the card, the user can
// pick actual days in the editor.
function buildScheduleStrip(daysPerWeek: number): { letter: string; code: string; train: boolean }[] {
  const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  // Common splits — hard-code which days are train days for clean visuals.
  const presets: Record<number, boolean[]> = {
    2: [true, false, false, true, false, false, false],
    3: [true, false, true, false, true, false, false],
    4: [true, true, false, true, true, false, false],
    5: [true, true, true, false, true, true, false],
    6: [true, true, true, false, true, true, true],
    7: [true, true, true, true, true, true, true],
  }
  const train = presets[daysPerWeek] ?? Array.from({ length: 7 }, (_, i) => i < daysPerWeek)
  return letters.map((l, i) => ({
    letter: l,
    code: train[i] ? '·' : '',
    train: train[i],
  }))
}

