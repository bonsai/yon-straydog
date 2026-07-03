import { describe, it, expect } from 'vitest'
import { INTRO_LINES, STORY_SCENES } from '../spots'

describe('story data', () => {
  describe('INTRO_LINES', () => {
    it('has 9 lines', () => {
      expect(INTRO_LINES.length).toBe(9)
    })

    it('every line has a speed value', () => {
      for (const line of INTRO_LINES) {
        expect(line.speed).toBeGreaterThan(0)
      }
    })
  })

  describe('STORY_SCENES', () => {
    it('has 9 scenes', () => {
      expect(STORY_SCENES.length).toBe(9)
    })

    it('every scene has icon, title, and paragraphs', () => {
      for (const scene of STORY_SCENES) {
        expect(scene.icon.length).toBeGreaterThan(0)
        expect(scene.title.length).toBeGreaterThan(0)
        expect(scene.paragraphs.length).toBeGreaterThan(0)
      }
    })

    it('all paragraphs are strings', () => {
      for (const scene of STORY_SCENES) {
        for (const p of scene.paragraphs) {
          expect(typeof p).toBe('string')
        }
      }
    })
  })
})
