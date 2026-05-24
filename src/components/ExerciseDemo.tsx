import { useEffect, useState } from 'react'
import {
  extractYouTubeId,
  getPinnedVideoId,
  setPinnedVideoId,
  youtubeEmbedUrl,
  youtubeSearchUrl,
  youtubeWatchUrl,
} from '../lib/video'
import { toast } from '../state/toasts'

interface Props {
  exerciseId: string
  exerciseName: string
  fallbackImage: string | null
  searchQuery: string
}

/** Embedded video player + "pin a YouTube URL" flow. YouTube's listType=search
 * embed parameter is deprecated, so we don't try to embed search results.
 * Instead: if the user pins a specific YouTube URL, we embed it directly.
 * Otherwise we show a thumbnail-style card that opens YouTube cleanly. */
export default function ExerciseDemo({ exerciseId, exerciseName, fallbackImage, searchQuery }: Props) {
  const [pinned, setPinned] = useState<string | null>(null)
  const [showPin, setShowPin] = useState(false)
  const [draft, setDraft] = useState('')
  const [draftError, setDraftError] = useState<string | null>(null)

  useEffect(() => {
    setPinned(getPinnedVideoId(exerciseId))
  }, [exerciseId])

  function savePin() {
    const id = extractYouTubeId(draft)
    if (!id) {
      setDraftError('Couldn\'t read a YouTube video ID from that URL.')
      return
    }
    setPinnedVideoId(exerciseId, id)
    setPinned(id)
    setShowPin(false)
    setDraft('')
    setDraftError(null)
    toast('Video pinned — plays in-app from now on', { kind: 'success' })
  }

  function unpin() {
    setPinnedVideoId(exerciseId, null)
    setPinned(null)
    toast('Pinned video removed', { kind: 'info' })
  }

  if (pinned) {
    return (
      <section className="card video-card">
        <header className="section-head">
          <h3>Video demo</h3>
          <button className="link small" onClick={unpin}>Unpin</button>
        </header>
        <div className="video-frame">
          <iframe
            src={youtubeEmbedUrl(pinned)}
            title={`Demo of ${exerciseName}`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
        <p className="muted small">
          Your pinned demo. <a className="link" href={youtubeWatchUrl(pinned)} target="_blank" rel="noopener noreferrer">Open on YouTube</a>.
        </p>
      </section>
    )
  }

  return (
    <section className="card video-card">
      <header className="section-head">
        <h3>Video demo</h3>
      </header>
      <a
        className="video-tile"
        href={youtubeSearchUrl(searchQuery)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Watch ${exerciseName} demos on YouTube`}
      >
        {fallbackImage ? (
          <img
            className="video-tile-thumb"
            src={fallbackImage}
            alt=""
            loading="lazy"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : null}
        <span className="video-tile-overlay">
          <span className="video-tile-play" aria-hidden>▶</span>
          <span className="video-tile-label">Watch demos on YouTube</span>
          <span className="video-tile-sub muted small">Opens in a new tab</span>
        </span>
      </a>

      {!showPin ? (
        <button className="link small" onClick={() => setShowPin(true)}>
          Pin a specific video to play in-app →
        </button>
      ) : (
        <div className="pin-video-form">
          <label className="field">
            <span>Paste a YouTube URL</span>
            <input
              type="url"
              value={draft}
              autoFocus
              placeholder="https://www.youtube.com/watch?v=..."
              onChange={(e) => {
                setDraft(e.target.value)
                setDraftError(null)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  savePin()
                }
              }}
            />
          </label>
          {draftError ? <p className="muted small danger-text">{draftError}</p> : null}
          <div className="row">
            <button className="btn primary small" onClick={savePin} disabled={!draft.trim()}>
              Pin video
            </button>
            <button
              className="btn small ghost"
              onClick={() => {
                setShowPin(false)
                setDraft('')
                setDraftError(null)
              }}
            >
              Cancel
            </button>
          </div>
          <p className="muted small">
            Once pinned, the video plays inside this card every time you open this exercise. Saved on this device only.
          </p>
        </div>
      )}
    </section>
  )
}
