import { describe, it, expect } from 'vitest'
import { createSimonState, generateSequence, tapNote, canAdvance, advance } from '../simon/logic.ts'

describe('simon logic', () => {
  describe('createSimonState', () => {
    it('creates initial state', () => {
      const state = createSimonState()
      expect(state.sequence).toEqual([])
      expect(state.playerIdx).toBe(0)
      expect(state.currentRound).toBe(1)
      expect(state.phase).toBe('showing')
      expect(state.activeNote).toBeNull()
    })
  })

  describe('generateSequence', () => {
    it('generates sequence matching current round length', () => {
      const state = { ...createSimonState(), currentRound: 3 }
      const next = generateSequence(state)
      expect(next.sequence.length).toBe(3)
      expect(next.phase).toBe('showing')
      expect(next.playerIdx).toBe(0)
    })
  })

  describe('tapNote', () => {
    it('ignores taps during showing phase', () => {
      const state = createSimonState()
      const result = tapNote(state, 0)
      expect(result).toBe(state)
    })

    it('goes to wrong on incorrect tap', () => {
      const state = { ...createSimonState(), sequence: [1, 2, 3], phase: 'input' as const }
      const result = tapNote(state, 0)
      expect(result.phase).toBe('wrong')
      expect(result.activeNote).toBe(0)
    })

    it('advances player index on correct tap', () => {
      const state = { ...createSimonState(), sequence: [1, 2, 3], phase: 'input' as const, playerIdx: 0 }
      const result = tapNote(state, 1)
      expect(result.phase).toBe('input')
      expect(result.playerIdx).toBe(1)
      expect(result.activeNote).toBe(1)
    })

    it('goes to correct phase when round finished', () => {
      const state = { ...createSimonState(), sequence: [2, 0], phase: 'input' as const, playerIdx: 0, currentRound: 1 }
      const r1 = tapNote(state, 2)
      expect(r1.playerIdx).toBe(1)
      const r2 = tapNote(r1, 0)
      expect(r2.phase).toBe('correct')
    })

    it('goes to clear when all rounds complete', () => {
      const state = { ...createSimonState(), sequence: [3], phase: 'input' as const, playerIdx: 0, currentRound: 4 }
      const result = tapNote(state, 3)
      expect(result.phase).toBe('clear')
    })
  })

  describe('canAdvance', () => {
    it('returns true for correct phase', () => {
      expect(canAdvance({ ...createSimonState(), phase: 'correct' })).toBe(true)
    })
    it('returns true for wrong phase', () => {
      expect(canAdvance({ ...createSimonState(), phase: 'wrong' })).toBe(true)
    })
    it('returns false for showing phase', () => {
      expect(canAdvance({ ...createSimonState(), phase: 'showing' })).toBe(false)
    })
    it('returns false for input phase', () => {
      expect(canAdvance({ ...createSimonState(), phase: 'input' })).toBe(false)
    })
  })

  describe('advance', () => {
    it('generates next round after correct', () => {
      const state = { ...createSimonState(), sequence: [0], phase: 'correct' as const, currentRound: 1 }
      const result = advance(state)
      expect(result.phase).toBe('showing')
      expect(result.currentRound).toBe(2)
    })

    it('retries same round after wrong', () => {
      const state = { ...createSimonState(), sequence: [0], phase: 'wrong' as const, currentRound: 2 }
      const result = advance(state)
      expect(result.phase).toBe('showing')
      expect(result.currentRound).toBe(2)
    })

    it('reaches clear after final round', () => {
      const state = { ...createSimonState(), phase: 'correct' as const, currentRound: 4 }
      const result = advance(state)
      expect(result.phase).toBe('clear')
    })
  })
})
