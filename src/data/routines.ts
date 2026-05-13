import type { Routine } from '../db/schema'

export const PRESET_ROUTINES: Routine[] = [
  {
    id: 'ppl-6day',
    name: 'Push / Pull / Legs (6-day)',
    description:
      'High-volume bulking split. Each muscle hit twice a week. Best when you can train 6 days; cycle A→B→C→A→B→C.',
    builtIn: true,
    workouts: [
      {
        id: 'ppl-push-a',
        name: 'Push A',
        items: [
          { exerciseId: 'bench-press', targetSets: 4, targetReps: '5–6', targetRPE: 8 },
          { exerciseId: 'incline-db-press', targetSets: 3, targetReps: '8–10', targetRPE: 8 },
          { exerciseId: 'ohp', targetSets: 3, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'lateral-raise', targetSets: 4, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'tricep-pushdown', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
        ],
      },
      {
        id: 'ppl-pull-a',
        name: 'Pull A',
        items: [
          { exerciseId: 'deadlift', targetSets: 3, targetReps: '3–5', targetRPE: 8 },
          { exerciseId: 'pullup', targetSets: 4, targetReps: '6–10', targetRPE: 8 },
          { exerciseId: 'barbell-row', targetSets: 3, targetReps: '8–10', targetRPE: 8 },
          { exerciseId: 'barbell-curl', targetSets: 3, targetReps: '8–10', targetRPE: 9 },
          { exerciseId: 'face-pull', targetSets: 3, targetReps: '12–15', targetRPE: 8 },
        ],
      },
      {
        id: 'ppl-legs-a',
        name: 'Legs A',
        items: [
          { exerciseId: 'back-squat', targetSets: 4, targetReps: '5–6', targetRPE: 8 },
          { exerciseId: 'rdl', targetSets: 3, targetReps: '8–10', targetRPE: 8 },
          { exerciseId: 'leg-press', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'leg-curl', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'standing-calf-raise', targetSets: 4, targetReps: '10–15', targetRPE: 9 },
        ],
      },
      {
        id: 'ppl-push-b',
        name: 'Push B',
        items: [
          { exerciseId: 'ohp', targetSets: 4, targetReps: '5–6', targetRPE: 8 },
          { exerciseId: 'bench-press', targetSets: 3, targetReps: '8–10', targetRPE: 8 },
          { exerciseId: 'cable-fly', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'lateral-raise', targetSets: 4, targetReps: '12–20', targetRPE: 9 },
          { exerciseId: 'overhead-tricep-ext', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
        ],
      },
      {
        id: 'ppl-pull-b',
        name: 'Pull B',
        items: [
          { exerciseId: 'barbell-row', targetSets: 4, targetReps: '5–6', targetRPE: 8 },
          { exerciseId: 'seated-cable-row', targetSets: 3, targetReps: '10–12', targetRPE: 8 },
          { exerciseId: 'pullup', targetSets: 3, targetReps: '8–12', targetRPE: 9 },
          { exerciseId: 'incline-curl', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'hammer-curl', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'db-shrug', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
        ],
      },
      {
        id: 'ppl-legs-b',
        name: 'Legs B',
        items: [
          { exerciseId: 'front-squat', targetSets: 3, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'rdl', targetSets: 3, targetReps: '8–10', targetRPE: 8 },
          { exerciseId: 'walking-lunge', targetSets: 3, targetReps: '20 steps', targetRPE: 9 },
          { exerciseId: 'leg-curl', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'standing-calf-raise', targetSets: 4, targetReps: '15–20', targetRPE: 9 },
          { exerciseId: 'hanging-leg-raise', targetSets: 3, targetReps: '8–12', targetRPE: 9 },
        ],
      },
    ],
  },
  {
    id: 'upper-lower-4day',
    name: 'Upper / Lower (4-day)',
    description:
      'Time-efficient 4-day split. Each muscle hit twice a week. Cycle U1 → L1 → U2 → L2 → repeat.',
    builtIn: true,
    workouts: [
      {
        id: 'ul-upper-1',
        name: 'Upper 1 (heavy)',
        items: [
          { exerciseId: 'bench-press', targetSets: 4, targetReps: '4–6', targetRPE: 8 },
          { exerciseId: 'barbell-row', targetSets: 4, targetReps: '5–6', targetRPE: 8 },
          { exerciseId: 'ohp', targetSets: 3, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'pullup', targetSets: 3, targetReps: '6–10', targetRPE: 8 },
          { exerciseId: 'barbell-curl', targetSets: 3, targetReps: '8–10', targetRPE: 9 },
          { exerciseId: 'tricep-pushdown', targetSets: 3, targetReps: '8–10', targetRPE: 9 },
        ],
      },
      {
        id: 'ul-lower-1',
        name: 'Lower 1 (heavy)',
        items: [
          { exerciseId: 'back-squat', targetSets: 4, targetReps: '5–6', targetRPE: 8 },
          { exerciseId: 'rdl', targetSets: 3, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'leg-press', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'leg-curl', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'standing-calf-raise', targetSets: 4, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'plank', targetSets: 3, targetReps: '45 sec', targetRPE: 8 },
        ],
      },
      {
        id: 'ul-upper-2',
        name: 'Upper 2 (hypertrophy)',
        items: [
          { exerciseId: 'incline-db-press', targetSets: 4, targetReps: '8–12', targetRPE: 8 },
          { exerciseId: 'seated-cable-row', targetSets: 4, targetReps: '10–12', targetRPE: 8 },
          { exerciseId: 'lateral-raise', targetSets: 4, targetReps: '12–20', targetRPE: 9 },
          { exerciseId: 'face-pull', targetSets: 3, targetReps: '12–15', targetRPE: 8 },
          { exerciseId: 'incline-curl', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'overhead-tricep-ext', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
        ],
      },
      {
        id: 'ul-lower-2',
        name: 'Lower 2 (hypertrophy)',
        items: [
          { exerciseId: 'front-squat', targetSets: 3, targetReps: '8–10', targetRPE: 8 },
          { exerciseId: 'walking-lunge', targetSets: 3, targetReps: '20 steps', targetRPE: 9 },
          { exerciseId: 'rdl', targetSets: 3, targetReps: '10–12', targetRPE: 8 },
          { exerciseId: 'leg-curl', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'standing-calf-raise', targetSets: 4, targetReps: '15–20', targetRPE: 9 },
          { exerciseId: 'hanging-leg-raise', targetSets: 3, targetReps: '8–12', targetRPE: 9 },
        ],
      },
    ],
  },
  {
    id: 'full-body-3day',
    name: 'Full Body (3-day)',
    description:
      'One full-body workout, three times a week. Best for early bulkers or busy weeks — high frequency, manageable volume per session.',
    builtIn: true,
    workouts: [
      {
        id: 'fb-a',
        name: 'Full Body A',
        items: [
          { exerciseId: 'back-squat', targetSets: 3, targetReps: '5–6', targetRPE: 8 },
          { exerciseId: 'bench-press', targetSets: 3, targetReps: '5–6', targetRPE: 8 },
          { exerciseId: 'barbell-row', targetSets: 3, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'lateral-raise', targetSets: 2, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'barbell-curl', targetSets: 2, targetReps: '8–10', targetRPE: 9 },
        ],
      },
      {
        id: 'fb-b',
        name: 'Full Body B',
        items: [
          { exerciseId: 'deadlift', targetSets: 2, targetReps: '3–5', targetRPE: 8 },
          { exerciseId: 'ohp', targetSets: 3, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'pullup', targetSets: 3, targetReps: '6–10', targetRPE: 8 },
          { exerciseId: 'leg-press', targetSets: 2, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'standing-calf-raise', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
        ],
      },
      {
        id: 'fb-c',
        name: 'Full Body C',
        items: [
          { exerciseId: 'front-squat', targetSets: 3, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'incline-db-press', targetSets: 3, targetReps: '8–10', targetRPE: 8 },
          { exerciseId: 'seated-cable-row', targetSets: 3, targetReps: '8–12', targetRPE: 8 },
          { exerciseId: 'rdl', targetSets: 2, targetReps: '8–10', targetRPE: 8 },
          { exerciseId: 'hammer-curl', targetSets: 2, targetReps: '10–12', targetRPE: 9 },
        ],
      },
    ],
  },
  {
    id: 'beginner-lp',
    name: 'Beginner Linear Progression',
    description:
      'Three full-body workouts a week. Add 2.5 kg every session until you stall. Built for first 3–6 months of training.',
    builtIn: true,
    workouts: [
      {
        id: 'lp-a',
        name: 'Workout A',
        items: [
          { exerciseId: 'back-squat', targetSets: 3, targetReps: '5', targetRPE: 8 },
          { exerciseId: 'bench-press', targetSets: 3, targetReps: '5', targetRPE: 8 },
          { exerciseId: 'barbell-row', targetSets: 3, targetReps: '5', targetRPE: 8 },
        ],
      },
      {
        id: 'lp-b',
        name: 'Workout B',
        items: [
          { exerciseId: 'back-squat', targetSets: 3, targetReps: '5', targetRPE: 8 },
          { exerciseId: 'ohp', targetSets: 3, targetReps: '5', targetRPE: 8 },
          { exerciseId: 'deadlift', targetSets: 1, targetReps: '5', targetRPE: 8 },
        ],
      },
    ],
  },
  {
    id: 'bro-split',
    name: 'Bro Split (5-day)',
    description:
      'One muscle group per day. High volume per session, low frequency. Old-school bodybuilding. Cycle Mon–Fri, weekends off.',
    builtIn: true,
    workouts: [
      {
        id: 'bro-chest',
        name: 'Chest day',
        items: [
          { exerciseId: 'bench-press', targetSets: 4, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'incline-db-press', targetSets: 4, targetReps: '8–10', targetRPE: 8 },
          { exerciseId: 'cable-fly', targetSets: 4, targetReps: '12–15', targetRPE: 9 },
        ],
      },
      {
        id: 'bro-back',
        name: 'Back day',
        items: [
          { exerciseId: 'deadlift', targetSets: 3, targetReps: '4–6', targetRPE: 8 },
          { exerciseId: 'pullup', targetSets: 4, targetReps: '6–10', targetRPE: 8 },
          { exerciseId: 'barbell-row', targetSets: 4, targetReps: '8–10', targetRPE: 8 },
          { exerciseId: 'seated-cable-row', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'face-pull', targetSets: 3, targetReps: '12–15', targetRPE: 8 },
        ],
      },
      {
        id: 'bro-shoulders',
        name: 'Shoulder day',
        items: [
          { exerciseId: 'ohp', targetSets: 4, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'lateral-raise', targetSets: 5, targetReps: '12–20', targetRPE: 9 },
          { exerciseId: 'face-pull', targetSets: 3, targetReps: '12–15', targetRPE: 8 },
          { exerciseId: 'db-shrug', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
        ],
      },
      {
        id: 'bro-arms',
        name: 'Arm day',
        items: [
          { exerciseId: 'barbell-curl', targetSets: 4, targetReps: '8–10', targetRPE: 8 },
          { exerciseId: 'incline-curl', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'hammer-curl', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'tricep-pushdown', targetSets: 4, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'overhead-tricep-ext', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
        ],
      },
      {
        id: 'bro-legs',
        name: 'Leg day',
        items: [
          { exerciseId: 'back-squat', targetSets: 4, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'rdl', targetSets: 3, targetReps: '8–10', targetRPE: 8 },
          { exerciseId: 'leg-press', targetSets: 4, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'leg-curl', targetSets: 4, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'standing-calf-raise', targetSets: 4, targetReps: '12–20', targetRPE: 9 },
        ],
      },
    ],
  },
]

export const DEFAULT_ACTIVE_ROUTINE_ID = 'ppl-6day'
