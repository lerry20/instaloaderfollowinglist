import { db, type Settings } from './schema'
import { CURATED_EXERCISES } from '../data/curatedExercises'
import { PRESET_ROUTINES, DEFAULT_ACTIVE_ROUTINE_ID } from '../data/routines'

export const DEFAULT_SETTINGS: Settings = {
  id: 1,
  units: 'kg',
  defaultRestSec: 90,
  goalNotes:
    'Bulk: gain ~0.25 kg / week. Push every working set hard, stop one rep short of failure, and add 2.5 kg whenever you hit the top of the rep range two sessions in a row.',
  goal: 'bulk',
  // Onboarding was removed — new users land straight on Train with these
  // defaults. `onboarded` is kept on the type for forward-compat with
  // older DBs but is effectively always true now.
  onboarded: true,
  notificationsEnabled: false,
  activeRoutineId: DEFAULT_ACTIVE_ROUTINE_ID,
  skillLevel: 'beginner',
  theme: 'system',
  periodizationPhase: 'volume',
  periodizationWeek: 1,
}

export async function seedIfEmpty() {
  // Upsert curated exercises (refreshes content on app upgrades).
  await db.exercises.bulkPut(CURATED_EXERCISES)

  // Upsert built-in routines so users get new presets on upgrade.
  await db.routines.bulkPut(PRESET_ROUTINES)

  const existingSettings = await db.settings.get(1)
  if (!existingSettings) {
    await db.settings.put(DEFAULT_SETTINGS)
  } else {
    // Backfill any new fields on upgrade without overwriting user choices.
    await db.settings.put({
      ...DEFAULT_SETTINGS,
      ...existingSettings,
      activeRoutineId: existingSettings.activeRoutineId || DEFAULT_ACTIVE_ROUTINE_ID,
      skillLevel: existingSettings.skillLevel ?? 'beginner',
      theme: existingSettings.theme ?? 'system',
      periodizationPhase: existingSettings.periodizationPhase ?? 'volume',
      periodizationWeek: existingSettings.periodizationWeek ?? 1,
    })
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
    db.nutrition.clear(),
    db.sleep.clear(),
    db.measurements.clear(),
    db.coachMessages.clear(),
  ])
  await seedIfEmpty()
}
