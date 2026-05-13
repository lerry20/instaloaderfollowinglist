import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './routes/Dashboard'
import Plan from './routes/Plan'
import Workout from './routes/Workout'
import ExerciseDetail from './routes/ExerciseDetail'
import History from './routes/History'
import Bodyweight from './routes/Bodyweight'
import Settings from './routes/Settings'
import Onboarding from './routes/Onboarding'
import { seedIfEmpty } from './db/seed'
import { useSettings } from './db/queries'

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
    <BrowserRouter>
      <OnboardingGate />
      <Routes>
        <Route path="/welcome" element={<Onboarding />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/workout/:day" element={<Workout />} />
          <Route path="/exercise/:id" element={<ExerciseDetail />} />
          <Route path="/history" element={<History />} />
          <Route path="/bodyweight" element={<Bodyweight />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
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
