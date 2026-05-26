import { useState, type ReactNode } from 'react'

interface Props {
  title: string
  /** Optional one-line subtitle shown to the right of the title, muted. */
  subtitle?: string
  /** Whether the section starts open. Default true (visible). */
  defaultOpen?: boolean
  /** Optional className to scope styling per section. */
  className?: string
  children: ReactNode
}

/** Reusable Freeletics-style section header that tap-toggles its body.
 * Built on native <details> so keyboard / screen-reader nav works. */
export default function CollapsibleSection({
  title,
  subtitle,
  defaultOpen = true,
  className = '',
  children,
}: Props) {
  // We render <details open> initially based on the prop, then let the
  // browser own the toggle from there (no React state to drift out of
  // sync). useState is only used to capture the initial value.
  const [initialOpen] = useState(defaultOpen)
  return (
    <details
      className={`card collapsible-section collapsible-section--page ${className}`.trim()}
      open={initialOpen}
    >
      <summary>
        <div className="collapsible-section-title">
          <h3>{title}</h3>
          {subtitle ? <span className="muted small">{subtitle}</span> : null}
        </div>
      </summary>
      {children}
    </details>
  )
}
