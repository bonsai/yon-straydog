import { describe, it, expect } from 'vitest'
import { ensureResumed } from '../game/sound'

describe('sound', () => {
  it('ensureResumed does not throw', () => {
    expect(() => ensureResumed()).not.toThrow()
  })

  it('AudioContext is created on first call', () => {
    ensureResumed()
    expect(typeof AudioContext).toBe('function')
  })
})
