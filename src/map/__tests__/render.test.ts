import { describe, it, expect, beforeEach } from 'vitest'
import { startSpotHub } from '../hub'
import { useDogStore } from '../../store'

describe('startSpotHub', () => {
  beforeEach(() => {
    localStorage.clear()
    useDogStore.getState().reset()
    document.body.innerHTML = `
      <div id="spot-hub" class="">
        <div id="hub-top">
          <span id="hub-icon">🐕</span>
          <span id="hub-title">Stray Dog</span>
        </div>
        <div id="hub-grid"></div>
      </div>
      <div id="puzzle4" class="active"></div>
    `
  })

  it('startSpotHub opens the hub container', () => {
    startSpotHub()
    const el = document.getElementById('spot-hub')
    expect(el?.classList.contains('open')).toBe(true)
  })

  it('startSpotHub renders 5 spot cards in the grid', () => {
    startSpotHub()
    const grid = document.getElementById('hub-grid')
    expect(grid?.children.length).toBe(5)
  })

  it('startSpotHub shows s0 as unlocked, s1-s4 as locked', () => {
    startSpotHub()
    const cards = document.querySelectorAll('.hub-card')
    expect(cards[0].classList.contains('locked')).toBe(false) // s0 unlocked
    expect(cards[1].classList.contains('locked')).toBe(true)  // s1 locked (needs s0)
    expect(cards[2].classList.contains('locked')).toBe(true)  // s2 locked (needs s1)
    expect(cards[3].classList.contains('locked')).toBe(true)  // s3 locked (needs s2)
    expect(cards[4].classList.contains('locked')).toBe(true)  // s4 locked (needs 4 badges)
  })

  it('startSpotHub unlocks s2 after s0+s1 completed', () => {
    useDogStore.getState().completeSpot('s0')
    useDogStore.getState().completeSpot('s1')
    startSpotHub()
    const cards = document.querySelectorAll('.hub-card')
    expect(cards[2].classList.contains('locked')).toBe(false)
  })

  it('marks completed spots as done', () => {
    useDogStore.getState().completeSpot('s0')
    startSpotHub()
    const cards = document.querySelectorAll('.hub-card')
    expect(cards[0].classList.contains('done')).toBe(true)
    expect(cards[1].classList.contains('done')).toBe(false)
  })
})
