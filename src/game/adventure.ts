import { type Step, getCurrentStep, advanceStep, hasMoreSteps, clearSteps } from './game-state'

let active = false
let onFinish: (() => void) | null = null

export function startAdventure(onComplete?: () => void): void {
  onFinish = onComplete ?? null
  active = true
  showStep()
}

export function stopAdventure(): void {
  active = false
  const el = document.getElementById('adventure-overlay')
  if (el) el.style.display = 'none'
  clearSteps()
}

function showStep(): void {
  if (!active) return
  const step = getCurrentStep()
  if (!step) {
    active = false
    onFinish?.()
    return
  }
  const overlay = document.getElementById('adventure-overlay')
  if (!overlay) return
  overlay.style.display = 'flex'

  const textEl = document.getElementById('adventure-text')
  const btnEl = document.getElementById('adventure-btn')
  if (!textEl || !btnEl) return

  if (step.type === 'text') {
    textEl.textContent = step.text ?? ''
    btnEl.textContent = 'タップして次へ →'
    btnEl.className = 'adventure-btn'
    btnEl.onclick = () => {
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
  } else if (step.type === 'action') {
    overlay.style.display = 'none'
    active = false
    step.action?.()
  }
}
