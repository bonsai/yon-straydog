import { describe, it, expect } from 'vitest'
import { createSimonCanvas, clickTest, drawSimon, NOTES } from '../simon'

describe('createSimonCanvas', () => {
  it('creates a canvas with correct dimensions', () => {
    const canvas = createSimonCanvas()
    expect(canvas.tagName).toBe('CANVAS')
    expect(canvas.width).toBe(64 * 2 + 8)
    expect(canvas.height).toBe(64 * 2 + 8 + 40)
  })
})

describe('clickTest', () => {
  it('returns 0 for top-left pad', () => {
    expect(clickTest({ offsetX: 10, offsetY: 10 })).toBe(0)
  })

  it('returns 1 for top-right pad', () => {
    expect(clickTest({ offsetX: 80, offsetY: 10 })).toBe(1)
  })

  it('returns 2 for bottom-left pad', () => {
    expect(clickTest({ offsetX: 10, offsetY: 80 })).toBe(2)
  })

  it('returns 3 for bottom-right pad', () => {
    expect(clickTest({ offsetX: 80, offsetY: 80 })).toBe(3)
  })

  it('returns null for click beyond grid bounds', () => {
    expect(clickTest({ offsetX: 200, offsetY: 10 })).toBeNull()
    expect(clickTest({ offsetX: -1, offsetY: 10 })).toBeNull()
  })

  it('returns null for out-of-bounds click', () => {
    expect(clickTest({ offsetX: -1, offsetY: 10 })).toBeNull()
    expect(clickTest({ offsetX: 200, offsetY: 10 })).toBeNull()
  })
})

describe('drawSimon', () => {
  it('draws without error with a mock 2d context', () => {
    const canvas = createSimonCanvas()
    const ctx = {
      fillStyle: '',
      fill: () => {},
      fillRect: () => {},
      beginPath: () => {},
      roundRect: () => {},
      stroke: () => {},
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      textBaseline: '',
      fillText: () => {},
    } as unknown as CanvasRenderingContext2D
    const state = {
      sequence: [0, 1, 2, 3],
      playerIdx: 0,
      currentRound: 1,
      phase: 'showing' as const,
      activeNote: null,
    }
    expect(() => drawSimon(ctx, state)).not.toThrow()
  })
})
