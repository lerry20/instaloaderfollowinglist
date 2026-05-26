import { db } from '../db/schema'
import { currentStreak } from './streak'
import { sessionHasPRs } from '../db/queries'

export interface Achievement {
  id: string
  /** Short name shown on the chip. */
  name: string
  /** One-line description shown on tap / hover. */
  detail: string
  /** Single-glyph icon — emoji is fine, keeps things human. */
  icon: string
  /** True when the user has earned it. */
  earned: boolean
}

/** Compute every milestone in one pass. Pure read-only function — runs
 * against the DB and returns a flat list of Achievement records ordered
 * by category (consistency / strength / streak). */
export async function computeAchievements(): Promise<Achievement[]> {
  const sessions = await db.sessions.toArray()
  const completed = sessions.filter((s) => s.completedAt !== null)
  const sessionCount = completed.length

  // Total PRs across all completed sessions.
  let prTotal = 0
  for (const s of completed) {
    if (!s.id) continue
    const prs = await sessionHasPRs(s.id)
    prTotal += prs.length
  }

  const streak = await currentStreak()

  // Distinct dates the user trained — for the "this many calendar days"
  // achievements rather than session counts.
  const trainingDays = new Set(completed.map((s) => s.date)).size

  return [
    {
      id: 'first-workout',
      icon: '🚀',
      name: 'First step',
      detail: 'Completed your first workout.',
      earned: sessionCount >= 1,
    },
    {
      id: '10-sessions',
      icon: '🏋️',
      name: '10 sessions',
      detail: 'Showed up ten times.',
      earned: sessionCount >= 10,
    },
    {
      id: '50-sessions',
      icon: '💪',
      name: '50 sessions',
      detail: 'Half a hundred. Consistency wins.',
      earned: sessionCount >= 50,
    },
    {
      id: '100-sessions',
      icon: '🏆',
      name: '100 sessions',
      detail: 'A real veteran of the gym floor.',
      earned: sessionCount >= 100,
    },
    {
      id: 'first-pr',
      icon: '🥇',
      name: 'First PR',
      detail: 'Set your first personal record.',
      earned: prTotal >= 1,
    },
    {
      id: 'ten-prs',
      icon: '🥈',
      name: '10 PRs',
      detail: 'Ten lifetime personal records.',
      earned: prTotal >= 10,
    },
    {
      id: '7-day-streak',
      icon: '🔥',
      name: '7-day streak',
      detail: 'A full week of consistent training.',
      earned: streak >= 7,
    },
    {
      id: '30-day-streak',
      icon: '⚡️',
      name: '30-day streak',
      detail: 'Thirty days. Habit unlocked.',
      earned: streak >= 30,
    },
    {
      id: 'training-month',
      icon: '📅',
      name: '20 training days',
      detail: 'Trained on twenty distinct calendar days.',
      earned: trainingDays >= 20,
    },
  ]
}
