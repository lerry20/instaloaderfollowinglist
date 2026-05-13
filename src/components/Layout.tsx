import { NavLink, Outlet } from 'react-router-dom'
import RestTimerBar from './RestTimerBar'
import UpdateBanner from './UpdateBanner'

export default function Layout() {
  return (
    <div className="app-shell">
      <UpdateBanner />
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden />
          <span>BulkLog</span>
        </div>
        <nav className="top-nav" aria-label="Primary">
          <NavLink to="/" end>Today</NavLink>
          <NavLink to="/plan">Plan</NavLink>
          <NavLink to="/history">History</NavLink>
          <NavLink to="/bodyweight">Weight</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <RestTimerBar />
      <nav className="bottom-nav" aria-label="Primary">
        <NavLink to="/" end>
          <span aria-hidden>🏋️</span>
          <span>Today</span>
        </NavLink>
        <NavLink to="/plan">
          <span aria-hidden>📅</span>
          <span>Plan</span>
        </NavLink>
        <NavLink to="/history">
          <span aria-hidden>📜</span>
          <span>History</span>
        </NavLink>
        <NavLink to="/bodyweight">
          <span aria-hidden>⚖️</span>
          <span>Weight</span>
        </NavLink>
        <NavLink to="/settings">
          <span aria-hidden>⚙️</span>
          <span>More</span>
        </NavLink>
      </nav>
    </div>
  )
}
