import { STORY_SCENES } from './data'

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
