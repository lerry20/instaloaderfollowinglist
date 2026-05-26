import { useEffect, useState } from 'react'
import { computeAchievements, type Achievement } from '../lib/achievements'

export default function AchievementsCard() {
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
    <section className="achievements-card">
      <header className="achievements-head">
        <div>
          <span className="muted small">Milestones</span>
          <h3>{earned} / {total} earned</h3>
        </div>
      </header>

      <ul className="achievements-grid">
        {achievements.map((a) => (
          <li
            key={a.id}
            className={`achievement${a.earned ? ' earned' : ''}`}
            title={a.detail}
          >
            <span className="achievement-icon" aria-hidden>{a.icon}</span>
            <span className="achievement-text">
              <strong>{a.name}</strong>
              <span className="muted small">{a.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
