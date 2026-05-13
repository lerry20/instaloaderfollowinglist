import { create } from 'zustand'

interface RestTimerState {
  totalSec: number
  startedAt: number | null
  endsAt: number | null
  tick: number
  start: (seconds: number) => void
  stop: () => void
  addSec: (delta: number) => void
  remainingSec: () => number
  isActive: () => boolean
}

let tickInterval: number | null = null
let wakeLock: WakeLockSentinel | null = null
let visibilityHandler: (() => void) | null = null

interface WakeLockSentinel {
  released: boolean
  release: () => Promise<void>
}

async function acquireWakeLock() {
  try {
    const nav = navigator as Navigator & { wakeLock?: { request: (t: string) => Promise<WakeLockSentinel> } }
    if (nav.wakeLock) {
      wakeLock = await nav.wakeLock.request('screen')
      visibilityHandler = async () => {
        if (document.visibilityState === 'visible' && wakeLock?.released && nav.wakeLock) {
          try {
            wakeLock = await nav.wakeLock.request('screen')
          } catch {
            // ignore
          }
        }
      }
      document.addEventListener('visibilitychange', visibilityHandler)
    }
  } catch {
    // ignore — feature unsupported or denied
  }
}

async function releaseWakeLock() {
  if (visibilityHandler) {
    document.removeEventListener('visibilitychange', visibilityHandler)
    visibilityHandler = null
  }
  try {
    if (wakeLock) {
      await wakeLock.release()
      wakeLock = null
    }
  } catch {
    // ignore
  }
}

function fireEnd() {
  try {
    if ('vibrate' in navigator) navigator.vibrate([220, 100, 220, 100, 220])
  } catch {
    // ignore
  }
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const playBeep = (start: number, freq: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.001, ctx.currentTime + start)
      gain.gain.exponentialRampToValueAtTime(0.32, ctx.currentTime + start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + 0.45)
      osc.start(ctx.currentTime + start)
      osc.stop(ctx.currentTime + start + 0.5)
    }
    playBeep(0, 880)
    playBeep(0.55, 880)
  } catch {
    // ignore — audio likely needs user gesture
  }
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      const reg = (navigator as Navigator & { serviceWorker?: ServiceWorkerContainer }).serviceWorker
      if (reg && reg.controller) {
        reg.ready
          .then((r) =>
            r.showNotification('Rest complete', {
              body: 'Get back to the bar.',
              icon: '/icon.svg',
              tag: 'rest-timer',
              silent: false,
            }),
          )
          .catch(() => {
            new Notification('Rest complete', { body: 'Get back to the bar.' })
          })
      } else {
        new Notification('Rest complete', { body: 'Get back to the bar.' })
      }
    }
  } catch {
    // ignore
  }
}

export async function ensureNotificationPermission() {
  try {
    if (!('Notification' in window)) return false
    if (Notification.permission === 'granted') return true
    if (Notification.permission === 'denied') return false
    const r = await Notification.requestPermission()
    return r === 'granted'
  } catch {
    return false
  }
}

export const useRestTimer = create<RestTimerState>((set, get) => ({
  totalSec: 0,
  startedAt: null,
  endsAt: null,
  tick: 0,
  start(seconds) {
    const now = Date.now()
    set({ totalSec: seconds, startedAt: now, endsAt: now + seconds * 1000, tick: 0 })
    if (tickInterval) window.clearInterval(tickInterval)
    void acquireWakeLock()
    let fired = false
    tickInterval = window.setInterval(() => {
      const s = get()
      if (!s.endsAt) return
      const remaining = Math.max(0, Math.ceil((s.endsAt - Date.now()) / 1000))
      set({ tick: s.tick + 1 })
      if (remaining <= 0 && !fired) {
        fired = true
        fireEnd()
        void releaseWakeLock()
        if (tickInterval) {
          window.clearInterval(tickInterval)
          tickInterval = null
        }
      }
    }, 250)
  },
  stop() {
    if (tickInterval) {
      window.clearInterval(tickInterval)
      tickInterval = null
    }
    void releaseWakeLock()
    set({ totalSec: 0, startedAt: null, endsAt: null, tick: 0 })
  },
  addSec(delta) {
    const s = get()
    if (!s.endsAt) return
    set({ endsAt: s.endsAt + delta * 1000, totalSec: Math.max(0, s.totalSec + delta) })
  },
  remainingSec() {
    const s = get()
    if (!s.endsAt) return 0
    return Math.max(0, Math.ceil((s.endsAt - Date.now()) / 1000))
  },
  isActive() {
    return get().endsAt !== null
  },
}))
