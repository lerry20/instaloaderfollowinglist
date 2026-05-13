import { NavLink, Outlet } from 'react-router-dom'
import RestTimerBar from './RestTimerBar'

export default function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden />
          <span>BulkLog</span>
        </div>
        <nav className="top-nav">
          <NavLink to="/" end>
            Today
          </NavLink>
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
          <span>Today</span>
        </NavLink>
        <NavLink to="/plan">
          <span>Plan</span>
        </NavLink>
        <NavLink to="/history">
          <span>History</span>
        </NavLink>
        <NavLink to="/bodyweight">
          <span>Weight</span>
        </NavLink>
        <NavLink to="/settings">
          <span>Settings</span>
        </NavLink>
      </nav>
    </div>
  )
}
