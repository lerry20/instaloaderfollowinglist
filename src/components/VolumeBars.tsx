import { useEffect, useState } from 'react'
import { weeklyVolumeByMuscle, type MuscleVolume } from '../lib/programming'

export default function VolumeBars() {
  const [volumes, setVolumes] = useState<MuscleVolume[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    weeklyVolumeByMuscle(7)
      .then((v) => {
        if (cancelled) return
        setVolumes(v.filter((x) => x.landmarks.mev > 0 || x.workingSets > 0))
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
    return () => {
      cancelled = true
    }
  }, [])

  if (!loaded) return <p className="muted small">Computing volume…</p>
  if (volumes.length === 0) return null

  return (
    <ul className="volume-bars">
      {volumes.map((v) => {
        const max = Math.max(v.landmarks.mrv + 2, v.workingSets)
        const mevPct = (v.landmarks.mev / max) * 100
        const mavPct = (v.landmarks.mav / max) * 100
        const mrvPct = (v.landmarks.mrv / max) * 100
        const setsPct = (v.workingSets / max) * 100
        return (
          <li key={v.muscle} className={`volume-row status-${v.status}`}>
            <span className="volume-label">{v.label}</span>
            <div className="volume-track">
              <div className="volume-zone optimal" style={{ left: `${mevPct}%`, width: `${mavPct - mevPct}%` }} />
              <div className="volume-zone past-mav" style={{ left: `${mavPct}%`, width: `${mrvPct - mavPct}%` }} />
              <div className="volume-marker mev" style={{ left: `${mevPct}%` }} title={`MEV ${v.landmarks.mev}`} />
              <div className="volume-marker mav" style={{ left: `${mavPct}%` }} title={`MAV ${v.landmarks.mav}`} />
              <div className="volume-marker mrv" style={{ left: `${mrvPct}%` }} title={`MRV ${v.landmarks.mrv}`} />
              <div className="volume-fill" style={{ width: `${setsPct}%` }} />
            </div>
            <span className="volume-count tabnum">{Math.round(v.workingSets * 10) / 10}</span>
          </li>
        )
      })}
    </ul>
  )
}
