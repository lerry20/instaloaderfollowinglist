import { useEffect, useState } from 'react'

/** Demo mode: a non-destructive flag that hides all personal data
 * (sessions, PRs, streak, bodyweight history, nutrition entries, etc.)
 * without touching IndexedDB. Used to clean up the UI when showing the
 * app to someone else. Toggle in Settings — your data is untouched.
 *
 * Stored in localStorage so the choice survives reloads. */
const LS_KEY = 'mybulklog:demo-mode'
const listeners = new Set<(v: boolean) => void>()

export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(LS_KEY) === '1'
}

export function setDemoMode(value: boolean) {
  if (typeof window === 'undefined') return
  if (value) {
    window.localStorage.setItem(LS_KEY, '1')
  } else {
    window.localStorage.removeItem(LS_KEY)
  }
  listeners.forEach((fn) => fn(value))
}

export function useDemoMode(): boolean {
  const [enabled, setEnabled] = useState<boolean>(isDemoMode)
  useEffect(() => {
    listeners.add(setEnabled)
    return () => {
      listeners.delete(setEnabled)
    }
  }, [])
  return enabled
}
