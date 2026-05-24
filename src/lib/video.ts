/** Extract a YouTube video ID from any reasonable YouTube URL.
 * Handles youtu.be/, youtube.com/watch?v=, youtube.com/embed/,
 * youtube.com/shorts/, mobile m.youtube.com, and bare IDs. */
export function extractYouTubeId(input: string): string | null {
  if (!input) return null
  const trimmed = input.trim()
  // Bare 11-character ID — accept as-is.
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed
  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return null
  }
  const host = url.hostname.replace(/^www\./, '').replace(/^m\./, '')
  if (host === 'youtu.be') {
    const id = url.pathname.replace(/^\//, '').split('/')[0]
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
  }
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const v = url.searchParams.get('v')
    if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v
    // /embed/<id> or /shorts/<id>
    const m = url.pathname.match(/^\/(?:embed|shorts|v)\/([A-Za-z0-9_-]{11})/)
    if (m) return m[1]
  }
  return null
}

const PINNED_KEY_PREFIX = 'bulklog:pinnedVideo:'

export function getPinnedVideoId(exerciseId: string): string | null {
  try {
    return localStorage.getItem(PINNED_KEY_PREFIX + exerciseId)
  } catch {
    return null
  }
}

export function setPinnedVideoId(exerciseId: string, videoId: string | null) {
  try {
    if (videoId === null) localStorage.removeItem(PINNED_KEY_PREFIX + exerciseId)
    else localStorage.setItem(PINNED_KEY_PREFIX + exerciseId, videoId)
  } catch {
    // ignore — local storage may be disabled
  }
}

export function youtubeSearchUrl(query: string): string {
  // sp=EgIQAQ filters results to videos only.
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`
}

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`
}

export function youtubeThumbUrl(videoId: string): string {
  // hqdefault is more reliably available than maxresdefault.
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}
