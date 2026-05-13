import { useEffect, useState } from 'react'
import { useRestTimer } from '../state/restTimer'

export default function RestTimerBar() {
  const { totalSec, stop, addSec } = useRestTimer()
  const remaining = useRestTimer((s) => s.remainingSec())
  const tick = useRestTimer((s) => s.tick)
  const [, setForce] = useState(0)
  useEffect(() => {
    setForce((x) => x + 1)
  }, [tick])

  if (totalSec === 0) return null
  const pct = totalSec > 0 ? ((totalSec - remaining) / totalSec) * 100 : 100
  const done = remaining === 0
  const mm = String(Math.floor(remaining / 60)).padStart(1, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  return (
    <div className={`rest-bar${done ? ' done' : ''}`} role="status" aria-live="polite">
      <div className="rest-bar-progress" style={{ width: `${pct}%` }} />
      <div className="rest-bar-content">
        <span className="rest-bar-label">{done ? 'Rest complete' : 'Rest'}</span>
        <span className="rest-bar-time">
          {mm}:{ss}
        </span>
        <div className="rest-bar-actions">
          <button onClick={() => addSec(-15)} disabled={done}>
            −15
          </button>
          <button onClick={() => addSec(15)} disabled={done}>
            +15
          </button>
          <button onClick={stop} className="primary">
            {done ? 'Done' : 'Skip'}
          </button>
        </div>
      </div>
    </div>
  )
}
