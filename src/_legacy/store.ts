import type { SpotId } from './story/spots'

export type AppScreen = 'intro' | 'puzzle4x4' | 'home' | 'map'

interface UserPos {
  lat: number
  lng: number
}

export interface DogState {
  appState: AppScreen
  completed: SpotId[]
  introDone: boolean
  currentSpot: { id: string; name: string; icon: string; hint: string } | null
  userPos: UserPos | null
}

interface DogActions {
  setAppState: (s: AppScreen) => void
  completeSpot: (id: SpotId) => void
  setIntroDone: () => void
  setCurrentSpot: (s: { id: string; name: string; icon: string; hint: string } | null) => void
  setUserPos: (p: UserPos | null) => void
  reset: () => void
}

const state: DogState = {
  appState: 'intro',
  completed: JSON.parse(localStorage.getItem('sd_completed') ?? '[]') as SpotId[],
  introDone: localStorage.getItem('sd_intro_done') === 'true',
  currentSpot: null,
  userPos: null,
}

const actions: DogActions = {
  setAppState(appState) { state.appState = appState },
  completeSpot(id) {
    state.completed = [...state.completed, id]
    localStorage.setItem('sd_completed', JSON.stringify(state.completed))
  },
  setIntroDone() {
    localStorage.setItem('sd_intro_done', 'true')
    state.introDone = true
  },
  setCurrentSpot(s) { state.currentSpot = s },
  setUserPos(p) { state.userPos = p },
  reset() {
    localStorage.removeItem('sd_completed')
    localStorage.removeItem('sd_intro_done')
    localStorage.removeItem('sd_4x4_done')
    state.appState = 'intro'
    state.completed = []
    state.introDone = false
    state.currentSpot = null
  },
}

export function getState(): DogState { return state }
export function setState(partial: Partial<DogState>): void { Object.assign(state, partial) }

export const useDogStore = {
  getState: () => ({ ...state, ...actions }),
  setState: (partial: Partial<DogState>) => Object.assign(state, partial),
}
