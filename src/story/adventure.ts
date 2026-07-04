import { type Step, getCurrentStep, advanceStep, hasMoreSteps, clearSteps } from '../game-state'
import { STORY_SCENES } from './spots'
import { appendMemo } from '../map/hub'

// ============================================================================
// Step-based adventure
// ============================================================================

let active = false
let onFinish: (() => void) | null = null
let autoTimer: number | null = null
let typingTimer: number | null = null
let typingLineIdx = 0
let typingCharIdx = 0
let typingLines: string[] = []
let typingCurrentSpan: HTMLSpanElement | null = null
let pendingNext = false

export function startAdventure(onComplete?: () => void): void {
  onFinish = onComplete ?? null
  active = true
  showStep()
}

export function stopAdventure(): void {
  active = false
  if (autoTimer !== null) { clearTimeout(autoTimer); autoTimer = null }
  if (typingTimer !== null) { clearTimeout(typingTimer); typingTimer = null }
  const el = document.getElementById('adventure-overlay')
  if (el) el.style.display = 'none'
  clearSteps()
}

function goNext(): void {
  if (pendingNext) {
    pendingNext = false
    if (typingTimer !== null) { clearTimeout(typingTimer); typingTimer = null }
    finishTyping()
  }
  if (typingTimer !== null) { clearTimeout(typingTimer); typingTimer = null }
  const overlay = document.getElementById('adventure-overlay')
  if (!overlay) return
  const next = advanceStep()
  if (next) {
    showStep()
  } else {
    if (hasMoreSteps()) {
      showStep()
    } else {
      overlay.style.display = 'none'
      active = false
      onFinish?.()
    }
  }
}

function finishTyping(): void {
  const textEl = document.getElementById('adventure-text')
  if (!textEl) return
  // Show all remaining text instantly
  textEl.textContent = typingLines.join('\n')
  typingTimer = null
  typingLines = []
  typingLineIdx = 0
  typingCharIdx = 0
  typingCurrentSpan = null
  // Enable tap to continue
  const overlay = document.getElementById('adventure-overlay')
  if (overlay) overlay.onclick = goNext
}

function startTyping(text: string): void {
  typingLines = text.split('\n')
  typingLineIdx = 0
  typingCharIdx = 0
  const textEl = document.getElementById('adventure-text')
  if (!textEl) return
  textEl.textContent = ''
  typingCurrentSpan = null
  pendingNext = false

  const tick = () => {
    if (!active) return
    if (typingLineIdx >= typingLines.length) {
      // Done typing
      typingTimer = null
      typingLines = []
      const overlay = document.getElementById('adventure-overlay')
      if (overlay) overlay.onclick = goNext
      return
    }
    const line = typingLines[typingLineIdx]

    if (typingCharIdx === 0) {
      if (line === '') {
        textEl.appendChild(document.createElement('br'))
        typingLineIdx++
        typingTimer = window.setTimeout(tick, 80)
        return
      }
      const span = document.createElement('span')
      textEl.appendChild(span)
      typingCurrentSpan = span
      const advance = () => {
        if (typingCharIdx >= line.length) {
          textEl.appendChild(document.createElement('br'))
          typingCharIdx = 0
          typingLineIdx++
          if (typingLineIdx < typingLines.length) {
            typingTimer = window.setTimeout(tick, 120)
          } else {
            typingTimer = null
            typingLines = []
            const overlay = document.getElementById('adventure-overlay')
            if (overlay) overlay.onclick = goNext
          }
          return
        }
        if (typingCurrentSpan) {
          typingCurrentSpan.textContent += line[typingCharIdx]
        }
        typingCharIdx++
        typingTimer = window.setTimeout(advance, 30)
      }
      advance()
    }
  }

  pendingNext = true
  const overlay = document.getElementById('adventure-overlay')
  if (overlay) overlay.onclick = () => {
    // Skip typing, show full text
    if (typingTimer !== null) { clearTimeout(typingTimer); typingTimer = null }
    finishTyping()
  }
  typingTimer = window.setTimeout(tick, 200)
}

