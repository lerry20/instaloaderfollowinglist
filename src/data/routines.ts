import type { Routine } from '../db/schema'

export const PRESET_ROUTINES: Routine[] = [
  // ─────────────────── BEGINNER ───────────────────
  {
    id: 'beginner-lp',
    name: 'Beginner Strength + Hypertrophy (3-day)',
    description:
      'Best for: your first 3–6 months of training. Train 3 days a week. Workouts alternate A → B → A → B. Each session you add 2.5 kg to the main lifts until you can\'t — that\'s how fast beginners get stronger. Arm work added so you actually grow muscle, not just get stronger. Skip if: you can already squat 1× bodyweight clean — move to Upper/Lower or PPL.',
    builtIn: true,
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
    name: 'Full Body (3-day)',
    description:
      'Best for: busy weeks when you can only train 3 days but still want to hit every muscle. Three different sessions (A, B, C) so it doesn\'t get stale. Each muscle gets one good workout per week — enough to hold size, less than ideal for growth. Skip if: you can train 4+ days a week — Upper/Lower or PPL will grow more muscle.',
    builtIn: true,
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
    name: 'Upper / Lower for size (4-day)',
    description:
      'Best for: intermediate lifters who can train 4 days a week. Each muscle gets worked twice a week (proven sweet spot for growth). Two heavy days build strength; two pump days build size. Cycle: heavy upper → heavy lower → pump upper → pump lower. Skip if: you can train 6 days — PPL hits each muscle twice AND lets you spread the workload further.',
    builtIn: true,
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
    name: 'PHUL — Strength + size (4-day)',
    description:
      'Best for: intermediate lifters who want to gain muscle AND get stronger at the same time. Two heavy strength days (3–5 reps, big compounds) + two pump days (8–15 reps, isolation work). The mix that most intermediates need once "add 2.5 kg every session" stops working. Skip if: you only care about size (use Upper/Lower or PPL) or only about strength (use a powerlifting program).',
    builtIn: true,
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
    name: 'Push / Pull / Legs for size (6-day)',
    description:
      'Best for: intermediate / advanced lifters chasing muscle size, training 5–6 days a week. The classic bulker\'s split. Each muscle hit twice a week (proven sweet spot for growth). A days are heavier (5–8 reps); B days are lighter and pump-focused (8–15 reps). The flagship for serious muscle gain — but only if you can show up consistently. Skip if: you can train 4 or fewer days a week — use Upper/Lower instead, or you\'ll under-recover.',
    builtIn: true,
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
    name: 'Arnold Volume Split (5-day, high volume)',
    description:
      'Best for: advanced lifters who already train 5+ days a week and recover well. Pairs muscle groups (chest+back, shoulders+arms, legs, then repeat A+B). Heavy compounds up front, lots of pump work at the end. The volume is brutal — every session is 60–90 minutes. Skip if: your sleep is under 7 hours, you\'re not getting enough calories, or you\'ve been training less than a year — you\'ll over-train fast.',
    builtIn: true,
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
    name: 'Chest + Shoulders + Arms focus (2-day)',
    description:
      'Best for: 6–8 week focused blocks when you want to bring up your chest, shoulders, biceps, and abs specifically. Hits all three chest regions across two days (upper, mid, AND lower — lower is the part most splits miss). Each muscle trained twice a week. Lower-chest emphasis comes from chest dips (forward lean) and the high-to-low cable fly angle. Skip if: you want a balanced program — your back, glutes, and legs will fall behind on this one. Use as a temporary block, then return to PPL or Upper/Lower.',
    builtIn: true,
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
]

export const DEFAULT_ACTIVE_ROUTINE_ID = 'ppl-6day'
