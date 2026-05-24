import { describe, it, expect } from 'vitest'
import { extractYouTubeId, youtubeEmbedUrl, youtubeWatchUrl } from './video'

describe('video', () => {
  describe('extractYouTubeId', () => {
    const ID = 'dQw4w9WgXcQ'

    it('accepts a bare 11-character ID', () => {
      expect(extractYouTubeId(ID)).toBe(ID)
    })

    it('rejects empty / null / nonsense input', () => {
      expect(extractYouTubeId('')).toBeNull()
      expect(extractYouTubeId('not a url')).toBeNull()
      expect(extractYouTubeId('https://example.com/foo')).toBeNull()
    })

    it('extracts from youtu.be short links', () => {
      expect(extractYouTubeId(`https://youtu.be/${ID}`)).toBe(ID)
      expect(extractYouTubeId(`https://youtu.be/${ID}?t=10`)).toBe(ID)
    })

    it('extracts from youtube.com/watch?v=', () => {
      expect(extractYouTubeId(`https://www.youtube.com/watch?v=${ID}`)).toBe(ID)
      expect(extractYouTubeId(`https://youtube.com/watch?v=${ID}&list=foo`)).toBe(ID)
    })

    it('extracts from youtube.com/embed/<id>', () => {
      expect(extractYouTubeId(`https://www.youtube.com/embed/${ID}`)).toBe(ID)
      expect(extractYouTubeId(`https://youtube-nocookie.com/embed/${ID}?rel=0`)).toBe(ID)
    })

    it('extracts from youtube.com/shorts/<id>', () => {
      expect(extractYouTubeId(`https://www.youtube.com/shorts/${ID}`)).toBe(ID)
    })

    it('extracts from mobile m.youtube.com URLs', () => {
      expect(extractYouTubeId(`https://m.youtube.com/watch?v=${ID}`)).toBe(ID)
    })

    it('rejects malformed IDs in URLs', () => {
      // too short
      expect(extractYouTubeId('https://youtu.be/short')).toBeNull()
      // wrong host
      expect(extractYouTubeId(`https://vimeo.com/${ID}`)).toBeNull()
    })

    it('handles whitespace around the input', () => {
      expect(extractYouTubeId(`   https://youtu.be/${ID}   `)).toBe(ID)
      expect(extractYouTubeId(`  ${ID}  `)).toBe(ID)
    })
  })

  describe('URL builders', () => {
    it('produces a privacy-enhanced embed URL', () => {
      const url = youtubeEmbedUrl('abc12345678')
      expect(url).toContain('youtube-nocookie.com/embed/abc12345678')
      expect(url).toContain('rel=0')
      expect(url).toContain('modestbranding=1')
    })

    it('produces a watch URL', () => {
      expect(youtubeWatchUrl('abc12345678')).toBe('https://www.youtube.com/watch?v=abc12345678')
    })
  })
})
