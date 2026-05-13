import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type CoachMessage } from '../db/schema'
import { useSettings } from '../db/queries'
import { askCoach } from '../lib/aiCoach'

interface Props {
  open: boolean
  onClose: () => void
}

export default function CoachChat({ open, onClose }: Props) {
  const settings = useSettings()
  const messages = useLiveQuery(() => db.coachMessages.toArray(), [])
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [open, messages?.length, pending])

  if (!open) return null

  const sorted = (messages ?? []).slice().sort((a, b) => a.ts - b.ts)
  const hasKey = !!settings?.aiApiKey

  async function send() {
    if (!draft.trim() || pending || !settings) return
    const userText = draft.trim()
    setDraft('')
    setError(null)
    setPending(true)
    const ts = Date.now()
    await db.coachMessages.add({ role: 'user', content: userText, ts })

    try {
      // Build prior history (last 8) for context.
      const all = await db.coachMessages.toArray()
      const history = all
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .sort((a, b) => a.ts - b.ts)
        .slice(-9, -1) // exclude the just-added user message
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))
      const reply = await askCoach(settings.aiApiKey ?? '', history, userText)
      await db.coachMessages.add({ role: 'assistant', content: reply, ts: Date.now() })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
    } finally {
      setPending(false)
    }
  }

  async function clearChat() {
    if (!confirm('Clear chat history?')) return
    await db.coachMessages.clear()
  }

  return (
    <div className="modal-backdrop coach-backdrop" onClick={onClose}>
      <div className="modal coach-modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <div>
            <h3>AI Coach</h3>
            {hasKey ? (
              <span className="muted small">claude-haiku-4-5</span>
            ) : (
              <span className="muted small">no API key — set one in Settings</span>
            )}
          </div>
          <div className="row small-gap">
            {sorted.length > 0 ? <button className="link small" onClick={clearChat}>Clear</button> : null}
            <button className="link" onClick={onClose}>Close</button>
          </div>
        </header>

        <div className="coach-scroll" ref={scrollRef}>
          {sorted.length === 0 ? (
            <div className="coach-empty">
              <p>Ask me anything about your training — programming, exercise selection, deload timing, plateaus.</p>
              <p className="muted small">
                I read your recent sessions, weekly volume per muscle, bodyweight trend, and current periodization phase before answering.
              </p>
              <div className="coach-suggestions">
                <button className="chip" onClick={() => setDraft('How am I doing this week?')}>How am I doing?</button>
                <button className="chip" onClick={() => setDraft('Should I deload soon?')}>Should I deload?</button>
                <button className="chip" onClick={() => setDraft('My bench has plateaued — what should I change?')}>Plateau help</button>
                <button className="chip" onClick={() => setDraft('Is my weekly volume right?')}>Volume check</button>
              </div>
            </div>
          ) : (
            sorted.map((m: CoachMessage) => (
              <div key={m.id} className={`coach-msg coach-${m.role}`}>
                {m.content}
              </div>
            ))
          )}
          {pending ? <div className="coach-msg coach-assistant coach-pending">Thinking…</div> : null}
          {error ? <div className="coach-msg coach-error">⚠ {error}</div> : null}
        </div>

        <div className="coach-input-row">
          <textarea
            placeholder={hasKey ? 'Ask the coach…' : 'Add your API key in Settings to chat'}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            rows={2}
            disabled={!hasKey || pending}
          />
          <button
            className="btn primary"
            onClick={send}
            disabled={!draft.trim() || pending || !hasKey}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
