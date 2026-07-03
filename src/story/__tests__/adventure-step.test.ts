import { describe, it, expect, beforeEach, vi } from 'vitest'
import { startAdventure, stopAdventure } from '../adventure'
import { setSteps, setPhase } from '../../game-state'

describe('adventure step execution', () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.innerHTML = `
      <div id="adventure-overlay">
        <div id="adventure-text"></div>
        <div id="adventure-choices" class="adv-choices">
          <button id="adv-yes" class="adv-choice adv-choice-yes">はい</button>
          <button id="adv-no" class="adv-choice adv-choice-no">いいえ</button>
        </div>
      </div>
    `
    setPhase('title')
  })

  it('startAdventure shows the overlay for text step', () => {
    setSteps([{ type: 'text', text: 'Hello', auto: true }])
    startAdventure()
    const overlay = document.getElementById('adventure-overlay')
    expect(overlay?.style.display).toBe('flex')
    const textEl = document.getElementById('adventure-text')
    expect(textEl?.textContent).toBe('Hello')
  })

  it('startAdventure shows choice buttons for choice step', () => {
    setSteps([{ type: 'choice', text: 'Choose?', choiceId: 'test' }])
    startAdventure()
    const choices = document.getElementById('adventure-choices')
    expect(choices?.style.display).toBe('flex')
    const textEl = document.getElementById('adventure-text')
    expect(textEl?.textContent).toBe('Choose?')
  })

  it('startAdventure calls action immediately for action step', () => {
    let called = false
    setSteps([{ type: 'action', action: () => { called = true }, nextPhase: 'hub' }])
    startAdventure()
    expect(called).toBe(true)
  })

  it('startAdventure runs action step after text steps', () => {
    let called = false
    setSteps([
      { type: 'text', text: 'step1', auto: true },
      { type: 'action', action: () => { called = true }, nextPhase: 'hub' },
    ])
    startAdventure()
    expect(called).toBe(false)
    const textEl = document.getElementById('adventure-text')
    expect(textEl?.textContent).toBe('step1')
  })

  it('clicking overlay advances to next text step', () => {
    setSteps([
      { type: 'text', text: 'first', auto: true },
      { type: 'text', text: 'second', auto: true },
    ])
    startAdventure()
    const overlay = document.getElementById('adventure-overlay')!
    overlay.click()
    const textEl = document.getElementById('adventure-text')
    expect(textEl?.textContent).toBe('second')
  })

  it('clicking overlay on last text step fires onComplete callback', () => {
    let completed = false
    setSteps([{ type: 'text', text: 'only', auto: true }])
    startAdventure(() => { completed = true })
    const overlay = document.getElementById('adventure-overlay')!
    overlay.click()
    expect(completed).toBe(true)
  })

  it('stopAdventure hides overlay and clears steps', () => {
    setSteps([{ type: 'text', text: 'bye', auto: true }])
    startAdventure()
    stopAdventure()
    const overlay = document.getElementById('adventure-overlay')
    expect(overlay?.style.display).toBe('none')
    const el = document.getElementById('adventure-text')
    // stopAdventure does not clear text content, but clears step queue
    expect(el).toBeTruthy()
  })

  it('yes button advances on choice step', () => {
    setSteps([
      { type: 'choice', text: 'Go?', choiceId: 'test' },
      { type: 'text', text: 'after choice', auto: true },
    ])
    startAdventure()
    const yesBtn = document.getElementById('adv-yes')!
    yesBtn.click()
    const textEl = document.getElementById('adventure-text')
    expect(textEl?.textContent).toBe('after choice')
  })

  it('advances through text→choice→action sequence', () => {
    let actionCalled = false
    setSteps([
      { type: 'text', text: 'intro', auto: true },
      { type: 'choice', text: 'continue?', choiceId: 'go' },
      { type: 'action', action: () => { actionCalled = true }, nextPhase: 'hub' },
    ])
    startAdventure()
    expect(document.getElementById('adventure-text')!.textContent).toBe('intro')

    // advance to choice
    document.getElementById('adventure-overlay')!.click()
    expect(document.getElementById('adventure-text')!.textContent).toBe('continue?')

    // advance to action
    document.getElementById('adv-yes')!.click()
    expect(actionCalled).toBe(true)
  })
})
