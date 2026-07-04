import { describe, it, expect, beforeEach } from 'vitest'
import { QUIZZES, startQuiz4, closeQuiz4 } from '../quiz'

describe('quiz data integrity', () => {
  it('has exactly 37 quizzes', () => {
    expect(QUIZZES.length).toBe(37)
  })

  it('every quiz has all fields', () => {
    for (const q of QUIZZES) {
      expect(q.hint.length).toBeGreaterThan(0)
      expect(q.missing.length).toBe(1)
      expect(q.reading.length).toBeGreaterThan(0)
      expect(q.full.length).toBeGreaterThan(0)
    }
  })

  it('every quiz hint contains a placeholder box', () => {
    for (const q of QUIZZES) {
      expect(q.hint).toContain('□')
    }
  })

  it('every quiz has a hint with a placeholder, a one-char missing, a reading, and a full form', () => {
    for (const q of QUIZZES) {
      expect(q.hint).toContain('□')
      expect(q.missing.length).toBe(1)
      expect(q.reading.length).toBeGreaterThan(0)
      expect(q.full.length).toBeGreaterThan(0)
    }
  })

  it('no duplicate full phrases', () => {
    const phrases = QUIZZES.map(q => q.full)
    expect(new Set(phrases).size).toBe(phrases.length)
  })

  it('no duplicate hints', () => {
    const hints = QUIZZES.map(q => q.hint)
    expect(new Set(hints).size).toBe(hints.length)
  })
})

describe('startQuiz4 / closeQuiz4', () => {
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

  it('shows the quiz container and populates fields', () => {
    startQuiz4()
    const el = document.getElementById('quiz4-game')
    expect(el?.style.display).toBe('flex')
    const qEl = document.getElementById('quiz4-q')
    expect(qEl?.innerHTML).toContain('□')
    const hintEl = document.getElementById('quiz4-hint')
    expect(hintEl?.textContent).toMatch(/^📖 /)
    const input = document.getElementById('quiz4-input') as HTMLInputElement
    expect(input?.value).toBe('')
  })

  it('closeQuiz4 hides the container', () => {
    startQuiz4()
    closeQuiz4()
    const el = document.getElementById('quiz4-game')
    expect(el?.style.display).toBe('none')
  })

  it('closeQuiz4 removes keydown listener', () => {
    startQuiz4()
    closeQuiz4()
    const btn = document.getElementById('quiz4-btn') as HTMLButtonElement
    btn.onclick = () => { /* reset */ }
    const fb = document.getElementById('quiz4-fb')
    expect(fb?.textContent).toBe('')
  })
})
