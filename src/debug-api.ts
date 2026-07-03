import { useDogStore } from './store'
import { SPOTS, STORY_SCENES, SPOT_SCENE_INDEX } from './story/spots'
import { startPuyoGame } from './game/puyo'
import { startSimon } from './game/simon'
import { startQuiz4 } from './game/quiz'
import { setCurrentGameSpot, completeCurrentSpot, getBadgeCount } from './map/hub'
import { startMap, stopMap, setForceMock } from './map/map'
import { startStoryScene } from './story/adventure'
import { showCompleteScreen, showResultScreen } from './main'

export function setupDebugAPI(): void {
  if (!import.meta.env.DEV && location.hash !== '#debug') return

  const api = {
    // ── Games ──
    game: {
      start: (id: string) => {
        const gs = (window as any).__gameStarters
        if (gs?.[id]) { setCurrentGameSpot(id); gs[id]() }
      },
      puyo: () => { setCurrentGameSpot('s0'); startPuyoGame(0) },
      simon: () => { setCurrentGameSpot('s1'); startSimon() },
      quiz: () => { setCurrentGameSpot('s2'); startQuiz4() },
      clear: () => completeCurrentSpot(),
    },

    // ── Map ──
    map: {
      open: () => startMap(useDogStore.getState().completed),
      close: () => stopMap(),
      mock: () => { setForceMock(true); startMap(useDogStore.getState().completed) },
    },

    // ── Stories ──
    story: {
      show: (idx: number) => startStoryScene(idx),
      list: () => STORY_SCENES.map((s, i) => `${i}: ${s.title}`),
    },

    // ── Screens ──
    screen: {
      hub: () => { window.location.hash = '#debug'; location.reload() },
      goToHub: () => { const m = (window as any).__main; if (m?.goToHub) m.goToHub() },
      result: (spotId: string) => {
        const spot = SPOTS.find(s => s.id === spotId)
        if (!spot) return
        showResultScreen(spot.badge, 'バッジを獲得！', spot.badgeName, `${getBadgeCount(useDogStore.getState().completed)}/3`)
      },
      complete: () => showCompleteScreen(),
    },

    // ── State ──
    state: {
      get: () => ({
        completed: useDogStore.getState().completed,
        badges: getBadgeCount(useDogStore.getState().completed),
        introDone: useDogStore.getState().introDone,
        appState: useDogStore.getState().appState,
      }),
      complete: (id: string) => useDogStore.getState().completeSpot(id),
      completeAll: () =>
        SPOTS.filter(s => s.id !== 's3').forEach(s =>
          useDogStore.getState().completeSpot(s.id)
        ),
      reset: () => useDogStore.getState().reset(),
      introDone: () => useDogStore.getState().setIntroDone(),
    },

    // ── Data ──
    data: { spots: SPOTS, stories: STORY_SCENES },

    // ── Help ──
    help: () => console.table({
      'game.start(id)': 'start mini-game by spot id (s0/s1/s2)',
      'game.puyo()': 'start puyo game (s0)',
      'game.simon()': 'start simon game (s1)',
      'game.quiz()': 'start kanji quiz (s2)',
      'game.clear()': 'complete current spot',
      'map.open()': 'open map',
      'map.close()': 'close map',
      'map.mock()': 'open map with mock GPS',
      'story.show(n)': 'show story scene by index (0-7)',
      'story.list()': 'list all story scenes',
      'screen.hub()': 'go to hub (reload)',
      'screen.result(id)': 'show result screen for spot',
      'screen.complete()': 'show complete screen',
      'state.get()': 'print current state',
      'state.complete(id)': 'mark spot as completed',
      'state.completeAll()': 'complete all 3 badge spots',
      'state.reset()': 'reset all progress',
      'state.introDone()': 'mark intro as done',
      'data.spots': 'spot definitions',
      'data.stories': 'story scene data',
    }),
  }

  Object.defineProperty(globalThis, '__debug', {
    value: api, configurable: true,
  })
  console.log('[debug] API ready — use window.__debug')
  console.log('[debug] window.__debug.help() for usage')
}
