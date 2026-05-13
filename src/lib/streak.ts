import { db } from '../db/schema'

/** Returns the number of consecutive calendar days ending today (or yesterday)
 * on which the user has at least one completed session. The streak doesn't break
 * after a single rest day — only after two consecutive missed days, since rest
 * is part of training. */
export async function currentStreak(): Promise<number> {
  const sessions = await db.sessions.toArray()
  const completedDates = new Set(
    sessions.filter((s) => s.completedAt !== null).map((s) => s.date),
  )
  if (completedDates.size === 0) return 0

  const now = new Date()
  const today = isoDate(now)
  // Build a sorted descending array of unique completed-session dates.
  const dates = Array.from(completedDates).sort().reverse()
  const mostRecent = dates[0]
  if (!mostRecent) return 0

  // If you haven't trained today OR yesterday, no active streak.
  const yesterday = isoDate(new Date(now.getTime() - 86400 * 1000))
  if (mostRecent !== today && mostRecent !== yesterday) return 0

  // Walk back day-by-day. Allow up to one consecutive miss (rest day) between
  // training days; two misses ends the streak.
  let streak = 0
  let cursor = new Date(`${mostRecent}T00:00:00`)
  let consecutiveMisses = 0
  while (true) {
    const iso = isoDate(cursor)
    if (completedDates.has(iso)) {
      streak += 1
      consecutiveMisses = 0
    } else {
      consecutiveMisses += 1
      if (consecutiveMisses > 1) break
    }
    cursor = new Date(cursor.getTime() - 86400 * 1000)
    // Don't loop past the earliest known date.
    if (iso < dates[dates.length - 1]) break
  }
  return streak
}

function isoDate(d: Date) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export interface ProactiveMessage {
  kind: 'streak' | 'gap' | 'deload' | 'volume-high' | 'plateau' | 'neutral'
  text: string
}

export async function buildProactiveMessage(): Promise<ProactiveMessage | null> {
  const sessions = await db.sessions.toArray()
  const completed = sessions
    .filter((s) => s.completedAt !== null)
    .sort((a, b) => b.startedAt - a.startedAt)
  if (completed.length === 0) {
    return { kind: 'neutral', text: 'Welcome — your first workout sets the baseline. Just start.' }
  }
  const lastDate = completed[0].date
  const today = isoDate(new Date())
  const daysSince = daysBetween(lastDate, today)

  if (daysSince >= 3) {
    return {
      kind: 'gap',
      text: `Last workout was ${daysSince} days ago. Easy to slip — get the next one in today.`,
    }
  }

  const streak = await currentStreak()
  if (streak >= 3) {
    return { kind: 'streak', text: `🔥 ${streak}-day training streak. Don't break it.` }
  }

  return null
}

function daysBetween(a: string, b: string): number {
  const ms = new Date(`${b}T00:00:00`).getTime() - new Date(`${a}T00:00:00`).getTime()
  return Math.round(ms / (86400 * 1000))
}
