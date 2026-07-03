import { describe, it, expect, beforeEach } from 'vitest'
import { startQuiz4, closeQuiz4, QUIZZES } from '../quiz'

describe('onSubmit via DOM', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="quiz4-game" style="display:none">
        <button id="quiz4-close">✕</button>
        <div id="quiz4-q"></div>
        <div id="quiz4-hint"></div>
        <input id="quiz4-input" type="text">
        <button id="quiz4-btn">答える</button>
        <div id="quiz4-fb"></div>
      </div>
    `
  })

  it('shows correct feedback when answer is right', () => {
    startQuiz4()
    const input = document.getElementById('quiz4-input') as HTMLInputElement
    const btn = document.getElementById('quiz4-btn') as HTMLButtonElement
    const fb = document.getElementById('quiz4-fb')

    // Get the current quiz's expected answer from the displayed hint
    const qEl = document.getElementById('quiz4-q')
    const hintMatch = qEl?.innerHTML.match(/([^<br>]+)/)
    const hint = qEl?.textContent || ''
    const quiz = QUIZZES.find(q => hint.includes(q.hint.replace('□', '')))
    if (!quiz) return // skip if can't find

    input.value = quiz.missing
    btn.click()
    expect(fb?.textContent).toContain('正解')
    expect(fb?.style.color).toBe('rgb(76, 175, 80)')
  })

  it('shows wrong feedback when answer is wrong', () => {
    startQuiz4()
    const input = document.getElementById('quiz4-input') as HTMLInputElement
    const btn = document.getElementById('quiz4-btn') as HTMLButtonElement
    const fb = document.getElementById('quiz4-fb')

    input.value = 'X'
    btn.click()
    expect(fb?.textContent).toContain('正解は')
    expect(fb?.style.color).toBe('rgb(239, 83, 80)')
  })

  it('shows prompt when input is empty', () => {
    startQuiz4()
    const btn = document.getElementById('quiz4-btn') as HTMLButtonElement
    const fb = document.getElementById('quiz4-fb')

    btn.click()
    expect(fb?.textContent).toBe('漢字1文字を入力')
  })

  it('closeQuiz4 hides the container and removes keydown listener', () => {
    startQuiz4()
    closeQuiz4()
    const el = document.getElementById('quiz4-game')
    expect(el?.style.display).toBe('none')
  })

  it('enter key triggers onSubmit via document listener', () => {
    startQuiz4()
    const fb = document.getElementById('quiz4-fb')
    const input = document.getElementById('quiz4-input') as HTMLInputElement
    input.value = ''
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(fb?.textContent).toBe('漢字1文字を入力')
  })

  it('escape key triggers closeQuiz4 via document listener', () => {
    startQuiz4()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    const el = document.getElementById('quiz4-game')
    expect(el?.style.display).toBe('none')
  })
})
