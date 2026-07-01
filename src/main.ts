import './style.css'
import bgImage from '/gdog.png'
import { useDogStore } from './store'
import { INTRO_LINES, STORY_SCENES } from './story/data'
import { type PuzzleState, createPuzzleState, isSolved, selectOrSwap } from './game/puzzle'
import { startSpotHub, registerGameStarters, setCurrentGameSpot, setOnSpotCleared, getBadgeCount } from './game/hub'
import { setPhase } from './game/game-state'
import { startMap, stopMap, setOnArrive } from './game/map'
import { SPOTS } from './game/spots'

// =====================================================
// SCREEN TRANSITIONS
// =====================================================
function switchScreen(fromId: string, toId: string): void {
  const fromEl = document.getElementById(fromId)
  const toEl = document.getElementById(toId)
  if (!fromEl || !toEl) return
  fromEl.classList.remove('screen-enter')
  fromEl.classList.add('screen-exit')
  const onExitEnd = () => {
    fromEl.removeEventListener('animationend', onExitEnd)
    fromEl.classList.remove('active', 'screen-exit')
    toEl.classList.add('active', 'screen-enter')
    const onEnterEnd = () => { toEl.removeEventListener('animationend', onEnterEnd); toEl.classList.remove('screen-enter') }
    toEl.addEventListener('animationend', onEnterEnd)
  }
  fromEl.addEventListener('animationend', onExitEnd)
}

function showScreen(id: string): void {
  for (const el of document.querySelectorAll('.screen')) el.classList.remove('active', 'screen-enter', 'screen-exit')
  const el = document.getElementById(id)
  if (el) el.classList.add('active')
}

// =====================================================
// INTRO — Typewriter
// =====================================================
function startIntro(): void {
  useDogStore.setState({ appState: 'intro' })
  setPhase('intro')
  showScreen('intro')
  if (useDogStore.getState().introDone) { finishIntroState(); return }

  const textEl = document.getElementById('intro-text')!
  const skipBtn = document.getElementById('intro-skip') as HTMLButtonElement
  const startBtn = document.getElementById('intro-start') as HTMLButtonElement
  const bgEl = document.getElementById('intro-bg')!
  const bottomBar = document.querySelector('#intro .bottom-bar') as HTMLElement

  textEl.innerHTML = ''; startBtn.style.display = 'none'; bottomBar.style.display = 'none'
  bgEl.style.background = '#0a0a0f'

  let lineIdx = 0, charIdx = 0, cancelled = false
  const preload = new Image(); preload.src = bgImage

  skipBtn.onclick = () => {
    cancelled = true; textEl.innerHTML = ''
    for (const line of INTRO_LINES) {
      if (!line.text) { textEl.appendChild(document.createElement('br')); continue }
      const p = document.createElement('p')
      if (line.color) p.style.color = line.color
      p.style.marginBottom = '4px'; p.textContent = line.text; textEl.appendChild(p)
    }
    revealImage()
  }

  function typeNextLine(): void {
    if (cancelled) return
    if (lineIdx >= INTRO_LINES.length) { revealImage(); return }
    const line = INTRO_LINES[lineIdx]
    if (!line.text) { textEl.appendChild(document.createElement('br')); lineIdx++; setTimeout(typeNextLine, line.speed); return }
    const p = document.createElement('p')
    if (line.color) p.style.color = line.color
    p.style.marginBottom = '4px'; textEl.appendChild(p); charIdx = 0
    const cursor = document.createElement('span'); cursor.className = 'cursor'; p.appendChild(cursor)
    function typeChar(): void {
      if (cancelled) return
      if (charIdx >= line.text.length) { cursor.remove(); lineIdx++; setTimeout(typeNextLine, 300); return }
      cursor.before(document.createTextNode(line.text[charIdx])); charIdx++
      if (lineIdx === 10 && charIdx === 4) beginImageFade()
      setTimeout(typeChar, line.speed + (Math.random() * 20 - 10))
    }
    typeChar()
  }
  function beginImageFade(): void { bgEl.style.backgroundImage = `url(${bgImage})`; bgEl.classList.add('faded'); requestAnimationFrame(() => bgEl.classList.add('visible')) }
  function revealImage(): void {
    bgEl.style.backgroundImage = `url(${bgImage})`; bgEl.classList.add('faded', 'visible'); bgEl.style.opacity = '1'
    bottomBar.style.display = 'flex'; startBtn.style.display = 'block'
    startBtn.onclick = () => { useDogStore.getState().setIntroDone(); switchScreen('intro', 'puzzle4'); start4x4Puzzle() }
  }
  typeNextLine()
}

