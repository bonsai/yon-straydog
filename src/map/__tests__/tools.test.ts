import { describe, it, expect, beforeEach } from 'vitest'
import { showTools, setupTools } from '../hub'

describe('showTools', () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="toolbar" class=""></div>`
  })

  it('shows toolbar when visible=true', () => {
    showTools(true)
    const el = document.getElementById('toolbar')
    expect(el?.classList.contains('open')).toBe(true)
  })

  it('hides toolbar when visible=false', () => {
    showTools(true)
    showTools(false)
    const el = document.getElementById('toolbar')
    expect(el?.classList.contains('open')).toBe(false)
  })
})

describe('setupTools', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="toolbar" class="">
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
        <div id="mic-body">
          <div id="mic-indicator"></div>
          <div id="mic-status">🎤 タップで録音開始</div>
        </div>
      </div>
      <div id="spot-hub" class="">
        <div id="hub-grid"></div>
      </div>
      <div id="map-wrap" style="display:none">
        <h2>🐕 Stray Dog</h2>
      </div>
    `
  })

  it('setupTools wires memo button click without throwing', () => {
    expect(() => setupTools()).not.toThrow()
  })

  it('memo button toggles memo overlay', () => {
    setupTools()
    const memoBtn = document.getElementById('tool-btn-memo')!
    const memoOverlay = document.getElementById('tool-memo')!
    memoBtn.click()
    expect(memoOverlay.classList.contains('open')).toBe(true)
    memoBtn.click()
    expect(memoOverlay.classList.contains('open')).toBe(false)
  })

  it('memo close button closes overlay', () => {
    setupTools()
    document.getElementById('tool-btn-memo')!.click()
    document.getElementById('memo-close')!.click()
    expect(document.getElementById('tool-memo')!.classList.contains('open')).toBe(false)
  })

  it('map button toggles between hub and map', () => {
    setupTools()
    const mapWrap = document.getElementById('map-wrap')!
    const hub = document.getElementById('spot-hub')!
    mapWrap.style.display = 'flex'
    document.getElementById('tool-btn-map')!.click()
    expect(hub.classList.contains('open')).toBe(true)
    expect(mapWrap.style.display).toBe('none')
  })

  it('camera button does not throw on click', () => {
    setupTools()
    expect(() => document.getElementById('tool-btn-camera')!.click()).not.toThrow()
  })

  it('mic button does not throw on click', () => {
    setupTools()
    expect(() => document.getElementById('tool-btn-mic')!.click()).not.toThrow()
  })

  it('camera close button hides overlay', () => {
    setupTools()
    document.getElementById('tool-btn-camera')!.click()
    document.getElementById('camera-close')!.click()
    const fb = document.getElementById('camera-fallback')
    expect(fb?.style.display).toBe('none')
  })

  it('mic close button hides overlay', () => {
    setupTools()
    document.getElementById('tool-btn-mic')!.click()
    document.getElementById('mic-close')!.click()
    const status = document.getElementById('mic-status')
    expect(status?.textContent).toBe('🎤 タップで録音開始')
  })
})
