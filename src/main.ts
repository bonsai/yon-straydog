import './style.css'
import coupleImage from '/0.jpg'
import dogImage from '/gdog.png'
import { useDogStore } from './store'
import { STORY_SCENES, INTRO_LINES } from './story/spots'
import { startSpotHub, registerGameStarters, setCurrentGameSpot, setOnSpotCleared, getBadgeCount, setupTools, showTools } from './map/hub'
import { setPhase, setSteps, buildIntroSteps, buildStorySteps } from './game-state'
import { startAdventure, setupStoryButtons, startStoryScene } from './story/adventure'
import { SPOTS, SCENE_REUNION, SPOT_SCENE_INDEX, type Spot, type SpotId } from './story/spots'
import { startMap, setOnArrive, stopMap } from './map/map'
import { ensureResumed, playTyping, playCorrect, playWrong, playBark, playComplete } from './game/sound'
import { setupDebugAPI } from './debug-api'
import { autoSave } from './save'
import { PuzzleStarter } from './game/puzzle-starter'

function getId<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id) as T | null
  if (!el) throw new Error(`Element #${id} not found`)
  return el
}

function qs<T extends HTMLElement = HTMLElement>(sel: string, parent?: HTMLElement): T | null {
  return (parent ?? document).querySelector<T>(sel)
}

// =====================================================
// SCREEN TRANSITIONS
// =====================================================
export function switchScreen(fromId: string, toId: string): void {
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

export function showScreen(id: string): void {
  for (const el of document.querySelectorAll('.screen')) el.classList.remove('active', 'screen-enter', 'screen-exit')
  const el = document.getElementById(id)
  if (el) el.classList.add('active')
}

// =====================================================
// INTRO
// =====================================================
let introTypingTimer: number | null = null

function startPuzzle4(): void {
  const intro = document.getElementById('intro')
  if (intro) intro.classList.remove('active')
  PuzzleStarter()
  // After puzzle solved, go to hub
  const goBtn = document.getElementById('p4-go') as HTMLButtonElement
  if (goBtn) {
    goBtn.addEventListener('click', () => {
      const p4 = document.getElementById('puzzle4')
      if (p4) p4.style.display = 'none'
      goToHub()
    }, { once: true })
  }
  const closeBtn = document.getElementById('puzzle4-close')
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      const p4 = document.getElementById('puzzle4')
      if (p4) p4.style.display = 'none'
      goToHub()
    }, { once: true })
  }
}

function startIntro(): void {
  useDogStore.setState({ appState: 'intro' })
  setPhase('intro')
  showScreen('intro')
  showTools(false)
  if (useDogStore.getState().introDone) { finishIntroState(); return }

  const bgEl = getId('intro-bg')
  bgEl.style.background = `url(${coupleImage}) center/contain no-repeat #0a0a0f`
  bgEl.classList.add('faded', 'visible')
  bgEl.style.opacity = '1'

  const textEl = getId('intro-text')
  const skipBtn = getId<HTMLElement>('intro-skip')
  const bottomBar = qs<HTMLElement>('#intro .bottom-bar')
  textEl.style.display = 'block'
  textEl.textContent = ''
  skipBtn.style.display = 'block'
  if (bottomBar) bottomBar.style.display = 'none'

  ensureResumed()
  let lineIdx = 0
  let charIdx = 0
  let lineTimeout = 0

  const skip = () => {
    if (introTypingTimer !== null) { clearTimeout(introTypingTimer); introTypingTimer = null }
    useDogStore.getState().setIntroDone()
    startPuzzle4()
  }
  skipBtn.onclick = skip

  const tick = () => {
    if (lineIdx >= INTRO_LINES.length) { skip(); return }
    const line = INTRO_LINES[lineIdx]
    if (!line.text) {
      lineTimeout = line.speed
      lineIdx++
      introTypingTimer = window.setTimeout(tick, lineTimeout)
      return
    }
    if (charIdx === 0) {
      // switch to dog image when couple hands over the photo
      if (lineIdx === 10) {
        const bgEl2 = document.getElementById('intro-bg')
        if (bgEl2) { bgEl2.style.backgroundImage = `url(${dogImage})`; bgEl2.style.opacity = '1' }
      }
      const span = document.createElement('span')
      if (line.color) span.style.color = line.color
      textEl.appendChild(span)
      const advance = () => {
        if (charIdx >= line.text.length) {
          textEl.appendChild(document.createElement('br'))
          charIdx = 0
          lineIdx++
          introTypingTimer = window.setTimeout(tick, 80)
          return
        }
        span.textContent += line.text[charIdx]
        charIdx++
        playTyping()
        introTypingTimer = window.setTimeout(advance, line.speed)
      }
      advance()
    }
  }
  introTypingTimer = window.setTimeout(tick, 400)
}

