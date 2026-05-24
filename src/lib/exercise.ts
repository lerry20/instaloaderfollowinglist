import type { Exercise } from '../db/schema'
import type { Locale } from '../i18n'
import { useLocaleStore } from '../i18n'

interface Localized {
  name: string
  equipment: string
  cues: string[]
  bulkingTip?: string
}

/** Resolve an exercise's name / equipment / cues / bulkingTip in the active
 * locale, with English fallback for any missing field. */
export function localizeExercise(ex: Exercise, locale: Locale): Localized {
  const i = ex.i18n?.[locale]
  return {
    name: i?.name ?? ex.name,
    equipment: i?.equipment ?? ex.equipment,
    cues: i?.cues ?? ex.cues,
    bulkingTip: i?.bulkingTip ?? ex.bulkingTip,
  }
}

/** Reactive variant — re-renders when the locale changes. */
export function useLocalizedExercise(ex: Exercise | undefined | null): Localized | null {
  const locale = useLocaleStore((s) => s.locale)
  if (!ex) return null
  return localizeExercise(ex, locale)
}
