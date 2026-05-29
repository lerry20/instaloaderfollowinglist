import { useEffect, useState } from 'react'
import { db } from '../db/schema'
import { useLocaleStore, type Locale } from '../i18n'
import { useDemoMode } from '../state/demoMode'

interface DayCell {
  date: string
  sets: number
  hasSession: boolean
  isToday: boolean
}

const LOCALE_BCP47: Record<Locale, string> = {
  en: 'en-US',
  it: 'it-IT',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  pt: 'pt-BR',
}

const WEEKS = 13 // ~3 months

function isoDate(d: Date) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function TrainingCalendar() {
  const locale = useLocaleStore((s) => s.locale)
  const demo = useDemoMode()
  const [cells, setCells] = useState<DayCell[]>([])
  const [monthHeaders, setMonthHeaders] = useState<Array<{ col: number; label: string }>>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      // Demo mode: render the empty calendar grid so the PT sees the
      // visualisation shape without seeing the user's actual training days.
      const sessions = demo ? [] : await db.sessions.toArray()
      const logs = demo ? [] : await db.setLogs.toArray()
      const setsByDate = new Map<string, number>()
      const datesWithSession = new Set<string>()
      for (const s of sessions) {
        if (s.completedAt === null) continue
        datesWithSession.add(s.date)
        const sessionLogs = logs.filter((l) => l.sessionId === s.id && !l.isWarmup)
        setsByDate.set(s.date, (setsByDate.get(s.date) ?? 0) + sessionLogs.length)
      }
      const today = new Date()
      const todayIso = isoDate(today)
      // Align to the most recent Sunday → so the rightmost column is the
      // current week (Sun → Sat).
      const dayOfWeek = today.getDay() // 0 = Sunday
      const days: DayCell[] = []
      // We render WEEKS columns × 7 rows, oldest on the left.
      const totalDays = WEEKS * 7
      for (let i = totalDays - 1; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        const iso = isoDate(d)
        days.push({
          date: iso,
          sets: setsByDate.get(iso) ?? 0,
          hasSession: datesWithSession.has(iso),
          isToday: iso === todayIso,
        })
      }
      // Pad the trailing edge so the LAST cell is today (already true), and
      // pad the leading edge so the FIRST column starts on Sunday for alignment.
      const leadPad = (7 - ((totalDays + dayOfWeek + 1) % 7)) % 7
      const padded: (DayCell | null)[] = Array.from({ length: leadPad }, () => null)
      padded.push(...days)
      if (!cancelled) {
        setCells(padded as DayCell[])
        // Compute month-change column positions for the header strip.
        const monthFmt = new Intl.DateTimeFormat(LOCALE_BCP47[locale], { month: 'short' })
        const headers: Array<{ col: number; label: string }> = []
        let lastMonth = ''
        for (let colIdx = 0; colIdx < WEEKS; colIdx++) {
          // First day of each week column.
          const cellIdx = colIdx * 7 + leadPad
          const cell = padded[cellIdx]
          if (!cell) continue
          const month = monthFmt.format(new Date(`${cell.date}T00:00:00`))
          if (month !== lastMonth) {
            headers.push({ col: colIdx, label: month })
            lastMonth = month
          }
        }
        setMonthHeaders(headers)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [demo])

  if (cells.length === 0) {
    return <p className="muted small">No training history yet.</p>
  }

  // Reshape into 7-row × N-column grid (rendered as CSS grid below).
  const dayLabels = ['Mon', 'Wed', 'Fri']
  return (
    <div className="cal-wrap">
      {monthHeaders.length > 0 ? (
        <div className="cal-month-row" aria-hidden>
          <span className="cal-row-label" />
          <div className="cal-month-cells">
            {Array.from({ length: WEEKS }, (_, col) => {
              const header = monthHeaders.find((h) => h.col === col)
              return (
                <span key={col} className="cal-month-cell">
                  {header ? header.label : ''}
                </span>
              )
            })}
          </div>
        </div>
      ) : null}
      <div className="cal-rows">
        {[0, 1, 2, 3, 4, 5, 6].map((row) => (
          <div key={row} className="cal-row">
            <span className="cal-row-label">{[1, 3, 5].includes(row) ? dayLabels[(row - 1) / 2] : ''}</span>
            <div className="cal-row-cells">
              {cells
                .filter((_, idx) => idx % 7 === row)
                .map((cell, i) =>
                  cell == null ? (
                    <span key={i} className="cal-cell cal-empty" />
                  ) : (
                    <span
                      key={cell.date + i}
                      className={`cal-cell ${intensityClass(cell.sets)}${cell.isToday ? ' cal-cell-today' : ''}`}
                      title={cellTitle(cell)}
                    />
                  ),
                )}
            </div>
          </div>
        ))}
      </div>
      <div className="cal-legend">
        <span className="muted small">Less</span>
        <span className="cal-cell intensity-0" />
        <span className="cal-cell intensity-1" />
        <span className="cal-cell intensity-2" />
        <span className="cal-cell intensity-3" />
        <span className="cal-cell intensity-4" />
        <span className="muted small">More</span>
      </div>
    </div>
  )
}

function intensityClass(sets: number): string {
  if (sets === 0) return 'intensity-0'
  if (sets <= 6) return 'intensity-1'
  if (sets <= 12) return 'intensity-2'
  if (sets <= 20) return 'intensity-3'
  return 'intensity-4'
}

function cellTitle(c: DayCell): string {
  if (c.sets === 0) return `${c.date} · rest`
  return `${c.date} · ${c.sets} working sets`
}
