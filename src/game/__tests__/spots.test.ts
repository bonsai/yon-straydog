import { describe, it, expect } from 'vitest'
import { SPOTS, BADGE_SPOTS } from '../../story/spots'
import { getBadgeCount } from '../../hub.js'

describe('spots data integrity', () => {
  it('has exactly 4 spots', () => {
    expect(SPOTS.length).toBe(4)
  })

  it('each spot has a unique id', () => {
    const ids = SPOTS.map(s => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('each spot has valid lat/lng', () => {
    for (const spot of SPOTS) {
      expect(spot.lat).toBeGreaterThan(-90)
      expect(spot.lat).toBeLessThan(90)
      expect(spot.lng).toBeGreaterThan(-180)
      expect(spot.lng).toBeLessThan(180)
    }
  })

  it('each spot has a valid game type', () => {
    const validGames = ['puyo', 'simon', 'quiz4', 'final']
    for (const spot of SPOTS) {
      expect(validGames).toContain(spot.game)
    }
  })

  it('s3 (final spot) requires all 3 hints', () => {
    const s3 = SPOTS.find(s => s.id === 's3')
    expect(s3).toBeDefined()
    expect(s3!.game).toBe('final')
    expect(s3!.hint).toContain('3')
  })

  it('has story for every spot', () => {
    for (const spot of SPOTS) {
      expect(spot.story.length).toBeGreaterThan(0)
    }
  })

  it('has badge emoji for every spot', () => {
    for (const spot of SPOTS) {
      expect(spot.badge.length).toBeGreaterThan(0)
      expect(spot.badgeName.length).toBeGreaterThan(0)
    }
  })
})

describe('BADGE_SPOTS', () => {
  it('has 3 badge spots (excludes s3)', () => {
    expect(BADGE_SPOTS.length).toBe(3)
    expect(BADGE_SPOTS.every(s => s.id !== 's3')).toBe(true)
  })

  it('each badge spot has unique badge emoji', () => {
    const emojis = BADGE_SPOTS.map(s => s.badge)
    expect(new Set(emojis).size).toBe(emojis.length)
  })
})

describe('getBadgeCount', () => {
  it('returns 0 for empty completed', () => {
    expect(getBadgeCount([])).toBe(0)
  })

  it('returns 1 for one badge spot', () => {
    expect(getBadgeCount(['s0'])).toBe(1)
  })

  it('returns 2 for two badge spots', () => {
    expect(getBadgeCount(['s0', 's1'])).toBe(2)
  })

  it('returns 3 for all badge spots', () => {
    expect(getBadgeCount(['s0', 's1', 's2'])).toBe(3)
  })

  it('does not count s3', () => {
    expect(getBadgeCount(['s3'])).toBe(0)
    expect(getBadgeCount(['s0', 's3'])).toBe(1)
  })
})
