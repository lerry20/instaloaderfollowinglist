import { Component, type ErrorInfo, type ReactNode } from 'react'
import { db } from '../db/schema'
import { resetDatabase } from '../db/seed'

interface State {
  error: Error | null
  info: ErrorInfo | null
  busy: boolean
}

export default class ErrorBoundary extends Component<
  { children: ReactNode },
  State
> {
  state: State = { error: null, info: null, busy: false }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App crashed:', error, info)
    this.setState({ info })
  }

  async abandonSessions() {
    this.setState({ busy: true })
    try {
      const open = await db.sessions
        .toArray()
        .then((arr) => arr.filter((s) => s.completedAt === null))
      for (const s of open) {
        await db.setLogs.where('sessionId').equals(s.id!).delete()
        await db.sessions.delete(s.id!)
      }
    } finally {
      window.location.reload()
    }
  }

  async hardReset() {
    if (!confirm('This wipes ALL local data (sessions, weight, settings). Continue?')) {
      return
    }
    this.setState({ busy: true })
    try {
      await resetDatabase()
    } finally {
      window.location.reload()
    }
  }

  async copyReport() {
    const { error, info } = this.state
    const payload = [
      `BulkLog crash report`,
      `ts: ${new Date().toISOString()}`,
      `url: ${window.location.href}`,
      `ua: ${navigator.userAgent}`,
      ``,
      `error: ${error?.message ?? String(error)}`,
      ``,
      `stack:`,
      error?.stack ?? '(no stack)',
      ``,
      `component stack:`,
      info?.componentStack ?? '(no component stack)',
    ].join('\n')
    try {
      await navigator.clipboard.writeText(payload)
      // eslint-disable-next-line no-alert
      alert('Crash report copied to clipboard.')
    } catch {
      console.log('[crash-report]', payload)
      // eslint-disable-next-line no-alert
      alert('Copy failed — report logged to devtools console.')
    }
  }

  render() {
    if (!this.state.error) return this.props.children

    const componentStack = this.state.info?.componentStack?.trim() || ''

    return (
      <div className="boot-screen error-screen">
        <div className="error-card">
          <h2>Something crashed</h2>
          <p className="muted small">
            BulkLog hit an unexpected error and stopped rendering. The most
            common cause is a session that got into a bad state — try
            "Abandon active sessions" first.
          </p>
          <pre className="error-pre">{String(this.state.error.message ?? this.state.error)}</pre>
          {componentStack ? (
            <details>
              <summary className="muted small">Component stack</summary>
              <pre className="error-pre">{componentStack}</pre>
            </details>
          ) : null}
          <div className="error-actions">
            <button
              className="btn primary"
              disabled={this.state.busy}
              onClick={() => this.abandonSessions()}
            >
              Abandon active sessions &amp; reload
            </button>
            <button
              className="btn"
              disabled={this.state.busy}
              onClick={() => window.location.reload()}
            >
              Just reload
            </button>
            <button
              className="btn"
              disabled={this.state.busy}
              onClick={() => this.copyReport()}
            >
              Copy crash report
            </button>
            <button
              className="btn danger"
              disabled={this.state.busy}
              onClick={() => this.hardReset()}
            >
              Reset all data
            </button>
          </div>
        </div>
      </div>
    )
  }
}
