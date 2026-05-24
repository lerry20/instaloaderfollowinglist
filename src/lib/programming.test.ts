import { describe, it, expect, beforeEach } from 'vitest'
import { db, type Exercise } from '../db/schema'
import { VOLUME_LANDMARKS, weeklyVolumeByMuscle, nextPhase } from './programming'

function isoDaysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

const benchPress: Exercise = {
  id: 'bench',
  name: 'Bench Press',
  primaryMuscle: 'chest',
  secondaryMuscles: ['frontDelt', 'tricep'],
  equipment: 'barbell',
  cues: [],
  videoQuery: 'bench press',
  imageUrls: [],
  category: 'compound',
  defaultRestSec: 120,
  isCurated: true,
}

async function seedSessionWithSets(date: string, exerciseId: string, sets: number) {
  const sessionId = (await db.sessions.add({
    date,
    routineId: 'r',
    workoutId: 'w',
    workoutName: 'W',
    items: [],
    startedAt: new Date(`${date}T08:00:00`).getTime(),
    completedAt: new Date(`${date}T09:00:00`).getTime(),
  })) as number
  for (let i = 0; i < sets; i++) {
    await db.setLogs.add({
      sessionId,
      exerciseId,
      setIndex: i,
      weight: 80,
      reps: 8,
      rpe: 8,
      isWarmup: false,
      loggedAt: Date.now(),
    })
  }
}

describe('programming', () => {
  beforeEach(async () => {
    await db.sessions.clear()
    await db.setLogs.clear()
    await db.exercises.clear()
    await db.exercises.add(benchPress)
  })

  describe('VOLUME_LANDMARKS', () => {
    it('defines mev <= mav <= mrv for every muscle', () => {
      for (const [muscle, lm] of Object.entries(VOLUME_LANDMARKS)) {
        expect(lm.mev, muscle).toBeLessThanOrEqual(lm.mav)
        expect(lm.mav, muscle).toBeLessThanOrEqual(lm.mrv)
      }
    })
  })

  describe('weeklyVolumeByMuscle', () => {
    it('returns below-mev for every active muscle with no recent sessions', async () => {
      const v = await weeklyVolumeByMuscle()
      const chest = v.find((m) => m.muscle === 'chest')
      expect(chest?.workingSets).toBe(0)
      expect(chest?.status).toBe('below-mev')
    })

    it('counts primary muscle sets at full credit', async () => {
      // 10 chest working sets today → above MEV (8), within MAV (18) → optimal
      await seedSessionWithSets(isoDaysAgo(0), 'bench', 10)
      const v = await weeklyVolumeByMuscle()
      const chest = v.find((m) => m.muscle === 'chest')
      expect(chest?.workingSets).toBe(10)
      expect(chest?.status).toBe('optimal')
    })

    it('counts secondary muscles at half credit', async () => {
      // 10 bench sets → tricep is a secondary → 5 sets credited
      await seedSessionWithSets(isoDaysAgo(0), 'bench', 10)
      const v = await weeklyVolumeByMuscle()
      const tricep = v.find((m) => m.muscle === 'tricep')
      expect(tricep?.workingSets).toBe(5)
    })

    it('ignores warmup sets', async () => {
      const sessionId = (await db.sessions.add({
        date: isoDaysAgo(0),
        routineId: 'r',
        workoutId: 'w',
        workoutName: 'W',
        items: [],
        startedAt: Date.now(),
        completedAt: Date.now(),
      })) as number
      await db.setLogs.add({
        sessionId, exerciseId: 'bench', setIndex: 0,
        weight: 40, reps: 10, rpe: null,
        isWarmup: true, loggedAt: Date.now(),
      })
      await db.setLogs.add({
        sessionId, exerciseId: 'bench', setIndex: 1,
        weight: 80, reps: 8, rpe: 8,
        isWarmup: false, loggedAt: Date.now(),
      })
      const v = await weeklyVolumeByMuscle()
      expect(v.find((m) => m.muscle === 'chest')?.workingSets).toBe(1)
    })

    it('ignores sessions outside the lookback window', async () => {
      await seedSessionWithSets(isoDaysAgo(30), 'bench', 10)
      const v = await weeklyVolumeByMuscle()
      expect(v.find((m) => m.muscle === 'chest')?.workingSets).toBe(0)
    })

    it('flags past-mrv status when volume exceeds MRV', async () => {
      // Chest MRV is 22 — log 30 working sets.
      await seedSessionWithSets(isoDaysAgo(0), 'bench', 30)
      const v = await weeklyVolumeByMuscle()
      expect(v.find((m) => m.muscle === 'chest')?.status).toBe('past-mrv')
    })
  })

  describe('nextPhase', () => {
    it('cycles volume → intensification → deload → volume', () => {
      expect(nextPhase('volume')).toBe('intensification')
      expect(nextPhase('intensification')).toBe('deload')
      expect(nextPhase('deload')).toBe('volume')
    })
  })
})
