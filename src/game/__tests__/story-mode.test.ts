import { beforeEach, describe, expect, it } from 'vitest'
import { clearStoryProgress, saveStoryProgressIndex, startStoryScene } from '../../story/adventure'

describe('story-mode resume', () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.innerHTML = `
      <div id="story-mode" style="display:none"></div>
      <div id="story-mode-icon"></div>
      <div id="story-mode-title"></div>
      <div id="story-mode-text"></div>
      <button id="story-mode-prev"></button>
      <button id="story-mode-next"></button>
    `
    clearStoryProgress()
  })

  it('reopens from the stored scene index', () => {
    saveStoryProgressIndex(2)

    startStoryScene()

    expect(document.getElementById('story-mode-title')?.textContent).toContain('幕2-2')
  })
})
