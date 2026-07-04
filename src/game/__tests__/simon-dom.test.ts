import { describe, it, expect, beforeEach } from 'vitest'
import { startSimon, closeSimon } from '../simon'

describe('startSimon / closeSimon', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="simon-game" style="display:none">
        <div id="simon-canvas"></div>
        <div id="simon-hint">光った順にタップ</div>
      </div>
    `
  })

  it('startSimon shows the game container', () => {
    startSimon()
    const el = document.getElementById('simon-game')
    expect(el?.style.display).toBe('flex')
  })

  it('startSimon appends canvas to simon-canvas', () => {
    startSimon()
    const wrap = document.getElementById('simon-canvas')
    expect(wrap?.querySelector('canvas')).toBeTruthy()
  })

  it('closeSimon hides the game container', () => {
    startSimon()
    closeSimon()
    const el = document.getElementById('simon-game')
    expect(el?.style.display).toBe('none')
  })

  it('closeSimon removes keydown listener', () => {
    startSimon()
    closeSimon()
    const el = document.getElementById('simon-game')!
    el.style.display = 'flex'
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(el.style.display).toBe('flex')
  })

  it('does nothing when simon-game element is missing', () => {
    document.body.innerHTML = ''
    expect(() => startSimon()).not.toThrow()
    expect(() => closeSimon()).not.toThrow()
  })
})