function finishIntroState(): void {
  const bgEl = document.getElementById('intro-bg')
  const skipBtn = document.getElementById('intro-skip')
  if (bgEl) { bgEl.style.backgroundImage = `url(${coupleImage})`; bgEl.classList.add('faded', 'visible'); bgEl.style.opacity = '1' }
  if (skipBtn) skipBtn.style.display = 'block'; skipBtn!.onclick = () => {}
  const textEl = document.getElementById('intro-text')
  if (textEl) textEl.style.display = 'block'
  const bottomBar = qs<HTMLElement>('#intro .bottom-bar')
  if (bottomBar) bottomBar.style.display = 'none'

  setTimeout(() => goToHub(), 100)
}

// =====================================================
// SPOT FLOW
// =====================================================
function startSpotMap(spotId: string): void {
  setPhase('play')
  showTools(true)
  const spot = SPOTS.find(s => s.id === spotId)
  if (!spot) { goToHub(); return }
  const spotHub = document.getElementById('spot-hub')
  if (spotHub) spotHub.classList.remove('open')
  setCurrentGameSpot(spotId)
  setOnArrive((s: Spot) => {
    const starter = (window as any).__gameStarters?.[s.id]
    if (starter) {
      showTools(false)
      starter()
    }
  })
  startMap(useDogStore.getState().completed)
}

export function showClearedStory(spotId: string): void {
  const spot = SPOTS.find(s => s.id === spotId)
  if (!spot) { goToHub(); return }
  const badgeCount = useDogStore.getState().completed.length
  const totalBadges = SPOTS.filter(s => s.game !== 'final').length
  const paras = spot.storyParagraphs.filter(p => p)
  const steps = buildStorySteps(spot.icon, spot.name, paras, () => {
    showResultScreen(
      spot.badge || spot.icon,
      spot.badge ? 'バッジを獲得！' : spot.name,
      spot.badgeName || '',
      `${badgeCount}/${totalBadges} のヒント玉を収集`
    )
  }, 'hub', 'つづける')
  setSteps(steps)
  startAdventure()
  autoSave(0)
}

export function showResultScreen(icon: string, title: string, badge: string, subtitle: string): void {
  showTools(false)
  const r = document.getElementById('result')
  if (!r) return
  getId('r-icon').textContent = icon
  getId('r-title').textContent = title
  getId('r-text').textContent = subtitle
  getId('r-badge').textContent = `🏅 ${badge}`
  playCorrect()
  const store = useDogStore.getState()
  const bc = store.completed.length
  getId('r-progress').textContent = `🟡 ${bc}/${SPOTS.filter(s => s.game !== 'final').length}`
  r.style.display = 'flex'
  const btn = getId<HTMLButtonElement>('r-btn')
  btn.onclick = () => {
    r.style.display = 'none'
    goToHub()
  }
}

export function goToHub(): void {
  setPhase('hub')
  showTools(true)
  startSpotHub()
}

export function showCompleteScreen(): void {
  setPhase('complete')
  showTools(false)
  const el = document.getElementById('complete')
  if (el) el.style.display = 'flex'
  playComplete()
  playBark()
  confetti()
  autoSave(0)
}

export function confetti(): void {
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

export function hideEl(id: string): void { const el = document.getElementById(id); if (el) el.style.display = 'none' }

function openStoryModal(idx: number): void {
  startStoryScene(idx)
}

export function enableDebugMode(): void {
  document.querySelectorAll('.debug-only').forEach(el => (el as HTMLElement).classList.remove('debug-only'))
}

// =====================================================
// DEBUG PANEL
// =====================================================
export function renderDebugPanel(): void {
  const body = document.getElementById('debug-body')
  if (!body) return
  const { completed } = useDogStore.getState()
  const badgeCount = getBadgeCount(completed)

  body.innerHTML = `
    <div class="debug-state">
      <div><span class="label">completed:</span> [${completed.join(', ') || '-'}]</div>
      <div><span class="label">badges:</span> ${badgeCount}/3</div>
      <div><span class="label">introDone:</span> ${localStorage.getItem('sd_intro_done') === 'true' ? '✅' : '❌'}</div>
      <div><span class="label">4x4Done:</span> ${localStorage.getItem('sd_4x4_done') === 'true' ? '✅' : '❌'}</div>
    </div>
    ${SPOTS.map(s => {
      const done = completed.includes(s.id)
      const unlocked = s.id === 's0' || s.id === 's1' || completed.includes('s0') && completed.includes('s1') || done
      const lockStatus = done ? 'done' : unlocked ? 'unlocked' : 'locked'
      const gameLabel = { puzzle: '2×2パズル', puyo: 'ぷよぷよ', simon: 'シモン', quiz4: 'クイズ', final: '最終' }[s.game]
      return `<div class="debug-card">
        <h3>${s.icon} ${s.name} <span class="tag ${lockStatus}">${lockStatus}</span></h3>
        <div class="row"><span class="label">ID:</span> ${s.id}</div>
        <div class="row"><span class="label">座標:</span> ${s.lat}, ${s.lng}</div>
        <div class="row"><span class="label">ゲーム:</span> ${gameLabel}</div>
        <div class="row"><span class="label">ヒント:</span> ${s.hint}</div>
        <div class="row"><span class="label">ストーリー:</span> ${s.story}</div>
        ${s.badge ? `<div class="row"><span class="label">バッジ:</span> ${s.badge} ${s.badgeName}</div>` : ''}
        <div class="debug-actions">
          ${s.game !== 'final' ? `<button class="btn-game" data-game="${s.id}">▶ ${gameLabel}</button>` : ''}
          <button class="btn-story" data-scene="${SPOT_SCENE_INDEX[s.id]}">📖 ストーリー</button>
        </div>
      </div>`
    }).join('')}
  `

  body.querySelectorAll('[data-game]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = (btn as HTMLElement).dataset.game
      if (!id) return
      const starter = (window as any).__gameStarters?.[id]
      if (starter) {
        document.getElementById('debug-panel')?.classList.remove('open')
        setCurrentGameSpot(id)
        starter()
      }
    })
  })

  body.querySelectorAll('[data-scene]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt((btn as HTMLElement).dataset.scene ?? '0', 10)
      document.getElementById('debug-panel')?.classList.remove('open')
      startStoryScene(idx)
    })
  })
}

