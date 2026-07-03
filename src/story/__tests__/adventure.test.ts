import { describe, it, expect, beforeEach } from 'vitest'
import { startStoryScene, saveStoryProgressIndex, clearStoryProgress } from '../adventure'

describe('story viewer', () => {
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
  })

  it('startStoryScene shows the story container', () => {
    startStoryScene(0)
    const el = document.getElementById('story-mode')
    expect(el?.style.display).toBe('flex')
  })

  it('startStoryScene renders icon and title for scene 0', () => {
    startStoryScene(0)
    expect(document.getElementById('story-mode-icon')?.textContent).toBe('📖')
    expect(document.getElementById('story-mode-title')?.textContent).toContain('出会い')
  })

  it('startStoryScene renders scene 2 (Hibiki)', () => {
    startStoryScene(2)
    expect(document.getElementById('story-mode-icon')?.textContent).toBe('🔔')
    expect(document.getElementById('story-mode-title')?.textContent).toContain('響')
  })

  it('saveStoryProgressIndex persists to localStorage', () => {
    saveStoryProgressIndex(3)
    expect(localStorage.getItem('sd_story_progress')).toBe('3')
  })

  it('clearStoryProgress removes from localStorage', () => {
    saveStoryProgressIndex(3)
    clearStoryProgress()
    expect(localStorage.getItem('sd_story_progress')).toBeNull()
  })

  it('startStoryScene without idx reads from stored progress', () => {
    saveStoryProgressIndex(6)
    startStoryScene()
    expect(document.getElementById('story-mode-title')?.textContent).toContain('Goldberg')
  })

  it('startStoryScene defaults to 0 when no stored progress', () => {
    clearStoryProgress()
    startStoryScene()
    expect(document.getElementById('story-mode-title')?.textContent).toContain('出会い')
  })
})
