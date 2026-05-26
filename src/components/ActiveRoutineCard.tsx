import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Routine } from '../db/schema'
import { useSettings } from '../db/queries'
import { computeAdherence, thisWeekCompletedDates, type RoutineAdherence } from '../lib/adherence'
import { routineMissingCount } from '../lib/equipment'
import { useT } from '../i18n'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

interface Props {
  routine: Routine
  onSwitch: () => void
  onEdit: () => void
}

export default function ActiveRoutineCard({ routine, onSwitch, onEdit }: Props) {
  const t = useT()
  const settings = useSettings()
  const exercises = useLiveQuery(() => db.exercises.toArray(), [])
  const exById = new Map((exercises ?? []).map((e) => [e.id, e]))
  const missingCount = routineMissingCount(routine, exById, settings?.availableEquipment)
  const [adherence, setAdherence] = useState<RoutineAdherence | null>(null)
  const [thisWeekDates, setThisWeekDates] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false
    computeAdherence(routine)
      .then((a) => { if (!cancelled) setAdherence(a) })
      .catch(() => {})
    thisWeekCompletedDates()
      .then((s) => { if (!cancelled) setThisWeekDates(s) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [routine.id])

  const days = routine.daysPerWeek ?? routine.workouts.length

  // Build a 7-day strip for the current calendar week — Mon..Sun.
  const today = new Date()
  const dayIdx = (today.getDay() + 6) % 7
  const monday = new Date(today)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(monday.getDate() - dayIdx)
  const weekStrip = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const iso = d.toISOString().slice(0, 10)
    const done = thisWeekDates.has(iso)
    const isToday = i === dayIdx
    return { iso, label: DAY_LABELS[i], done, isToday }
  })

  return (
    <article className="active-routine-card">
      <header className="active-routine-head">
        <div>
          <h2>{routine.name}</h2>
          <span className="muted small">
            {t('routines.days_per_week', { n: days })}
            {routine.level ? ` · ${t(`routines.level_${routine.level}` as 'routines.level_beginner')}` : ''}
          </span>
        </div>
        <span className="active-routine-dot" aria-label="Active">●</span>
      </header>

      <ul className="active-routine-week" aria-label="This week">
        {weekStrip.map((d) => (
          <li
            key={d.iso}
            className={`week-day${d.done ? ' done' : ''}${d.isToday ? ' today' : ''}`}
            title={d.iso}
          >
            <span className="week-day-label">{d.label}</span>
            <span className="week-day-mark">{d.done ? '✓' : d.isToday ? '·' : ''}</span>
          </li>
        ))}
      </ul>

      {adherence && adherence.verdict !== 'no-data' ? (
        <p className={`adherence adherence-${adherence.verdict}`}>{adherence.note}</p>
      ) : null}

      {missingCount > 0 ? (
        <p className="routine-equipment-warning">
          ⚠ {missingCount} exercise{missingCount === 1 ? '' : 's'} need equipment
          you don\'t have. Swap them or update equipment in Settings.
        </p>
      ) : null}

      <div className="active-routine-actions">
        <Link to="/train" className="btn primary small">
          {t('train.todays_workout')} →
        </Link>
        <button className="btn small ghost" onClick={onEdit}>{t('common.edit')}</button>
        <button className="btn small ghost" onClick={onSwitch}>{t('active-routine.switch')}</button>
      </div>
    </article>
  )
}
