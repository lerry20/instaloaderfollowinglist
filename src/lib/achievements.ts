import { db } from '../db/schema'
import { currentStreak } from './streak'
import { sessionHasPRs } from '../db/queries'

export interface Achievement {
  id: string
  /** Single-glyph icon — emoji is fine, keeps things human. */
  icon: string
  /** True when the user has earned it. */
  earned: boolean
}

/** Compute every milestone in one pass. Returns id + icon + earned —
 * the component looks up localized name/detail via t() keyed by id. */
export async function computeAchievements(): Promise<Achievement[]> {
  const sessions = await db.sessions.toArray()
  const completed = sessions.filter((s) => s.completedAt !== null)
  const sessionCount = completed.length

  let prTotal = 0
  for (const s of completed) {
    if (!s.id) continue
    const prs = await sessionHasPRs(s.id)
    prTotal += prs.length
  }

  const streak = await currentStreak()
  const trainingDays = new Set(completed.map((s) => s.date)).size

  return [
    { id: 'first_workout', icon: '🚀', earned: sessionCount >= 1 },
    { id: '10_sessions',   icon: '🏋️', earned: sessionCount >= 10 },
    { id: '50_sessions',   icon: '💪', earned: sessionCount >= 50 },
    { id: '100_sessions',  icon: '🏆', earned: sessionCount >= 100 },
    { id: 'first_pr',      icon: '🥇', earned: prTotal >= 1 },
    { id: 'ten_prs',       icon: '🥈', earned: prTotal >= 10 },
    { id: '7_streak',      icon: '🔥', earned: streak >= 7 },
    { id: '30_streak',     icon: '⚡️', earned: streak >= 30 },
    { id: '20_days',       icon: '📅', earned: trainingDays >= 20 },
  ]
}
