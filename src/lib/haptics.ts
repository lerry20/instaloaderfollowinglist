// Light wrapper over the Vibration API. Quietly no-ops on unsupported devices
// (most iOS Safari without home-screen install). Doesn't throw.

function safeVibrate(pattern: number | number[]) {
  try {
    if ('vibrate' in navigator) navigator.vibrate(pattern)
  } catch {
    // ignore
  }
}

export const haptics = {
  /** A single light tap — for set logging, button confirmation. */
  tap: () => safeVibrate(20),
  /** Slightly stronger — for warm-up logged, exercise advance. */
  pop: () => safeVibrate(35),
  /** Two-pulse — for set log + auto-advance. */
  double: () => safeVibrate([20, 60, 20]),
  /** Celebration — used on PR detection. */
  pr: () => safeVibrate([60, 80, 60, 80, 120]),
  /** Long pulse — finish workout. */
  finish: () => safeVibrate([100, 80, 100, 80, 200]),
  /** Subtle — toast / minor confirmation. */
  subtle: () => safeVibrate(10),
}
