import { describe, it, expect } from 'vitest'
import { registerGameStarters } from '../registry'

describe('registerGameStarters', () => {
  it('registers all 5 spot starters', () => {
    const target: Record<string, () => void> = {}
    registerGameStarters(target)

    expect(Object.keys(target).sort()).toEqual(['s0', 's1', 's2', 's3', 's4'])
  })

  it('s0 starter does not throw', () => {
    const target: Record<string, () => void> = {}
    registerGameStarters(target)
    expect(target.s0).toBeInstanceOf(Function)
  })
})
