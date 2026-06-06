import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import DebugPanel from './components/DebugPanel'
import Train from './routes/Train'
import Routines from './routes/Routines'
import RoutinePreview from './routes/RoutinePreview'
import RoutineEdit from './routes/RoutineEdit'
import Progress from './routes/Progress'
import Daily from './routes/Daily'
import ExerciseDetail from './routes/ExerciseDetail'
import Miguel from './routes/Miguel'
import { seedIfEmpty } from './db/seed'
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
        <span>MyBulkLog</span>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeManager />
        <DebugPanel />
        <Routes>
          <Route path="/miguel" element={<Miguel />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Train />} />
            <Route path="/train" element={<Train />} />
            <Route path="/routines" element={<Routines />} />
            <Route path="/routines/:id" element={<RoutinePreview />} />
            <Route path="/routines/:id/edit" element={<RoutineEdit />} />
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