// =====================================================
// EXPORTS FOR TESTING
// =====================================================
export { startIntro, finishIntroState, startSpotMap }

// =====================================================
// INIT
// =====================================================
document.addEventListener('DOMContentLoaded', async () => {
  registerGameStarters()
  setupStoryButtons()
  setupTools()
  setupDebugAPI()

  if (location.hash === '#debug') {
    enableDebugMode()
  }

  // Wire story mode button
  document.getElementById('hub-story-btn')?.addEventListener('click', () => {
    openStoryModal(0)
  })

  // Wire debug panel
  document.getElementById('hub-debug-btn')?.addEventListener('click', () => {
    renderDebugPanel()
    document.getElementById('debug-panel')?.classList.add('open')
  })
  document.getElementById('debug-close')?.addEventListener('click', () => {
    document.getElementById('debug-panel')?.classList.remove('open')
  })

  // Wire hub card clicks
  const hubGrid = document.getElementById('hub-grid')
  if (hubGrid) {
    hubGrid.addEventListener('click', (e) => {
      const card = (e.target as HTMLElement).closest('.hub-card.open') as HTMLElement | null
      if (!card) return
      const id = card.dataset.id
      if (!id) return

      if (id === 's4' && getBadgeCount(useDogStore.getState().completed) >= 4) {
        useDogStore.getState().completeSpot('s3')
        const spot = SPOTS.find(s => s.id === 's3')!
        const allParas = [...spot.storyParagraphs.filter(p => p), '', ...SCENE_REUNION.paragraphs.filter(p => p)]
        const steps = buildStorySteps('🐕', '再会', allParas, () => showCompleteScreen(), 'complete', '結果を見るか？')
        setSteps(steps)
        startAdventure()
        return
      }

      const store = useDogStore.getState()
      if (store.completed.includes(id)) return

      startSpotMap(id)
    })
  }

  // After mini-game clears
  setOnSpotCleared((spotId: string) => {
    const store = useDogStore.getState()
    if (store.completed.length >= SPOTS.length) {
      const finalParas = SCENE_REUNION.paragraphs.filter(p => p)
      const steps = buildStorySteps('🐕', '再会', finalParas, () => showCompleteScreen(), 'complete', '結果を見るか？')
      setSteps(steps)
      startAdventure()
    } else {
      showClearedStory(spotId)
    }
  })

  const { introDone } = useDogStore.getState()
  if (introDone) {
    goToHub()
  } else {
    startIntro()
  }

  // Share button
  document.getElementById('complete-share-btn')?.addEventListener('click', shareResult)

  // Complete button → restart
  document.getElementById('complete-btn')?.addEventListener('click', () => {
    hideEl('complete')
    stopMap()
    useDogStore.getState().reset()
    startIntro()
  })

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  }
})

export function shareResult(): void {
  const text = [
    '🐕 Stray Dog をクリアした！',
    '',
    '神保町を歩いて迷い犬を探すAR街歩きゲーム。',
    '3つのバッジを集めて、犬を見つけ出した！',
    '',
    '#StrayDogYON #神保町',
    '',
    window.location.href,
  ].join('\n')

  if (navigator.share) {
    navigator.share({ title: 'Stray Dog — 迷い犬を探して', text }).catch(() => {})
  } else {
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('complete-share-btn')
      if (btn) { btn.textContent = '✅ コピーした！'; setTimeout(() => { btn.textContent = '📤 シェアする' }, 2000) }
    }).catch(() => {})
  }
}
