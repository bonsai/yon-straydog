import { useDogStore } from '../store'
import { SPOTS, BADGE_SPOTS } from '../story/spots'
import { registerGameStarters as registerReg } from '../game/registry'
import { isTestMode } from '../test-mode'

const TOOLS_STORAGE_KEY = 'sd_memo'

function getMemo(): string {
  try { return localStorage.getItem(TOOLS_STORAGE_KEY) ?? '' }
  catch { return '' }
}

function saveMemo(text: string): void {
  localStorage.setItem(TOOLS_STORAGE_KEY, text)
}

export function appendMemo(text: string): void {
  const current = getMemo()
  const sep = current ? '\n' : ''
  saveMemo(current + sep + text)
}

let memoShown = false
let cameraStream: MediaStream | null = null
let micStream: MediaStream | null = null

function stopCamera(): void {
  if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null }
}

function stopMic(): void {
  if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null }
  const s = document.getElementById('mic-status')
  if (s) s.textContent = '🎤 タップで録音開始'
  document.getElementById('mic-indicator')?.classList.remove('recording')
}

export function showTools(visible: boolean): void {
  document.getElementById('toolbar')?.classList.toggle('open', visible)
}

function showMemo(): void {
  const overlay = document.getElementById('tool-memo')
  if (!overlay) return
  const wasOpen = overlay.classList.contains('open')
  cleanupTools()
  if (!wasOpen) {
    overlay.classList.add('open')
    const ta = document.getElementById('memo-textarea') as HTMLTextAreaElement
    if (ta) { ta.value = getMemo(); ta.focus() }
  }
}

function showCamera(): void {
  const overlay = document.getElementById('tool-camera')
  if (!overlay) return
  if (overlay.classList.contains('open')) { stopCamera(); overlay.classList.remove('open'); return }
  overlay.classList.add('open')
  const video = document.getElementById('camera-video') as HTMLVideoElement
  if (!video) return
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(stream => { cameraStream = stream; video.srcObject = stream })
    .catch(() => { const fb = document.getElementById('camera-fallback'); if (fb) fb.style.display = 'block' })
}

function showMic(): void {
  const overlay = document.getElementById('tool-mic')
  if (!overlay) return
  if (overlay.classList.contains('open')) { stopMic(); overlay.classList.remove('open'); return }
  overlay.classList.add('open')
  const status = document.getElementById('mic-status')
  if (status) status.textContent = '🎤 録音中...'
  document.getElementById('mic-indicator')?.classList.add('recording')
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => { micStream = stream; if (status) status.textContent = '🎤 録音中（タップで停止）' })
    .catch(() => { if (status) status.textContent = '🎤 マイクが使えません'; document.getElementById('mic-indicator')?.classList.remove('recording') })
}

function cleanupTools(): void {
  stopCamera(); stopMic()
  ;['tool-memo','tool-camera','tool-mic','tool-bag'].forEach(id => document.getElementById(id)?.classList.remove('open'))
  memoShown = false
}

function showBag(): void {
  const overlay = document.getElementById('tool-bag')
  if (!overlay) return
  const wasOpen = overlay.classList.contains('open')
  cleanupTools()
  if (!wasOpen) {
    overlay.classList.add('open')
    renderBag()
  }
}

function renderBag(): void {
  const ballsEl = document.getElementById('bag-balls')
  const progressEl = document.getElementById('bag-progress')
  if (!ballsEl || !progressEl) return
  const { completed } = useDogStore.getState()
  const total = 4
  const count = completed.length
  ballsEl.innerHTML = Array.from({ length: total }, (_, i) => {
    const done = i < count
    return `<span style="font-size:2rem;margin:0 6px;filter:${done?'none':'grayscale(1) opacity(.3)'}">${done?'🟡':'⚪'}</span>`
  }).join('')
  progressEl.textContent = `🐾 ヒント玉 ${count}/${total}`
}

export function updateBagIcon(): void {
  const btn = document.getElementById('tool-btn-bag')
  if (!btn) return
  const { completed } = useDogStore.getState()
  btn.textContent = completed.length > 0 ? '👜' : '👜'
  btn.setAttribute('data-count', String(completed.length))
}

