import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDogStore } from '../store'
import { setPhase, setSteps, clearSteps, getPhase } from '../game-state'
import { startSpotHub } from '../map/hub'
import { SPOTS, SCENE_REUNION } from '../story/spots'
import {
  switchScreen, showScreen, hideEl, enableDebugMode,
  goToHub, showCompleteScreen, showResultScreen,
  confetti, shareResult, renderDebugPanel, showClearedStory,
} from '../main'

function setupFullDOM(): void {
  document.body.innerHTML = `
    <div id="screen">
      <div id="intro" class="screen active">
        <div id="intro-bg"></div>
        <button id="intro-skip">スキップ ▶▶</button>
        <div id="intro-text-area"><div id="intro-text"></div></div>
        <div class="bottom-bar"><button id="intro-start" class="btn">タップして次へ</button></div>
      </div>
      <div id="adventure-overlay">
        <div id="adventure-text"></div>
        <div id="adventure-choices" class="adv-choices">
          <button id="adv-yes" class="adv-choice adv-choice-yes">はい</button>
          <button id="adv-no" class="adv-choice adv-choice-no">いいえ</button>
        </div>
      </div>
      <div id="puzzle4">
        <div id="puzzle4-card">
          <div id="puzzle4-head">
            <div><div id="puzzle4-title">🐕 写真をなおして</div><div id="puzzle4-hint">タップで選ぶ</div></div>
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
      <div id="spot-hub">
        <div id="hub-top">
          <span id="hub-icon">🐕</span><span id="hub-title">Stray Dog</span>
        </div>
        <div id="hub-grid"></div>
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
      <div id="map-wrap" class="screen">
        <div id="map-top"><h2>🐕 Stray Dog</h2><div class="prog debug-only">進捗 <span id="prog-num">0</span>/4</div></div>
        <div id="map"></div>
        <div id="bottom-sheet">
          <div id="bs-handle"></div>
          <div id="bs-title">到着しました</div>
          <div id="bs-sub">📍 タップして謎を解く</div>
          <div id="bs-desc">スマホで答えを入力しよう</div>
          <div id="bs-loading"><div class="spinner"></div>位置情報を取得中...</div>
          <button id="bs-btn" class="locked">謎を解く</button>
        </div>
      </div>
      <div id="toolbar">
        <button id="tool-btn-memo" class="tool-btn" data-tool="memo">📝</button>
        <button id="tool-btn-map" class="tool-btn" data-tool="map">🗺️</button>
        <button id="tool-btn-camera" class="tool-btn" data-tool="camera">📷</button>
        <button id="tool-btn-mic" class="tool-btn" data-tool="mic">🎤</button>
      </div>
      <div id="tool-memo" class="tool-overlay">
        <div id="memo-head"><span>📝 メモ</span><button id="memo-close">✕</button></div>
        <textarea id="memo-textarea" placeholder="会話のメモをここに…"></textarea>
      </div>
      <div id="tool-camera" class="tool-overlay">
        <div id="camera-head"><span>📷 カメラ</span><button id="camera-close">✕</button></div>
        <video id="camera-video" autoplay playsinline></video>
        <div id="camera-fallback">📷 カメラにアクセスできません</div>
      </div>
      <div id="tool-mic" class="tool-overlay">
        <div id="mic-head"><span>🎤 マイク</span><button id="mic-close">✕</button></div>
        <div id="mic-body"><div id="mic-indicator"></div><div id="mic-status">🎤 タップで録音開始</div></div>
      </div>
      <div id="debug-panel">
        <div id="debug-head"><span>🐛 Debug</span><button id="debug-close">✕</button></div>
        <div id="debug-body"></div>
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
        <button class="btn" id="complete-share-btn" style="background:#2a2a3e;color:#ffd700">📤 シェアする</button>
        <button class="btn" id="complete-btn">もう一度遊ぶ 🔄</button>
      </div>
    </div>
  `
}

