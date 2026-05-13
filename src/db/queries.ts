import { useLiveQuery } from 'dexie-react-hooks'
import {
  db,
  type DayKey,
  type Plan,
  type PlanItem,
  type SetLog,
  type Settings,
} from './schema'

export function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function todayDayKey(): DayKey {
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

export function useSession(sessionId: number | undefined) {
  return useLiveQuery(
    () => (sessionId ? db.sessions.get(sessionId) : undefined),
    [sessionId],
  )
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

export async function getOrCreateTodaySession(
  dayKey: DayKey,
  label: string,
  items: PlanItem[],
) {
  const date = todayISO()
  const existing = await db.sessions.where('date').equals(date).first()
  if (existing) {
    // If somehow created without items (v1 data), patch them in
    if (!existing.items || existing.items.length === 0) {
      await db.sessions.update(existing.id!, { items })
    }
    return existing.id!
  }
  return await db.sessions.add({
    date,
    dayKey,
    planDayLabel: label,
    items,
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
  isWarmup: boolean,
) {
  return await db.setLogs.add({
    sessionId,
    exerciseId,
    setIndex,
    weight,
    reps,
    rpe,
    isWarmup,
    loggedAt: Date.now(),
  })
}

export async function updateSetLog(id: number, patch: Partial<SetLog>) {
  await db.setLogs.update(id, patch)
}

export async function deleteSetLog(id: number) {
  await db.setLogs.delete(id)
}

export async function markSessionComplete(sessionId: number) {
  await db.sessions.update(sessionId, { completedAt: Date.now() })
}

export async function swapSessionItem(
  sessionId: number,
  oldExerciseId: string,
  newItem: PlanItem,
) {
  const s = await db.sessions.get(sessionId)
  if (!s) return
  const items = (s.items ?? []).map((it) => (it.exerciseId === oldExerciseId ? newItem : it))
  await db.sessions.update(sessionId, { items })
}

export async function lastWorkingTopSet(
  exerciseId: string,
  excludeSessionId?: number,
): Promise<{ sessionId: number; weight: number; reps: number; loggedAt: number } | null> {
  const logs = await db.setLogs
    .where('exerciseId')
    .equals(exerciseId)
    .filter((l) => !l.isWarmup && (excludeSessionId ? l.sessionId !== excludeSessionId : true))
    .toArray()
  if (logs.length === 0) return null
  const bySession = new Map<number, { weight: number; reps: number; loggedAt: number }>()
  for (const l of logs) {
    const cur = bySession.get(l.sessionId)
    if (!cur || l.weight > cur.weight) {
      bySession.set(l.sessionId, { weight: l.weight, reps: l.reps, loggedAt: l.loggedAt })
    }
  }
  let best: { sessionId: number; weight: number; reps: number; loggedAt: number } | null = null
  for (const [sessionId, info] of bySession.entries()) {
    if (!best || info.loggedAt > best.loggedAt) {
      best = { sessionId, ...info }
    }
  }
  return best
}

export async function allTimeTopSet(
  exerciseId: string,
): Promise<{ weight: number; sessionId: number } | null> {
  const logs = await db.setLogs
    .where('exerciseId')
    .equals(exerciseId)
    .filter((l) => !l.isWarmup)
    .toArray()
  if (logs.length === 0) return null
  let best: { weight: number; sessionId: number } | null = null
  for (const l of logs) {
    if (!best || l.weight > best.weight) best = { weight: l.weight, sessionId: l.sessionId }
  }
  return best
}

export async function sessionHasPR(sessionId: number): Promise<string[]> {
  // Returns exerciseIds where the heaviest working set in this session exceeded
  // the previous all-time working top set for that exercise.
  const logs = await db.setLogs.where('sessionId').equals(sessionId).toArray()
  const byEx = new Map<string, number>()
  for (const l of logs) {
    if (l.isWarmup) continue
    byEx.set(l.exerciseId, Math.max(byEx.get(l.exerciseId) ?? 0, l.weight))
  }
  const prs: string[] = []
  for (const [exId, weightInSession] of byEx.entries()) {
    const prior = await db.setLogs
      .where('exerciseId')
      .equals(exId)
      .filter((l) => !l.isWarmup && l.sessionId !== sessionId)
      .toArray()
    const priorMax = prior.reduce((m, l) => Math.max(m, l.weight), 0)
    if (weightInSession > priorMax && priorMax > 0) prs.push(exId)
  }
  return prs
}

export async function exerciseSessionHistory(
  exerciseId: string,
  limit = 12,
): Promise<{ label: string; value: number }[]> {
  const logs = await db.setLogs
    .where('exerciseId')
    .equals(exerciseId)
    .filter((l) => !l.isWarmup)
    .toArray()
  const bySession = new Map<number, number>()
  for (const l of logs) {
    bySession.set(l.sessionId, Math.max(bySession.get(l.sessionId) ?? 0, l.weight))
  }
  const sessions = await db.sessions
    .where('id')
    .anyOf(Array.from(bySession.keys()))
    .toArray()
  sessions.sort((a, b) => (a.date < b.date ? -1 : 1))
  return sessions.slice(-limit).map((s) => ({
    label: s.date.slice(5),
    value: bySession.get(s.id!)!,
  }))
}
