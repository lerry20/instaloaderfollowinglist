import { useEffect, useRef, useState, type ReactNode } from 'react'
import { haptics } from '../lib/haptics'

type Tone = 'default' | 'success' | 'warn'

interface Props {
  /** Required big bold display title (e.g. "Nutrition", "May 2026"). */
  title: string
  /** Small uppercase letterspaced label shown above the title
   * (e.g. "TODAY", "THIS MONTH", "HIGHLIGHTS"). */
  eyebrow?: string
  /** Optional headline value shown right of the title (e.g. "78.4 kg").
   * Always visible — even when the section is collapsed. */
  stat?: string
  /** Optional one-line muted helper text beneath the title. */
  subtitle?: string
  /** Visual accent rail on the left when open. */
  tone?: Tone
  /** Whether the section starts open. Default true. */
  defaultOpen?: boolean
  /** Stable id — if provided, the open/close state persists across
   * page loads via localStorage. */
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

/** Editorial-style collapsible: eyebrow + display title + optional stat,
 * with a bare line chevron and a tone accent rail on the left edge when
 * open. Smooth grid-based height animation. Press-to-toggle the whole
 * row; scroll-anchored so the trigger stays put when toggled deep in
 * the page. State persists per-id via localStorage. */
export default function CollapsibleSection({
  title,
  eyebrow,
  stat,
  subtitle,
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
    requestAnimationFrame(() => {
      if (!el) return
      const after = el.getBoundingClientRect().top
      const delta = after - before
      if (Math.abs(delta) > 1) {
        window.scrollBy({ top: delta, behavior: 'instant' as ScrollBehavior })
      }
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
          {eyebrow ? <span className="cx-section-eyebrow">{eyebrow}</span> : null}
          <span className="cx-section-title-row">
            <span className="cx-section-title">{title}</span>
            {stat ? <span className="cx-section-stat tabnum">{stat}</span> : null}
          </span>
          {subtitle ? <span className="cx-section-subtitle">{subtitle}</span> : null}
        </span>
        <span className="cx-section-chevron" aria-hidden>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
            <path
              d="M6 9.5L12 15L18 9.5"
              stroke="currentColor"
              strokeWidth="2"
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
