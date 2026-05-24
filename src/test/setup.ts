// Provides fake IndexedDB for Dexie + minor browser polyfills.
import 'fake-indexeddb/auto'
import '@testing-library/jest-dom/vitest'

// matchMedia is referenced by theme.ts at module load.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}
