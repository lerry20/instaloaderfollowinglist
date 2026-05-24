import { en } from './en'
import { it } from './it'
import { es } from './es'
import { fr } from './fr'
import { de } from './de'
import { pt } from './pt'
import { useLocaleStore } from './store'
import type { Dict, DictKey, Locale } from './types'

export type { Dict, DictKey, Locale } from './types'
export { LOCALES, LOCALE_LABEL, LOCALE_FLAG } from './types'
export { useLocaleStore } from './store'

// All six locales have full dictionaries. Any missing key in a locale
// falls back to English at runtime via lookup().
const dicts: Record<Locale, Partial<Dict>> = {
  en, it, es, fr, de, pt,
}

function lookup(locale: Locale, key: DictKey): string {
  const d = dicts[locale]
  return (d && d[key]) ?? en[key] ?? String(key)
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template
  let out = template
  for (const [k, v] of Object.entries(vars)) {
    out = out.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
  }
  return out
}

export function translate(locale: Locale, key: DictKey, vars?: Record<string, string | number>): string {
  return interpolate(lookup(locale, key), vars)
}

/** Reactive translation hook. Re-renders the calling component when the
 * selected locale changes. */
export function useT() {
  const locale = useLocaleStore((s) => s.locale)
  return (key: DictKey, vars?: Record<string, string | number>) => translate(locale, key, vars)
}
