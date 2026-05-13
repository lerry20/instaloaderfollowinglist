import { useEffect } from 'react'
import type { Theme } from '../db/schema'
import { useSettings } from '../db/queries'

const STORAGE_KEY = 'bulklog:theme'

function resolveTheme(t: Theme): 'light' | 'dark' {
  if (t === 'system') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  }
  return t
}

function applyTheme(resolved: 'light' | 'dark') {
  document.documentElement.dataset.theme = resolved
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', resolved === 'light' ? '#f6f7fb' : '#0b1020')
  }
}

export function useThemeSync() {
  const settings = useSettings()
  const theme: Theme = settings?.theme ?? 'system'

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // ignore
    }
    applyTheme(resolveTheme(theme))

    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const handler = () => applyTheme(resolveTheme('system'))
    if (mq.addEventListener) mq.addEventListener('change', handler)
    else (mq as MediaQueryList & { addListener: (h: () => void) => void }).addListener(handler)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler)
      else (mq as MediaQueryList & { removeListener: (h: () => void) => void }).removeListener(handler)
    }
  }, [theme])
}
