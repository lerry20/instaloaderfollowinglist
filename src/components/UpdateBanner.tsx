import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export default function UpdateBanner() {
  const [hidden, setHidden] = useState(false)
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, reg) {
      if (!reg) return
      // Check for updates every 30 minutes while the app is open.
      setInterval(() => reg.update().catch(() => {}), 30 * 60 * 1000)
    },
  })

  useEffect(() => {
    if (needRefresh) setHidden(false)
  }, [needRefresh])

  if (!needRefresh || hidden) return null

  return (
    <div className="update-banner" role="status">
      <span>A new version of BulkLog is available.</span>
      <div className="update-banner-actions">
        <button
          className="link"
          onClick={() => {
            setNeedRefresh(false)
            setHidden(true)
          }}
        >
          Later
        </button>
        <button className="btn primary small" onClick={() => updateServiceWorker(true)}>
          Reload
        </button>
      </div>
    </div>
  )
}
