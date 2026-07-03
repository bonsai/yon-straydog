import { describe, it, expect, beforeEach } from 'vitest'
import { setupStoryButtons, closeStory, startStoryScene, saveStoryProgressIndex, clearStoryProgress } from '../adventure'

describe('setupStoryButtons', () => {
  beforeEach(() => {
    localStorage.clear()
    clearStoryProgress()
    document.body.innerHTML = `
      <div id="story-mode" style="display:none">
        <div id="story-mode-icon"></div>
        <div id="story-mode-title"></div>
        <div id="story-mode-text"></div>
        <button id="story-mode-prev" class="hidden-btn">◀ 戻る</button>
        <button id="story-mode-next">次へ ▶</button>
      </div>
    `
    startStoryScene(0)
  })

  it('next button advances to scene 1', () => {
    setupStoryButtons()
    document.getElementById('story-mode-next')!.click()
    expect(document.getElementById('story-mode-title')?.textContent).toContain('幕2-1')
  })

  it('prev button is hidden on scene 0', () => {
    setupStoryButtons()
    expect(document.getElementById('story-mode-prev')?.classList.contains('hidden-btn')).toBe(true)
  })

  it('prev button is visible after advancing', () => {
    setupStoryButtons()
    document.getElementById('story-mode-next')!.click()
    expect(document.getElementById('story-mode-prev')?.classList.contains('hidden-btn')).toBe(false)
  })

  it('prev button goes back to previous scene', () => {
    setupStoryButtons()
    document.getElementById('story-mode-next')!.click() // to scene 1
    document.getElementById('story-mode-next')!.click() // to scene 2
    document.getElementById('story-mode-prev')!.click() // back to scene 1
    expect(document.getElementById('story-mode-title')?.textContent).toContain('幕2-1')
  })

  it('next button at last scene closes story', () => {
    setupStoryButtons()
    // advance to last scene
    const nextBtn = document.getElementById('story-mode-next')!
    for (let i = 0; i < 7; i++) {
      nextBtn.click()
    }
    // nextBtn text should be '閉じる ✕' on last scene
    expect(nextBtn?.textContent).toContain('閉じる')
    // clicking next at last scene closes
    nextBtn.click()
    expect(document.getElementById('story-mode')?.style.display).toBe('none')
  })
})

describe('closeStory', () => {
  beforeEach(() => {
    localStorage.clear()
    clearStoryProgress()
    document.body.innerHTML = `
      <div id="story-mode" style="display:flex">
        <div id="story-mode-icon"></div>
        <div id="story-mode-title"></div>
        <div id="story-mode-text"></div>
        <button id="story-mode-prev" class="hidden-btn">◀ 戻る</button>
        <button id="story-mode-next">次へ ▶</button>
      </div>
    `
    startStoryScene(3) // start at scene 3
  })

  it('hides story-mode element', () => {
    closeStory()
    expect(document.getElementById('story-mode')?.style.display).toBe('none')
  })

  it('persists current index to localStorage', () => {
    closeStory()
    expect(localStorage.getItem('sd_story_progress')).toBe('3')
  })

  it('calls onClose callback if provided', () => {
    let closed = false
    startStoryScene(2, () => { closed = true })
    closeStory()
    expect(closed).toBe(true)
  })
})
