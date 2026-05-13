import { useLiveQuery } from 'dexie-react-hooks'
import { db, type DayKey, type Plan, type Settings } from './schema'

export function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function todayDayKey(): DayKey {
  // JS getDay(): 0 = Sun .. 6 = Sat
  const idx = new Date().getDay()
  const map: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  return map[idx]
}

export function usePlan(planId = 'default'): Plan | undefined {
  return useLiveQuery(() => db.plans.get(planId), [planId])
}

export function useSettings(): Settings | undefined {
  return useLiveQuery(() => db.settings.get(1), [])
}

export function useExercise(id: string | undefined) {
  return useLiveQuery(() => (id ? db.exercises.get(id) : undefined), [id])
}

export function useAllExercises() {
  return useLiveQuery(() => db.exercises.orderBy('name').toArray(), [])
}

export function useSessionForToday() {
  return useLiveQuery(async () => {
    const date = todayISO()
    const all = await db.sessions.where('date').equals(date).toArray()
    return all[0]
  }, [])
}

export function useSetLogsForExercise(exerciseId: string | undefined, limit = 50) {
  return useLiveQuery(async () => {
    if (!exerciseId) return []
    const logs = await db.setLogs
      .where('exerciseId')
      .equals(exerciseId)
      .reverse()
      .limit(limit)
      .toArray()
    return logs
  }, [exerciseId, limit])
}

export function useSessionSetLogs(sessionId: number | undefined) {
  return useLiveQuery(async () => {
    if (!sessionId) return []
    return db.setLogs.where('sessionId').equals(sessionId).toArray()
  }, [sessionId])
}

export function useRecentSessions(limit = 20) {
  return useLiveQuery(
    () => db.sessions.orderBy('date').reverse().limit(limit).toArray(),
    [limit],
  )
}

export function useBodyweightLogs() {
  return useLiveQuery(() => db.bodyweight.orderBy('date').toArray(), [])
}

export async function getOrCreateTodaySession(dayKey: DayKey, label: string) {
  const date = todayISO()
  const existing = await db.sessions.where('date').equals(date).first()
  if (existing) return existing.id!
  return await db.sessions.add({
    date,
    dayKey,
    planDayLabel: label,
    startedAt: Date.now(),
    completedAt: null,
  })
}

export async function logSet(
  sessionId: number,
  exerciseId: string,
  setIndex: number,
  weight: number,
  reps: number,
  rpe: number | null,
) {
  await db.setLogs.add({
    sessionId,
    exerciseId,
    setIndex,
    weight,
    reps,
    rpe,
    loggedAt: Date.now(),
  })
}

export async function deleteSetLog(id: number) {
  await db.setLogs.delete(id)
}

export async function markSessionComplete(sessionId: number) {
  await db.sessions.update(sessionId, { completedAt: Date.now() })
}

export async function lastTopSetForExercise(exerciseId: string) {
  const logs = await db.setLogs.where('exerciseId').equals(exerciseId).toArray()
  if (logs.length === 0) return null
  // Group by sessionId, take heaviest set in each session, then most recent.
  const bySession = new Map<number, number>()
  for (const l of logs) {
    bySession.set(l.sessionId, Math.max(bySession.get(l.sessionId) ?? 0, l.weight))
  }
  let latest: { sessionId: number; loggedAt: number; weight: number } | null = null
  for (const l of logs) {
    if (l.weight === bySession.get(l.sessionId)) {
      if (!latest || l.loggedAt > latest.loggedAt) {
        latest = { sessionId: l.sessionId, loggedAt: l.loggedAt, weight: l.weight }
      }
    }
  }
  return latest
}
