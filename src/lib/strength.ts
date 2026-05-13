/** Brzycki formula for reps ≤ 10. Falls back to Epley for higher reps where
 * Brzycki diverges. Returns kg. */
export function estimateOneRepMax(weightKg: number, reps: number): number | null {
  if (!weightKg || weightKg <= 0) return null
  if (!reps || reps <= 0) return null
  if (reps === 1) return weightKg
  if (reps <= 10) {
    // Brzycki: 1RM = weight / (1.0278 - 0.0278 × reps)
    const denom = 1.0278 - 0.0278 * reps
    if (denom <= 0) return null
    return weightKg / denom
  }
  // Epley for higher reps: 1RM ≈ weight × (1 + reps/30)
  return weightKg * (1 + reps / 30)
}

export function formatDuration(ms: number): string {
  if (!ms || ms < 0) return '—'
  const totalMinutes = Math.round(ms / 60000)
  if (totalMinutes < 60) return `${totalMinutes}m`
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}
