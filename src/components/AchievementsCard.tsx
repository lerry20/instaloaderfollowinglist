import { useEffect, useState } from 'react'
import { computeAchievements, type Achievement } from '../lib/achievements'
import { useT, type DictKey } from '../i18n'
import CollapsibleSection from './CollapsibleSection'

export default function AchievementsCard() {
  const t = useT()
  const [achievements, setAchievements] = useState<Achievement[] | null>(null)

  useEffect(() => {
    let cancelled = false
    computeAchievements()
      .then((a) => { if (!cancelled) setAchievements(a) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  if (!achievements) return null

  const earned = achievements.filter((a) => a.earned).length
  const total = achievements.length

  return (
    <CollapsibleSection
      id="progress-achievements"
      eyebrow={t('ach.title')}
      title={t('ach.earned', { n: earned, total })}
      tone={earned > 0 ? 'success' : 'default'}
      defaultOpen={false}
    >
      <ul className="achievements-grid">
        {achievements.map((a) => {
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
