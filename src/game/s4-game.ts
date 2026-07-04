import { completeCurrentSpot } from '../map/hub'

interface S4Config {
  left: { id: string; label: string }[]
  right: { id: string; label: string }[]
  pairs: Record<string, string>
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
let selectedDragId: string | null = null

export function startS4Game(config?: S4Config): void {
  currentConfig = config ?? DEFAULT_CONFIG
  const el = document.getElementById('s4-game')
  if (!el) return
  el.style.display = 'flex'
  matchedCount = 0
  selectedDragId = null

  renderS4()

  document.getElementById('s4-close')?.addEventListener('click', closeS4Game, { once: true })
}

function renderS4(): void {
  const left = document.getElementById('s4-left')!
  const right = document.getElementById('s4-right')!
  const status = document.getElementById('s4-status')!

  // render left (fixed slots)
  left.innerHTML = currentConfig.left.map(l => {
    const isMatched = document.querySelector(`.s4-fixed[data-id="${l.id}"].matched`) !== null || matchedCount > 0 && currentConfig.pairs[l.id] && document.querySelector(`.s4-drag[data-id="${currentConfig.pairs[l.id]}"].matched`) !== null
    const cls = isMatched ? 's4-fixed matched' : 's4-fixed'
    return `<div class="${cls}" data-id="${l.id}">${l.label}</div>`
  }).join('')

  // render right (selectable blocks)
  right.innerHTML = currentConfig.right.map(r => {
    const isMatched = document.querySelector(`.s4-drag[data-id="${r.id}"].matched`) !== null
    const isSelected = selectedDragId === r.id
    const cls = isMatched ? 's4-drag matched' : isSelected ? 's4-drag selected' : 's4-drag'
    return `<div class="${cls}" data-id="${r.id}">${r.label}</div>`
  }).join('')

  status.textContent = `${matchedCount}/3 マッチ`

  // attach click handlers
  document.querySelectorAll('.s4-drag:not(.matched)').forEach(d => {
    d.addEventListener('click', onDragClick)
  })
  document.querySelectorAll('.s4-fixed:not(.matched)').forEach(f => {
    f.addEventListener('click', onFixedClick)
  })
}

function onDragClick(e: Event): void {
  const el = e.currentTarget as HTMLElement
  const id = el.dataset.id!
  if (selectedDragId === id) {
    selectedDragId = null
  } else {
    selectedDragId = id
  }
  refreshSelection()
}

function onFixedClick(e: Event): void {
  if (!selectedDragId) return
  const fixed = e.currentTarget as HTMLElement
  const fixedId = fixed.dataset.id!

  if (currentConfig.pairs[fixedId] === selectedDragId) {
    // match
    matchedCount++
    selectedDragId = null
    refreshSelection()
    if (matchedCount === Object.keys(currentConfig.pairs).length) {
      document.getElementById('s4-status')!.textContent = '3/3 マッチ！'
      setTimeout(() => {
        closeS4Game()
        completeCurrentSpot()
      }, 800)
    }
  } else {
    // wrong match → blink red
    fixed.classList.add('wrong')
    setTimeout(() => fixed.classList.remove('wrong'), 300)
  }
}

function refreshSelection(): void {
  document.querySelectorAll('.s4-drag').forEach(d => {
    d.classList.toggle('selected', (d as HTMLElement).dataset.id === selectedDragId)
  })
}

function closeS4Game(): void {
  const el = document.getElementById('s4-game')
  if (el) el.style.display = 'none'
  selectedDragId = null
}
