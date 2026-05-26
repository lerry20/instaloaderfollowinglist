import { db, type Exercise, type Session, type SetLog, type Units } from '../db/schema'
import { kgToDisplay } from './units'
import { estimateOneRepMax, formatDuration } from './strength'

interface RenderOpts {
  session: Session
  logs: SetLog[]
  exercises: Exercise[]
  prs: string[]
  units: Units
  theme: 'dark' | 'light'
}

export async function renderShareCanvas(opts: RenderOpts): Promise<HTMLCanvasElement> {
  const { session, logs, exercises, prs, units, theme } = opts
  const size = 1080
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const palette =
    theme === 'light'
      ? {
          bg: '#f4f6fc',
          card: '#ffffff',
          border: '#d4dbf0',
          text: '#1a2150',
          muted: '#5a6391',
          primary: '#3b66e0',
          gold: '#c08a1d',
          good: '#2c9f60',
        }
      : {
          bg: '#0b1020',
          card: '#131a3a',
          border: '#2a3566',
          text: '#ecf0ff',
          muted: '#8b95cf',
          primary: '#7aa2ff',
          gold: '#ffc857',
          good: '#5cd29b',
        }

  // Background
  ctx.fillStyle = palette.bg
  ctx.fillRect(0, 0, size, size)

  // Brand row
  const padding = 64
  ctx.fillStyle = palette.primary
  ctx.fillRect(padding, padding, 36, 36)
  ctx.font = 'bold 30px system-ui, -apple-system, sans-serif'
  ctx.fillStyle = palette.text
  ctx.textBaseline = 'middle'
  ctx.fillText('MyBulkLog', padding + 56, padding + 18)
  // Date right-aligned
  ctx.font = '24px system-ui, -apple-system, sans-serif'
  ctx.fillStyle = palette.muted
  ctx.textAlign = 'right'
  ctx.fillText(session.date, size - padding, padding + 18)
  ctx.textAlign = 'left'

  // Title
  ctx.font = 'bold 72px system-ui, -apple-system, sans-serif'
  ctx.fillStyle = palette.text
  ctx.fillText(session.workoutName, padding, padding + 130)

  // Subtitle
  ctx.font = '28px system-ui, -apple-system, sans-serif'
  ctx.fillStyle = palette.muted
  const working = logs.filter((l) => !l.isWarmup)
  const totalVolume = working.reduce((s, l) => s + l.weight * l.reps, 0)
  const duration =
    session.completedAt && session.startedAt
      ? formatDuration(session.completedAt - session.startedAt)
      : '—'
  ctx.fillText(
    `${working.length} working sets · ${Math.round(kgToDisplay(totalVolume, units)).toLocaleString()} ${units}·reps · ${duration}`,
    padding,
    padding + 188,
  )

  // PR badge if any
  let cursorY = padding + 240
  if (prs.length > 0) {
    ctx.fillStyle = palette.gold
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif'
    ctx.fillText(`🥇 ${prs.length} ${prs.length === 1 ? 'PR' : 'PRs'} hit today`, padding, cursorY)
    cursorY += 60
  }

  // Exercise list
  const exerciseIds = Array.from(new Set(working.map((l) => l.exerciseId)))
  const rowHeight = 64
  const maxRows = Math.floor((size - cursorY - padding - 96) / rowHeight)
  const shown = exerciseIds.slice(0, maxRows)

  cursorY += 24
  ctx.font = 'bold 28px system-ui, -apple-system, sans-serif'
  ctx.fillStyle = palette.muted
  ctx.fillText('TOP SETS', padding, cursorY)
  cursorY += 48

  for (const exId of shown) {
    const ex = exercises.find((e) => e.id === exId)
    const exLogs = working.filter((l) => l.exerciseId === exId)
    const top = exLogs.reduce(
      (best, l) => (best === null || l.weight > best.weight ? { weight: l.weight, reps: l.reps } : best),
      null as { weight: number; reps: number } | null,
    )
    if (!top) continue
    const isPR = prs.includes(exId)
    // Row background
    ctx.fillStyle = palette.card
    ctx.strokeStyle = palette.border
    ctx.lineWidth = 1
    roundedRect(ctx, padding, cursorY, size - 2 * padding, rowHeight - 12, 14)
    ctx.fill()
    ctx.stroke()
    // Name
    ctx.font = '600 30px system-ui, -apple-system, sans-serif'
    ctx.fillStyle = isPR ? palette.gold : palette.text
    ctx.fillText(`${isPR ? '🥇 ' : ''}${ex?.name ?? exId}`, padding + 24, cursorY + rowHeight / 2 - 6)
    // Top set right-aligned
    ctx.textAlign = 'right'
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif'
    ctx.fillStyle = palette.text
    const displayW = kgToDisplay(top.weight, units)
    const wStr = Number.isInteger(displayW) ? String(displayW) : displayW.toFixed(1)
    ctx.fillText(`${wStr} ${units} × ${top.reps}`, size - padding - 24, cursorY + rowHeight / 2 - 6)
    ctx.textAlign = 'left'
    cursorY += rowHeight
  }

  if (exerciseIds.length > shown.length) {
    ctx.font = '24px system-ui, -apple-system, sans-serif'
    ctx.fillStyle = palette.muted
    ctx.fillText(`+ ${exerciseIds.length - shown.length} more exercises`, padding, cursorY + 18)
    cursorY += 48
  }

  // Footer
  ctx.font = '22px system-ui, -apple-system, sans-serif'
  ctx.fillStyle = palette.muted
  ctx.textAlign = 'center'
  ctx.fillText('Tracked with MyBulkLog', size / 2, size - padding)
  ctx.textAlign = 'left'

  void estimateOneRepMax // silence unused import warning if not used here
  return canvas
}

