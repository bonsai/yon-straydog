import { create } from 'zustand'
import type L from 'leaflet'
import { type Option, none, some } from 'fp-ts/Option'
import type { Spot, SpotId } from './game/spots'

export type AppScreen = 'intro' | 'puzzle4x4' | 'home' | 'map'

interface UserPos {
  lat: number
  lng: number
}

interface DogState {
  appState: AppScreen
  completed: SpotId[]
  introDone: boolean
  currentSpot: Option<Spot>
  userPos: Option<UserPos>
  map: L.Map | null
  userMarker: L.CircleMarker | null
  spotMarkers: L.Marker[]
  gpsWatchId: number | null
}

interface DogActions {
  setAppState: (s: AppScreen) => void
  completeSpot: (id: SpotId) => void
  setIntroDone: () => void
  setCurrentSpot: (s: Option<Spot>) => void
  setUserPos: (p: Option<UserPos>) => void
  setMap: (m: L.Map | null) => void
  setUserMarker: (m: L.CircleMarker | null) => void
  setSpotMarkers: (ms: L.Marker[]) => void
  setGpsWatchId: (id: number | null) => void
  reset: () => void
}

export const useDogStore = create<DogState & DogActions>((set) => ({
  appState: 'intro',
  completed: JSON.parse(localStorage.getItem('sd_completed') ?? '[]') as SpotId[],
  introDone: localStorage.getItem('sd_intro_done') === 'true',
  currentSpot: none,
  userPos: none,
  map: null,
  userMarker: null,
  spotMarkers: [],
  gpsWatchId: null,

  setAppState: (appState) => set({ appState }),

  completeSpot: (id) =>
    set((s) => {
      const next = [...s.completed, id]
      localStorage.setItem('sd_completed', JSON.stringify(next))
      return { completed: next }
    }),

  setIntroDone: () => {
    localStorage.setItem('sd_intro_done', 'true')
    set({ introDone: true })
  },

  setCurrentSpot: (currentSpot) => set({ currentSpot }),
  setUserPos: (userPos) => set({ userPos }),
  setMap: (map) => set({ map }),
  setUserMarker: (userMarker) => set({ userMarker }),
  setSpotMarkers: (spotMarkers) => set({ spotMarkers }),
  setGpsWatchId: (gpsWatchId) => set({ gpsWatchId }),

  reset: () => {
    localStorage.removeItem('sd_completed')
    localStorage.removeItem('sd_intro_done')
    localStorage.removeItem('sd_4x4_done')
    set({
      appState: 'intro',
      completed: [],
      introDone: false,
      currentSpot: none,
    })
  },
}))
