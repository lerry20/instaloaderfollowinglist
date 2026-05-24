import { create } from 'zustand'
import { LOCALES, type Locale } from './types'

const STORAGE_KEY = 'bulklog:locale'

function detectInitial(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (stored && (LOCALES as readonly string[]).includes(stored)) return stored
  } catch {
    // ignore
  }
  if (typeof navigator !== 'undefined') {
    const tag = navigator.language?.split('-')[0]?.toLowerCase()
    if (tag && (LOCALES as readonly string[]).includes(tag)) return tag as Locale
  }
  return 'en'
}

interface State {
  locale: Locale
  setLocale: (l: Locale) => void
}

export const useLocaleStore = create<State>((set) => ({
  locale: detectInitial(),
  setLocale: (l) => {
    try { localStorage.setItem(STORAGE_KEY, l) } catch { /* ignore */ }
    set({ locale: l })
  },
}))
