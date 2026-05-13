import { db } from './schema'
import { EXERCISES } from '../data/exercises'
import { DEFAULT_PLAN, DEFAULT_SETTINGS } from '../data/defaultPlan'

export async function seedIfEmpty() {
  await db.exercises.bulkPut(EXERCISES)

  const existingPlan = await db.plans.get(DEFAULT_PLAN.id)
  if (!existingPlan) {
    await db.plans.put(DEFAULT_PLAN)
  }

  const existingSettings = await db.settings.get(1)
  if (!existingSettings) {
    await db.settings.put(DEFAULT_SETTINGS)
  }
}

export async function resetDatabase() {
  await Promise.all([
    db.exercises.clear(),
    db.plans.clear(),
    db.sessions.clear(),
    db.setLogs.clear(),
    db.bodyweight.clear(),
    db.settings.clear(),
  ])
  await seedIfEmpty()
}
