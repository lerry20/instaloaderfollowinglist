import type { EquipmentTag, Exercise, Routine } from '../db/schema'

/** True when the user can do this exercise given their available equipment.
 * - `available === undefined` → user has all equipment (default) → always doable.
 * - Exercise with no equipmentTags or empty tags → bodyweight → always doable.
 * - Otherwise: every tag the exercise needs must be in the available set. */
export function canDoExercise(
  ex: Exercise,
  available: EquipmentTag[] | undefined,
): boolean {
  if (available === undefined) return true
  if (!ex.equipmentTags || ex.equipmentTags.length === 0) return true
  return ex.equipmentTags.every((tag) => available.includes(tag))
}

/** How many of a routine's exercises the user CAN'T do with their current
 * equipment. 0 = fully doable. Used to flag/sort routine cards. */
export function routineMissingCount(
  routine: Routine,
  exById: Map<string, Exercise>,
  available: EquipmentTag[] | undefined,
): number {
  if (available === undefined) return 0
  let missing = 0
  const seen = new Set<string>()
  for (const w of routine.workouts) {
    for (const item of w.items) {
      if (seen.has(item.exerciseId)) continue
      seen.add(item.exerciseId)
      const ex = exById.get(item.exerciseId)
      if (!ex) continue
      if (!canDoExercise(ex, available)) missing += 1
    }
  }
  return missing
}
