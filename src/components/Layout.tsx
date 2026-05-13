import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import RestTimerBar from './RestTimerBar'
import ToastContainer from './ToastContainer'
import SettingsModal from './SettingsModal'
import CoachChat from './CoachChat'
import { currentStreak } from '../lib/streak'

export default function Layout() {
  const [showSettings, setShowSettings] = useState(false)
  const [showCoach, setShowCoach] = useState(false)
  const [streak, setStreak] = useState<number>(0)

  useEffect(() => {
    let cancelled = false
    function refresh() {
      currentStreak()
        .then((n) => !cancelled && setStreak(n))
        .catch(() => {})
    }
    refresh()
    const id = window.setInterval(refresh, 60_000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden />
          <span>BulkLog</span>
          {streak >= 2 ? (
            <span className="streak-badge tabnum" title={`${streak}-day streak`}>
              🔥 {streak}
            </span>
          ) : null}
        </div>
        <div className="header-right">
          <nav className="top-nav" aria-label="Primary">
            <NavLink to="/" end>Train</NavLink>
            <NavLink to="/routines">Routines</NavLink>
            <NavLink to="/daily">Daily</NavLink>
            <NavLink to="/progress">Progress</NavLink>
          </nav>
          <button
            type="button"
            className="icon-btn"
            aria-label="Open AI coach"
            onClick={() => setShowCoach(true)}
            title="AI coach"
          >
            <span aria-hidden style={{ fontSize: '1rem' }}>💬</span>
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label="Settings"
            onClick={() => setShowSettings(true)}
          >
            <SettingsIcon />
          </button>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <RestTimerBar />
      <nav className="bottom-nav" aria-label="Primary">
        <NavLink to="/" end>
          <span aria-hidden>🏋️</span>
          <span>Train</span>
        </NavLink>
        <NavLink to="/routines">
          <span aria-hidden>📋</span>
          <span>Routines</span>
        </NavLink>
        <NavLink to="/daily">
          <span aria-hidden>🍳</span>
          <span>Daily</span>
        </NavLink>
        <NavLink to="/progress">
          <span aria-hidden>📈</span>
          <span>Progress</span>
        </NavLink>
      </nav>
      <ToastContainer />
      {showSettings ? <SettingsModal onClose={() => setShowSettings(false)} /> : null}
      <CoachChat open={showCoach} onClose={() => setShowCoach(false)} />
    </div>
  )
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}
