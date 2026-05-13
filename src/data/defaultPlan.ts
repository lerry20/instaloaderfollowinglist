import type { Plan } from '../db/schema'

export const DEFAULT_PLAN: Plan = {
  id: 'default',
  name: 'Push / Pull / Legs (Bulking)',
  weekTemplate: {
    mon: {
      label: 'Push A',
      items: [
        { exerciseId: 'bench-press', targetSets: 4, targetReps: '5–6', targetRPE: 8 },
        { exerciseId: 'incline-db-press', targetSets: 3, targetReps: '8–10', targetRPE: 8 },
        { exerciseId: 'ohp', targetSets: 3, targetReps: '6–8', targetRPE: 8 },
        { exerciseId: 'lateral-raise', targetSets: 4, targetReps: '12–15', targetRPE: 9 },
        { exerciseId: 'tricep-pushdown', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
      ],
    },
    tue: {
      label: 'Pull A',
      items: [
        { exerciseId: 'deadlift', targetSets: 3, targetReps: '3–5', targetRPE: 8 },
        { exerciseId: 'pullup', targetSets: 4, targetReps: '6–10', targetRPE: 8 },
        { exerciseId: 'barbell-row', targetSets: 3, targetReps: '8–10', targetRPE: 8 },
        { exerciseId: 'barbell-curl', targetSets: 3, targetReps: '8–10', targetRPE: 9 },
        { exerciseId: 'face-pull', targetSets: 3, targetReps: '12–15', targetRPE: 8 },
      ],
    },
    wed: {
      label: 'Legs A',
      items: [
        { exerciseId: 'back-squat', targetSets: 4, targetReps: '5–6', targetRPE: 8 },
        { exerciseId: 'rdl', targetSets: 3, targetReps: '8–10', targetRPE: 8 },
        { exerciseId: 'leg-press', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
        { exerciseId: 'leg-curl', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
        { exerciseId: 'standing-calf-raise', targetSets: 4, targetReps: '10–15', targetRPE: 9 },
      ],
    },
    thu: {
      label: 'Push B',
      items: [
        { exerciseId: 'ohp', targetSets: 4, targetReps: '5–6', targetRPE: 8 },
        { exerciseId: 'bench-press', targetSets: 3, targetReps: '8–10', targetRPE: 8 },
        { exerciseId: 'cable-fly', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
        { exerciseId: 'lateral-raise', targetSets: 4, targetReps: '12–20', targetRPE: 9 },
        { exerciseId: 'overhead-tricep-ext', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
      ],
    },
    fri: {
      label: 'Pull B',
      items: [
        { exerciseId: 'barbell-row', targetSets: 4, targetReps: '5–6', targetRPE: 8 },
        { exerciseId: 'seated-cable-row', targetSets: 3, targetReps: '10–12', targetRPE: 8 },
        { exerciseId: 'pullup', targetSets: 3, targetReps: '8–12', targetRPE: 9 },
        { exerciseId: 'incline-curl', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
        { exerciseId: 'hammer-curl', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
        { exerciseId: 'face-the-wall-shrug', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
      ],
    },
    sat: {
      label: 'Legs B',
      items: [
        { exerciseId: 'front-squat', targetSets: 3, targetReps: '6–8', targetRPE: 8 },
        { exerciseId: 'rdl', targetSets: 3, targetReps: '8–10', targetRPE: 8 },
        { exerciseId: 'walking-lunge', targetSets: 3, targetReps: '20 steps', targetRPE: 9 },
        { exerciseId: 'leg-curl', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
        { exerciseId: 'standing-calf-raise', targetSets: 4, targetReps: '15–20', targetRPE: 9 },
        { exerciseId: 'hanging-leg-raise', targetSets: 3, targetReps: '8–12', targetRPE: 9 },
      ],
    },
    sun: null,
  },
}

export const DEFAULT_SETTINGS = {
  id: 1 as const,
  units: 'kg' as const,
  defaultRestSec: 90,
  goalNotes:
    'Bulk: gain ~0.25 kg / week. Push every working set to RPE 8 and add load when you hit the top of the rep range two sessions in a row.',
}
