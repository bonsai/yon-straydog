import { describe, it, expect } from 'vitest'
import { createPuyoState, spawnPiece, movePiece, rotatePiece, hardDrop, tick } from '../puyo/logic.ts'
import { createEmptyGrid, ROWS, COLS } from '../puyo/types.ts'
import type { Grid, Piece, PuyoState } from '../puyo/types.ts'

describe('puyo logic', () => {
  describe('createPuyoState', () => {
    it('creates initial state with a piece', () => {
      const state = createPuyoState(0)
      expect(state.grid.length).toBe(ROWS)
      expect(state.grid[0].length).toBe(COLS)
      expect(state.piece).not.toBeNull()
      expect(state.phase).toBe('playing')
      expect(state.score).toBe(0)
      expect(state.clearedGroups).toBe(0)
      expect(state.targetColor).toBe(0)
    })
  })

  describe('spawnPiece', () => {
    it('spawns piece at center top', () => {
      const piece = spawnPiece(0)
      expect(piece.row).toBe(0)
      expect(piece.col).toBe(Math.floor(COLS / 2))
      expect(piece.colors.length).toBe(2)
      expect(piece.colors[0]).toBe(0)
    })
  })

  describe('movePiece', () => {
    it('moves piece left', () => {
      const state = createPuyoState(0)
      const moved = movePiece(state, -1)
      expect(moved.piece!.col).toBe(state.piece!.col - 1)
    })

    it('moves piece right', () => {
      const state = createPuyoState(0)
      const moved = movePiece(state, 1)
      expect(moved.piece!.col).toBe(state.piece!.col + 1)
    })

    it('does not move piece beyond left wall', () => {
      const state = createPuyoState(0)
      let s = state
      for (let i = 0; i < COLS + 2; i++) {
        s = movePiece(s, -1)
      }
      expect(s.piece!.col).toBe(0)
    })

    it('does not move piece beyond right wall', () => {
      const state = createPuyoState(0)
      let s = state
      for (let i = 0; i < COLS + 2; i++) {
        s = movePiece(s, 1)
      }
      expect(s.piece!.col).toBe(COLS - 1)
    })

    it('does nothing when phase is not playing', () => {
      const state = { ...createPuyoState(0), phase: 'done' as const }
      const result = movePiece(state, 1)
      expect(result).toBe(state)
    })
  })

  describe('rotatePiece', () => {
    it('rotates piece clockwise', () => {
      const state = createPuyoState(0)
      const rotated = rotatePiece(state)
      expect(rotated.piece!.dir).toBe((state.piece!.dir + 1) % 4)
    })

    it('does nothing when phase is not playing', () => {
      const state = { ...createPuyoState(0), phase: 'gameover' as const }
      const result = rotatePiece(state)
      expect(result).toBe(state)
    })
  })

  describe('tick', () => {
    it('moves piece down one row', () => {
      const state = createPuyoState(0)
      const result = tick(state)
      expect(result.piece!.row).toBe(1)
    })

    it('locks piece when it hits bottom', () => {
      let state = createPuyoState(0)
      const piece = state.piece!
      // Move piece to ROWS-2 with dir=2 → child at ROWS-1
      const nearBottom = { ...state, piece: { ...piece, row: ROWS - 2 } }
      const result = tick(nearBottom)
      // After lock + no match → new piece spawns
      expect(result.piece).not.toBeNull()
      expect(result.piece).not.toBe(piece)
      expect(result.grid[ROWS - 2][piece.col]).toBe(piece.colors[0])
      expect(result.grid[ROWS - 1][piece.col]).toBe(piece.colors[1])
    })
  })

  describe('hardDrop', () => {
    it('instantly drops and locks the piece', () => {
      const state = createPuyoState(0)
      const piece = state.piece!
      const result = hardDrop(state)
      // After lock + no match → new piece spawns
      expect(result.piece).not.toBeNull()
      expect(result.piece).not.toBe(piece)
      // Grid should have the locked puyos at bottom
      expect(result.grid[ROWS - 2][piece.col]).toBe(piece.colors[0])
      expect(result.grid[ROWS - 1][piece.col]).toBe(piece.colors[1])
    })
  })
})
