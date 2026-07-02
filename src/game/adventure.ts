import { type Step, getCurrentStep, advanceStep, hasMoreSteps, clearSteps } from './game-state'

let active = false
let onFinish: (() => void) | null = null
let autoTimer: number | null = null

export function startAdventure(onComplete?: () => void): void {
  onFinish = onComplete ?? null
  active = true
  showStep()
}

export function stopAdventure(): void {
  active = false
  if (autoTimer !== null) { clearTimeout(autoTimer); autoTimer = null }
  const el = document.getElementById('adventure-overlay')
  if (el) el.style.display = 'none'
  clearSteps()
}

function goNext(): void {
  if (autoTimer !== null) { clearTimeout(autoTimer); autoTimer = null }
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
    textEl.textContent = step.text ?? ''
    choicesEl.style.display = 'none'
    if (step.auto) {
      overlay.onclick = goNext
    } else {
      overlay.onclick = goNext
    }
  } else if (step.type === 'choice') {
    textEl.textContent = step.text ?? ''
    choicesEl.style.display = 'flex'
    const yesBtn = document.getElementById('adv-yes') as HTMLElement | null
    const noBtn = document.getElementById('adv-no') as HTMLElement | null
    if (yesBtn) yesBtn.onclick = goNext
    if (noBtn) noBtn.onclick = () => {}
  } else if (step.type === 'action') {
    overlay.style.display = 'none'
    active = false
    step.action?.()
  }
}