export async function shareWorkoutImage(sessionId: number): Promise<void> {
  const session = await db.sessions.get(sessionId)
  if (!session) throw new Error('Session not found')
  const logs = await db.setLogs.where('sessionId').equals(sessionId).toArray()
  const exercises = await db.exercises.toArray()
  const prs = await computePRs(sessionId, logs)
  const settings = await db.settings.get(1)
  const themeAttr = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
  const canvas = await renderShareCanvas({
    session,
    logs,
    exercises,
    prs,
    units: settings?.units ?? 'kg',
    theme: themeAttr,
  })
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
  })
  const filename = `mybulklog-${session.date}.png`

  // Prefer the Web Share API on supported devices (iOS Safari, Android Chrome).
  const file = new File([blob], filename, { type: 'image/png' })
  const navWithShare = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean
    share?: (data: ShareData) => Promise<void>
  }
  if (navWithShare.canShare && navWithShare.share && navWithShare.canShare({ files: [file] })) {
    try {
      await navWithShare.share({ files: [file], title: `${session.workoutName} — MyBulkLog` })
      return
    } catch {
      // fall through to download
    }
  }
  // Fallback: trigger a download.
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

async function computePRs(sessionId: number, logs: SetLog[]): Promise<string[]> {
  const working = logs.filter((l) => !l.isWarmup)
  const byEx = new Map<string, number>()
  for (const l of working) byEx.set(l.exerciseId, Math.max(byEx.get(l.exerciseId) ?? 0, l.weight))
  const prs: string[] = []
  for (const [exId, weightInSession] of byEx.entries()) {
    const prior = await db.setLogs
      .where('exerciseId')
      .equals(exId)
      .filter((l) => !l.isWarmup && l.sessionId !== sessionId)
      .toArray()
    const priorMax = prior.reduce((m, l) => Math.max(m, l.weight), 0)
    if (weightInSession > priorMax && priorMax > 0) prs.push(exId)
  }
  return prs
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
