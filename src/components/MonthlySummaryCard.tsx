import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Units } from '../db/schema'
import { kgToDisplay } from '../lib/units'
import { useLocaleStore, useT, type Locale } from '../i18n'
import { useDemoMode } from '../state/demoMode'
import CollapsibleSection from './CollapsibleSection'

const LOCALE_BCP47: Record<Locale, string> = {
  en: 'en-US',
  it: 'it-IT',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  pt: 'pt-BR',
}

interface Props {
  units: Units
}

/** Big summary card at the top of Progress. Always-on, recomputed live.
 * "May: 18 sessions · 312 working sets · 12 PRs · +1.2 kg". */
export default function MonthlySummaryCard({ units }: Props) {
  const t = useT()
  const locale = useLocaleStore((s) => s.locale)
  const demo = useDemoMode()

  // Bounds: first millisecond of this month and the previous month
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const data = useLiveQuery(async () => {
    const sessions = await db.sessions.toArray()
    const completed = sessions.filter(
      (s) =>
        s.completedAt !== null &&
        s.completedAt >= monthStart.getTime(),
    )
    const completedIds = new Set(completed.map((s) => s.id!).filter(Boolean))

    const allLogs = await db.setLogs.toArray()
    const monthLogs = allLogs.filter(
      (l) => completedIds.has(l.sessionId) && !l.isWarmup,
    )
    const workingSets = monthLogs.length

    // PRs: scan only sessions in this month
    const prCounts = await Promise.all(
      completed.map(async (s) => {
        const prs = await import('../db/queries').then((m) =>
          m.sessionHasPRs(s.id!),
        )
        return prs.length
      }),
    )
    const prTotal = prCounts.reduce((a, b) => a + b, 0)

    // Bodyweight: most recent entry in this month vs most recent in prev month
    const bw = await db.bodyweight.toArray()
    bw.sort((a, b) => a.date.localeCompare(b.date))
    const monthStartIso = monthStart.toISOString().slice(0, 10)
    const prevStartIso = prevMonthStart.toISOString().slice(0, 10)
    const thisMonthBw = bw.filter((b) => b.date >= monthStartIso)
    const prevMonthBw = bw.filter((b) => b.date >= prevStartIso && b.date < monthStartIso)
    const latestThis = thisMonthBw[thisMonthBw.length - 1]
    const latestPrev = prevMonthBw[prevMonthBw.length - 1]
    const bwDelta =
      latestThis && latestPrev ? latestThis.weightKg - latestPrev.weightKg : null

    return {
      sessions: completed.length,
      workingSets,
      prs: prTotal,
      bwDelta,
    }
  }, [])

  if (!data) return null

  // Demo mode: show the card structure with zeros so the PT understands
  // what this card tracks, without exposing the user's actual numbers.
  const displayData = demo
    ? { sessions: 0, workingSets: 0, prs: 0, bwDelta: null }
    : data

  const monthLabel = new Intl.DateTimeFormat(LOCALE_BCP47[locale], {
    month: 'long',
    year: 'numeric',
  }).format(monthStart)

  return (
    <CollapsibleSection
      id="progress-monthly"
      eyebrow={t('monthly.title')}
      title={monthLabel}
    >
      <div className="monthly-summary-grid">
        <div className="monthly-stat">
          <span className="monthly-stat-value tabnum">{displayData.sessions}</span>
          <span className="muted small">{t('monthly.sessions')}</span>
        </div>
        <div className="monthly-stat">
          <span className="monthly-stat-value tabnum">{displayData.workingSets}</span>
          <span className="muted small">{t('monthly.working_sets')}</span>
        </div>
        <div className="monthly-stat">
          <span className={`monthly-stat-value tabnum${displayData.prs > 0 ? ' shine' : ''}`}>
            {displayData.prs > 0 ? '🥇 ' : ''}{displayData.prs}
          </span>
          <span className="muted small">{displayData.prs === 1 ? t('monthly.pr_singular') : t('monthly.prs')}</span>
        </div>
        <div className="monthly-stat">
          {displayData.bwDelta !== null ? (
            <>
              <span className={`monthly-stat-value tabnum ${displayData.bwDelta >= 0 ? 'up' : 'down'}`}>
                {displayData.bwDelta >= 0 ? '+' : ''}
                {kgToDisplay(displayData.bwDelta, units).toFixed(1)}
              </span>
              <span className="muted small">{t('monthly.bw_unit_suffix', { u: units })}</span>
            </>
          ) : (
            <>
              <span className="monthly-stat-value tabnum">—</span>
              <span className="muted small">{t('monthly.bw_label')}</span>
            </>
          )}
        </div>
      </div>
    </CollapsibleSection>
  )
}
