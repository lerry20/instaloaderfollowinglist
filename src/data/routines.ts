import type { Routine } from '../db/schema'

export const PRESET_ROUTINES: Routine[] = [
  // ─────────────────── BEGINNER ───────────────────
  {
    id: 'beginner-lp',
    name: 'Beginner Strength + Hypertrophy (3-day)',
    description:
      'Compound lifts three days a week, alternating workouts A and B. Linear progression — add 2.5 kg each session you can complete clean.',
    builtIn: true,
    level: 'beginner',
    daysPerWeek: 3,
    focus: 'balanced',
    weeksInBlock: 12,
    archetypeNote: {
      whyItWorks:
        'For brand-new lifters, simply adding weight every session is the fastest possible progress. Compound lifts only — they build the most muscle per minute. Arm work added so you grow, not just get strong.',
      whoShouldnt:
        'Skip this if you can already squat your bodyweight cleanly. You\'ll outgrow linear progression in weeks — move to Upper / Lower 4× or PPL 6×.',
    },
    workouts: [
      {
        id: 'lp-a',
        name: 'Workout A',
        items: [
          { exerciseId: 'back-squat', targetSets: 3, targetReps: '5', targetRPE: 8 },
          { exerciseId: 'bench-press', targetSets: 3, targetReps: '5', targetRPE: 8 },
          { exerciseId: 'barbell-row', targetSets: 3, targetReps: '8', targetRPE: 8 },
          { exerciseId: 'hammer-curl', targetSets: 2, targetReps: '10', targetRPE: 9 },
          { exerciseId: 'tricep-pushdown', targetSets: 2, targetReps: '10', targetRPE: 9 },
        ],
      },
      {
        id: 'lp-b',
        name: 'Workout B',
        items: [
          { exerciseId: 'back-squat', targetSets: 3, targetReps: '5', targetRPE: 8 },
          { exerciseId: 'ohp', targetSets: 3, targetReps: '5', targetRPE: 8 },
          { exerciseId: 'deadlift', targetSets: 1, targetReps: '5', targetRPE: 8 },
          { exerciseId: 'pullup', targetSets: 3, targetReps: 'AMRAP', targetRPE: 9 },
          { exerciseId: 'barbell-curl', targetSets: 2, targetReps: '10', targetRPE: 9 },
        ],
      },
    ],
  },

  // ─────────────────── 3-DAY FULL BODY ───────────────────
  {
    id: 'full-body-3day',
    name: 'Full Body 3×',
    description:
      'Three different full-body sessions (A, B, C) hit every muscle once a week. Best when your week is unpredictable.',
    builtIn: true,
    level: 'beginner',
    daysPerWeek: 3,
    focus: 'balanced',
    weeksInBlock: 12,
    archetypeNote: {
      whyItWorks:
        'Three days a week, every muscle hit once — enough to hold size, simple enough to never skip. Three different sessions keep it interesting.',
      whoShouldnt:
        'If you can honestly train 4+ days/week, Upper/Lower or PPL will grow more muscle. This is a holding pattern for busy weeks, not a growth program.',
    },
    workouts: [
      {
        id: 'fb-a',
        name: 'Full Body A — Chest / Back',
        items: [
          { exerciseId: 'bench-press', targetSets: 3, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'barbell-row', targetSets: 3, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'back-squat', targetSets: 3, targetReps: '5–6', targetRPE: 8 },
          { exerciseId: 'incline-db-press', targetSets: 2, targetReps: '10', targetRPE: 9 },
          { exerciseId: 'pullup', targetSets: 2, targetReps: 'AMRAP', targetRPE: 9 },
        ],
      },
      {
        id: 'fb-b',
        name: 'Full Body B — Legs / Shoulders',
        items: [
          { exerciseId: 'back-squat', targetSets: 3, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'ohp', targetSets: 3, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'rdl', targetSets: 3, targetReps: '8–10', targetRPE: 8 },
          { exerciseId: 'lateral-raise', targetSets: 3, targetReps: '15', targetRPE: 9 },
          { exerciseId: 'tricep-pushdown', targetSets: 2, targetReps: '12', targetRPE: 9 },
        ],
      },
      {
        id: 'fb-c',
        name: 'Full Body C — Pull / Push',
        items: [
          { exerciseId: 'deadlift', targetSets: 3, targetReps: '3–5', targetRPE: 8 },
          { exerciseId: 'incline-bench', targetSets: 3, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'front-squat', targetSets: 3, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'chin-up', targetSets: 3, targetReps: 'AMRAP', targetRPE: 9 },
          { exerciseId: 'barbell-curl', targetSets: 2, targetReps: '10', targetRPE: 9 },
        ],
      },
    ],
  },

  // ─────────────────── UPPER / LOWER 4-DAY ───────────────────
  {
    id: 'upper-lower-4day',
    name: 'Upper / Lower 4×',
    description:
      'Four days a week — heavy upper, heavy lower, pump upper, pump lower. Every muscle 2×/week.',
    builtIn: true,
    level: 'intermediate',
    daysPerWeek: 4,
    focus: 'balanced',
    weeksInBlock: 12,
    archetypeNote: {
      whyItWorks:
        'Each muscle is trained twice a week — the proven sweet spot for hypertrophy. Heavy days build strength, pump days build size. Manageable if you have a job.',
      whoShouldnt:
        'If you can train 6 days a week, PPL gives you more total weekly volume with the same per-session intensity. If you can only train 3 days, drop to Full Body 3×.',
    },
    workouts: [
      {
        id: 'ul-upper-heavy',
        name: 'Upper Heavy',
        items: [
          { exerciseId: 'bench-press', targetSets: 4, targetReps: '5–6', targetRPE: 8 },
          { exerciseId: 'barbell-row', targetSets: 4, targetReps: '5–6', targetRPE: 8 },
          { exerciseId: 'ohp', targetSets: 3, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'pullup', targetSets: 3, targetReps: '6–10', targetRPE: 8 },
          { exerciseId: 'barbell-curl', targetSets: 3, targetReps: '8', targetRPE: 9 },
          { exerciseId: 'skullcrusher', targetSets: 3, targetReps: '8', targetRPE: 9 },
        ],
      },
      {
        id: 'ul-lower-heavy',
        name: 'Lower Heavy',
        items: [
          { exerciseId: 'back-squat', targetSets: 4, targetReps: '5–6', targetRPE: 8 },
          { exerciseId: 'rdl', targetSets: 3, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'leg-press', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'leg-curl', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'standing-calf-raise', targetSets: 4, targetReps: '10–12', targetRPE: 9 },
        ],
      },
      {
        id: 'ul-upper-hyper',
        name: 'Upper Hypertrophy',
        items: [
          { exerciseId: 'incline-db-press', targetSets: 4, targetReps: '8–12', targetRPE: 8 },
          { exerciseId: 'seated-cable-row', targetSets: 4, targetReps: '10–12', targetRPE: 8 },
          { exerciseId: 'seated-db-press', targetSets: 3, targetReps: '8–12', targetRPE: 9 },
          { exerciseId: 'lat-pulldown', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'lateral-raise', targetSets: 4, targetReps: '12–20', targetRPE: 9 },
          { exerciseId: 'face-pull', targetSets: 3, targetReps: '15', targetRPE: 8 },
          { exerciseId: 'incline-curl', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'overhead-tricep-ext', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
        ],
      },
      {
        id: 'ul-lower-hyper',
        name: 'Lower Hypertrophy',
        items: [
          { exerciseId: 'front-squat', targetSets: 3, targetReps: '8–10', targetRPE: 8 },
          { exerciseId: 'split-squat', targetSets: 3, targetReps: '10/leg', targetRPE: 9 },
          { exerciseId: 'seated-leg-curl', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'hip-thrust', targetSets: 3, targetReps: '10–12', targetRPE: 8 },
          { exerciseId: 'standing-calf-raise', targetSets: 4, targetReps: '15–20', targetRPE: 9 },
          { exerciseId: 'hanging-leg-raise', targetSets: 3, targetReps: '10–15', targetRPE: 9 },
        ],
      },
    ],
  },

  // ─────────────────── PHUL 4-DAY ───────────────────
  {
    id: 'phul-4day',
    name: 'PHUL 4×',
    description:
      'Two heavy strength days (3–5 reps) + two hypertrophy days (8–15 reps). Strength and size in the same week.',
    builtIn: true,
    level: 'intermediate',
    daysPerWeek: 4,
    focus: 'balanced',
    weeksInBlock: 12,
    archetypeNote: {
      whyItWorks:
        'The mix most intermediates need once linear progression stops working. Heavy days drive strength, pump days drive hypertrophy — both in the same week.',
      whoShouldnt:
        'If you only care about size, Upper/Lower or PPL grow more muscle. If you only care about strength, run a dedicated powerlifting program.',
    },
    workouts: [
      {
        id: 'phul-power-upper',
        name: 'Power Upper',
        items: [
          { exerciseId: 'bench-press', targetSets: 4, targetReps: '3–5', targetRPE: 8 },
          { exerciseId: 'barbell-row', targetSets: 4, targetReps: '3–5', targetRPE: 8 },
          { exerciseId: 'ohp', targetSets: 3, targetReps: '5–6', targetRPE: 8 },
          { exerciseId: 'pullup', targetSets: 3, targetReps: '6–10', targetRPE: 8 },
          { exerciseId: 'close-grip-bench', targetSets: 2, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'barbell-curl', targetSets: 2, targetReps: '6–8', targetRPE: 8 },
        ],
      },
      {
        id: 'phul-power-lower',
        name: 'Power Lower',
        items: [
          { exerciseId: 'back-squat', targetSets: 4, targetReps: '3–5', targetRPE: 8 },
          { exerciseId: 'deadlift', targetSets: 3, targetReps: '3–5', targetRPE: 8 },
          { exerciseId: 'leg-press', targetSets: 3, targetReps: '8–10', targetRPE: 8 },
          { exerciseId: 'standing-calf-raise', targetSets: 4, targetReps: '8–10', targetRPE: 8 },
        ],
      },
      {
        id: 'phul-hyper-upper',
        name: 'Hypertrophy Upper',
        items: [
          { exerciseId: 'incline-db-press', targetSets: 4, targetReps: '8–12', targetRPE: 9 },
          { exerciseId: 'lat-pulldown', targetSets: 4, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'cable-fly', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'seated-cable-row', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'lateral-raise', targetSets: 4, targetReps: '15', targetRPE: 9 },
          { exerciseId: 'cable-curl', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'tricep-pushdown', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
        ],
      },
      {
        id: 'phul-hyper-lower',
        name: 'Hypertrophy Lower',
        items: [
          { exerciseId: 'front-squat', targetSets: 3, targetReps: '8–10', targetRPE: 8 },
          { exerciseId: 'walking-lunge', targetSets: 3, targetReps: '10/leg', targetRPE: 9 },
          { exerciseId: 'rdl', targetSets: 3, targetReps: '10–12', targetRPE: 8 },
          { exerciseId: 'leg-extension', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'seated-calf-raise', targetSets: 4, targetReps: '15–20', targetRPE: 9 },
        ],
      },
    ],
  },

  // ─────────────────── PPL 6-DAY ───────────────────
  {
    id: 'ppl-6day',
    name: 'Push Pull Legs 6×',
    description:
      'The classic hypertrophy split. Push, pull, legs, repeat — each muscle 2×/week. A days heavier, B days pump-focused.',
    builtIn: true,
    level: 'intermediate',
    daysPerWeek: 6,
    focus: 'balanced',
    weeksInBlock: 16,
    archetypeNote: {
      whyItWorks:
        'The flagship hypertrophy split. Six days lets you spread volume across more sessions — same total weekly work, less per-session fatigue. Each muscle twice a week, the sweet spot for growth.',
      whoShouldnt:
        'If you can only train 4 days a week, Upper/Lower gives you the same 2×/week frequency without the under-recovery risk. Don\'t take this on if your real schedule is 3–4 days.',
    },
    workouts: [
      {
        id: 'ppl-push-a',
        name: 'Push A — Heavy',
        items: [
          { exerciseId: 'bench-press', targetSets: 4, targetReps: '5–6', targetRPE: 8 },
          { exerciseId: 'incline-db-press', targetSets: 3, targetReps: '8–10', targetRPE: 8 },
          { exerciseId: 'ohp', targetSets: 3, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'cable-fly', targetSets: 2, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'lateral-raise', targetSets: 4, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'tricep-pushdown', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
        ],
      },
      {
        id: 'ppl-pull-a',
        name: 'Pull A — Heavy',
        items: [
          { exerciseId: 'deadlift', targetSets: 3, targetReps: '3–5', targetRPE: 8 },
          { exerciseId: 'pullup', targetSets: 4, targetReps: '6–10', targetRPE: 8 },
          { exerciseId: 'barbell-row', targetSets: 3, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'face-pull', targetSets: 3, targetReps: '12–15', targetRPE: 8 },
          { exerciseId: 'barbell-curl', targetSets: 3, targetReps: '8–10', targetRPE: 9 },
          { exerciseId: 'hammer-curl', targetSets: 2, targetReps: '10–12', targetRPE: 9 },
        ],
      },
      {
        id: 'ppl-legs-a',
        name: 'Legs A — Quad focus',
        items: [
          { exerciseId: 'back-squat', targetSets: 4, targetReps: '5–6', targetRPE: 8 },
          { exerciseId: 'leg-press', targetSets: 3, targetReps: '8–10', targetRPE: 9 },
          { exerciseId: 'walking-lunge', targetSets: 3, targetReps: '10/leg', targetRPE: 9 },
          { exerciseId: 'leg-extension', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'standing-calf-raise', targetSets: 4, targetReps: '10–15', targetRPE: 9 },
          { exerciseId: 'hanging-leg-raise', targetSets: 3, targetReps: '8–12', targetRPE: 9 },
        ],
      },
      {
        id: 'ppl-push-b',
        name: 'Push B — Hypertrophy',
        items: [
          { exerciseId: 'incline-bench', targetSets: 4, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'seated-db-press', targetSets: 3, targetReps: '8–10', targetRPE: 8 },
          { exerciseId: 'chest-dip', targetSets: 3, targetReps: '8–12', targetRPE: 9 },
          { exerciseId: 'pec-deck', targetSets: 2, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'cable-lateral', targetSets: 4, targetReps: '15–20', targetRPE: 9 },
          { exerciseId: 'overhead-tricep-ext', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'skullcrusher', targetSets: 3, targetReps: '8–10', targetRPE: 9 },
        ],
      },
      {
        id: 'ppl-pull-b',
        name: 'Pull B — Hypertrophy',
        items: [
          { exerciseId: 'chin-up', targetSets: 4, targetReps: '6–10', targetRPE: 8 },
          { exerciseId: 't-bar-row', targetSets: 4, targetReps: '8–10', targetRPE: 8 },
          { exerciseId: 'lat-pulldown', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'straight-arm-pulldown', targetSets: 3, targetReps: '12', targetRPE: 9 },
          { exerciseId: 'rear-delt-fly', targetSets: 3, targetReps: '15', targetRPE: 9 },
          { exerciseId: 'incline-curl', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'preacher-curl', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
        ],
      },
      {
        id: 'ppl-legs-b',
        name: 'Legs B — Posterior chain',
        items: [
          { exerciseId: 'rdl', targetSets: 4, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'front-squat', targetSets: 3, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'hip-thrust', targetSets: 3, targetReps: '8–12', targetRPE: 8 },
          { exerciseId: 'seated-leg-curl', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'seated-calf-raise', targetSets: 4, targetReps: '15–20', targetRPE: 9 },
          { exerciseId: 'cable-crunch', targetSets: 3, targetReps: '15', targetRPE: 9 },
        ],
      },
    ],
  },

  // ─────────────────── ARNOLD VOLUME 5-DAY ───────────────────
  {
    id: 'arnold-5day',
    name: 'Arnold Volume 5×',
    description:
      'Pairs muscle groups (chest+back, shoulders+arms, legs). Heavy compounds → pump work. Brutal volume.',
    builtIn: true,
    level: 'advanced',
    daysPerWeek: 5,
    focus: 'balanced',
    weeksInBlock: 8,
    archetypeNote: {
      whyItWorks:
        'High-volume training for advanced lifters who recover well. Pairing muscle groups front-loads compound work and back-loads pump work — the structure that built classic-era physiques.',
      whoShouldnt:
        'Skip this if you sleep less than 7 hours, you\'re cutting calories, or you\'ve been training less than two years. The volume will overtrain you faster than you can adapt.',
    },
    workouts: [
      {
        id: 'arn-chest-back-a',
        name: 'Chest & Back A',
        items: [
          { exerciseId: 'bench-press', targetSets: 4, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'barbell-row', targetSets: 4, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'incline-db-press', targetSets: 3, targetReps: '8–10', targetRPE: 9 },
          { exerciseId: 'pullup', targetSets: 3, targetReps: '6–10', targetRPE: 8 },
          { exerciseId: 'pec-deck', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'seated-cable-row', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
        ],
      },
      {
        id: 'arn-shoulders-arms-a',
        name: 'Shoulders & Arms A',
        items: [
          { exerciseId: 'ohp', targetSets: 4, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'lateral-raise', targetSets: 4, targetReps: '15–20', targetRPE: 9 },
          { exerciseId: 'face-pull', targetSets: 3, targetReps: '15', targetRPE: 8 },
          { exerciseId: 'barbell-curl', targetSets: 4, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'close-grip-bench', targetSets: 4, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'hammer-curl', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'tricep-pushdown', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
        ],
      },
      {
        id: 'arn-legs',
        name: 'Legs',
        items: [
          { exerciseId: 'back-squat', targetSets: 4, targetReps: '5–8', targetRPE: 8 },
          { exerciseId: 'rdl', targetSets: 3, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'leg-press', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'leg-extension', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'leg-curl', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'standing-calf-raise', targetSets: 4, targetReps: '10–15', targetRPE: 9 },
          { exerciseId: 'seated-calf-raise', targetSets: 3, targetReps: '15–20', targetRPE: 9 },
        ],
      },
      {
        id: 'arn-chest-back-b',
        name: 'Chest & Back B',
        items: [
          { exerciseId: 'incline-bench', targetSets: 4, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'lat-pulldown', targetSets: 4, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'db-bench-press', targetSets: 3, targetReps: '8–10', targetRPE: 9 },
          { exerciseId: 't-bar-row', targetSets: 3, targetReps: '8–10', targetRPE: 9 },
          { exerciseId: 'cable-fly', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'db-pullover', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
        ],
      },
      {
        id: 'arn-shoulders-arms-b',
        name: 'Shoulders & Arms B',
        items: [
          { exerciseId: 'seated-db-press', targetSets: 4, targetReps: '8–10', targetRPE: 8 },
          { exerciseId: 'cable-lateral', targetSets: 4, targetReps: '15–20', targetRPE: 9 },
          { exerciseId: 'rear-delt-fly', targetSets: 3, targetReps: '15', targetRPE: 9 },
          { exerciseId: 'incline-curl', targetSets: 4, targetReps: '8–10', targetRPE: 9 },
          { exerciseId: 'skullcrusher', targetSets: 4, targetReps: '8–10', targetRPE: 9 },
          { exerciseId: 'preacher-curl', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'overhead-tricep-ext', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
        ],
      },
    ],
  },

  // ─────────────────── UPPER-FRONT SPECIALIZATION 2-DAY ───────────────────
  {
    id: 'upper-front-spec-2day',
    name: 'Chest + Shoulders Specialization 2×',
    description:
      'Two-day specialization block for chest, shoulders, biceps, abs. All three chest regions (upper / mid / lower) hit each session.',
    builtIn: true,
    level: 'intermediate',
    daysPerWeek: 2,
    focus: 'chest',
    weeksInBlock: 8,
    archetypeNote: {
      whyItWorks:
        'A short specialization block for bringing up chest, shoulders, biceps, and abs. Hits all three chest regions across each session — upper, mid, lower. Run for 6–8 weeks, then return to a balanced program.',
      whoShouldnt:
        'Not a long-term program. If you want a balanced physique, your back, glutes, and legs will lag on this. Use it as a focused block between Upper/Lower or PPL cycles.',
    },
    workouts: [
      {
        id: 'ufs-day-a',
        name: 'Day A — Chest (Lower + Mid) + Shoulders + Abs',
        items: [
          // Heaviest compound first: builds the most chest mass.
          { exerciseId: 'bench-press', targetSets: 4, targetReps: '5–6', targetRPE: 8 },
          // The lower-chest specialist. Lean FORWARD ~30° on the dip — that pulls the load
          // onto the lower-chest fibers. Upright = triceps.
          { exerciseId: 'chest-dip', targetSets: 4, targetReps: '6–10', targetRPE: 8 },
          // Upper-chest accessory so the upper region doesn't go untouched.
          { exerciseId: 'incline-db-press', targetSets: 3, targetReps: '8–10', targetRPE: 9 },
          // Stretched-position chest finisher. Cable fly hits the chest where dumbbells
          // run out of tension.
          { exerciseId: 'cable-fly', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          // Shoulder compound — front delts already got smashed by chest work, but the
          // overhead press hits side and front together for shoulder thickness.
          { exerciseId: 'ohp', targetSets: 3, targetReps: '6–8', targetRPE: 8 },
          // Side-delt isolation for shoulder width.
          { exerciseId: 'lateral-raise', targetSets: 4, targetReps: '12–20', targetRPE: 9 },
          // Loadable ab work — actually progresses over time, unlike bodyweight crunches.
          { exerciseId: 'cable-crunch', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          // Lower-abdominal emphasis.
          { exerciseId: 'hanging-leg-raise', targetSets: 3, targetReps: '8–12', targetRPE: 9 },
        ],
      },
      {
        id: 'ufs-day-b',
        name: 'Day B — Chest (Upper + Mid) + Biceps + Abs',
        items: [
          // Upper-chest specialist. Bench at 30° (steeper turns it into a shoulder press).
          { exerciseId: 'incline-bench', targetSets: 4, targetReps: '6–8', targetRPE: 8 },
          // Mid chest with a deeper stretch than the barbell gives.
          { exerciseId: 'db-bench-press', targetSets: 3, targetReps: '8–10', targetRPE: 9 },
          // Mid-chest pump. Pinned shoulders, no momentum.
          { exerciseId: 'pec-deck', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          // Lower-chest emphasis: set the cables HIGH and pull them down-and-in (high-to-low
          // fly). The downward angle biases the lower fibers.
          { exerciseId: 'cable-fly', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          // Rear delts: under-trained in chest-heavy splits. Keeps posture / shoulder health
          // intact.
          { exerciseId: 'rear-delt-fly', targetSets: 3, targetReps: '15', targetRPE: 9 },
          // Bicep mass builder.
          { exerciseId: 'barbell-curl', targetSets: 4, targetReps: '8–10', targetRPE: 8 },
          // Long head of the bicep — the part that creates the peak.
          { exerciseId: 'incline-curl', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          // Brachialis (underneath the bicep) — adds arm thickness fast.
          { exerciseId: 'hammer-curl', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          // Bracing-strength carryover for everything else.
          { exerciseId: 'plank', targetSets: 3, targetReps: '45 sec', targetRPE: 8 },
        ],
      },
    ],
  },

  // ─────────────────── 3-DAY PUSH/PULL/LEGS ───────────────────
  {
    id: 'ppl-3day',
    name: 'Push Pull Legs 3×',
    description:
      'PPL on a 3-day schedule. Each muscle once a week — but every session is focused, not full-body.',
    builtIn: true,
    level: 'intermediate',
    daysPerWeek: 3,
    focus: 'balanced',
    weeksInBlock: 12,
    archetypeNote: {
      whyItWorks:
        'When you only have 3 days but want the focus of PPL — each session covers one movement pattern instead of stretching across the body. Heavier compounds per session than a 3-day full body.',
      whoShouldnt:
        'If you can train 4+ days, the 6-day PPL gives every muscle 2×/week — much better for growth. This is the 3-day fallback.',
    },
    workouts: [
      {
        id: 'ppl3-push',
        name: 'Day 1 — Push',
        items: [
          { exerciseId: 'bench-press', targetSets: 4, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'incline-db-press', targetSets: 3, targetReps: '8–12', targetRPE: 8 },
          { exerciseId: 'lateral-raise', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'close-grip-bench', targetSets: 3, targetReps: '8–10', targetRPE: 8 },
          { exerciseId: 'tricep-pushdown', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
        ],
      },
      {
        id: 'ppl3-pull',
        name: 'Day 2 — Pull',
        items: [
          { exerciseId: 'pullup', targetSets: 3, targetReps: '6–10', targetRPE: 9 },
          { exerciseId: 'barbell-row', targetSets: 4, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'seated-cable-row', targetSets: 3, targetReps: '10–12', targetRPE: 8 },
          { exerciseId: 'face-pull', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'hammer-curl', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
        ],
      },
      {
        id: 'ppl3-legs',
        name: 'Day 3 — Legs',
        items: [
          { exerciseId: 'back-squat', targetSets: 4, targetReps: '5–8', targetRPE: 8 },
          { exerciseId: 'rdl', targetSets: 3, targetReps: '6–10', targetRPE: 8 },
          { exerciseId: 'leg-press', targetSets: 3, targetReps: '10–12', targetRPE: 8 },
          { exerciseId: 'leg-curl', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'standing-calf-raise', targetSets: 4, targetReps: '10–15', targetRPE: 9 },
        ],
      },
    ],
  },

  // ─────────────────── PUSH/PULL 4-DAY ───────────────────
  {
    id: 'push-pull-4day',
    name: 'Push / Pull 4×',
    description:
      'Alternating push and pull, four days a week. Quads & hamstrings sprinkled into each session.',
    builtIn: true,
    level: 'intermediate',
    daysPerWeek: 4,
    focus: 'balanced',
    weeksInBlock: 12,
    archetypeNote: {
      whyItWorks:
        'Simpler than PPL — no dedicated leg day, instead quads/hamstrings get sprinkled into the upper sessions. Lets you train each muscle group 2×/week with less complexity than splitting by movement.',
      whoShouldnt:
        'If you specifically want bigger legs, dedicated leg days (PPL or UL) will out-grow this. If you can only train 3 days, drop to PPL 3× or Full Body 3×.',
    },
    workouts: [
      {
        id: 'pp4-push-a',
        name: 'Day 1 — Push A',
        items: [
          { exerciseId: 'back-squat', targetSets: 4, targetReps: '5–8', targetRPE: 8 },
          { exerciseId: 'bench-press', targetSets: 4, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'ohp', targetSets: 3, targetReps: '6–10', targetRPE: 8 },
          { exerciseId: 'lateral-raise', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'tricep-pushdown', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
        ],
      },
      {
        id: 'pp4-pull-a',
        name: 'Day 2 — Pull A',
        items: [
          { exerciseId: 'deadlift', targetSets: 3, targetReps: '5', targetRPE: 8 },
          { exerciseId: 'pullup', targetSets: 4, targetReps: '6–10', targetRPE: 9 },
          { exerciseId: 'barbell-row', targetSets: 3, targetReps: '8–10', targetRPE: 8 },
          { exerciseId: 'barbell-curl', targetSets: 3, targetReps: '8–10', targetRPE: 9 },
          { exerciseId: 'face-pull', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
        ],
      },
      {
        id: 'pp4-push-b',
        name: 'Day 3 — Push B',
        items: [
          { exerciseId: 'front-squat', targetSets: 3, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'incline-db-press', targetSets: 4, targetReps: '8–12', targetRPE: 8 },
          { exerciseId: 'cable-lateral', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'leg-extension', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'close-grip-bench', targetSets: 3, targetReps: '8–10', targetRPE: 8 },
        ],
      },
      {
        id: 'pp4-pull-b',
        name: 'Day 4 — Pull B',
        items: [
          { exerciseId: 'rdl', targetSets: 4, targetReps: '6–10', targetRPE: 8 },
          { exerciseId: 'lat-pulldown', targetSets: 4, targetReps: '8–12', targetRPE: 8 },
          { exerciseId: 'seated-cable-row', targetSets: 3, targetReps: '10–12', targetRPE: 8 },
          { exerciseId: 'hammer-curl', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'leg-curl', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
        ],
      },
    ],
  },

  // ─────────────────── BRO SPLIT 5-DAY ───────────────────
  {
    id: 'bro-split-5day',
    name: 'Bro Split 5×',
    description:
      'One muscle group per day: chest, back, legs, shoulders, arms. The classic bodybuilder split.',
    builtIn: true,
    level: 'intermediate',
    daysPerWeek: 5,
    focus: 'balanced',
    weeksInBlock: 12,
    archetypeNote: {
      whyItWorks:
        'Each muscle gets a full session dedicated to it — high volume per workout, 7 days of recovery before hitting it again. Simple to understand: "today is chest day." Easy to remember exercises.',
      whoShouldnt:
        'Once-a-week frequency is below the hypertrophy sweet spot. If your goal is maximum growth and you can train 4+ days, Upper/Lower or PPL will out-grow this. Best used as a "I want to focus on one body part each day" preference, not for max gains.',
    },
    workouts: [
      {
        id: 'bro-chest',
        name: 'Day 1 — Chest',
        items: [
          { exerciseId: 'bench-press', targetSets: 4, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'incline-db-press', targetSets: 4, targetReps: '8–12', targetRPE: 8 },
          { exerciseId: 'cable-fly', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'pec-deck', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'chest-dip', targetSets: 3, targetReps: 'AMRAP', targetRPE: 9 },
        ],
      },
      {
        id: 'bro-back',
        name: 'Day 2 — Back',
        items: [
          { exerciseId: 'deadlift', targetSets: 3, targetReps: '5', targetRPE: 8 },
          { exerciseId: 'pullup', targetSets: 4, targetReps: '6–10', targetRPE: 9 },
          { exerciseId: 'barbell-row', targetSets: 4, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'lat-pulldown', targetSets: 3, targetReps: '10–12', targetRPE: 8 },
          { exerciseId: 'straight-arm-pulldown', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
        ],
      },
      {
        id: 'bro-legs',
        name: 'Day 3 — Legs',
        items: [
          { exerciseId: 'back-squat', targetSets: 4, targetReps: '5–8', targetRPE: 8 },
          { exerciseId: 'rdl', targetSets: 3, targetReps: '6–10', targetRPE: 8 },
          { exerciseId: 'leg-press', targetSets: 3, targetReps: '10–12', targetRPE: 8 },
          { exerciseId: 'leg-curl', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'standing-calf-raise', targetSets: 4, targetReps: '10–15', targetRPE: 9 },
        ],
      },
      {
        id: 'bro-shoulders',
        name: 'Day 4 — Shoulders',
        items: [
          { exerciseId: 'ohp', targetSets: 4, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'lateral-raise', targetSets: 4, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'rear-delt-fly', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'face-pull', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'db-shrug', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
        ],
      },
      {
        id: 'bro-arms',
        name: 'Day 5 — Arms',
        items: [
          { exerciseId: 'barbell-curl', targetSets: 4, targetReps: '8–10', targetRPE: 9 },
          { exerciseId: 'close-grip-bench', targetSets: 4, targetReps: '8–10', targetRPE: 8 },
          { exerciseId: 'hammer-curl', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'tricep-pushdown', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'cable-curl', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'overhead-tricep-ext', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
        ],
      },
    ],
  },

  // ─────────────────── BACK FOCUS 4-DAY ───────────────────
  {
    id: 'back-focus-4day',
    name: 'Back Focus 4×',
    description:
      'Two back-emphasis days for width and thickness. One push, one legs. Bring up a lagging back.',
    builtIn: true,
    level: 'intermediate',
    daysPerWeek: 4,
    focus: 'back',
    weeksInBlock: 8,
    archetypeNote: {
      whyItWorks:
        'Two dedicated back sessions per week, separated by movement pattern: one width day (vertical pulls — pull-ups, lat pulldowns) and one thickness day (horizontal pulls — rows, deadlifts). The fastest way to bring up a back that\'s falling behind.',
      whoShouldnt:
        'Not a long-term program. Run for 6–8 weeks while back catches up, then return to a balanced program. Your chest and shoulders get less work here.',
    },
    workouts: [
      {
        id: 'bf4-back-width',
        name: 'Day 1 — Back Width',
        items: [
          { exerciseId: 'pullup', targetSets: 4, targetReps: '6–10', targetRPE: 9 },
          { exerciseId: 'lat-pulldown', targetSets: 4, targetReps: '8–12', targetRPE: 8 },
          { exerciseId: 'straight-arm-pulldown', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'barbell-curl', targetSets: 3, targetReps: '8–10', targetRPE: 9 },
          { exerciseId: 'hammer-curl', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
        ],
      },
      {
        id: 'bf4-push',
        name: 'Day 2 — Push',
        items: [
          { exerciseId: 'bench-press', targetSets: 4, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'ohp', targetSets: 3, targetReps: '6–10', targetRPE: 8 },
          { exerciseId: 'incline-db-press', targetSets: 3, targetReps: '8–12', targetRPE: 8 },
          { exerciseId: 'lateral-raise', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'tricep-pushdown', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
        ],
      },
      {
        id: 'bf4-back-thickness',
        name: 'Day 3 — Back Thickness',
        items: [
          { exerciseId: 'deadlift', targetSets: 3, targetReps: '5', targetRPE: 8 },
          { exerciseId: 'barbell-row', targetSets: 4, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 't-bar-row', targetSets: 3, targetReps: '8–10', targetRPE: 8 },
          { exerciseId: 'seated-cable-row', targetSets: 3, targetReps: '10–12', targetRPE: 8 },
          { exerciseId: 'face-pull', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'db-shrug', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
        ],
      },
      {
        id: 'bf4-legs',
        name: 'Day 4 — Legs',
        items: [
          { exerciseId: 'back-squat', targetSets: 4, targetReps: '5–8', targetRPE: 8 },
          { exerciseId: 'rdl', targetSets: 3, targetReps: '6–10', targetRPE: 8 },
          { exerciseId: 'leg-press', targetSets: 3, targetReps: '10–12', targetRPE: 8 },
          { exerciseId: 'leg-curl', targetSets: 2, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'standing-calf-raise', targetSets: 3, targetReps: '10–15', targetRPE: 9 },
        ],
      },
    ],
  },

  // ─────────────────── LOWER BODY FOCUS 4-DAY ───────────────────
  {
    id: 'lower-focus-4day',
    name: 'Lower Body Focus 4×',
    description:
      'Two quad-heavy days, two posterior-chain days. Hits glutes, hamstrings, and quads from every angle.',
    builtIn: true,
    level: 'intermediate',
    daysPerWeek: 4,
    focus: 'legs',
    weeksInBlock: 8,
    archetypeNote: {
      whyItWorks:
        'Two dedicated leg sessions: one quad-focused (squat, leg press, extensions) and one posterior-focused (deadlift, RDL, hip thrust, leg curl). Two lighter upper-body sessions cover maintenance. Best for building legs and glutes specifically.',
      whoShouldnt:
        'Your chest, back, and arms will lag on this — they get half the volume of a balanced program. Run as a specialization block (6–8 weeks), not as your default.',
    },
    workouts: [
      {
        id: 'lf4-quad',
        name: 'Day 1 — Quad Focus',
        items: [
          { exerciseId: 'back-squat', targetSets: 4, targetReps: '5–8', targetRPE: 8 },
          { exerciseId: 'front-squat', targetSets: 3, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'leg-press', targetSets: 3, targetReps: '10–12', targetRPE: 8 },
          { exerciseId: 'leg-extension', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'standing-calf-raise', targetSets: 3, targetReps: '10–15', targetRPE: 9 },
        ],
      },
      {
        id: 'lf4-push',
        name: 'Day 2 — Push (light)',
        items: [
          { exerciseId: 'bench-press', targetSets: 3, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'ohp', targetSets: 3, targetReps: '6–10', targetRPE: 8 },
          { exerciseId: 'lateral-raise', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
          { exerciseId: 'tricep-pushdown', targetSets: 3, targetReps: '12–15', targetRPE: 9 },
        ],
      },
      {
        id: 'lf4-posterior',
        name: 'Day 3 — Posterior Chain',
        items: [
          { exerciseId: 'deadlift', targetSets: 3, targetReps: '5', targetRPE: 8 },
          { exerciseId: 'rdl', targetSets: 4, targetReps: '6–10', targetRPE: 8 },
          { exerciseId: 'hip-thrust', targetSets: 4, targetReps: '8–12', targetRPE: 8 },
          { exerciseId: 'leg-curl', targetSets: 3, targetReps: '10–12', targetRPE: 9 },
          { exerciseId: 'seated-calf-raise', targetSets: 4, targetReps: '12–15', targetRPE: 9 },
        ],
      },
      {
        id: 'lf4-pull',
        name: 'Day 4 — Pull (light)',
        items: [
          { exerciseId: 'pullup', targetSets: 3, targetReps: '6–10', targetRPE: 9 },
          { exerciseId: 'barbell-row', targetSets: 3, targetReps: '6–8', targetRPE: 8 },
          { exerciseId: 'lat-pulldown', targetSets: 3, targetReps: '10–12', targetRPE: 8 },
          { exerciseId: 'barbell-curl', targetSets: 3, targetReps: '8–10', targetRPE: 9 },
        ],
      },
    ],
  },
]

export const DEFAULT_ACTIVE_ROUTINE_ID = 'ppl-6day'
