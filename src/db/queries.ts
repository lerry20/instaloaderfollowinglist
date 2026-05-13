import { useLiveQuery } from 'dexie-react-hooks'
import {
  db,
  type PlanItem,
  type Routine,
  type Settings,
  type WorkoutDef,
} from './schema'

export function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function useSettings(): Settings | undefined {
  return useLiveQuery(() => db.settings.get(1), [])
}

export function useActiveRoutine(): Routine | undefined {
  return useLiveQuery(async () => {
    const s = await db.settings.get(1)
    if (!s) return undefined
    return db.routines.get(s.activeRoutineId)
  }, [])
}

export function useAllRoutines(): Routine[] | undefined {
  return useLiveQuery(() => db.routines.orderBy('id').toArray(), [])
}

export function useExercise(id: string | undefined) {
  return useLiveQuery(() => (id ? db.exercises.get(id) : undefined), [id])
}

export function useAllExercises() {
  return useLiveQuery(() => db.exercises.orderBy('name').toArray(), [])
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

export function useActiveSession() {
  return useLiveQuery(async () => {
    const all = await db.sessions.orderBy('startedAt').reverse().limit(10).toArray()
    return all.find((s) => s.completedAt === null)
  }, [])
}

export async function suggestNextWorkout(
  routine: Routine,
): Promise<WorkoutDef> {
  if (routine.workouts.length === 0) {
    return { id: 'empty', name: 'Empty routine', items: [] }
  }
  // Look at the most recent completed session in this routine.
  const recent = await db.sessions
    .where('routineId')
    .equals(routine.id)
    .reverse()
    .sortBy('startedAt')
  const lastCompleted = recent.find((s) => s.completedAt !== null)
  if (!lastCompleted) return routine.workouts[0]
  const idx = routine.workouts.findIndex((w) => w.id === lastCompleted.workoutId)
  if (idx < 0) return routine.workouts[0]
  return routine.workouts[(idx + 1) % routine.workouts.length]
}

export async function startSession(
  routine: Routine,
  workout: WorkoutDef,
): Promise<number> {
  // Reuse an in-progress session for the same workout if it exists.
  const existing = await db.sessions
    .where({ routineId: routine.id, workoutId: workout.id })
    .reverse()
    .sortBy('startedAt')
  const open = existing.find((s) => s.completedAt === null)
  if (open) return open.id!
  return await db.sessions.add({
    date: todayISO(),
    routineId: routine.id,
    workoutId: workout.id,
    workoutName: workout.name,
    items: workout.items,
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

export async function deleteSetLog(id: number) {
  await db.setLogs.delete(id)
}

export async function markSessionComplete(sessionId: number) {
  await db.sessions.update(sessionId, { completedAt: Date.now() })
}

export async function abandonSession(sessionId: number) {
  // Drop the session and its logs entirely.
  await db.setLogs.where('sessionId').equals(sessionId).delete()
  await db.sessions.delete(sessionId)
}

export async function swapSessionItem(
  sessionId: number,
  oldExerciseId: string,
  newItem: PlanItem,
) {
  const s = await db.sessions.get(sessionId)
  if (!s) return
  const items = (s.items ?? []).map((it) =>
    it.exerciseId === oldExerciseId ? newItem : it,
  )
  await db.sessions.update(sessionId, { items })
}

export interface LastSetSummary {
  weight: number
  reps: number
  rpe: number | null
  loggedAt: number
}

export async function lastWorkingSetsForExercise(
  exerciseId: string,
  excludeSessionId?: number,
  limitSessions = 1,
): Promise<{ sessionId: number; sets: LastSetSummary[] } | null> {
  const logs = await db.setLogs
    .where('exerciseId')
    .equals(exerciseId)
    .filter((l) => !l.isWarmup && (excludeSessionId ? l.sessionId !== excludeSessionId : true))
    .toArray()
  if (logs.length === 0) return null
  const bySession = new Map<number, LastSetSummary[]>()
  for (const l of logs) {
    if (!bySession.has(l.sessionId)) bySession.set(l.sessionId, [])
    bySession.get(l.sessionId)!.push({
      weight: l.weight,
      reps: l.reps,
      rpe: l.rpe,
      loggedAt: l.loggedAt,
    })
  }
  const sessionIds = Array.from(bySession.keys())
  const sessions = await db.sessions.bulkGet(sessionIds)
  const ordered = sessions
    .filter((s): s is NonNullable<typeof s> => !!s)
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, limitSessions)
  if (ordered.length === 0) return null
  const top = ordered[0]
  return {
    sessionId: top.id!,
    sets: (bySession.get(top.id!) ?? []).sort((a, b) => a.loggedAt - b.loggedAt),
  }
}

export interface ProgressionHint {
  kind: 'increase' | 'hold' | 'reduce' | 'firstTime'
  amountKg?: number
  reason: string
}

export async function suggestProgression(
  exerciseId: string,
  item: PlanItem,
  excludeSessionId?: number,
): Promise<{ suggestedKg: number | null; hint: ProgressionHint }> {
  // Look at the last 2 sessions of working sets.
  const logs = await db.setLogs
    .where('exerciseId')
    .equals(exerciseId)
    .filter((l) => !l.isWarmup && (excludeSessionId ? l.sessionId !== excludeSessionId : true))
    .toArray()
  if (logs.length === 0) {
    return { suggestedKg: null, hint: { kind: 'firstTime', reason: 'First time logging this lift.' } }
  }
  const bySession = new Map<number, typeof logs>()
  for (const l of logs) {
    if (!bySession.has(l.sessionId)) bySession.set(l.sessionId, [])
    bySession.get(l.sessionId)!.push(l)
  }
  const sessions = await db.sessions.bulkGet(Array.from(bySession.keys()))
  const ordered = sessions
    .filter((s): s is NonNullable<typeof s> => !!s)
    .sort((a, b) => b.startedAt - a.startedAt)
  const recent = ordered.slice(0, 2)
  if (recent.length === 0) {
    return { suggestedKg: null, hint: { kind: 'firstTime', reason: 'No prior data.' } }
  }
  const lastSetsBySession = recent.map((s) =>
    (bySession.get(s.id!) ?? []).sort((a, b) => a.loggedAt - b.loggedAt),
  )
  const lastSession = lastSetsBySession[0]
  const lastTop = lastSession.reduce((m, l) => Math.max(m, l.weight), 0)
  const repsHigh = Number(String(item.targetReps).split(/[–\-]/)[1] || String(item.targetReps).split(/[–\-]/)[0]) || null
  const repsLow = Number(String(item.targetReps).split(/[–\-]/)[0]) || null

  // Hit top of rep range with the top weight in last 2 sessions → increase.
  if (repsHigh !== null) {
    const hitTopBoth = lastSetsBySession.every((sets) => {
      if (sets.length === 0) return false
      const topSet = sets.find((s) => s.weight === Math.max(...sets.map((x) => x.weight)))
      return topSet ? topSet.reps >= repsHigh : false
    })
    if (hitTopBoth && lastSetsBySession.length === 2) {
      return {
        suggestedKg: lastTop + 2.5,
        hint: {
          kind: 'increase',
          amountKg: 2.5,
          reason: `You hit ${repsHigh}+ reps the last two sessions. Add 2.5 kg.`,
        },
      }
    }
  }

  // Last session reps below target low → reduce or hold.
  if (repsLow !== null) {
    const minRepsLast = Math.min(...lastSession.map((l) => l.reps))
    if (minRepsLast < repsLow) {
      return {
        suggestedKg: Math.max(0, lastTop - 2.5),
        hint: {
          kind: 'reduce',
          amountKg: 2.5,
          reason: `Reps dropped below target last time. Pull weight back 2.5 kg.`,
        },
      }
    }
  }

  return {
    suggestedKg: lastTop,
    hint: { kind: 'hold', reason: `Match last session’s top set, push for one more rep.` },
  }
}

export async function sessionHasPRs(sessionId: number): Promise<string[]> {
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

export async function exerciseProgression(
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
  const sessions = await db.sessions.bulkGet(Array.from(bySession.keys()))
  const ordered = sessions
    .filter((s): s is NonNullable<typeof s> => !!s)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(-limit)
  return ordered.map((s) => ({
    label: s.date.slice(5),
    value: bySession.get(s.id!)!,
  }))
}