function finishIntroState(): void {
  const bgEl = document.getElementById('intro-bg')
  const bottomBar = document.querySelector('#intro .bottom-bar') as HTMLElement | null
  const startBtn = document.getElementById('intro-start') as HTMLButtonElement | null
  const skipBtn = document.getElementById('intro-skip')
  if (bgEl) { bgEl.style.backgroundImage = `url(${bgImage})`; bgEl.classList.add('faded', 'visible'); bgEl.style.opacity = '1' }
  if (skipBtn) skipBtn.style.display = 'none'
  if (bottomBar) bottomBar.style.display = 'flex'
  if (startBtn) {
    startBtn.style.display = 'block'
    startBtn.onclick = () => {
      if (localStorage.getItem('sd_4x4_done') === 'true') { goToHub() } else { switchScreen('intro', 'puzzle4'); start4x4Puzzle() }
    }
  }
}

// =====================================================
// 4x4 PUZZLE
// =====================================================
function start4x4Puzzle(): void {
  useDogStore.setState({ appState: 'puzzle4x4' })
  setPhase('puzzle')
  const grid = document.getElementById('puzzle4-grid')!
  const status = document.getElementById('puzzle4-status')!
  const solvedHint = document.getElementById('p4-solved-hint')!
  const goBtn = document.getElementById('p4-go') as HTMLButtonElement
  solvedHint.style.display = 'none'; goBtn.classList.remove('show')

  const SIZE = 4
  const alreadySolved = localStorage.getItem('sd_4x4_done') === 'true'
  let pState: PuzzleState = createPuzzleState(!alreadySolved)

  function renderGrid(): void {
    grid.innerHTML = ''
    for (let i = 0; i < pState.tiles.length; i++) {
      const t = pState.tiles[i]
      const row = Math.floor(t.currentPos / SIZE)
      const col = t.currentPos % SIZE
      const div = document.createElement('div')
      div.className = 'p4-tile'
      if (pState.selectedIdx !== null && pState.selectedIdx === i) div.classList.add('selected')
      if (t.currentPos === t.correctPos) div.classList.add('in-place')
      div.style.backgroundPosition = `${(col/3)*100}% ${(row/3)*100}%`
      div.dataset.idx = String(i); div.addEventListener('click', () => onTap(i)); grid.appendChild(div)
    }
    status.textContent = `操作: ${pState.moves} 回`
  }

  function onTap(idx: number): void {
    if (goBtn.classList.contains('show')) return
    pState = selectOrSwap(pState, idx); renderGrid()
    if (pState.selectedIdx === null && isSolved(pState)) onSolved()
  }

  function onSolved(): void {
    status.textContent = `🎉 完成！ ${pState.moves} 回でクリア`
    grid.querySelectorAll('.p4-tile').forEach(el => { el.classList.add('solved-flash'); el.classList.add('in-place') })
    if (navigator.vibrate) navigator.vibrate([50, 30, 50])
    setTimeout(() => {
      solvedHint.style.display = 'block'; goBtn.classList.add('show')
      localStorage.setItem('sd_4x4_done', 'true')
    }, 500)
  }

  document.getElementById('puzzle4-close')?.addEventListener('click', () => { hideEl('puzzle4'); onPuzzleComplete() })
  goBtn.addEventListener('click', () => { hideEl('puzzle4'); onPuzzleComplete() })
  renderGrid()
}

function onPuzzleComplete(): void {
  setPhase('hub')
  startSpotHub()
}

// =====================================================
// SPOT FLOW
// =====================================================
const SPOT_TO_SCENE: Record<string, number> = { s0: 1, s1: 2, s2: 3, s3: 4 }

function showAdventureText(paragraphs: string[], lastBtn: string, onDone: () => void): void {
  const overlay = document.getElementById('adventure-overlay')
  const textEl = document.getElementById('adventure-text')
  const btnEl = document.getElementById('adventure-btn')
  if (!overlay || !textEl || !btnEl) { onDone(); return }

  const paras = paragraphs.filter(p => p)
  let idx = 0
  overlay.style.display = 'flex'

  function show(): void {
    if (idx >= paras.length) {
      overlay.style.display = 'none'
      onDone()
      return
    }
    textEl.textContent = paras[idx]
    btnEl.textContent = idx < paras.length - 1 ? '次へ →' : lastBtn
    btnEl.onclick = () => { idx++; show() }
  }
  show()
}