function showStep(): void {
  if (!active) return
  const step = getCurrentStep()
  if (!step) {
    active = false
    onFinish?.()
    return
  }
  const overlay = document.getElementById('adventure-overlay') as HTMLElement | null
  if (!overlay) return

  const textEl = document.getElementById('adventure-text')
  const choicesEl = document.getElementById('adventure-choices')
  if (!textEl || !choicesEl) return

  overlay.style.display = 'flex'
  overlay.onclick = null

  if (step.type === 'text') {
    choicesEl.style.display = 'none'
    if (step.text) {
      appendMemo(step.text)
      startTyping(step.text)
    }
  } else if (step.type === 'choice') {
    textEl.innerHTML = ''
    const p = document.createElement('p')
    p.textContent = step.text ?? ''
    textEl.appendChild(p)
    choicesEl.style.display = 'flex'
    const yesBtn = document.getElementById('adv-yes') as HTMLElement | null
    const noBtn = document.getElementById('adv-no') as HTMLElement | null
    if (yesBtn) { yesBtn.textContent = step.yesLabel ?? 'はい'; yesBtn.onclick = goNext }
    if (noBtn) { noBtn.textContent = step.noLabel ?? 'いいえ'; noBtn.onclick = () => {} }
  } else if (step.type === 'action') {
    overlay.style.display = 'none'
    active = false
    step.action?.()
  }
}

// ============================================================================
// Story viewer
// ============================================================================

const STORY_PROGRESS_KEY = 'sd_story_progress'

let currentIdx = 0
let onClose: (() => void) | null = null

function readStoredStoryIndex(): number | null {
  try {
    const raw = localStorage.getItem(STORY_PROGRESS_KEY)
    if (raw === null) return null
    const parsed = Number(raw)
    if (!Number.isInteger(parsed) || parsed < 0 || parsed >= STORY_SCENES.length) return null
    return parsed
  } catch {
    return null
  }
}

function persistStoryIndex(idx: number): void {
  currentIdx = idx
  try {
    localStorage.setItem(STORY_PROGRESS_KEY, String(idx))
  } catch {
    // Ignore storage write failures in non-browser environments.
  }
}

export function saveStoryProgressIndex(idx: number): void {
  persistStoryIndex(idx)
}

export function clearStoryProgress(): void {
  currentIdx = 0
  try {
    localStorage.removeItem(STORY_PROGRESS_KEY)
  } catch {
    // Ignore storage write failures in non-browser environments.
  }
}

function renderScene(): void {
  const scene = STORY_SCENES[currentIdx]
  const iconEl = document.getElementById('story-mode-icon')
  const titleEl = document.getElementById('story-mode-title')
  const textEl = document.getElementById('story-mode-text')
  const prevBtn = document.getElementById('story-mode-prev')
  const nextBtn = document.getElementById('story-mode-next') as HTMLButtonElement | null
  if (!iconEl || !titleEl || !textEl || !prevBtn || !nextBtn) return

  iconEl.textContent = scene.icon
  titleEl.textContent = scene.title
  textEl.innerHTML = scene.paragraphs.map(p => {
    if (!p) return '<br>'
    if (p.startsWith('"')) return `<p class="dog-thought">${p}</p>`
    if (p.includes('→ 答え:')) return `<p class="highlight">${p}</p>`
    if (p.startsWith('——')) return `<p class="divider">${p}</p>`
    return `<p>${p}</p>`
  }).join('')

  prevBtn.classList.toggle('hidden-btn', currentIdx === 0)
  nextBtn.textContent = currentIdx >= STORY_SCENES.length - 1 ? '閉じる ✕' : '次へ ▶'
  persistStoryIndex(currentIdx)
}

export function startStoryScene(idx?: number, onCloseCallback?: () => void): void {
  const resolvedIdx = typeof idx === 'number' ? idx : readStoredStoryIndex() ?? 0
  persistStoryIndex(resolvedIdx)
  onClose = onCloseCallback ?? null
  const el = document.getElementById('story-mode')
  if (el) el.style.display = 'flex'
  renderScene()
}

export function closeStory(): void {
  persistStoryIndex(currentIdx)
  const el = document.getElementById('story-mode')
  if (el) el.style.display = 'none'
  onClose?.()
  onClose = null
}

export function setupStoryButtons(): void {
  document.getElementById('story-mode-next')?.addEventListener('click', () => {
    if (currentIdx >= STORY_SCENES.length - 1) {
      closeStory()
      return
    }
    persistStoryIndex(currentIdx + 1)
    renderScene()
  })
  document.getElementById('story-mode-prev')?.addEventListener('click', () => {
    if (currentIdx <= 0) return
    persistStoryIndex(currentIdx - 1)
    renderScene()
  })
}
