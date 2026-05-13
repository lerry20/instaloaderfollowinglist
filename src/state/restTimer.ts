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

function fireEnd() {
  try {
    if ('vibrate' in navigator) navigator.vibrate([180, 80, 180])
  } catch {
    // ignore vibration errors
  }
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
    osc.start()
    osc.stop(ctx.currentTime + 0.6)
  } catch {
    // audio context may be blocked until user gesture
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
    let fired = false
    tickInterval = window.setInterval(() => {
      const s = get()
      if (!s.endsAt) return
      const remaining = Math.max(0, Math.ceil((s.endsAt - Date.now()) / 1000))
      set({ tick: s.tick + 1 })
      if (remaining <= 0 && !fired) {
        fired = true
        fireEnd()
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
    set({ totalSec: 0, startedAt: null, endsAt: null, tick: 0 })
  },
  addSec(delta) {
    const s = get()
    if (!s.endsAt) return
    set({ endsAt: s.endsAt + delta * 1000, totalSec: s.totalSec + delta })
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
