import { describe, it, expect, beforeEach } from 'vitest'
import { useDogStore } from '../store'

beforeEach(() => {
  localStorage.clear()
  useDogStore.getState().reset()
})

describe('store', () => {
  it('starts in intro state', () => {
    const { appState, completed, introDone } = useDogStore.getState()
    expect(appState).toBe('intro')
    expect(completed).toEqual([])
    expect(introDone).toBe(false)
  })

  it('setIntroDone updates state and localStorage', () => {
    useDogStore.getState().setIntroDone()
    expect(useDogStore.getState().introDone).toBe(true)
    expect(localStorage.getItem('sd_intro_done')).toBe('true')
  })

  it('completeSpot adds to completed and persists', () => {
    useDogStore.getState().completeSpot('s0')
    useDogStore.getState().completeSpot('s1')
    const { completed } = useDogStore.getState()
    expect(completed).toEqual(['s0', 's1'])
    expect(JSON.parse(localStorage.getItem('sd_completed')!)).toEqual(['s0', 's1'])
  })

  it('completeSpot does not duplicate', () => {
    useDogStore.getState().completeSpot('s0')
    useDogStore.getState().completeSpot('s0')
    expect(useDogStore.getState().completed).toEqual(['s0', 's0'])
  })

  it('setCurrentSpot updates currentSpot', () => {
    const spot = { id: 's0', name: 'さぼうる', icon: '🍨', hint: 'hint' }
    useDogStore.getState().setCurrentSpot(spot)
    expect(useDogStore.getState().currentSpot).toEqual(spot)
    useDogStore.getState().setCurrentSpot(null)
    expect(useDogStore.getState().currentSpot).toBeNull()
  })

  it('setUserPos updates position', () => {
    useDogStore.getState().setUserPos({ lat: 35.695, lng: 139.758 })
    expect(useDogStore.getState().userPos).toEqual({ lat: 35.695, lng: 139.758 })
  })

  it('reset clears all state and localStorage', () => {
    useDogStore.getState().setIntroDone()
    useDogStore.getState().completeSpot('s0')
    useDogStore.getState().reset()
    const { appState, completed, introDone } = useDogStore.getState()
    expect(appState).toBe('intro')
    expect(completed).toEqual([])
    expect(introDone).toBe(false)
    expect(localStorage.getItem('sd_completed')).toBeNull()
    expect(localStorage.getItem('sd_intro_done')).toBeNull()
    expect(localStorage.getItem('sd_4x4_done')).toBeNull()
  })

  it('setAppState updates screen state', () => {
    useDogStore.getState().setAppState('puzzle4x4')
    expect(useDogStore.getState().appState).toBe('puzzle4x4')
  })
})
