import { describe, it, expect } from 'vitest'
import {
  kgToDisplay,
  displayToKg,
  weightIncrement,
  formatWeight,
  calcPlates,
} from './units'

describe('units', () => {
  describe('kgToDisplay / displayToKg', () => {
    it('passes kg through unchanged', () => {
      expect(kgToDisplay(80, 'kg')).toBe(80)
      expect(displayToKg(80, 'kg')).toBe(80)
    })

    it('converts kg to lb', () => {
      expect(kgToDisplay(100, 'lb')).toBeCloseTo(220.46, 2)
    })

    it('converts lb back to kg', () => {
      expect(displayToKg(220, 'lb')).toBeCloseTo(99.79, 2)
    })

    it('round-trips through display', () => {
      const original = 87.5
      const display = kgToDisplay(original, 'lb')
      const back = displayToKg(display, 'lb')
      expect(back).toBeCloseTo(original, 5)
    })
  })

  describe('weightIncrement', () => {
    it('returns 2.5 kg by default, 5 kg for big', () => {
      expect(weightIncrement('kg')).toBe(2.5)
      expect(weightIncrement('kg', true)).toBe(5)
    })

    it('returns 5 lb by default, 10 lb for big', () => {
      expect(weightIncrement('lb')).toBe(5)
      expect(weightIncrement('lb', true)).toBe(10)
    })
  })

  describe('formatWeight', () => {
    it('formats kg with one decimal max', () => {
      expect(formatWeight(80, 'kg')).toBe('80 kg')
      expect(formatWeight(82.5, 'kg')).toBe('82.5 kg')
    })

    it('rounds to integer for lb', () => {
      // 100 kg ≈ 220.46 lb → "220 lb" at 0 decimals
      expect(formatWeight(100, 'lb', 0)).toBe('220 lb')
    })
  })

  describe('calcPlates', () => {
    it('returns just the bar for low targets', () => {
      const r = calcPlates(20, 'kg')
      expect(r.perSide).toEqual([])
      expect(r.totalKg).toBe(20)
    })

    it('loads 100 kg with a greedy plate pick', () => {
      // 100 kg - 20 bar = 80 kg, 40 per side. Greedy: 25 + 15.
      const r = calcPlates(100, 'kg')
      expect(r.perSide).toContainEqual({ plate: 25, count: 1 })
      expect(r.perSide).toContainEqual({ plate: 15, count: 1 })
      expect(r.totalKg).toBe(100)
    })

    it('handles 102.5 kg with mixed plates', () => {
      const r = calcPlates(102.5, 'kg')
      // bar 20 + 2*(20 + 20 + 1.25) = 20 + 82.5 = 102.5
      expect(r.totalKg).toBeCloseTo(102.5, 1)
    })

    it('reports a remainder when target unreachable with available plates', () => {
      // Target 0.1 kg above bar — no plate small enough
      const r = calcPlates(20.1, 'kg')
      expect(Math.abs(r.remainderKg)).toBeGreaterThan(0)
    })

    it('works in lb with a 45 lb bar', () => {
      // 135 lb = 45 + 2 × 45 per side
      const r = calcPlates(135 * 0.45359237, 'lb', 45 * 0.45359237)
      expect(r.perSide.find((p) => p.plate === 45)?.count).toBe(1)
    })
  })
})
