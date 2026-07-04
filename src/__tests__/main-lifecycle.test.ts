import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useDogStore } from '../store'
import { getPhase } from '../game-state'
import {
  startIntro,
  finishIntroState,
  start4x4Puzzle,
  onPuzzleComplete,
  goToHub,
  showScreen,
  hideEl,
} from '../main'

import { isSolved, type PuzzleState } from '../game/puzzle'
import * as puzzleModule from '../game/puzzle'

const puzzle4DOM = `
  <div id="puzzle4" class="screen">
    <div id="puzzle4-card">
      <div id="puzzle4-head">
        <div>
          <div id="puzzle4-title">🐕 写真をなおして</div>
          <div id="puzzle4-hint">タップで選ぶ</div>
        </div>
        <button id="puzzle4-close">✕</button>
      </div>
      <div id="puzzle4-body">
        <div id="puzzle4-grid"></div>
        <div id="puzzle4-status">操作: 0 回</div>
        <div id="p4-solved-hint"><div>🐾</div>「さぼうる の レインボウを さがせ」</div>
      </div>
      <div id="puzzle4-foot"><button id="p4-go" class="btn">さぼうるへ行く →</button></div>
    </div>
  </div>
`

const fullDOM = `
  <div id="screen">
    <div id="intro" class="screen">
      <div id="intro-bg"></div>
      <button id="intro-skip">スキップ ▶▶</button>
      <div id="intro-text-area"><div id="intro-text"></div></div>
      <div class="bottom-bar"><button id="intro-start" class="btn">タップして次へ</button></div>
    </div>
    ${puzzle4DOM}
    <div id="spot-hub">
      <div id="hub-top">
        <span id="hub-icon">🐕</span><span id="hub-title">Stray Dog</span>
      </div>
      <div id="hub-grid"></div>
    </div>
    <div id="map-wrap" class="screen">
      <div id="map-top"><h2>🐕 Stray Dog</h2></div>
      <div id="map"></div>
      <div id="bottom-sheet">
        <div id="bs-title">到着しました</div>
        <button id="bs-btn" class="locked">謎を解く</button>
      </div>
    </div>
    <div id="toolbar">
      <button id="tool-btn-memo" class="tool-btn">📝</button>
      <button id="tool-btn-map" class="tool-btn">🗺️</button>
    </div>
    <div id="adventure-overlay">
      <div id="adventure-text"></div>
      <div id="adventure-choices" class="adv-choices">
        <button id="adv-yes" class="adv-choice adv-choice-yes">はい</button>
        <button id="adv-no" class="adv-choice adv-choice-no">いいえ</button>
      </div>
    </div>
    <div id="result">
      <div class="icon" id="r-icon">🐾</div>
      <h2 id="r-title">見つけた！</h2>
      <p class="sub" id="r-text">犬の足跡を発見した</p>
      <div class="badge" id="r-badge">🏅 バッジ獲得</div>
      <div class="badge-progress" id="r-progress"></div>
      <button class="btn" id="r-btn">つづける</button>
    </div>
    <div id="complete">
      <div class="icon" id="complete-icon">🐕</div>
      <h2 id="complete-title">犬を見つけた！</h2>
      <div id="complete-scroll"><p id="complete-body">足跡をたどって辿り着くと——</p></div>
      <button class="btn" id="complete-share-btn">📤 シェアする</button>
      <button class="btn" id="complete-btn">もう一度遊ぶ 🔄</button>
    </div>
    <div id="debug-panel">
      <div id="debug-head"><span>🐛 Debug</span><button id="debug-close">✕</button></div>
      <div id="debug-body"></div>
    </div>
    <div id="story-mode">
      <div id="story-mode-card">
        <div id="story-mode-head"><span id="story-mode-icon"></span><span id="story-mode-title"></span></div>
        <div id="story-mode-scroll"><div id="story-mode-text"></div></div>
        <div id="story-mode-foot">
          <button id="story-mode-prev" class="btn hidden-btn">◀ 戻る</button>
          <button id="story-mode-next" class="btn">次へ ▶</button>
        </div>
      </div>
    </div>
  </div>
`

