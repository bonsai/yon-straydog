import { describe, it, expect, beforeEach } from 'vitest'
import { startPuyoGame, closePuyoGame } from '../puyo'

describe('startPuyoGame / closePuyoGame', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="puyo-game" style="display:none">
        <div id="puyo-station-label"></div>
        <div id="puyo-canvas"></div>
        <div id="puyo-controls"></div>
      </div>
    `
  })

  it('startPuyoGame shows the game container', () => {
    startPuyoGame(0)
    const el = document.getElementById('puyo-game')
    expect(el?.style.display).toBe('flex')
  })

  it('startPuyoGame sets the station label', () => {
    startPuyoGame(0)
    const label = document.getElementById('puyo-station-label')
    expect(label?.textContent?.length).toBeGreaterThan(0)
  })

  it('startPuyoGame appends canvas to puyo-canvas', () => {
    startPuyoGame(0)
    const wrap = document.getElementById('puyo-canvas')
    expect(wrap?.querySelector('canvas')).toBeTruthy()
  })

  it('closePuyoGame hides the game container', () => {
    startPuyoGame(0)
    closePuyoGame()
    const el = document.getElementById('puyo-game')
    expect(el?.style.display).toBe('none')
  })

  it('closePuyoGame removes keydown listener', () => {
    startPuyoGame(0)
    closePuyoGame()
    // Esc key should no longer close the game after cleanup
    const el = document.getElementById('puyo-game')!
    el.style.display = 'flex'
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    // closePuyoGame was called, so display should still be flex
    expect(el.style.display).toBe('flex')
  })

  it('does nothing when puyo-game element is missing', () => {
    document.body.innerHTML = ''
    expect(() => startPuyoGame(0)).not.toThrow()
    expect(() => closePuyoGame()).not.toThrow()
  })
})
