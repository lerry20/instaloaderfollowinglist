import { db, type Routine } from '../db/schema'

const MS_PER_DAY = 86400 * 1000

export interface RoutineAdherence {
  /** Average completed sessions per week over the last `lookbackDays`. */
  actualPerWeek: number
  /** Routine's prescribed days/week — falls back to workouts.length. */
  prescribedPerWeek: number
  /** Completed sessions this calendar week (Mon-anchored). */
  thisWeek: number
  /** Verdict: comfortably on it, falling short, or ahead of the program. */
  verdict: 'on-it' | 'short' | 'ahead' | 'no-data'
  /** One short trainer-voice sentence. Locale-agnostic for now. */
  note: string
  /** ratio = actualPerWeek / prescribedPerWeek (1.0 = perfect match). */
  ratio: number
}

/** Compute how the user is actually training vs what the routine asks for.
 * Looks at the last `lookbackDays` of completed sessions, regardless of which
 * routine the session was attached to — what matters is total training load. */
export async function computeAdherence(
  routine: Routine,
  lookbackDays = 28,
): Promise<RoutineAdherence> {
  const cutoff = Date.now() - lookbackDays * MS_PER_DAY
  const sessions = await db.sessions.toArray()
  const completed = sessions.filter(
    (s) => s.completedAt !== null && s.completedAt >= cutoff,
  )

  const prescribedPerWeek = routine.daysPerWeek ?? routine.workouts.length
  const weeks = lookbackDays / 7
  const actualPerWeek = completed.length / weeks

  // This calendar week (Monday-anchored, locale-agnostic ISO style)
  const today = new Date()
  const dayIdx = (today.getDay() + 6) % 7 // 0 = Monday
  const monday = new Date(today)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(monday.getDate() - dayIdx)
  const thisWeek = completed.filter(
    (s) => s.completedAt !== null && s.completedAt >= monday.getTime(),
  ).length

  let verdict: RoutineAdherence['verdict']
  let note: string
  const ratio = prescribedPerWeek > 0 ? actualPerWeek / prescribedPerWeek : 0

  if (completed.length === 0) {
    verdict = 'no-data'
    note = 'No completed sessions in the last 4 weeks yet.'
  } else if (ratio >= 0.9) {
    verdict = 'on-it'
    note = "You're matching the program — keep going."
  } else if (ratio >= 0.6) {
    verdict = 'short'
    note = `You average ${actualPerWeek.toFixed(1)} / ${prescribedPerWeek} sessions per week. Close, but consistency matters more than ambition.`
  } else if (ratio > 0) {
    verdict = 'short'
    note = `You average ${actualPerWeek.toFixed(1)} / ${prescribedPerWeek} sessions per week — this routine may be too ambitious for your current schedule.`
  } else {
    verdict = 'no-data'
    note = 'No recent training data.'
  }

  // If they're consistently exceeding, flag that too.
  if (ratio > 1.15) {
    verdict = 'ahead'
    note = `You're training ${actualPerWeek.toFixed(1)} sessions per week — you could probably handle a denser program.`
  }

  return { actualPerWeek, prescribedPerWeek, thisWeek, verdict, note, ratio }
}

/** Date string (YYYY-MM-DD) of every day this calendar week the user
 * completed a session. Used to render the "M T W ✓" strip. */
export async function thisWeekCompletedDates(): Promise<Set<string>> {
  const today = new Date()
  const dayIdx = (today.getDay() + 6) % 7
  const monday = new Date(today)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(monday.getDate() - dayIdx)
  const mondayIso = monday.toISOString().slice(0, 10)
  const sessions = await db.sessions.toArray()
  return new Set(
    sessions
      .filter((s) => s.completedAt !== null && s.date >= mondayIso)
      .map((s) => s.date),
  )
}
