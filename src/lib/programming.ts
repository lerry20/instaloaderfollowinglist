import { db, type MuscleKey, type PeriodizationPhase, MUSCLE_LABEL } from '../db/schema'

// Israetel's MEV / MAV / MRV landmarks (working sets per muscle per week).
// These are rough but widely cited; intermediate values shown.
export interface MuscleVolumeLandmarks {
  mev: number // minimum effective volume
  mav: number // top of "adaptive" range
  mrv: number // maximum recoverable volume
}

export const VOLUME_LANDMARKS: Record<MuscleKey, MuscleVolumeLandmarks> = {
  chest: { mev: 8, mav: 18, mrv: 22 },
  frontDelt: { mev: 6, mav: 12, mrv: 16 },
  sideDelt: { mev: 8, mav: 20, mrv: 26 },
  rearDelt: { mev: 8, mav: 18, mrv: 22 },
  bicep: { mev: 8, mav: 18, mrv: 22 },
  tricep: { mev: 6, mav: 14, mrv: 18 },
  forearm: { mev: 4, mav: 10, mrv: 14 },
  lat: { mev: 10, mav: 20, mrv: 25 },
  midBack: { mev: 8, mav: 18, mrv: 22 },
  lowerBack: { mev: 4, mav: 8, mrv: 12 },
  core: { mev: 0, mav: 12, mrv: 20 },
  glute: { mev: 4, mav: 12, mrv: 16 },
  quad: { mev: 8, mav: 18, mrv: 22 },
  hamstring: { mev: 6, mav: 14, mrv: 20 },
  calf: { mev: 8, mav: 14, mrv: 20 },
  trap: { mev: 4, mav: 10, mrv: 14 },
}

export interface MuscleVolume {
  muscle: MuscleKey
  label: string
  workingSets: number
  landmarks: MuscleVolumeLandmarks
  status: 'below-mev' | 'optimal' | 'past-mav' | 'past-mrv'
}

export async function weeklyVolumeByMuscle(daysBack = 7): Promise<MuscleVolume[]> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - (daysBack - 1))
  const cutoffIso = cutoff.toISOString().slice(0, 10)
  const allSessions = await db.sessions.toArray()
  const recentIds = allSessions.filter((s) => s.date >= cutoffIso).map((s) => s.id!)
  if (recentIds.length === 0) {
    return (Object.keys(VOLUME_LANDMARKS) as MuscleKey[]).map((m) => ({
      muscle: m,
      label: MUSCLE_LABEL[m],
      workingSets: 0,
      landmarks: VOLUME_LANDMARKS[m],
      status: VOLUME_LANDMARKS[m].mev > 0 ? 'below-mev' : 'optimal',
    }))
  }

  const allLogs = await db.setLogs.toArray()
  const allExercises = await db.exercises.toArray()
  const counts = new Map<MuscleKey, number>()

  for (const log of allLogs) {
    if (log.isWarmup) continue
    if (!recentIds.includes(log.sessionId)) continue
    const ex = allExercises.find((e) => e.id === log.exerciseId)
    if (!ex) continue
    counts.set(ex.primaryMuscle, (counts.get(ex.primaryMuscle) ?? 0) + 1)
    for (const secondary of ex.secondaryMuscles) {
      // Secondary muscles get half-credit toward weekly volume.
      counts.set(secondary, (counts.get(secondary) ?? 0) + 0.5)
    }
  }

  return (Object.keys(VOLUME_LANDMARKS) as MuscleKey[]).map((m) => {
    const sets = counts.get(m) ?? 0
    const lm = VOLUME_LANDMARKS[m]
    let status: MuscleVolume['status'] = 'optimal'
    if (sets < lm.mev) status = 'below-mev'
    else if (sets > lm.mrv) status = 'past-mrv'
    else if (sets > lm.mav) status = 'past-mav'
    return { muscle: m, label: MUSCLE_LABEL[m], workingSets: sets, landmarks: lm, status }
  })
}

// Detect "time to deload" using simple heuristics:
//  - average RPE on working sets rising session-over-session
//  - reps dropping below target two sessions in a row across multiple lifts
export interface DeloadSignal {
  shouldDeload: boolean
  reason: string
  details: string[]
}

export async function detectDeloadSignal(): Promise<DeloadSignal> {
  const all = await db.sessions.toArray()
  const completed = all.filter((s) => s.completedAt !== null).sort((a, b) => b.startedAt - a.startedAt)
  if (completed.length < 4) {
    return { shouldDeload: false, reason: 'Not enough history yet (need 4+ completed sessions).', details: [] }
  }
  const recentFour = completed.slice(0, 4)
  const reasons: string[] = []

  // Average RPE per session
  const setLogs = await db.setLogs.toArray()
  const avgRpePerSession = recentFour.map((s) => {
    const logs = setLogs.filter((l) => l.sessionId === s.id && !l.isWarmup && l.rpe !== null)
    if (logs.length === 0) return null
    const sum = logs.reduce((a, l) => a + (l.rpe ?? 0), 0)
    return sum / logs.length
  })
  const validRpe = avgRpePerSession.filter((v): v is number => v !== null)
  if (validRpe.length >= 3) {
    const recent = validRpe.slice(0, 2).reduce((a, b) => a + b, 0) / 2
    const older = validRpe.slice(2).reduce((a, b) => a + b, 0) / (validRpe.length - 2)
    if (recent - older >= 0.5) {
      reasons.push(
        `Average RPE has climbed by ${(recent - older).toFixed(1)} over your last ~2 sessions — sign of accumulated fatigue.`,
      )
    }
  }

  // 4+ weeks of accumulated training without a deload — preventive recommendation
  const oldestRecent = recentFour[recentFour.length - 1].startedAt
  const daysSpan = (Date.now() - oldestRecent) / (1000 * 60 * 60 * 24)
  if (daysSpan > 0 && completed.length >= 16 && daysSpan / completed.length < 3) {
    reasons.push('You\'ve trained consistently for 4+ weeks — a deload week is preventive maintenance.')
  }

  return {
    shouldDeload: reasons.length > 0,
    reason: reasons[0] ?? 'No deload signal detected. Keep pushing.',
    details: reasons,
  }
}

export const PHASE_LABEL: Record<PeriodizationPhase, string> = {
  volume: 'Volume',
  intensification: 'Intensification',
  deload: 'Deload',
}

export const PHASE_DESCRIPTION: Record<PeriodizationPhase, string> = {
  volume: '4 weeks of building total sets per muscle. Push reps in the 8-12 range, RPE 7-8. Most of your growth happens here.',
  intensification: '3 weeks of heavier load. Drop reps to 5-8 at RPE 8-9. Same exercises, more weight.',
  deload: '1 week of reduced volume (half sets) and lower intensity (RPE 6). Recovery week. Skip if you feel fresh, but you probably need it.',
}

export function nextPhase(p: PeriodizationPhase): PeriodizationPhase {
  if (p === 'volume') return 'intensification'
  if (p === 'intensification') return 'deload'
  return 'volume'
}