describe('startIntro', () => {
  beforeEach(() => {
    localStorage.clear()
    useDogStore.getState().reset()
    document.body.innerHTML = fullDOM
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('sets phase to intro and shows intro screen', () => {
    startIntro()
    expect(getPhase()).toBe('intro')
    expect(document.getElementById('intro')?.classList.contains('active')).toBe(true)
  })

  it('shows skip button and hides bottom bar', () => {
    startIntro()
    const skipBtn = document.getElementById('intro-skip')
    expect(skipBtn?.style.display).toBe('block')
    const bottomBar = document.querySelector('#intro .bottom-bar') as HTMLElement
    expect(bottomBar?.style.display).toBe('none')
  })

  it('sets background image on intro-bg', () => {
    startIntro()
    const bgEl = document.getElementById('intro-bg')
    expect(bgEl?.style.background).toContain('gdog.png')
    expect(bgEl?.style.opacity).toBe('1')
  })

  it('hides toolbar during intro', () => {
    const toolbar = document.getElementById('toolbar')!
    toolbar.classList.add('open')
    startIntro()
    expect(toolbar.classList.contains('open')).toBe(false)
  })

  it('skip button click sets introDone and triggers puzzle', () => {
    startIntro()
    const skipBtn = document.getElementById('intro-skip')!
    skipBtn.click()
    expect(useDogStore.getState().introDone).toBe(true)
    expect(localStorage.getItem('sd_intro_done')).toBe('true')
  })

  it('if introDone=true, skips to finishIntroState immediately', () => {
    useDogStore.getState().setIntroDone()
    startIntro()
    // finishIntroState uses setTimeout 100ms; it shows intro screen first
    expect(document.getElementById('intro')?.classList.contains('active')).toBe(true)
  })
})

describe('finishIntroState', () => {
  beforeEach(() => {
    localStorage.clear()
    useDogStore.getState().reset()
    document.body.innerHTML = fullDOM
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows bg and skip button on intro', () => {
    finishIntroState()
    const bgEl = document.getElementById('intro-bg')
    expect(bgEl?.style.opacity).toBe('1')
    expect(document.getElementById('intro-skip')?.style.display).toBe('block')
  })

  it('if sd_4x4_done=false, transitions to puzzle4 after timeout', () => {
    localStorage.setItem('sd_4x4_done', 'false')
    finishIntroState()
    vi.advanceTimersByTime(100)
    // puzzle4 should be active
    expect(document.getElementById('puzzle4-grid')?.children.length).toBeGreaterThan(0)
  })

  it('if sd_4x4_done=true, goes to hub after timeout', () => {
    localStorage.setItem('sd_4x4_done', 'true')
    finishIntroState()
    vi.advanceTimersByTime(100)
    expect(getPhase()).toBe('hub')
    expect(document.getElementById('spot-hub')?.classList.contains('open')).toBe(true)
  })
})

describe('start4x4Puzzle', () => {
  beforeEach(() => {
    localStorage.clear()
    useDogStore.getState().reset()
    document.body.innerHTML = fullDOM
  })

  it('sets phase to puzzle', () => {
    start4x4Puzzle()
    expect(getPhase()).toBe('puzzle')
  })

  it('renders 16 tiles in the grid', () => {
    start4x4Puzzle()
    const tiles = document.getElementById('puzzle4-grid')?.children
    expect(tiles?.length).toBe(16)
  })

  it('hides solved-hint and go button initially', () => {
    start4x4Puzzle()
    const solvedHint = document.getElementById('p4-solved-hint')
    expect(solvedHint?.style.display).toBe('none')
    const goBtn = document.getElementById('p4-go')
    expect(goBtn?.classList.contains('show')).toBe(false)
  })

  it('shows move count as 0 initially', () => {
    start4x4Puzzle()
    expect(document.getElementById('puzzle4-status')?.textContent).toContain('0')
  })

  it('if sd_4x4_done=true, creates solved puzzle state', () => {
    localStorage.setItem('sd_4x4_done', 'true')
    start4x4Puzzle()
    const grid = document.getElementById('puzzle4-grid')!
    const tiles = grid.querySelectorAll('.p4-tile')
    let allInPlace = true
    tiles.forEach(t => {
      if (!t.classList.contains('in-place')) allInPlace = false
    })
    expect(allInPlace).toBe(true)
  })

  it('tap on tile selects it, second tap swaps', () => {
    start4x4Puzzle()
    const grid = document.getElementById('puzzle4-grid')!
    const tile0 = grid.children[0] as HTMLElement
    const tile1 = grid.children[1] as HTMLElement
    const origBg0 = tile0.style.backgroundPosition
    const origBg1 = tile1.style.backgroundPosition

    tile0.click()
    // After renderGrid, re-query the DOM
    const selTile = grid.querySelector('.p4-tile.selected')
    expect(selTile).toBeTruthy()

    const tile1After = grid.children[1] as HTMLElement
    tile1After.click()
    // After swap, re-query: positions may have changed
    const newBg0 = (grid.children[0] as HTMLElement).style.backgroundPosition
    const newBg1 = (grid.children[1] as HTMLElement).style.backgroundPosition
    const changed = (newBg0 !== origBg0 || newBg1 !== origBg1)
    expect(changed).toBe(true)
  })

  it('puzzle close button triggers puzzle completion', () => {
    start4x4Puzzle()
    const closeBtn = document.getElementById('puzzle4-close')!
    const hub = document.getElementById('spot-hub')!
    closeBtn.click()
    expect(hub.classList.contains('open')).toBe(true)
  })
})

describe('onPuzzleComplete', () => {
  beforeEach(() => {
    localStorage.clear()
    useDogStore.getState().reset()
    document.body.innerHTML = fullDOM
  })

  it('transitions to hub', () => {
    onPuzzleComplete()
    expect(getPhase()).toBe('hub')
    expect(document.getElementById('spot-hub')?.classList.contains('open')).toBe(true)
  })
})

describe('goToHub', () => {
  beforeEach(() => {
    localStorage.clear()
    useDogStore.getState().reset()
    document.body.innerHTML = fullDOM
  })

  it('sets phase to hub and opens spot-hub with 5 cards', () => {
    goToHub()
    expect(getPhase()).toBe('hub')
    const cards = document.getElementById('hub-grid')?.children
    expect(cards?.length).toBe(5)
  })

  it('renders open cards for s0 and s1, locked for s2 and s3', () => {
    goToHub()
    const cards = document.querySelectorAll('.hub-card')
    expect(cards[0].classList.contains('locked')).toBe(false)
    expect(cards[1].classList.contains('locked')).toBe(false)
    expect(cards[2].classList.contains('locked')).toBe(true)
    expect(cards[3].classList.contains('locked')).toBe(true)
  })
})