export function setupTools(): void {
  document.getElementById('tool-btn-bag')?.addEventListener('click', showBag)
  document.getElementById('tool-btn-memo')?.addEventListener('click', showMemo)
  document.getElementById('tool-btn-map')?.addEventListener('click', () => {
    const hub = document.getElementById('spot-hub')
    const mapWrap = document.getElementById('map-wrap')
    if (mapWrap?.style.display === 'flex') {
      hub?.classList.add('open')
      mapWrap.style.display = 'none'
    } else {
      cleanupTools()
    }
  })
  document.getElementById('tool-btn-camera')?.addEventListener('click', showCamera)
  document.getElementById('tool-btn-mic')?.addEventListener('click', showMic)

  document.getElementById('tool-btn-reset')?.addEventListener('click', () => {
    useDogStore.getState().reset()
    location.hash = ''
    location.reload()
  })

  document.getElementById('memo-close')?.addEventListener('click', () => {
    const ta = document.getElementById('memo-textarea') as HTMLTextAreaElement
    if (ta) saveMemo(ta.value)
    document.getElementById('tool-memo')?.classList.remove('open')
    memoShown = false
  })
  document.getElementById('bag-close')?.addEventListener('click', () => {
    document.getElementById('tool-bag')?.classList.remove('open')
  })
  document.getElementById('camera-close')?.addEventListener('click', () => {
    stopCamera()
    document.getElementById('tool-camera')?.classList.remove('open')
    const fb = document.getElementById('camera-fallback')
    if (fb) fb.style.display = 'none'
  })
  document.getElementById('mic-close')?.addEventListener('click', () => { stopMic(); document.getElementById('tool-mic')?.classList.remove('open') })
}

export let currentGameSpot: string | null = null
export let onSpotCleared: ((spotId: string) => void) | null = null

export function setCurrentGameSpot(id: string | null): void { currentGameSpot = id }
export function setOnSpotCleared(cb: ((spotId: string) => void) | null): void { onSpotCleared = cb }

export function getBadgeCount(completed: string[]): number {
  return BADGE_SPOTS.filter(s => completed.includes(s.id)).length
}

export function completeCurrentSpot(): void {
  if (currentGameSpot) {
    const store = useDogStore.getState()
    if (!store.completed.includes(currentGameSpot)) store.completeSpot(currentGameSpot)
    const id = currentGameSpot
    currentGameSpot = null
    onSpotCleared?.(id)
    updateBagIcon()
  }
}

export function isSpotUnlocked(id: string, completed: string[]): boolean {
  if (isTestMode()) return true
  if (id === 's0') return true
  if (id === 's1') return completed.includes('s0') || localStorage.getItem('sd_intro_done') === 'true'
  if (id === 's2') return completed.includes('s1')
  if (id === 's3') return completed.includes('s2')
  if (id === 's4') return getBadgeCount(completed) >= 4
  return false
}

export function spotLockReason(id: string, completed: string[]): string {
  if (id === 's1') return 'まず YON 2F の写真を直そう'
  if (id === 's2') return 'まず 響 の音を聴こう'
  if (id === 's3') return 'まず 神田橋公園 を巡ろう'
  if (id === 's4') {
    const n = getBadgeCount(completed)
    return `ヒント玉 ${n}/4`
  }
  return '🔒'
}

function renderHub(): void {
  const grid = document.getElementById('hub-grid')
  const balls = document.getElementById('hub-balls')
  if (!grid) return
  const { completed } = useDogStore.getState()

  grid.innerHTML = SPOTS.map(s => {
    const done = completed.includes(s.id)
    const locked = !done && !isSpotUnlocked(s.id, completed)
    return `<div class="hub-card ${done?'done':locked?'locked':'open'}" data-id="${s.id}" style="background:${locked?'#111':done?'#0a1a0a':'#1a1a2e'};border:1px solid ${locked?'#222':done?'#2a5a2a':'#333'};border-radius:12px;padding:12px;text-align:center;cursor:${locked?'default':'pointer'};opacity:${locked?'.4':'1'}">
      <div style="font-size:1.8rem;margin-bottom:4px">${done?'✅':locked?'🔒':s.icon}</div>
      <div style="color:${done?'#4caf50':locked?'#555':'#ffd700'};font-size:.75rem;font-weight:bold;margin-bottom:2px">${s.name}</div>
      <div style="color:#666;font-size:.65rem;line-height:1.3">${done?'クリア！':locked?spotLockReason(s.id, completed):s.hint}</div>
    </div>`
  }).join('')
}

export function startSpotHub(): void {
  const el = document.getElementById('spot-hub')
  if (!el) return
  el.classList.add('open')
  const p4 = document.getElementById('puzzle4')
  if (p4) p4.classList.remove('active')
  renderHub()
  updateBagIcon()
}

export function registerGameStarters(): void {
  const starters: Record<string, () => void> = {}
  registerReg(starters)
  ;(window as any).__gameStarters = starters
}
