import { useEffect, useRef, useState, type ReactNode } from 'react'
import { haptics } from '../lib/haptics'

type Tone = 'default' | 'success' | 'warn'
type Status = 'good' | 'pending' | 'neutral'

interface Props {
  title: string
  /** One-line preview shown beneath the title in muted text. */
  subtitle?: string
  /** Optional headline value shown right of the title (e.g. "78.4 kg").
   * Always visible — so even a collapsed section conveys its key number. */
  stat?: string
  /** Small status dot. `good` = today's entry logged (green glow).
   * `pending` = needs your attention. `neutral` = informational. */
  status?: Status
  /** Visual accent. `success` = subtle gold tint (e.g. PRs).
   * `warn` = subtle warning tint. Default = monochrome. */
  tone?: Tone
  /** Whether the section starts open. Default true. */
  defaultOpen?: boolean
  /** Stable id — if provided, the open/close state persists across
   * page loads via localStorage. Skip it for transient / one-off sections. */
  id?: string
  /** Optional className to scope styling per section. */
  className?: string
  children: ReactNode
}

const LS_PREFIX = 'mybulklog:cx-section:'

function readPersisted(id: string | undefined, fallback: boolean): boolean {
  if (!id || typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(LS_PREFIX + id)
    if (raw === '1') return true
    if (raw === '0') return false
  } catch {
    // ignore
  }
  return fallback
}

function writePersisted(id: string | undefined, open: boolean) {
  if (!id || typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LS_PREFIX + id, open ? '1' : '0')
  } catch {
    // ignore
  }
}

/** Freeletics-style collapsible: animated chevron, headline stat, status
 * dot, smooth grid-based height animation, optional gold/warn accent,
 * and per-id state persistence. Controlled with React state (not native
 * <details>) so we can animate the body and still expose aria-expanded.
 *
 * On toggle we also preserve scroll-anchor by adjusting `window.scrollY`
 * to keep the trigger row stationary in the viewport — collapsing a tall
 * section far down the page no longer makes the page jump. */
export default function CollapsibleSection({
  title,
  subtitle,
  stat,
  status,
  tone = 'default',
  defaultOpen = true,
  id,
  className = '',
  children,
}: Props) {
  const [open, setOpen] = useState(() => readPersisted(id, defaultOpen))
  const sectionRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    writePersisted(id, open)
  }, [id, open])

  function toggle() {
    haptics.subtle()
    const el = sectionRef.current
    const before = el ? el.getBoundingClientRect().top : 0
    setOpen((v) => !v)
    // After paint, restore scroll position so the row stays put even when
    // the page above grew or shrank. rAF runs after React commits.
    requestAnimationFrame(() => {
      if (!el) return
      const after = el.getBoundingClientRect().top
      const delta = after - before
      if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: 'instant' as ScrollBehavior })
    })
  }

  return (
    <section
      ref={sectionRef}
      className={
        `cx-section ${open ? 'cx-section-open' : ''} cx-tone-${tone} ${className}`.trim()
      }
    >
      <button
        type="button"
        className="cx-section-trigger"
        aria-expanded={open}
        onClick={toggle}
      >
        <span className="cx-section-headline">
          <span className="cx-section-title-row">
            <span className="cx-section-title">{title}</span>
            {status ? (
              <span className={`cx-section-status cx-section-status-${status}`} aria-hidden />
            ) : null}
          </span>
          {subtitle ? <span className="cx-section-subtitle">{subtitle}</span> : null}
        </span>
        {stat ? <span className="cx-section-stat tabnum">{stat}</span> : null}
        <span className="cx-section-chevron" aria-hidden>
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
            <path
              d="M4 6.5L8 10.5L12 6.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      <div className="cx-section-drawer" aria-hidden={!open}>
        <div className="cx-section-drawer-clip">
          <div className="cx-section-body">{children}</div>
        </div>
      </div>
    </section>
  )
}
