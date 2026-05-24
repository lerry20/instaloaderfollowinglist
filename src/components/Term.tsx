import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  define: string
  className?: string
}

/** Lightly-decorated inline span that surfaces a plain-English definition
 * on hover (desktop) or long-press (mobile). Use for jargon that the user
 * is likely to meet without context — NOT for words that are obvious from
 * context. Stay selective so the screen doesn't read like a textbook. */
export default function Term({ children, define, className }: Props) {
  return (
    <span
      className={`term ${className ?? ''}`}
      title={define}
      tabIndex={0}
      role="button"
      aria-label={`${typeof children === 'string' ? children : 'Term'}: ${define}`}
    >
      {children}
    </span>
  )
}
