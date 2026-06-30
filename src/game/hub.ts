import { useDogStore } from '../store'
import { SPOTS } from './spots'

export let currentGameSpot: string | null = null

export function completeCurrentSpot(): void {
  if (currentGameSpot) {
    const store = useDogStore.getState()
    if (!store.completed.includes(currentGameSpot)) store.completeSpot(currentGameSpot)
    currentGameSpot = null
  }
  const hub = document.getElementById('spot-hub')
  if (hub) { hub.style.display = 'flex'; renderHub() }
}

function isSpotUnlocked(id: string, completed: string[]): boolean {
  if (id === 's0' || id === 's1') return true
  if (id === 's2') return completed.includes('s0') && completed.includes('s1')
  if (id === 's3') return completed.includes('s0') && completed.includes('s1') && completed.includes('s2')
  return false
}

function spotLockReason(id: string): string {
  if (id === 's2') return 'まず さぼうる と 響 を巡ろう'
  if (id === 's3') return '3つのヒント玉を集めよう'
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
      <div style="color:#666;font-size:.65rem;line-height:1.3">${done?'クリア！':locked?spotLockReason(s.id):s.hint}</div>
    </div>`
  }).join('')

  const ballSpots = SPOTS.filter(s => s.id !== 's3' && (isSpotUnlocked(s.id, completed) || completed.includes(s.id)))
  if (balls) balls.innerHTML = ballSpots.map(s => completed.includes(s.id) ? '🟡' : '⚪').join('')

  grid.querySelectorAll('.hub-card.open').forEach(el => {
    el.addEventListener('click', () => {
      const id = (el as HTMLElement).dataset.id
      if (!id) return
      const starter = (window as any).__gameStarters?.[id]
      if (starter) {
        currentGameSpot = id
        document.getElementById('spot-hub')!.style.display = 'none'
        starter()
      } else if (id === 's3') {
        useDogStore.getState().completeSpot('s3')
        showComplete()
      }
    })
  })
}

function showComplete(): void {
  showEl('complete')
  confetti()
}

function confetti(): void {
  for (let i = 0; i < 40; i++) {
    const c = document.createElement('div')
    c.className = 'confetti'
    c.style.left = Math.random() * 100 + '%'
    c.style.background = ['#ffd700','#4caf50','#ff6b6b','#4fc3f7','#ce93d8'][Math.floor(Math.random()*5)]
    c.style.width = (4 + Math.random() * 6) + 'px'
    c.style.height = (4 + Math.random() * 6) + 'px'
    c.style.animationDuration = (2 + Math.random() * 3) + 's'
    c.style.animationDelay = Math.random() * 2 + 's'
    document.body.appendChild(c); setTimeout(() => c.remove(), 5000)
  }
}

function showEl(id: string, display = 'flex'): void {
  const el = document.getElementById(id); if (el) el.style.display = display
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
  (window as any).__gameStarters = {
    s0: () => import('./puyo-game').then(m => m.startPuyoGame(0)),
    s1: () => import('./simon-game').then(m => m.startSimon()),
    s2: () => import('./quiz4-game').then(m => m.startQuiz4()),
  }
}
