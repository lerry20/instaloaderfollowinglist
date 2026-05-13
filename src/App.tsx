import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import Train from './routes/Train'
import Routines from './routes/Routines'
import Progress from './routes/Progress'
import Daily from './routes/Daily'
import ExerciseDetail from './routes/ExerciseDetail'
import Onboarding from './routes/Onboarding'
import { seedIfEmpty } from './db/seed'
import { useSettings } from './db/queries'
import { useThemeSync } from './state/theme'

export default function App() {
  const [seeded, setSeeded] = useState(false)
  useEffect(() => {
    seedIfEmpty()
      .then(() => setSeeded(true))
      .catch((err) => {
        console.error('Seed failed', err)
        setSeeded(true)
      })
  }, [])

  if (!seeded) {
    return (
      <div className="boot-screen">
        <span className="brand-mark" aria-hidden />
        <span>BulkLog</span>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeManager />
        <OnboardingGate />
        <Routes>
          <Route path="/welcome" element={<Onboarding />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Train />} />
            <Route path="/train" element={<Train />} />
            <Route path="/routines" element={<Routines />} />
            <Route path="/daily" element={<Daily />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/exercise/:id" element={<ExerciseDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

function ThemeManager() {
  useThemeSync()
  return null
}

function OnboardingGate() {
  const settings = useSettings()
  const location = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    if (!settings) return
    if (settings.onboarded === false && location.pathname !== '/welcome') {
      navigate('/welcome', { replace: true })
    }
  }, [settings, location.pathname, navigate])
  return null
}
