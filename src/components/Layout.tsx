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
          <NavLink to="/" end>Train</NavLink>
          <NavLink to="/routines">Routines</NavLink>
          <NavLink to="/progress">Progress</NavLink>
        </nav>
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
        <NavLink to="/progress">
          <span aria-hidden>📈</span>
          <span>Progress</span>
        </NavLink>
      </nav>
    </div>
  )
}
