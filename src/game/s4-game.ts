import { completeCurrentSpot } from '../map/hub'

interface S4Config {
  left: { id: string; label: string }[]
  right: { id: string; label: string }[]
  pairs: Record<string, string>  // left-id → right-id
}

const DEFAULT_CONFIG: S4Config = {
  left: [
    { id: 'bach', label: '🎼 Bach' },
    { id: 'goldberg', label: '🎹 Goldberg' },
    { id: 'aria', label: '🎵 Aria' },
  ],
  right: [
    { id: 'sabouru', label: '🍨 さぼうる' },
    { id: 'hibiki', label: '🔔 響' },
    { id: 'yon3f', label: '🎵 YON 3F' },
  ],
  pairs: { bach: 'yon3f', goldberg: 'sabouru', aria: 'hibiki' },
}

let currentConfig = DEFAULT_CONFIG
let matchedCount = 0

export function startS4Game(config?: S4Config): void {
  currentConfig = config ?? DEFAULT_CONFIG
  const el = document.getElementById('s4-game')
  if (!el) return
  el.style.display = 'flex'
  matchedCount = 0

  // Render left
  const left = document.getElementById('s4-left')!
  left.innerHTML = currentConfig.left.map(l =>
    `<div class="s4-fixed" data-id="${l.id}">${l.label}</div>`
  ).join('')

  // Render right
  const right = document.getElementById('s4-right')!
  right.innerHTML = currentConfig.right.map(r =>
    `<div class="s4-drag" draggable="true" data-id="${r.id}">${r.label}</div>`
  ).join('')

  document.getElementById('s4-status')!.textContent = ''

  document.querySelectorAll('.s4-drag').forEach(d => {
    const el = d as HTMLElement
    el.classList.remove('matched')
    el.draggable = true
    el.addEventListener('dragstart', onDragStart)
    el.addEventListener('dragend', onDragEnd)
  })

  document.querySelectorAll('.s4-fixed').forEach(f => {
    f.classList.remove('matched')
    f.addEventListener('dragover', onDragOver)
    f.addEventListener('drop', onDrop)
  })

  document.getElementById('s4-close')?.addEventListener('click', closeS4Game, { once: true })
}

function onDragStart(e: DragEvent): void {
  const el = e.target as HTMLElement
  e.dataTransfer!.setData('text/plain', el.dataset.id!)
  el.classList.add('dragging')
}

function onDragEnd(e: DragEvent): void {
  (e.target as HTMLElement).classList.remove('dragging')
}

function onDragOver(e: DragEvent): void {
  e.preventDefault()
}

function onDrop(e: DragEvent): void {
  e.preventDefault()
  const fixed = e.currentTarget as HTMLElement
  const dragId = e.dataTransfer!.getData('text/plain')
  const fixedId = fixed.dataset.id!

  if (currentConfig.pairs[fixedId] === dragId) {
    fixed.classList.add('matched')
    const dragEl = document.querySelector(`.s4-drag[data-id="${dragId}"]`) as HTMLElement
    if (dragEl) {
      dragEl.classList.add('matched')
      dragEl.draggable = false
    }
    matchedCount++
    updateStatus()
    if (matchedCount === Object.keys(currentConfig.pairs).length) {
      setTimeout(() => {
        closeS4Game()
        completeCurrentSpot()
      }, 800)
    }
  }
}

function updateStatus(): void {
  const el = document.getElementById('s4-status')
  if (el) el.textContent = `${matchedCount}/3 マッチ`
}

function closeS4Game(): void {
  const el = document.getElementById('s4-game')
  if (el) el.style.display = 'none'
}
