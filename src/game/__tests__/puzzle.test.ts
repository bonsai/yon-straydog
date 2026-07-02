import { describe, it, expect } from 'vitest'
import { createPuzzleState, isSolved, selectOrSwap } from '../puzzle/puzzle.js'

describe('puzzle', () => {
  describe('createPuzzleState', () => {
    it('creates solved state when shuffled=false', () => {
      const state = createPuzzleState(false)
      expect(state.tiles.length).toBe(16)
      expect(state.tiles.every(t => t.currentPos === t.correctPos)).toBe(true)
      expect(state.selectedIdx).toBeNull()
      expect(state.moves).toBe(0)
    })

    it('creates shuffled state when shuffled=true', () => {
      const state = createPuzzleState(true)
      expect(state.tiles.length).toBe(16)
      expect(state.selectedIdx).toBeNull()
      expect(state.moves).toBe(0)
      const solved = state.tiles.every(t => t.currentPos === t.correctPos)
      expect(solved).toBe(false)
    })
  })

  describe('isSolved', () => {
    it('returns true when all tiles are in correct position', () => {
      const state = createPuzzleState(false)
      expect(isSolved(state)).toBe(true)
    })

    it('returns false when tiles are out of place', () => {
      const state = createPuzzleState(true)
      expect(isSolved(state)).toBe(false)
    })
  })

  describe('selectOrSwap', () => {
    it('selects a tile when none is selected', () => {
      const state = createPuzzleState(false)
      const next = selectOrSwap(state, 3)
      expect(next.selectedIdx).toBe(3)
      expect(next.moves).toBe(0)
    })

    it('deselects when tapping same tile', () => {
      const state = createPuzzleState(false)
      const afterSelect = selectOrSwap(state, 3)
      const afterDeselect = selectOrSwap(afterSelect, 3)
      expect(afterDeselect.selectedIdx).toBeNull()
      expect(afterDeselect.moves).toBe(0)
    })

    it('swaps tiles when a different tile is tapped', () => {
      const state = createPuzzleState(false)
      const afterSelect = selectOrSwap(state, 3)
      const afterSwap = selectOrSwap(afterSelect, 7)
      expect(afterSwap.selectedIdx).toBeNull()
      expect(afterSwap.moves).toBe(1)
      expect(afterSwap.tiles[3].currentPos).toBe(7)
      expect(afterSwap.tiles[7].currentPos).toBe(3)
    })
  })
})
