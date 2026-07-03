import { describe, it, expect, beforeEach } from 'vitest'
import { setupDebugAPI } from '../debug-api'
import { useDogStore } from '../store'
import { SPOTS } from '../story/spots'

describe('debug API', () => {
  beforeEach(() => {
    localStorage.clear()
    useDogStore.getState().reset()
    delete (window as any).__debug
    document.body.innerHTML = `
      <div id="simon-game" style="display:none"><div id="simon-canvas"></div></div>
      <div id="quiz4-game" style="display:none">
        <button id="quiz4-close">✕</button>
        <div id="quiz4-q"></div><div id="quiz4-hint"></div>
        <input id="quiz4-input" type="text"><button id="quiz4-btn">答える</button><div id="quiz4-fb"></div>
      </div>
      <div id="puyo-game" style="display:none">
        <div id="puyo-station-label"></div><div id="puyo-canvas"></div>
      </div>
      <div id="result">
        <div class="icon" id="r-icon">🐾</div><h2 id="r-title"></h2>
        <p class="sub" id="r-text"></p><div class="badge" id="r-badge"></div>
        <div class="badge-progress" id="r-progress"></div>
        <button class="btn" id="r-btn">つづける</button>
      </div>
      <div id="complete">
        <div class="icon" id="complete-icon">🐕</div>
        <h2 id="complete-title">犬を見つけた！</h2>
        <div id="complete-scroll"><p id="complete-body"></p></div>
        <button class="btn" id="complete-share-btn">📤 シェアする</button>
        <button class="btn" id="complete-btn">もう一度遊ぶ 🔄</button>
      </div>
    `
  })

  it('setupDebugAPI creates window.__debug', () => {
    setupDebugAPI()
    expect((window as any).__debug).toBeDefined()
  })

  it('__debug.state.get() returns current state', () => {
    setupDebugAPI()
    const state = (window as any).__debug.state.get()
    expect(state).toHaveProperty('completed')
    expect(state).toHaveProperty('badges')
    expect(state).toHaveProperty('introDone')
    expect(state.badges).toBe(0)
  })

  it('__debug.state.complete() marks spot as done', () => {
    setupDebugAPI()
    ;(window as any).__debug.state.complete('s0')
    expect(useDogStore.getState().completed).toContain('s0')
  })

  it('__debug.state.completeAll() completes s0, s1, s2', () => {
    setupDebugAPI()
    ;(window as any).__debug.state.completeAll()
    const c = useDogStore.getState().completed
    expect(c).toContain('s0')
    expect(c).toContain('s1')
    expect(c).toContain('s2')
    expect(c).not.toContain('s3')
  })

  it('__debug.state.reset() clears all progress', () => {
    setupDebugAPI()
    useDogStore.getState().setIntroDone()
    useDogStore.getState().completeSpot('s0')
    ;(window as any).__debug.state.reset()
    expect(useDogStore.getState().introDone).toBe(false)
    expect(useDogStore.getState().completed).toEqual([])
  })

  it('__debug.state.introDone() marks intro as done', () => {
    setupDebugAPI()
    ;(window as any).__debug.state.introDone()
    expect(useDogStore.getState().introDone).toBe(true)
  })

  it('__debug.state.get() reflects badges after completions', () => {
    setupDebugAPI()
    useDogStore.getState().completeSpot('s0')
    useDogStore.getState().completeSpot('s1')
    const state = (window as any).__debug.state.get()
    expect(state.badges).toBe(2)
  })

  it('__debug.story.list() returns all story titles', () => {
    setupDebugAPI()
    const list = (window as any).__debug.story.list()
    expect(list.length).toBe(8)
    expect(list[0]).toContain('出会い')
  })

  it('__debug.data.spots references spot definitions', () => {
    setupDebugAPI()
    const spots = (window as any).__debug.data.spots
    expect(spots.length).toBe(4)
    expect(spots[0].id).toBe('s0')
  })

  it('__debug.game.simon() starts simon game', () => {
    setupDebugAPI()
    ;(window as any).__debug.game.simon()
    const el = document.getElementById('simon-game')
    expect(el?.style.display).toBe('flex')
  })

  it('__debug.game.quiz() starts quiz game', () => {
    setupDebugAPI()
    ;(window as any).__debug.game.quiz()
    const el = document.getElementById('quiz4-game')
    expect(el?.style.display).toBe('flex')
  })

  it('__debug.help() does not throw', () => {
    setupDebugAPI()
    expect(() => (window as any).__debug.help()).not.toThrow()
  })
})
