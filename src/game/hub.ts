import { useDogStore } from '../store'
import { SPOTS, BADGE_SPOTS } from './spots'

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
  el.style.display = 'flex'
  const p4 = document.getElementById('puzzle4')
  if (p4) p4.style.display = 'none'
  renderHub()
}

export function registerGameStarters(): void {
  ;(window as any).__gameStarters = {
    s0: () => import('./puyo-game').then(m => m.startPuyoGame(0)),
    s1: () => import('./simon-game').then(m => m.startSimon()),
    s2: () => import('./quiz4-game').then(m => m.startQuiz4()),
  }
}
