import type { Units } from '../db/schema'

const KG_PER_LB = 0.45359237

export function kgToDisplay(kg: number, units: Units): number {
  return units === 'kg' ? kg : kg / KG_PER_LB
}

export function displayToKg(value: number, units: Units): number {
  return units === 'kg' ? value : value * KG_PER_LB
}

export function roundToIncrement(value: number, units: Units): number {
  const inc = units === 'kg' ? 0.5 : 1
  return Math.round(value / inc) * inc
}

export function formatWeight(kg: number, units: Units, digits = 1): string {
  const v = kgToDisplay(kg, units)
  const rounded = Math.round(v * Math.pow(10, digits)) / Math.pow(10, digits)
  const out = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(digits)
  return `${out} ${units}`
}

export function weightIncrement(units: Units, large = false): number {
  if (units === 'kg') return large ? 5 : 2.5
  return large ? 10 : 5
}

export interface PlateSet {
  kg: number[]
  lb: number[]
  barKg: number
  barLb: number
}

export const DEFAULT_PLATES: PlateSet = {
  kg: [25, 20, 15, 10, 5, 2.5, 1.25, 0.5],
  lb: [45, 35, 25, 10, 5, 2.5, 1.25],
  barKg: 20,
  barLb: 45,
}

export interface PlateResult {
  perSide: { plate: number; count: number }[]
  totalKg: number
  totalLb: number
  remainderKg: number
  barKg: number
}

export function calcPlates(
  targetKg: number,
  units: Units,
  barKgOverride?: number,
): PlateResult {
  const barKg = barKgOverride ?? (units === 'kg' ? DEFAULT_PLATES.barKg : DEFAULT_PLATES.barLb * KG_PER_LB)
  const plates = units === 'kg' ? DEFAULT_PLATES.kg : DEFAULT_PLATES.lb
  const plateKg = units === 'kg' ? plates : plates.map((p) => p * KG_PER_LB)

  const perSideTargetKg = (targetKg - barKg) / 2
  if (perSideTargetKg <= 0) {
    return {
      perSide: [],
      totalKg: barKg,
      totalLb: barKg / KG_PER_LB,
      remainderKg: targetKg - barKg,
      barKg,
    }
  }

  let remaining = perSideTargetKg
  const counts: number[] = plates.map(() => 0)
  for (let i = 0; i < plates.length; i++) {
    while (remaining - plateKg[i] >= -0.001) {
      remaining -= plateKg[i]
      counts[i] += 1
    }
  }
  const perSide = plates
    .map((plate, i) => ({ plate, count: counts[i] }))
    .filter((p) => p.count > 0)
  const loadedKg = barKg + 2 * (perSideTargetKg - remaining)
  return {
    perSide,
    totalKg: loadedKg,
    totalLb: loadedKg / KG_PER_LB,
    remainderKg: remaining * 2,
    barKg,
  }
}
