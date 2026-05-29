import { useEffect, useState } from 'react'
import { computeAchievements, type Achievement } from '../lib/achievements'
import { useT, type DictKey } from '../i18n'
import { useDemoMode } from '../state/demoMode'
import CollapsibleSection from './CollapsibleSection'

export default function AchievementsCard() {
  const t = useT()
  const demo = useDemoMode()
  const [achievements, setAchievements] = useState<Achievement[] | null>(null)

  useEffect(() => {
    let cancelled = false
    computeAchievements()
      .then((a) => { if (!cancelled) setAchievements(a) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  if (!achievements) return null

  // Demo mode: show the milestone grid as if none had been earned yet,
  // so the PT can see the categories without seeing the user's status.
  const displayAch = demo
    ? achievements.map((a) => ({ ...a, earned: false }))
    : achievements
  const earned = displayAch.filter((a) => a.earned).length
  const total = displayAch.length

  return (
    <CollapsibleSection
      id="progress-achievements"
      eyebrow={t('ach.title')}
      title={t('ach.earned', { n: earned, total })}
      tone={earned > 0 ? 'success' : 'default'}
      defaultOpen={false}
    >
      <ul className="achievements-grid">
        {displayAch.map((a) => {
          const nameKey = `ach.${a.id}` as DictKey
          const detailKey = `ach.${a.id}_d` as DictKey
          const detail = t(detailKey)
          return (
            <li
              key={a.id}
              className={`achievement${a.earned ? ' earned' : ''}`}
              title={detail}
            >
              <span className="achievement-icon" aria-hidden>{a.icon}</span>
              <span className="achievement-text">
                <strong>{t(nameKey)}</strong>
                <span className="muted small">{detail}</span>
              </span>
            </li>
          )
        })}
      </ul>
    </CollapsibleSection>
  )
}
