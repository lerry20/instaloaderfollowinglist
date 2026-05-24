import { describe, it, expect } from 'vitest'
import { estimateOneRepMax, formatDuration } from './strength'

describe('strength', () => {
  describe('estimateOneRepMax', () => {
    it('returns null for non-positive inputs', () => {
      expect(estimateOneRepMax(0, 5)).toBeNull()
      expect(estimateOneRepMax(-10, 5)).toBeNull()
      expect(estimateOneRepMax(80, 0)).toBeNull()
      expect(estimateOneRepMax(80, -1)).toBeNull()
    })

    it('returns the weight unchanged for a single rep', () => {
      expect(estimateOneRepMax(100, 1)).toBe(100)
    })

    it('uses Brzycki for reps in 2..10', () => {
      // 100 kg × 5 → 100 / (1.0278 - 0.0278 × 5) = 100 / 0.8888 ≈ 112.5
      expect(estimateOneRepMax(100, 5)).toBeCloseTo(112.5, 0)
      // 80 kg × 8 → 80 / (1.0278 - 0.2224) ≈ 80 / 0.8054 ≈ 99.3
      expect(estimateOneRepMax(80, 8)).toBeCloseTo(99.3, 0)
    })

    it('uses Epley for reps > 10', () => {
      // 60 kg × 15 → 60 × (1 + 15/30) = 60 × 1.5 = 90
      expect(estimateOneRepMax(60, 15)).toBeCloseTo(90, 5)
      // 50 × 20 → 50 × (1 + 20/30) ≈ 83.33
      expect(estimateOneRepMax(50, 20)).toBeCloseTo(83.33, 1)
    })

    it('never produces an estimate below the actual weight', () => {
      for (const reps of [2, 5, 8, 10, 12, 20]) {
        const e = estimateOneRepMax(80, reps)
        expect(e).not.toBeNull()
        expect(e!).toBeGreaterThanOrEqual(80)
      }
    })
  })

  describe('formatDuration', () => {
    it('returns an em-dash for empty / invalid input', () => {
      expect(formatDuration(0)).toBe('—')
      expect(formatDuration(-1)).toBe('—')
    })

    it('formats sub-hour durations in minutes', () => {
      expect(formatDuration(60_000)).toBe('1m')
      expect(formatDuration(45 * 60_000)).toBe('45m')
      expect(formatDuration(59 * 60_000)).toBe('59m')
    })

    it('formats hour durations', () => {
      expect(formatDuration(60 * 60_000)).toBe('1h')
      expect(formatDuration(120 * 60_000)).toBe('2h')
    })

    it('formats hour + minute combos', () => {
      expect(formatDuration(75 * 60_000)).toBe('1h 15m')
      expect(formatDuration(135 * 60_000)).toBe('2h 15m')
    })
  })
})
