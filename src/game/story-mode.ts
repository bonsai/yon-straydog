import { STORY_SCENES } from '../story/data'

let currentIdx = 0
let onClose: (() => void) | null = null

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
}

export function startStoryScene(idx: number, onCloseCallback?: () => void): void {
  currentIdx = idx
  onClose = onCloseCallback ?? null
  const el = document.getElementById('story-mode')
  if (el) el.style.display = 'flex'
  renderScene()
}

export function closeStory(): void {
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
    currentIdx++
    renderScene()
  })
  document.getElementById('story-mode-prev')?.addEventListener('click', () => {
    if (currentIdx <= 0) return
    currentIdx--
    renderScene()
  })
}
