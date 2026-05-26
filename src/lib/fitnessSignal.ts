import { db, type Routine } from '../db/schema'
import { currentStreak } from './streak'
import { computeAdherence } from './adherence'
import { sessionHasPRs } from '../db/queries'
import { weeklyVolumeByMuscle, VOLUME_LANDMARKS } from './programming'

const MS_PER_DAY = 86400 * 1000

export interface FitnessSignal {
  /** 0..100 — composite score from streak + adherence + recent PRs + volume hit. */
  score: number
  /** One-word trend label compared to a baseline. */
  trend: 'climbing' | 'steady' | 'easing'
  /** A short trainer-voice sentence — one observation per signal. */
  reason: string
  /** Per-component breakdown so we can show a tooltip / "What's this?" later. */
  parts: {
    streak: number
    adherence: number
    recentPRs: number
    volumeHit: number
  }
}

/** Combine four health-of-training signals into a single 0–100 score.
 * Calmly informative, never gamey — the trainer's quick read of how
 * you're doing right now. */
export async function computeFitnessSignal(routine: Routine | null): Promise<FitnessSignal> {
  // Streak: 0 days → 0, 30+ days → 25.
  const streakDays = await currentStreak()
  const streakPts = Math.min(25, streakDays * 0.85)

  // Adherence: ratio actual/prescribed last 28 days → 30 pts max.
  // 0.9-1.1 = 30, falls off either direction.
  let adherencePts = 0
  if (routine) {
    const a = await computeAdherence(routine)
    const peak = 1
    const dist = Math.abs(a.ratio - peak)
    adherencePts = Math.max(0, 30 - dist * 35)
  }

  // Recent PRs: PR count in the last 30 days → 25 pts (capped at 5 PRs).
  const cutoff = Date.now() - 30 * MS_PER_DAY
  const completed = (await db.sessions.toArray())
    .filter((s) => s.completedAt !== null && (s.completedAt ?? 0) >= cutoff)
  let recentPRs = 0
  for (const s of completed) {
    if (!s.id) continue
    const prs = await sessionHasPRs(s.id)
    recentPRs += prs.length
  }
  const prPts = Math.min(25, recentPRs * 5)

  // Volume hit: fraction of muscles past MEV for this week.
  const vols = await weeklyVolumeByMuscle()
  const muscles = vols.filter((v) => VOLUME_LANDMARKS[v.muscle].mev > 0)
  const past = muscles.filter((v) => v.workingSets >= v.landmarks.mev).length
  const hitFraction = muscles.length > 0 ? past / muscles.length : 0
  const volumePts = hitFraction * 20

  const total = Math.round(streakPts + adherencePts + prPts + volumePts)
  const score = Math.max(0, Math.min(100, total))

  // Trend: compare to a baseline (60 = "doing fine"). Above → climbing,
  // below → easing, near → steady.
  let trend: FitnessSignal['trend']
  if (score >= 70) trend = 'climbing'
  else if (score >= 50) trend = 'steady'
  else trend = 'easing'

  // One-line trainer-voice sentence, picks the strongest signal.
  let reason: string
  const parts = {
    streak: Math.round(streakPts),
    adherence: Math.round(adherencePts),
    recentPRs: Math.round(prPts),
    volumeHit: Math.round(volumePts),
  }
  const order = [
    ['streak', parts.streak] as const,
    ['adherence', parts.adherence] as const,
    ['recentPRs', parts.recentPRs] as const,
    ['volumeHit', parts.volumeHit] as const,
  ].sort((a, b) => b[1] - a[1])
  const [topKey] = order[0]

  if (score === 0) {
    reason = 'Log a session to start building your signal.'
  } else if (topKey === 'streak' && streakDays >= 7) {
    reason = `${streakDays}-day streak is doing a lot of the work — keep showing up.`
  } else if (topKey === 'recentPRs' && recentPRs > 0) {
    reason = `${recentPRs} new PR${recentPRs === 1 ? '' : 's'} in the last 30 days. You're getting stronger.`
  } else if (topKey === 'adherence' && adherencePts > 20) {
    reason = `You're matching your routine almost perfectly.`
  } else if (topKey === 'volumeHit' && hitFraction >= 0.7) {
    reason = `${past} of ${muscles.length} muscles are hitting their growth targets this week.`
  } else if (trend === 'easing') {
    reason = `Training\'s slipped a bit — one good session resets the trend.`
  } else {
    reason = `Doing fine — keep building.`
  }

  return { score, trend, reason, parts }
}
