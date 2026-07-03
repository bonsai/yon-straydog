import { useDogStore } from './store'
import { SPOTS, STORY_SCENES, SPOT_SCENE_INDEX, INTRO_LINES, BADGE_SPOTS } from './story/spots'
import { startPuyoGame } from './game/puyo'
import { startSimon } from './game/simon'
import { startQuiz4 } from './game/quiz'
import { setCurrentGameSpot, completeCurrentSpot, getBadgeCount, startSpotHub, showTools, setupTools } from './map/hub'
import { startMap, stopMap, setForceMock, getCurrentPosition, setOnArrive, mockMoveTo } from './map/map'
import { startStoryScene, startAdventure, stopAdventure } from './story/adventure'
import { getPhase, setPhase, buildIntroSteps, buildHintSteps, buildStorySteps } from './game-state'
import { showScreen, showCompleteScreen, showResultScreen, showClearedStory, goToHub, hideEl, confetti, shareResult, enableDebugMode, renderDebugPanel } from './main'
import { createPuzzleState, isSolved, selectOrSwap } from './game/puzzle'

export function setupDebugAPI(): void {
  if (!import.meta.env.DEV && location.hash !== '#debug') return

  const api = {
    // ── Screens ──
    screen: {
      show: (id: string) => showScreen(id),
      hide: (id: string) => hideEl(id),
      hub: () => goToHub(),
      home: () => showScreen('home'),
      intro: () => showScreen('intro'),
      puzzle: () => showScreen('puzzle4'),
      map: () => showScreen('map-wrap'),
      result: (spotId?: string) => {
        const id = spotId ?? useDogStore.getState().completed.slice(-1)[0] ?? 's0'
        const spot = SPOTS.find(s => s.id === id)
        if (!spot) return
        showResultScreen(spot.badge, 'バッジを獲得！', spot.badgeName, `${getBadgeCount(useDogStore.getState().completed)}/3`)
      },
      complete: () => showCompleteScreen(),
      all: () => document.querySelectorAll('.screen').forEach(el => {
        const id = el.id
        if (id) console.log(`  #${id}: ${el.classList.contains('active') ? 'active' : 'hidden'}`)
      }),
    },

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
      list: () => SPOTS.map(s => `${s.id}: ${s.name} (${s.game})`),
    },

    // ── Map ──
    map: {
      open: () => startMap(useDogStore.getState().completed),
      close: () => stopMap(),
      mock: () => { setForceMock(true); startMap(useDogStore.getState().completed) },
      pos: () => getCurrentPosition(),
      moveTo: (spotId: string) => mockMoveTo(spotId),
    },

    // ── Stories ──
    story: {
      show: (idx: number) => startStoryScene(idx),
      list: () => STORY_SCENES.map((s, i) => `${i}: ${s.title}`),
      adventure: () => startAdventure(),
      stop: () => stopAdventure(),
      marathon: () => {
        // ストーリーのみモード: 全ゲーム要素をスキップしてストーリーを読む
        useDogStore.getState().reset()
        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'))
        document.querySelectorAll('#puzzle4, #result, #complete, #spot-hub, #adventure-overlay, #puzzle-wrap, #simon-game, #puyo-game, #quiz4-game, #toolbar, .tool-overlay, #debug-panel').forEach(el => {
          (el as HTMLElement).style.display = 'none'
        })
        startStoryScene(0, () => {
          // 全シーン読了後: コンプリート画面
          setTimeout(() => {
            document.getElementById('story-mode')?.style.display === 'none'
            showCompleteScreen()
          }, 300)
        })
        console.log('[story] ストーリーマラソン開始 — 全%sシーン', STORY_SCENES.length)
        console.log('[story] 「次へ ▶」で進行、「閉じる ✕」で終了')
      },
    },

    // ── Tools ──
    tool: {
      show: (name: string) => {
        const el = document.getElementById(`tool-${name}`)
        if (el) el.classList.add('open')
      },
      hide: (name: string) => {
        const el = document.getElementById(`tool-${name}`)
        if (el) el.classList.remove('open')
      },
      toolbar: (show: boolean) => showTools(show),
      // Shortcuts per tool
      memo: () => { document.getElementById('tool-memo')?.classList.add('open') },
      camera: () => { document.getElementById('tool-camera')?.classList.add('open') },
      mic: () => { document.getElementById('tool-mic')?.classList.add('open') },
    },

    // ── State ──
    state: {
      get: () => ({
        completed: useDogStore.getState().completed,
        badges: getBadgeCount(useDogStore.getState().completed),
        introDone: useDogStore.getState().introDone,
        appState: useDogStore.getState().appState,
        phase: getPhase(),
      }),
      set: (partial: Record<string, unknown>) => useDogStore.setState(partial as any),
      complete: (id: string) => useDogStore.getState().completeSpot(id),
      completeAll: () =>
        SPOTS.filter(s => s.id !== 's3').forEach(s =>
          useDogStore.getState().completeSpot(s.id)
        ),
      reset: () => useDogStore.getState().reset(),
      introDone: () => useDogStore.getState().setIntroDone(),
      phase: (p: string) => setPhase(p as any),
    },

    // ── Data ──
    data: {
      spots: SPOTS,
      stories: STORY_SCENES,
      intro: INTRO_LINES,
      badgeSpots: BADGE_SPOTS,
      sceneIndex: SPOT_SCENE_INDEX,
    },

    // ── Debug UI ──
    debug: {
      enable: () => enableDebugMode(),
      panel: () => {
        renderDebugPanel()
        document.getElementById('debug-panel')?.classList.add('open')
      },
      panelClose: () => document.getElementById('debug-panel')?.classList.remove('open'),
    },

    // ── Utility ──
    util: {
      confetti: () => confetti(),
      share: () => shareResult(),
      sound: {
        // Sound shortcuts delegated from imported modules
      },
    },

    // ── Puzzle (4x4) ──
    puzzle: {
      create: (shuffle?: boolean) => createPuzzleState(shuffle ?? true),
      solved: (state: ReturnType<typeof createPuzzleState>) => isSolved(state),
      swap: (state: ReturnType<typeof createPuzzleState>, idx: number) => selectOrSwap(state, idx),
    },

    // ── Help ──
    help: () => {
      console.log('=== __debug API ===')
      console.group('screen')
      console.log('  show(id)       — show screen by id')
      console.log('  hide(id)       — hide element by id')
      console.log('  hub()          — go to spot hub')
      console.log('  home()         — show home screen')
      console.log('  intro()        — show intro')
      console.log('  puzzle()       — show 4x4 puzzle')
      console.log('  map()          — show map')
      console.log('  result(id?)    — show result (optional spot id)')
      console.log('  complete()     — show complete screen')
      console.log('  all()          — list all screens with state')
      console.groupEnd()
      console.group('game')
      console.log('  start(id)      — start game by spot id')
      console.log('  puyo()         — start puyo game')
      console.log('  simon()        — start simon game')
      console.log('  quiz()         — start quiz')
      console.log('  clear()        — mark current spot cleared')
      console.log('  list()         — list all spots with game type')
      console.groupEnd()
      console.group('map')
      console.log('  open()         — open map')
      console.log('  close()        — close map')
      console.log('  mock()         — open map with mock GPS')
      console.log('  pos()          — get current position')
      console.groupEnd()
      console.group('story')
      console.log('  show(idx)      — show story scene by index')
      console.log('  list()         — list all story scenes')
      console.log('  adventure()    — start adventure overlay')
      console.log('  stop()         — stop adventure')
      console.log('  marathon()     — story-only mode: read all scenes')
      console.groupEnd()
      console.group('tool')
      console.log('  show(name)     — show tool overlay (memo/camera/mic)')
      console.log('  hide(name)     — hide tool overlay')
      console.log('  toolbar(bool)  — show/hide toolbar')
      console.log('  memo()         — open memo')
      console.log('  camera()       — open camera')
      console.log('  mic()          — open mic')
      console.groupEnd()
      console.group('state')
      console.log('  get()          — get current state')
      console.log('  set(partial)   — set state')
      console.log('  complete(id)   — mark spot completed')
      console.log('  completeAll()  — complete all badge spots')
      console.log('  reset()        — reset all progress')
      console.log('  introDone()    — mark intro as done')
      console.log('  phase(p)       — set game phase')
      console.groupEnd()
      console.group('data')
      console.log('  spots          — spot definitions')
      console.log('  stories        — story scene data')
      console.log('  intro          — intro lines')
      console.log('  badgeSpots     — badge-only spots (excl. s3)')
      console.log('  sceneIndex     — spot → scene index map')
      console.groupEnd()
      console.group('debug')
      console.log('  enable()       — enable debug mode (show debug-only)')
      console.log('  panel()        — open debug panel')
      console.log('  panelClose()   — close debug panel')
      console.groupEnd()
      console.group('util')
      console.log('  confetti()     — trigger confetti')
      console.log('  share()        — trigger share')
      console.groupEnd()
      console.group('puzzle')
      console.log('  create(?)      — create 4x4 puzzle state')
      console.log('  solved(state)  — check if solved')
      console.log('  swap(s, idx)   — select or swap tile')
      console.groupEnd()
    },
  }

  Object.defineProperty(globalThis, '__debug', {
    value: api, configurable: true,
  })
  console.log('[debug] __debug API ready')
  console.log('[debug] __debug.help() で全コマンド表示')
}

export type DebugAPI = ReturnType<typeof setupDebugAPI>