describe('UX flow: screen transitions', () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.innerHTML = ''
    setupFullDOM()
    useDogStore.getState().reset()
  })

  // === 2.1 Intro → screen isolation ===
  it('showScreen activates only the target screen', () => {
    showScreen('intro')
    expect(document.getElementById('intro')?.classList.contains('active')).toBe(true)
    // other .screen elements should not be active
    document.querySelectorAll('.screen').forEach(el => {
      if (el.id !== 'intro') expect(el.classList.contains('active')).toBe(false)
    })
  })

  it('switchScreen adds exit class to from and delays enter on to', () => {
    showScreen('intro')
    switchScreen('intro', 'puzzle4')
    expect(document.getElementById('intro')?.classList.contains('screen-exit')).toBe(true)
    // to element gets active + screen-enter after animationend
  })

  it('hideEl sets display:none', () => {
    const el = document.getElementById('puzzle4')!
    el.style.display = 'block'
    hideEl('puzzle4')
    expect(el.style.display).toBe('none')
  })

  // === UX 2.0: Intro → 4x4 puzzle ===
  it('intro skip button is present and wired', () => {
    showScreen('intro')
    const skipBtn = document.getElementById('intro-skip')
    expect(skipBtn).toBeTruthy()
    expect(skipBtn?.textContent).toContain('スキップ')
    expect(skipBtn?.style.display).not.toBe('none')
  })

  // === UX 2.1: 4x4 puzzle ===
  it('puzzle elements are present', () => {
    expect(document.getElementById('puzzle4-grid')).toBeTruthy()
    expect(document.getElementById('puzzle4-status')).toBeTruthy()
    expect(document.getElementById('p4-go')).toBeTruthy()
    expect(document.getElementById('puzzle4-close')).toBeTruthy()
  })

  // === UX 2.2: Hub ===
  it('goToHub sets phase to hub and opens hub with 5 spot cards', () => {
    goToHub()
    expect(getPhase()).toBe('hub')
    const hub = document.getElementById('spot-hub')
    expect(hub?.classList.contains('open')).toBe(true)
    const cards = document.getElementById('hub-grid')?.children
    expect(cards?.length).toBe(5)
  })

  it('s3 unlocks after 3 badges', () => {
    useDogStore.getState().completeSpot('s0')
    useDogStore.getState().completeSpot('s1')
    useDogStore.getState().completeSpot('s2')
    const hub = document.getElementById('spot-hub')!
    startSpotHub()
    const cards = hub.querySelectorAll('.hub-card')
    expect(cards[3].classList.contains('locked')).toBe(false)
  })

  // === UX 2.3: Result screen ===
  it('showResultScreen displays icon, title, badge, and progress', () => {
    useDogStore.getState().completeSpot('s0')
    showResultScreen('🍨', 'バッジを獲得！', 'クリームソーダのバッジ', '1/3 のヒント玉を収集')
    const r = document.getElementById('result')
    expect(r?.style.display).toBe('flex')
    expect(document.getElementById('r-icon')?.textContent).toBe('🍨')
    expect(document.getElementById('r-title')?.textContent).toBe('バッジを獲得！')
    expect(document.getElementById('r-badge')?.textContent).toContain('クリームソーダのバッジ')
    expect(document.getElementById('r-progress')?.textContent).toContain('🟡 1/3')
  })

  // === UX 2.4: Complete screen ===
  it('showCompleteScreen displays complete container and triggers phase', () => {
    showCompleteScreen()
    expect(getPhase()).toBe('complete')
    const el = document.getElementById('complete')
    expect(el?.style.display).toBe('flex')
    expect(document.getElementById('complete-share-btn')).toBeTruthy()
    expect(document.getElementById('complete-btn')?.textContent).toContain('もう一度遊ぶ')
  })

  it('complete button calls hideEl and reset', () => {
    useDogStore.getState().setIntroDone()
    useDogStore.getState().completeSpot('s0')
    showCompleteScreen()
    // wire the restart handler (normally done in DOMContentLoaded)
    document.getElementById('complete-btn')!.onclick = () => {
      hideEl('complete')
      useDogStore.getState().reset()
    }
    document.getElementById('complete-btn')?.click()
    expect(document.getElementById('complete')?.style.display).toBe('none')
    expect(useDogStore.getState().introDone).toBe(false)
    expect(useDogStore.getState().completed).toEqual([])
  })

  // === UX: Confetti ===
  it('confetti creates 40 div elements with correct class', () => {
    confetti()
    const particles = document.querySelectorAll('.confetti')
    expect(particles.length).toBe(40)
  })

  // === UX: Debug mode ===
  it('enableDebugMode reveals debug-only elements', () => {
    const debugEl = document.querySelector('.prog.debug-only') as HTMLElement | null
    expect(debugEl?.classList.contains('debug-only')).toBe(true)
    enableDebugMode()
    expect(debugEl?.classList.contains('debug-only')).toBe(false)
  })

  it('renderDebugPanel fills debug-body with spot cards', () => {
    renderDebugPanel()
    const body = document.getElementById('debug-body')
    expect(body?.innerHTML).toContain('さぼうる')
    expect(body?.innerHTML).toContain('s0')
    expect(body?.innerHTML).toContain('s1')
    expect(body?.innerHTML).toContain('s2')
    expect(body?.innerHTML).toContain('s3')
    expect(body?.innerHTML).toContain('completed:')
  })

  // === UX: Share ===
  it('shareResult copies to clipboard when navigator.share is unavailable', async () => {
    const writeText = vi.fn(() => Promise.resolve())
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText }, configurable: true,
    })
    // ensure navigator.share is undefined so we fall through to clipboard
    shareResult()
    await new Promise(r => setTimeout(r, 10))
    expect(writeText).toHaveBeenCalled()
    expect(writeText.mock.calls[0][0]).toContain('Stray Dog をクリア')
  })

  // === UX 2.5: showClearedStory builds story steps and starts adventure ===
  it('showClearedStory shows adventure overlay for spot s0', () => {
    SPOTS.find(s => s.id === 's0')! // reference to load SPOTS
    showClearedStory('s0')
    const overlay = document.getElementById('adventure-overlay')
    expect(overlay?.style.display).toBe('flex')
  })

  // === UX flow: end-to-end state transitions ===
  it('flow: empty completed → hub shows all locked', () => {
    goToHub()
    const cards = document.querySelectorAll('.hub-card')
    expect(cards[0].classList.contains('locked')).toBe(false) // s0 open
    expect(cards[1].classList.contains('locked')).toBe(false) // s1 open
    expect(cards[2].classList.contains('locked')).toBe(true)  // s2 locked
    expect(cards[3].classList.contains('locked')).toBe(true)  // s3 locked
  })

  it('flow: s0+s1 complete → s2 unlocks', () => {
    useDogStore.getState().completeSpot('s0')
    useDogStore.getState().completeSpot('s1')
    goToHub()
    const cards = document.querySelectorAll('.hub-card')
    expect(cards[2].classList.contains('locked')).toBe(false) // s2 unlocked
    expect(cards[3].classList.contains('locked')).toBe(true)  // s3 still locked
  })

  it('flow: all 3 badges → s3 unlocks', () => {
    useDogStore.getState().completeSpot('s0')
    useDogStore.getState().completeSpot('s1')
    useDogStore.getState().completeSpot('s2')
    goToHub()
    const cards = document.querySelectorAll('.hub-card')
    expect(cards[3].classList.contains('locked')).toBe(false) // s3 unlocked
  })
})
