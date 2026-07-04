import { describe, it, expect, beforeEach } from 'vitest'
import { isSpotUnlocked, spotLockReason, getBadgeCount, completeCurrentSpot, setOnSpotCleared, setCurrentGameSpot, registerGameStarters } from '../hub'

describe('isSpotUnlocked', () => {
  it('s0 is always unlocked', () => {
    expect(isSpotUnlocked('s0', [])).toBe(true)
    expect(isSpotUnlocked('s0', ['s1'])).toBe(true)
    expect(isSpotUnlocked('s0', ['s2'])).toBe(true)
  })

  it('s1 requires s0 completed', () => {
    expect(isSpotUnlocked('s1', [])).toBe(false)
    expect(isSpotUnlocked('s1', ['s0'])).toBe(true)
  })

  it('s2 requires s1 completed', () => {
    expect(isSpotUnlocked('s2', [])).toBe(false)
    expect(isSpotUnlocked('s2', ['s0'])).toBe(false)
    expect(isSpotUnlocked('s2', ['s1'])).toBe(false)
    expect(isSpotUnlocked('s2', ['s0', 's1'])).toBe(true)
    expect(isSpotUnlocked('s2', ['s0', 's1', 's3'])).toBe(true)
  })

  it('s3 requires s2 completed', () => {
    expect(isSpotUnlocked('s3', [])).toBe(false)
    expect(isSpotUnlocked('s3', ['s0'])).toBe(false)
    expect(isSpotUnlocked('s3', ['s0', 's1'])).toBe(false)
    expect(isSpotUnlocked('s3', ['s0', 's1', 's2'])).toBe(true)
  })

  it('s4 requires 4 badges', () => {
    expect(isSpotUnlocked('s4', [])).toBe(false)
    expect(isSpotUnlocked('s4', ['s0', 's1', 's2'])).toBe(false)
    expect(isSpotUnlocked('s4', ['s0', 's1', 's2', 's3'])).toBe(true)
  })

  it('returns false for unknown id', () => {
    expect(isSpotUnlocked('s999', [])).toBe(false)
  })
})

describe('spotLockReason', () => {
  it('returns hint for s1', () => {
    expect(spotLockReason('s1', [])).toContain('YON 2F')
  })

  it('returns hint for s2', () => {
    expect(spotLockReason('s2', [])).toContain('響')
    expect(spotLockReason('s2', ['s0'])).toContain('響')
  })

  it('returns hint for s3', () => {
    expect(spotLockReason('s3', [])).toContain('神田橋公園')
  })

  it('returns badge count for s4', () => {
    expect(spotLockReason('s4', [])).toContain('0/4')
    expect(spotLockReason('s4', ['s0'])).toContain('1/4')
    expect(spotLockReason('s4', ['s0', 's1'])).toContain('2/4')
    expect(spotLockReason('s4', ['s0', 's1', 's2', 's3'])).toContain('4/4')
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

  it('counts s4 as not a badge spot', () => {
    expect(getBadgeCount(['s4'])).toBe(0)
    expect(getBadgeCount(['s0', 's1', 's2', 's3', 's4'])).toBe(4)
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
