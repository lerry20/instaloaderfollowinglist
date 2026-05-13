import { db } from '../db/schema'
import { detectDeloadSignal, weeklyVolumeByMuscle } from './programming'

interface AnthropicMessage {
  role: 'user' | 'assistant'
  content: string
}

interface AnthropicResponse {
  content: { type: string; text?: string }[]
  error?: { message: string }
}

const MODEL = 'claude-haiku-4-5-20251001'
const MAX_TOKENS = 1024
const ENDPOINT = 'https://api.anthropic.com/v1/messages'

export interface CoachContext {
  systemPrompt: string
  recentSessions: string
  weeklyVolume: string
  deloadSignal: string
  bodyweightTrend: string
}

export async function buildCoachContext(): Promise<CoachContext> {
  const settings = await db.settings.get(1)
  const sessions = await db.sessions.toArray()
  const recentCompleted = sessions
    .filter((s) => s.completedAt !== null)
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, 5)
  const allLogs = await db.setLogs.toArray()
  const exercises = await db.exercises.toArray()

  const recentSessionsText = recentCompleted
    .map((s) => {
      const sessionLogs = allLogs.filter((l) => l.sessionId === s.id && !l.isWarmup)
      const byExercise = new Map<string, typeof sessionLogs>()
      for (const l of sessionLogs) {
        if (!byExercise.has(l.exerciseId)) byExercise.set(l.exerciseId, [])
        byExercise.get(l.exerciseId)!.push(l)
      }
      const lines: string[] = [`- ${s.date} (${s.workoutName})`]
      for (const [exId, logs] of byExercise.entries()) {
        const ex = exercises.find((e) => e.id === exId)
        const summary = logs
          .sort((a, b) => a.loggedAt - b.loggedAt)
          .map((l) => `${l.weight}kg×${l.reps}${l.rpe !== null ? `@${l.rpe}` : ''}`)
          .join(', ')
        lines.push(`  · ${ex?.name ?? exId}: ${summary}`)
      }
      return lines.join('\n')
    })
    .join('\n')

  const volumes = await weeklyVolumeByMuscle(7)
  const volumeText = volumes
    .filter((v) => v.workingSets > 0)
    .map(
      (v) =>
        `${v.label}: ${Math.round(v.workingSets * 10) / 10} sets (MEV ${v.landmarks.mev}, MAV ${v.landmarks.mav}, MRV ${v.landmarks.mrv}) → ${v.status}`,
    )
    .join('\n')

  const deload = await detectDeloadSignal()
  const deloadText = deload.shouldDeload
    ? `DELOAD SIGNAL: ${deload.reason}\n${deload.details.join('\n')}`
    : 'No deload signal detected.'

  const bws = await db.bodyweight.toArray()
  const bwSorted = [...bws].sort((a, b) => (a.date < b.date ? -1 : 1)).slice(-14)
  const bodyweightText =
    bwSorted.length === 0
      ? 'No bodyweight history.'
      : bwSorted.map((b) => `${b.date}: ${b.weightKg.toFixed(1)} kg`).join(', ')

  const systemPrompt = `You are BulkLog's in-app coach. The user is training for hypertrophy / muscle gain.

Goal: ${settings?.goal ?? 'bulk'}.
Active routine: see recent sessions.
Periodization phase: ${settings?.periodizationPhase ?? 'volume'} (week ${settings?.periodizationWeek ?? 1}).
Units: ${settings?.units ?? 'kg'}.
Notes: ${settings?.goalNotes ?? '(none)'}

Be direct, evidence-based, and practical. Reference the user's actual logs when relevant. Cite research briefly when it strengthens advice. Keep responses tight — 4-8 sentences unless asked for detail. Don't apologise. Don't ask the user to "consult a doctor" unless something genuinely alarming appears.`

  return {
    systemPrompt,
    recentSessions: recentSessionsText,
    weeklyVolume: volumeText,
    deloadSignal: deloadText,
    bodyweightTrend: bodyweightText,
  }
}

export async function askCoach(
  apiKey: string,
  history: AnthropicMessage[],
  newUserMessage: string,
): Promise<string> {
  if (!apiKey) {
    throw new Error('No API key set. Paste your Anthropic key in Settings → AI Coach.')
  }
  const ctx = await buildCoachContext()
  const contextBlock = `User context (recent training data):

Recent sessions:
${ctx.recentSessions || '(none)'}

Weekly volume by muscle (last 7 days):
${ctx.weeklyVolume || '(none)'}

Deload signal:
${ctx.deloadSignal}

Bodyweight (last 14 entries):
${ctx.bodyweightTrend}`

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: `${ctx.systemPrompt}\n\n${contextBlock}`,
      messages: [...history, { role: 'user', content: newUserMessage }],
    }),
  })
  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const j = (await res.json()) as AnthropicResponse
      if (j.error?.message) detail = j.error.message
    } catch {
      // ignore
    }
    throw new Error(`Coach error: ${detail}`)
  }
  const data = (await res.json()) as AnthropicResponse
  const text = data.content?.find((c) => c.type === 'text')?.text ?? ''
  if (!text) throw new Error('Empty response from coach.')
  return text
}