function startSpotMap(spotId: string): void {
  const spot = SPOTS.find(s => s.id === spotId)
  if (!spot) return
  setPhase('hub')
  document.getElementById('spot-hub')!.style.display = 'none'
  setOnArrive((arrivedSpot) => {
    if (arrivedSpot.id !== spotId) return
    stopMap()
    setCurrentGameSpot(spotId)
    const starter = (window as any).__gameStarters?.[spotId]
    if (starter) starter()
  })
  startMap(useDogStore.getState().completed)
}

function showClearedStory(spotId: string): void {
  const scene = STORY_SCENES[SPOT_TO_SCENE[spotId]]
  if (!scene) { goToHub(); return }

  // Show badge obtained screen
  const spot = SPOTS.find(s => s.id === spotId)
  const badgeCount = useDogStore.getState().completed.length
  showResultScreen(
    spot?.badge ?? '🐾',
    'バッジを獲得！',
    spot?.badgeName ?? '',
    `${badgeCount}/3 のヒント玉を収集`
  )
}

function showResultScreen(icon: string, title: string, badge: string, subtitle: string): void {
  const r = document.getElementById('result')
  if (!r) return
  document.getElementById('r-icon')!.textContent = icon
  document.getElementById('r-title')!.textContent = title
  document.getElementById('r-text')!.textContent = subtitle
  document.getElementById('r-badge')!.textContent = `🏅 ${badge}`
  const store = useDogStore.getState()
  const bc = store.completed.length
  document.getElementById('r-progress')!.textContent = `🟡 ${bc}/3`
  r.style.display = 'flex'
  const btn = document.getElementById('r-btn')!
  btn.onclick = () => {
    r.style.display = 'none'
    const store = useDogStore.getState()
    const nextSpot = SPOTS.find(s => !store.completed.includes(s.id))
    if (nextSpot) {
      const paras = [...(STORY_SCENES[SPOT_TO_SCENE[nextSpot.id]]?.paragraphs.filter(p => p) ?? [])]
      paras.push('')
      paras.push(`🐾 ${nextSpot.icon} ${nextSpot.name} に\n犬がいるかも？`)
      showAdventureText(paras, 'MAPを開く', () => startSpotMap(nextSpot.id))
    } else {
      goToHub()
    }
  }
}

function goToHub(): void {
  setPhase('hub')
  startSpotHub()
}

function showCompleteScreen(): void {
  setPhase('complete')
  const el = document.getElementById('complete')
  if (el) el.style.display = 'flex'
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

function hideEl(id: string): void { const el = document.getElementById(id); if (el) el.style.display = 'none' }

// =====================================================
// INIT
// =====================================================
document.addEventListener('DOMContentLoaded', async () => {
  registerGameStarters()

  // Wire hub card clicks
  const hubGrid = document.getElementById('hub-grid')
  if (hubGrid) {
    hubGrid.addEventListener('click', (e) => {
      const card = (e.target as HTMLElement).closest('.hub-card.open') as HTMLElement | null
      if (!card) return
      const id = card.dataset.id
      if (!id) return

      if (id === 's3' && getBadgeCount(useDogStore.getState().completed) >= 3) {
        useDogStore.getState().completeSpot('s3')
        const finalParas = STORY_SCENES[5].paragraphs.filter(p => p)
        showAdventureText(finalParas, '🎉 ゴール！', () => showCompleteScreen())
        return
      }

      const store = useDogStore.getState()
      if (store.completed.includes(id)) return

      const sceneIdx = SPOT_TO_SCENE[id]
      if (sceneIdx !== undefined) {
        const scene = STORY_SCENES[sceneIdx]
        showAdventureText(scene.paragraphs, '地図を見る →', () => {
          startSpotMap(id)
        })
      }
    })
  }

  // After mini-game clears
  setOnSpotCleared((spotId: string) => {
    const store = useDogStore.getState()
    if (store.completed.length >= SPOTS.length) {
      const finalParas = STORY_SCENES[5].paragraphs.filter(p => p)
      showAdventureText(finalParas, '🎉 ゴール！', () => showCompleteScreen())
    } else {
      showClearedStory(spotId)
    }
  })

  const { introDone } = useDogStore.getState()
  if (introDone && localStorage.getItem('sd_4x4_done') === 'true') {
    goToHub()
  } else if (introDone) {
    finishIntroState()
  } else {
    startIntro()
  }

  // Complete button → restart
  document.getElementById('complete-btn')?.addEventListener('click', () => {
    hideEl('complete')
    stopMap()
    useDogStore.getState().reset()
    startIntro()
  })
})
