import { useDogStore } from '../store'
import { SPOTS, BADGE_SPOTS } from '../story/spots'
import { registerGameStarters as registerReg } from '../game/registry'

const TOOLS_STORAGE_KEY = 'sd_memo'

function getMemo(): string {
  try { return localStorage.getItem(TOOLS_STORAGE_KEY) ?? '' }
  catch { return '' }
}

function saveMemo(text: string): void {
  localStorage.setItem(TOOLS_STORAGE_KEY, text)
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
  memoShown = !memoShown
  overlay.classList.toggle('open', memoShown)
  if (memoShown) {
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
  ;['tool-memo','tool-camera','tool-mic'].forEach(id => document.getElementById(id)?.classList.remove('open'))
  memoShown = false
}

export function setupTools(): void {
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

  document.getElementById('memo-close')?.addEventListener('click', () => {
    const ta = document.getElementById('memo-textarea') as HTMLTextAreaElement
    if (ta) saveMemo(ta.value)
    document.getElementById('tool-memo')?.classList.remove('open')
    memoShown = false
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
  }
}

function isSpotUnlocked(id: string, completed: string[]): boolean {
  if (id === 's0' || id === 's1') return true
  if (id === 's2') return completed.includes('s0') && completed.includes('s1')
  if (id === 's3') return getBadgeCount(completed) >= 3
  return false
}

function spotLockReason(id: string, completed: string[]): string {
  if (id === 's2') return 'まず さぼうる と 響 を巡ろう'
  if (id === 's3') {
    const n = getBadgeCount(completed)
    return `ヒント玉 ${n}/3`
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

  renderBadges()
}

function renderBadges(): void {
  const balls = document.getElementById('hub-balls')
  if (!balls) return
  const { completed } = useDogStore.getState()
  balls.innerHTML = BADGE_SPOTS.map(s =>
    completed.includes(s.id) ? `<span title="${s.badgeName}">🟡</span>` : `<span title="${s.name}">⚪</span>`
  ).join('')
}

export function startSpotHub(): void {
  const el = document.getElementById('spot-hub')
  if (!el) return
  el.classList.add('open')
  const p4 = document.getElementById('puzzle4')
  if (p4) p4.classList.remove('active')
  renderHub()
}

export function registerGameStarters(): void {
  const starters: Record<string, () => void> = {}
  registerReg(starters)
  ;(window as any).__gameStarters = starters
}
