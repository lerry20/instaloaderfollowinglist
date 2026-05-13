import { db, type Settings } from './schema'
import { CURATED_EXERCISES } from '../data/curatedExercises'
import { PRESET_ROUTINES, DEFAULT_ACTIVE_ROUTINE_ID } from '../data/routines'

export const DEFAULT_SETTINGS: Settings = {
  id: 1,
  units: 'kg',
  defaultRestSec: 90,
  goalNotes:
    'Bulk: gain ~0.25 kg / week. Push every working set to RPE 8 and add load when you hit the top of the rep range two sessions in a row.',
  goal: 'bulk',
  onboarded: false,
  notificationsEnabled: false,
  activeRoutineId: DEFAULT_ACTIVE_ROUTINE_ID,
}

export async function seedIfEmpty() {
  // Upsert curated exercises (refreshes content on app upgrades).
  await db.exercises.bulkPut(CURATED_EXERCISES)

  // Upsert built-in routines so users get new presets on upgrade.
  await db.routines.bulkPut(PRESET_ROUTINES)

  const existingSettings = await db.settings.get(1)
  if (!existingSettings) {
    await db.settings.put(DEFAULT_SETTINGS)
  } else if (!existingSettings.activeRoutineId) {
    await db.settings.put({ ...existingSettings, activeRoutineId: DEFAULT_ACTIVE_ROUTINE_ID })
  }
}

export async function resetDatabase() {
  await Promise.all([
    db.exercises.clear(),
    db.routines.clear(),
    db.sessions.clear(),
    db.setLogs.clear(),
    db.bodyweight.clear(),
    db.settings.clear(),
  ])
  await seedIfEmpty()
}
