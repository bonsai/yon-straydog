import { completeCurrentSpot } from '../map/hub'
import { playCorrect, playWrong } from './sound'

interface QuizConfig {
  question: string
  hint: string
  answer: string
  icon?: string
}

export function startTextQuiz(config: QuizConfig): void {
  const gameEl = document.getElementById('quiz4-game')
  const qEl = document.getElementById('quiz4-q')
  const hintEl = document.getElementById('quiz4-hint')
  const inputEl = document.getElementById('quiz4-input') as HTMLInputElement
  const btnEl = document.getElementById('quiz4-btn') as HTMLButtonElement
  const fbEl = document.getElementById('quiz4-fb')
  const closeBtn = document.getElementById('quiz4-close')
  if (!gameEl || !qEl || !hintEl || !inputEl || !btnEl || !fbEl) return

  qEl.innerHTML = config.question
  hintEl.textContent = config.hint
  inputEl.value = ''
  inputEl.placeholder = '答えを入力'
  fbEl.textContent = ''
  fbEl.className = ''
  btnEl.disabled = false

  const origIcon = document.getElementById('quiz4-icon')
  if (origIcon) origIcon.textContent = config.icon || '❓'

  gameEl.style.display = 'flex'

  const onSubmit = () => {
    const val = inputEl.value.trim()
    if (!val) return
    if (val === config.answer) {
      fbEl.textContent = '✅ 正解！'
      fbEl.className = 'correct'
      playCorrect()
      btnEl.disabled = true
      setTimeout(() => {
        gameEl.style.display = 'none'
        completeCurrentSpot()
      }, 1200)
    } else {
      fbEl.textContent = '❌ ちがうみたい…'
      fbEl.className = 'wrong'
      playWrong()
      inputEl.value = ''
    }
  }

  btnEl.onclick = onSubmit
  inputEl.onkeydown = (e) => { if (e.key === 'Enter') onSubmit() }

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      gameEl.style.display = 'none'
      document.removeEventListener('keydown', onKey)
    }
  }
  document.addEventListener('keydown', onKey)
  if (closeBtn) closeBtn.onclick = () => { gameEl.style.display = 'none'; document.removeEventListener('keydown', onKey) }
}
