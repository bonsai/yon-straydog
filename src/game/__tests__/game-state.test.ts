import { describe, it, expect, beforeEach } from 'vitest'
import {
  getPhase, setPhase, setSteps, getCurrentStep,
  advanceStep, hasMoreSteps, clearSteps,
  buildIntroSteps, buildHintSteps, buildStorySteps,
} from '../game-state.ts'
import type { GamePhase } from '../game-state.ts'

describe('game-state', () => {
  beforeEach(() => {
    setPhase('title')
    clearSteps()
  })

  describe('phase management', () => {
    it('defaults to title', () => {
      expect(getPhase()).toBe('title')
    })

    it('setPhase updates current phase', () => {
      setPhase('hub')
      expect(getPhase()).toBe('hub')
    })
  })

  describe('step queue', () => {
    it('setSteps replaces the queue', () => {
      setSteps([
        { type: 'text', text: 'hello' },
        { type: 'text', text: 'world' },
      ])
      expect(getCurrentStep()?.text).toBe('hello')
    })

    it('advanceStep moves to next step', () => {
      setSteps([
        { type: 'text', text: 'a' },
        { type: 'text', text: 'b' },
      ])
      advanceStep()
      expect(getCurrentStep()?.text).toBe('b')
    })

    it('hasMoreSteps returns true when steps remain', () => {
      setSteps([{ type: 'text', text: 'a' }, { type: 'text', text: 'b' }])
      expect(hasMoreSteps()).toBe(true)
    })

    it('hasMoreSteps returns false at last step', () => {
      setSteps([{ type: 'text', text: 'a' }])
      advanceStep()
      expect(hasMoreSteps()).toBe(false)
    })

    it('advanceStep transitions phase on last step with nextPhase', () => {
      setSteps([
        { type: 'text', text: 'a' },
        { type: 'action', action: () => {}, nextPhase: 'puzzle' },
      ])
      advanceStep()
      advanceStep()
      expect(getPhase()).toBe('puzzle')
    })
  })

  describe('buildIntroSteps', () => {
    it('returns steps ending with action', () => {
      const steps = buildIntroSteps(() => {})
      expect(steps.length).toBeGreaterThan(1)
      expect(steps[steps.length - 1].type).toBe('action')
      expect(steps[steps.length - 1].nextPhase).toBe('puzzle')
    })
  })

  describe('buildHintSteps', () => {
    it('returns hint steps with play phase transition', () => {
      const steps = buildHintSteps('spot name', 'hint text', () => {})
      expect(steps.length).toBe(4)
      expect(steps[steps.length - 1].type).toBe('action')
      expect(steps[steps.length - 1].nextPhase).toBe('play')
    })
  })

  describe('buildStorySteps', () => {
    it('creates step for each non-empty paragraph plus choice and action', () => {
      const paragraphs = ['p1', '', 'p2', 'p3']
      const steps = buildStorySteps('🐕', 'title', paragraphs, () => {}, 'hub')
      expect(steps.length).toBe(5)
      expect(steps[0].type).toBe('text')
      expect(steps[3].type).toBe('choice')
      expect(steps[4].type).toBe('action')
      expect(steps[4].nextPhase).toBe('hub')
    })
  })
})
