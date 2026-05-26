import type { EquipmentTag } from '../db/schema'

/** What equipment each curated exercise needs. Empty array = bodyweight,
 * doable anywhere. Tags are conservative (e.g. lat-pulldown needs a cable
 * machine; t-bar-row needs a barbell + a landmine attachment, simplified
 * to just barbell since most gyms have something workable). */
export const EXERCISE_EQUIPMENT: Record<string, EquipmentTag[]> = {
  // ───────── CHEST ─────────
  'bench-press': ['barbell', 'bench'],
  'incline-bench': ['barbell', 'bench'],
  'incline-db-press': ['dumbbell', 'bench'],
  'db-bench-press': ['dumbbell', 'bench'],
  'cable-fly': ['cable'],
  'pec-deck': ['machine'],
  'chest-dip': ['pullup_bar'],
  'decline-press': ['barbell', 'bench'],
  // ───────── SHOULDERS ─────────
  'ohp': ['barbell'],
  'seated-db-press': ['dumbbell', 'bench'],
  'lateral-raise': ['dumbbell'],
  'cable-lateral': ['cable'],
  'rear-delt-fly': ['dumbbell'],
  'face-pull': ['cable'],
  // ───────── BACK ─────────
  'deadlift': ['barbell'],
  'pullup': ['pullup_bar'],
  'chin-up': ['pullup_bar'],
  'lat-pulldown': ['cable'],
  'barbell-row': ['barbell'],
  't-bar-row': ['barbell'],
  'chest-supported-row': ['dumbbell', 'bench'],
  'seated-cable-row': ['cable'],
  'straight-arm-pulldown': ['cable'],
  'db-pullover': ['dumbbell', 'bench'],
  // ───────── BICEPS ─────────
  'barbell-curl': ['barbell'],
  'incline-curl': ['dumbbell', 'bench'],
  'hammer-curl': ['dumbbell'],
  'preacher-curl': ['barbell', 'bench'],
  'cable-curl': ['cable'],
  'bayesian-curl': ['cable'],
  // ───────── TRICEPS ─────────
  'close-grip-bench': ['barbell', 'bench'],
  'tricep-pushdown': ['cable'],
  'overhead-tricep-ext': ['dumbbell'],
  'skullcrusher': ['barbell', 'bench'],
  // ───────── LEGS ─────────
  'back-squat': ['barbell'],
  'front-squat': ['barbell'],
  'leg-press': ['machine'],
  'hack-squat': ['machine'],
  'leg-extension': ['machine'],
  'walking-lunge': ['dumbbell'],
  'split-squat': ['dumbbell', 'bench'],
  'rdl': ['barbell'],
  'leg-curl': ['machine'],
  'seated-leg-curl': ['machine'],
  'hip-thrust': ['barbell', 'bench'],
  'cable-pull-through': ['cable'],
  'good-morning': ['barbell'],
  'standing-calf-raise': ['machine'],
  'seated-calf-raise': ['machine'],
  // ───────── CORE ─────────
  'hanging-leg-raise': ['pullup_bar'],
  'cable-crunch': ['cable'],
  'plank': [],
  // ───────── TRAPS / FOREARMS ─────────
  'db-shrug': ['dumbbell'],
  'reverse-curl': ['barbell'],
  'wrist-curl': ['dumbbell'],
}
