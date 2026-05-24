import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../db/schema'
import { currentStreak, buildProactiveMessage } from './streak'

// Helpers for time-relative ISO dates so tests don't depend on the date today
// happening to fall on a particular day.
function isoDaysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

async function seedCompletedSession(date: string) {
  await db.sessions.add({
    date,
    routineId: 'test',
    workoutId: 'w',
    workoutName: 'W',
    items: [],
    startedAt: new Date(`${date}T08:00:00`).getTime(),
    completedAt: new Date(`${date}T09:00:00`).getTime(),
  })
}

describe('streak', () => {
  beforeEach(async () => {
    await db.sessions.clear()
  })

  describe('currentStreak', () => {
    it('returns 0 with no sessions', async () => {
      expect(await currentStreak()).toBe(0)
    })

    it('returns 0 if the last completed session is older than yesterday', async () => {
      await seedCompletedSession(isoDaysAgo(3))
      expect(await currentStreak()).toBe(0)
    })

    it('counts a single session today as a streak of 1', async () => {
      await seedCompletedSession(isoDaysAgo(0))
      expect(await currentStreak()).toBe(1)
    })

    it('counts back-to-back days', async () => {
      await seedCompletedSession(isoDaysAgo(0))
      await seedCompletedSession(isoDaysAgo(1))
      await seedCompletedSession(isoDaysAgo(2))
      expect(await currentStreak()).toBe(3)
    })

    it('tolerates a single rest day in between', async () => {
      // train, train, REST, train, train (today)
      await seedCompletedSession(isoDaysAgo(0))
      await seedCompletedSession(isoDaysAgo(1))
      // gap at day 2 — counted as one rest day
      await seedCompletedSession(isoDaysAgo(3))
      await seedCompletedSession(isoDaysAgo(4))
      const s = await currentStreak()
      // counts: 0, 1, miss(2), 3, 4 → streak should be 4
      expect(s).toBe(4)
    })

    it('breaks on two consecutive missed days', async () => {
      await seedCompletedSession(isoDaysAgo(0))
      await seedCompletedSession(isoDaysAgo(1))
      // miss 2, miss 3
      await seedCompletedSession(isoDaysAgo(4))
      expect(await currentStreak()).toBe(2)
    })

    it('ignores not-yet-completed sessions', async () => {
      await db.sessions.add({
        date: isoDaysAgo(0),
        routineId: 'r',
        workoutId: 'w',
        workoutName: 'W',
        items: [],
        startedAt: Date.now(),
        completedAt: null,
      })
      expect(await currentStreak()).toBe(0)
    })
  })

  describe('buildProactiveMessage', () => {
    it('returns the welcome neutral message with no history', async () => {
      const m = await buildProactiveMessage()
      expect(m?.kind).toBe('neutral')
    })

    it('returns a streak message after 3+ days', async () => {
      for (let i = 0; i < 3; i++) await seedCompletedSession(isoDaysAgo(i))
      const m = await buildProactiveMessage()
      expect(m?.kind).toBe('streak')
      expect(m?.text).toContain('3')
    })

    it('returns a gap message after 3+ days off', async () => {
      await seedCompletedSession(isoDaysAgo(5))
      const m = await buildProactiveMessage()
      expect(m?.kind).toBe('gap')
    })

    it('returns null when no notable signal', async () => {
      // single recent workout, no streak, no gap
      await seedCompletedSession(isoDaysAgo(0))
      expect(await buildProactiveMessage()).toBeNull()
    })
  })
})
