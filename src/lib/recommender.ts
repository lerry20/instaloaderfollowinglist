import type { Routine, RoutineFocus, RoutineLevel, SkillLevel } from '../db/schema'

const LEVEL_ORDER: Record<RoutineLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
}

const SKILL_TO_LEVEL: Record<SkillLevel, RoutineLevel> = {
  beginner: 'beginner',
  // Settings' SkillLevel only has 'beginner' | 'advanced' today; the picker
  // adds the explicit 'intermediate' tier on top.
  advanced: 'advanced',
}

export interface RecommendationInput {
  /** Days/week the user wants (from picker) or has been training (inferred). */
  days?: number
  /** Routine experience level the user identifies with. */
  level?: RoutineLevel
  /** Which muscle group the user wants to emphasize. */
  focus?: RoutineFocus
  /** The id of the user's currently active routine — used to demote it
   * slightly so the recommender suggests something different. */
  excludeRoutineId?: string
}

export interface ScoredRoutine {
  routine: Routine
  /** 0..100 — higher is a better fit for the input. */
  score: number
  /** Short reasons explaining the match, in order of importance. */
  reasons: string[]
}

/** Score a single routine against the user's inputs. */
export function scoreRoutine(
  r: Routine,
  input: RecommendationInput,
): ScoredRoutine {
  if (!r.builtIn) return { routine: r, score: 0, reasons: [] }

  let score = 0
  const reasons: string[] = []

  // Days/week match — biggest weight
  if (input.days != null && r.daysPerWeek != null) {
    const delta = Math.abs(r.daysPerWeek - input.days)
    if (delta === 0) {
      score += 40
      reasons.push(`matches your ${input.days} days/week`)
    } else if (delta === 1) {
      score += 20
      reasons.push(`close to your ${input.days}-day schedule (${r.daysPerWeek} days)`)
    } else if (delta === 2) {
      score += 8
    } else {
      score -= 8
    }
  } else if (r.daysPerWeek != null) {
    // No preference stated — give a small flat credit.
    score += 5
  }

  // Level match
  if (input.level && r.level) {
    const userLvl = LEVEL_ORDER[input.level]
    const routineLvl = LEVEL_ORDER[r.level]
    if (routineLvl === userLvl) {
      score += 25
      reasons.push(`built for ${r.level} lifters`)
    } else if (routineLvl < userLvl) {
      // Easier program — okay for advanced users, but flag it
      score += 10
      if (userLvl - routineLvl >= 2) {
        // Beginner program suggested to an advanced user — meaningful demote
        score -= 8
      }
    } else {
      // Routine harder than user — penalize hard
      score -= 25
    }
  } else if (r.level) {
    score += 5
  }

  // Focus alignment
  if (input.focus && r.focus) {
    if (input.focus === r.focus) {
      score += 25
      if (input.focus !== 'balanced') {
        reasons.push(`emphasizes ${r.focus}`)
      }
    } else if (r.focus === 'balanced' && input.focus !== 'balanced') {
      // Balanced is a fine fallback for a focus query
      score += 8
    } else if (input.focus === 'balanced' && r.focus !== 'balanced') {
      // User wanted balanced, this is specialized
      score -= 6
    } else {
      // Different specialization than what the user asked for
      score -= 12
    }
  }

  // Variety bonus — don't recommend the routine they're already on
  if (input.excludeRoutineId && r.id === input.excludeRoutineId) {
    score -= 30
  }

  // Length-of-block bonus — slight preference for shorter blocks (easier to commit)
  if (r.weeksInBlock != null && r.weeksInBlock <= 8) {
    score += 2
  }

  // Normalize to 0..100 (raw is ~ -100..100)
  const clamped = Math.max(0, Math.min(100, score + 30))

  return { routine: r, score: clamped, reasons: reasons.slice(0, 3) }
}

/** Rank all built-in routines by fit. Higher score = better match.
 * Returns the top `limit` results, dropping anything with score 0. */
export function rankRoutines(
  routines: Routine[],
  input: RecommendationInput,
  limit = 3,
): ScoredRoutine[] {
  return routines
    .filter((r) => r.builtIn)
    .map((r) => scoreRoutine(r, input))
    .filter((s) => s.score > 5)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/** A single "best for you right now" pick based on the user's saved profile
 * (skill level + active routine). Used on the Routines tab top section. */
export function pickTopForProfile(
  routines: Routine[],
  ctx: { skillLevel: SkillLevel; excludeRoutineId?: string },
): ScoredRoutine | null {
  const level = SKILL_TO_LEVEL[ctx.skillLevel] ?? 'intermediate'
  const ranked = rankRoutines(
    routines,
    { level, excludeRoutineId: ctx.excludeRoutineId },
    1,
  )
  return ranked[0] ?? null
}
