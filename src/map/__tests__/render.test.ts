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
          <button id="hub-story-btn" class="hub-story-btn">📖</button>
          <button id="hub-debug-btn" class="hub-story-btn debug-only">🐛</button>
          <div id="hub-balls">⚪⚪⚪</div>
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

  it('startSpotHub renders 4 spot cards in the grid', () => {
    startSpotHub()
    const grid = document.getElementById('hub-grid')
    expect(grid?.children.length).toBe(4)
  })

  it('startSpotHub shows s0 and s1 as unlocked, s2 as locked', () => {
    startSpotHub()
    const cards = document.querySelectorAll('.hub-card')
    expect(cards[0].classList.contains('locked')).toBe(false) // s0
    expect(cards[1].classList.contains('locked')).toBe(false) // s1
    expect(cards[2].classList.contains('locked')).toBe(true)  // s2 locked
    expect(cards[3].classList.contains('locked')).toBe(true)  // s3 locked
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

  it('renders badge balls (3 balls)', () => {
    startSpotHub()
    const balls = document.getElementById('hub-balls')
    const ballSpans = balls?.querySelectorAll('span')
    expect(ballSpans?.length).toBe(3)
  })

  it('updates badge display when spots are completed', () => {
    useDogStore.getState().completeSpot('s0')
    startSpotHub()
    const balls = document.getElementById('hub-balls')
    const ballSpans = balls?.querySelectorAll('span')
    expect(ballSpans?.[0]?.title).toBe('クリームソーダのバッジ')
    expect(ballSpans?.[1]?.title).toBe('響（野外彫刻）')
  })
})
