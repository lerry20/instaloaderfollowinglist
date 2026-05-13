import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './routes/Dashboard'
import Plan from './routes/Plan'
import Workout from './routes/Workout'
import ExerciseDetail from './routes/ExerciseDetail'
import History from './routes/History'
import Bodyweight from './routes/Bodyweight'
import Settings from './routes/Settings'
import { seedIfEmpty } from './db/seed'

export default function App() {
  useEffect(() => {
    seedIfEmpty().catch((err) => console.error('Seed failed', err))
  }, [])

  return (
    <BrowserRouter>
      <Routes>
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
