import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore, buildIntroSteps, buildHintSteps, buildStorySteps, type GamePhase } from '../status'

describe('useGameStore initial state', () => {
  it('has default phase as title', () => {
    const state = useGameStore.getState()
    expect(state.phase).toBe('title')
  })

  it('has empty steps and completedSpots', () => {
    const state = useGameStore.getState()
    expect(state.steps).toEqual([])
    expect(state.completedSpots).toEqual([])
  })

  it('has introDone false and no currentSpot', () => {
    const state = useGameStore.getState()
    expect(state.introDone).toBe(false)
    expect(state.currentSpot).toBeNull()
  })
})

describe('useGameStore actions (stubs)', () => {
  it('setPhase does not throw', () => {
    expect(() => useGameStore.getState().setPhase('hub')).not.toThrow()
  })

  it('setSteps does not throw', () => {
    expect(() => useGameStore.getState().setSteps([])).not.toThrow()
  })

  it('getCurrentStep returns undefined (stub)', () => {
    expect(useGameStore.getState().getCurrentStep()).toBeUndefined()
  })

  it('advanceStep returns undefined (stub)', () => {
    expect(useGameStore.getState().advanceStep()).toBeUndefined()
  })

  it('hasMoreSteps returns undefined (stub)', () => {
    expect(useGameStore.getState().hasMoreSteps()).toBeUndefined()
  })

  it('clearSteps does not throw', () => {
    expect(() => useGameStore.getState().clearSteps()).not.toThrow()
  })

  it('setIntroDone does not throw', () => {
    expect(() => useGameStore.getState().setIntroDone()).not.toThrow()
  })

  it('setCurrentSpot does not throw', () => {
    expect(() => useGameStore.getState().setCurrentSpot(null)).not.toThrow()
  })

  it('setUserPos does not throw', () => {
    expect(() => useGameStore.getState().setUserPos(null)).not.toThrow()
  })

  it('completeSpot does not throw', () => {
    expect(() => useGameStore.getState().completeSpot('s0')).not.toThrow()
  })

  it('reset does not throw', () => {
    expect(() => useGameStore.getState().reset()).not.toThrow()
  })
})

describe('buildIntroSteps', () => {
  it('returns steps ending with action that calls onDone', () => {
    let called = false
    const steps = buildIntroSteps(() => { called = true })
    expect(steps.length).toBeGreaterThan(1)
    const last = steps[steps.length - 1]
    expect(last.type).toBe('action')
    expect(last.nextPhase).toBe('puzzle')
    last.action?.()
    expect(called).toBe(true)
  })

  it('contains a choice step', () => {
    const steps = buildIntroSteps(() => {})
    const choice = steps.find(s => s.type === 'choice')
    expect(choice).toBeDefined()
    expect(choice!.choiceId).toBe('intro_puzzle')
  })
})

describe('buildHintSteps', () => {
  it('returns 4 steps with correct phase transition', () => {
    let called = false
    const steps = buildHintSteps('さぼうる', 'ヒントです', () => { called = true })
    expect(steps.length).toBe(4)
    expect(steps[0].text).toContain('さぼうる')
    expect(steps[1].text).toBe('ヒントです')
    expect(steps[2].type).toBe('choice')
    expect(steps[3].type).toBe('action')
    expect(steps[3].nextPhase).toBe('play')
    steps[3].action?.()
    expect(called).toBe(true)
  })
})

describe('buildStorySteps', () => {
  it('filters out empty paragraphs and adds choice and action steps', () => {
    let called = false
    const paragraphs = ['p1', '', 'p2']
    const steps = buildStorySteps('🐕', 'title', paragraphs, () => { called = true }, 'complete', '続ける')
    expect(steps.length).toBe(4)
    expect(steps[0].text).toBe('p1')
    expect(steps[1].text).toBe('p2')
    expect(steps[2].type).toBe('choice')
    expect(steps[2].text).toBe('続ける')
    expect(steps[3].type).toBe('action')
    expect(steps[3].nextPhase).toBe('complete')
    steps[3].action?.()
    expect(called).toBe(true)
  })

  it('uses default choice text when not provided', () => {
    const steps = buildStorySteps('🐕', 'title', ['p1'], () => {}, 'hub')
    const choice = steps.find(s => s.type === 'choice')
    expect(choice).toBeDefined()
    expect(choice!.text).toBe('ゲームをするかやめるか？')
  })

  it('returns only choice+action when paragraphs are all empty', () => {
    const steps = buildStorySteps('🐕', 'title', ['', ''], () => {}, 'hub')
    expect(steps.length).toBe(2)
    expect(steps[0].type).toBe('choice')
    expect(steps[1].type).toBe('action')
  })
})
