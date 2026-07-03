import { describe, it, expect, beforeEach } from 'vitest'
import { isSpotUnlocked, spotLockReason, getBadgeCount, completeCurrentSpot, setOnSpotCleared, setCurrentGameSpot, registerGameStarters } from '../hub'

describe('isSpotUnlocked', () => {
  it('s0 is always unlocked', () => {
    expect(isSpotUnlocked('s0', [])).toBe(true)
    expect(isSpotUnlocked('s0', ['s1'])).toBe(true)
    expect(isSpotUnlocked('s0', ['s2'])).toBe(true)
  })

  it('s1 is always unlocked', () => {
    expect(isSpotUnlocked('s1', [])).toBe(true)
    expect(isSpotUnlocked('s1', ['s0'])).toBe(true)
  })

  it('s2 requires s0 and s1 completed', () => {
    expect(isSpotUnlocked('s2', [])).toBe(false)
    expect(isSpotUnlocked('s2', ['s0'])).toBe(false)
    expect(isSpotUnlocked('s2', ['s1'])).toBe(false)
    expect(isSpotUnlocked('s2', ['s0', 's1'])).toBe(true)
    expect(isSpotUnlocked('s2', ['s0', 's1', 's3'])).toBe(true)
  })

  it('s3 requires 3 badges (s0, s1, s2)', () => {
    expect(isSpotUnlocked('s3', [])).toBe(false)
    expect(isSpotUnlocked('s3', ['s0'])).toBe(false)
    expect(isSpotUnlocked('s3', ['s0', 's1'])).toBe(false)
    expect(isSpotUnlocked('s3', ['s0', 's1', 's2'])).toBe(true)
  })

  it('returns false for unknown id', () => {
    expect(isSpotUnlocked('s999', [])).toBe(false)
  })
})

describe('spotLockReason', () => {
  it('returns hint for s2', () => {
    expect(spotLockReason('s2', [])).toContain('さぼうる')
    expect(spotLockReason('s2', ['s0'])).toContain('さぼうる')
  })

  it('returns badge count for s3', () => {
    expect(spotLockReason('s3', [])).toContain('0/3')
    expect(spotLockReason('s3', ['s0'])).toContain('1/3')
    expect(spotLockReason('s3', ['s0', 's1'])).toContain('2/3')
    expect(spotLockReason('s3', ['s0', 's1', 's2'])).toContain('3/3')
  })

  it('returns lock emoji for other ids', () => {
    expect(spotLockReason('s999', [])).toBe('🔒')
  })
})

describe('getBadgeCount', () => {
  it('returns 0 for empty completed', () => {
    expect(getBadgeCount([])).toBe(0)
  })

  it('counts only s0, s1, s2', () => {
    expect(getBadgeCount(['s0'])).toBe(1)
    expect(getBadgeCount(['s0', 's1'])).toBe(2)
    expect(getBadgeCount(['s0', 's1', 's2'])).toBe(3)
  })

  it('does not count s3', () => {
    expect(getBadgeCount(['s3'])).toBe(0)
    expect(getBadgeCount(['s0', 's3'])).toBe(1)
  })
})

describe('completeCurrentSpot', () => {
  beforeEach(() => {
    localStorage.clear()
    setCurrentGameSpot(null)
    setOnSpotCleared(null)
  })

  it('does nothing when no current spot', () => {
    let called = false
    setOnSpotCleared(() => { called = true })
    completeCurrentSpot()
    expect(called).toBe(false)
  })

  it('calls onSpotCleared with current spot id', () => {
    let clearedId: string | null = null
    setCurrentGameSpot('s0')
    setOnSpotCleared((id) => { clearedId = id })
    completeCurrentSpot()
    expect(clearedId).toBe('s0')
  })

  it('clears current spot after completion', () => {
    setCurrentGameSpot('s0')
    setOnSpotCleared(() => {})
    completeCurrentSpot()
    expect(completeCurrentSpot()).toBeUndefined()
  })
})

describe('registerGameStarters', () => {
  it('registers starters on window.__gameStarters', () => {
    registerGameStarters()
    const starters = (window as any).__gameStarters
    expect(typeof starters?.s0).toBe('function')
    expect(typeof starters?.s1).toBe('function')
    expect(typeof starters?.s2).toBe('function')
  })
})
