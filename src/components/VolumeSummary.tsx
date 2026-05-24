import { useEffect, useState } from 'react'
import { weeklyVolumeByMuscle, type MuscleVolume } from '../lib/programming'

interface Observation {
  kind: 'below' | 'optimal' | 'past'
  text: string
}

function pickObservations(volumes: MuscleVolume[]): Observation[] {
  // Surface up to 3 sentences that say something actionable, NOT a chart full
  // of acronyms. Priority order:
  //   1. Junk volume (past MRV) — most actionable: cut sets.
  //   2. Under-trained (below MEV) with actual sets logged — bump it up.
  //   3. The healthiest muscle (optimal range, most sets) — positive feedback.
  const past = volumes.filter((v) => v.status === 'past-mrv' || v.status === 'past-mav')
  const below = volumes.filter((v) => v.status === 'below-mev' && v.workingSets > 0)
  const optimal = volumes.filter((v) => v.status === 'optimal').sort((a, b) => b.workingSets - a.workingSets)

  const observations: Observation[] = []

  for (const v of past.slice(0, 1)) {
    const verb = v.status === 'past-mrv' ? 'past the upper limit' : 'past the sweet spot'
    observations.push({
      kind: 'past',
      text: `${v.label} is at ${round(v.workingSets)} sets this week — ${verb}. Extra sets here probably aren't producing growth; consider cutting some next session.`,
    })
  }

  for (const v of below.slice(0, 1)) {
    observations.push({
      kind: 'below',
      text: `${v.label}: ${round(v.workingSets)} sets so far. Below the minimum for growth (${v.landmarks.mev}+). If this muscle matters to you, add an exercise.`,
    })
  }

  if (observations.length < 3 && optimal.length > 0) {
    const top = optimal[0]
    observations.push({
      kind: 'optimal',
      text: `${top.label}: ${round(top.workingSets)} working sets — right in the sweet spot for growth.`,
    })
  }

  return observations.slice(0, 3)
}

function round(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

export default function VolumeSummary() {
  const [observations, setObservations] = useState<Observation[] | null>(null)

  useEffect(() => {
    let cancelled = false
    weeklyVolumeByMuscle(7)
      .then((vols) => {
        if (cancelled) return
        setObservations(pickObservations(vols))
      })
      .catch(() => setObservations([]))
    return () => {
      cancelled = true
    }
  }, [])

  if (observations === null) return null
  if (observations.length === 0) {
    return (
      <p className="muted small">
        Log a few sessions and this section will start telling you which muscles are getting
        enough work and which need more attention.
      </p>
    )
  }

  return (
    <ul className="volume-observations">
      {observations.map((o, i) => (
        <li key={i} className={`obs obs-${o.kind}`}>
          {o.text}
        </li>
      ))}
    </ul>
  )
}
