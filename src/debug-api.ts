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
import {
  createTable, dropTable, insert, select, selectById,
  update, remove, count, allTables, exportDb, importDb, clearDb, seedFromUrl,
} from './db'
import { saveGame, loadGame, listSaves, deleteSave, restoreSave, exportSave, importSave } from './save'

export function setupDebugAPI(): void {
  if (!import.meta.env.DEV && !location.hash.startsWith('#debug')) return

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

    // ── 復活の呪文 ──
    spell: {
      HIRA: 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん',

      encode: function () {
        const s = useDogStore.getState()
        const c = s.completed
        const n = (s.introDone ? 1 : 0)
          | (localStorage.getItem('sd_4x4_done') === 'true' ? 2 : 0)
          | (c.includes('s0') ? 4 : 0)
          | (c.includes('s1') ? 8 : 0)
          | (c.includes('s2') ? 16 : 0)
          | (c.includes('s3') ? 32 : 0)
        const h = this.HIRA.split('')
        const c0 = h[n % 46]
        const c1 = h[Math.floor(n / 46) % 46]
        const chk = (n + 7) * 13 % 46
        const c2 = h[chk]
        const c3 = h[Math.floor(chk / 7) % 46]
        const code = c0 + c1 + c2 + c3
        console.log('[spell] 復活の呪文: %s', code)
        console.log('[spell] 状態: intro=%s puzzle=%s s0=%s s1=%s s2=%s s3=%s',
          s.introDone, localStorage.getItem('sd_4x4_done') === 'true',
          c.includes('s0'), c.includes('s1'), c.includes('s2'), c.includes('s3'))
        return code
      },

      decode: function (code: string) {
        if (code.length !== 4) { console.warn('[spell] 4文字で入力してください'); return null }
        const idx = [...code].map(c => this.HIRA.indexOf(c))
        if (idx.some(i => i < 0)) { console.warn('[spell] ひらがな以外の文字が含まれています'); return null }
        const n = idx[0] + idx[1] * 46
        const chk = (n + 7) * 13 % 46
        if (idx[2] !== chk || idx[3] !== Math.floor(chk / 7) % 46) { console.warn('[spell] チェックサム不一致: 無効な呪文です'); return null }
        const st = {
          introDone: !!(n & 1),
          puzzleDone: !!(n & 2),
          s0: !!(n & 4), s1: !!(n & 8), s2: !!(n & 16), s3: !!(n & 32),
        }
        console.log('[spell] 復活の呪文 確認: %s', code)
        console.log('[spell] 復元状態: intro=%s puzzle=%s s0=%s s1=%s s2=%s s3=%s',
          st.introDone, st.puzzleDone, st.s0, st.s1, st.s2, st.s3)
        // 状態を適用
        useDogStore.getState().reset()
        if (st.introDone) useDogStore.getState().setIntroDone()
        if (st.puzzleDone) localStorage.setItem('sd_4x4_done', 'true')
        if (st.s0) useDogStore.getState().completeSpot('s0')
        if (st.s1) useDogStore.getState().completeSpot('s1')
        if (st.s2) useDogStore.getState().completeSpot('s2')
        if (st.s3) useDogStore.getState().completeSpot('s3')
        console.log('[spell] 復元完了！')
        return st
      },

      list: function () {
        // 主要チェックポイントの呪文を表示
        const table = [
          { name: '🔄 リセット状態', code: this.encodeFrom({ intro: false, puzzle: false, s0: false, s1: false, s2: false, s3: false }) },
          { name: '📖 イントロ完了', code: this.encodeFrom({ intro: true, puzzle: false, s0: false, s1: false, s2: false, s3: false }) },
          { name: '🧩 パズル完了', code: this.encodeFrom({ intro: true, puzzle: true, s0: false, s1: false, s2: false, s3: false }) },
          { name: '🍨 s0(さぼうる)完了', code: this.encodeFrom({ intro: true, puzzle: true, s0: true, s1: false, s2: false, s3: false }) },
          { name: '🔔 s1(響)完了', code: this.encodeFrom({ intro: true, puzzle: true, s0: true, s1: true, s2: false, s3: false }) },
          { name: '🗽 s2(神田橋)完了', code: this.encodeFrom({ intro: true, puzzle: true, s0: true, s1: true, s2: true, s3: false }) },
          { name: '🎵 全コンプリート', code: this.encodeFrom({ intro: true, puzzle: true, s0: true, s1: true, s2: true, s3: true }) },
        ]
        console.table(table)
        return table
      },

      encodeFrom: function (st: { intro: boolean; puzzle: boolean; s0: boolean; s1: boolean; s2: boolean; s3: boolean }) {
        const n = (st.intro ? 1 : 0) | (st.puzzle ? 2 : 0) | (st.s0 ? 4 : 0) | (st.s1 ? 8 : 0) | (st.s2 ? 16 : 0) | (st.s3 ? 32 : 0)
        const h = this.HIRA.split('')
        const c0 = h[n % 46]; const c1 = h[Math.floor(n / 46) % 46]
        const chk = (n + 7) * 13 % 46
        const c2 = h[chk]; const c3 = h[Math.floor(chk / 7) % 46]
        return c0 + c1 + c2 + c3
      },
    },

    // ── Save/Load ──
    save: {
      save(slot?: number, name?: string) {
        const data = saveGame(slot ?? 0, name)
        if (data) {
          console.log('[save] saved to slot %d: %s', data.slot, data.name)
          console.table({
            intro: data.introDone, puzzle: data.puzzleDone,
            s0: data.s0, s1: data.s1, s2: data.s2, s3: data.s3,
            story: data.storyProgress, memo: data.memo ? data.memo.slice(0, 20) + '...' : '',
          })
        }
        return data
      },
      load(slot?: number) {
        const data = loadGame(slot ?? 0)
        if (!data) { console.warn('[save] no save in slot %d', slot ?? 0); return null }
        console.log('[save] loaded slot %d: %s', data.slot, data.name)
        console.table({
          intro: data.introDone, puzzle: data.puzzleDone,
          s0: data.s0, s1: data.s1, s2: data.s2, s3: data.s3,
        })
        restoreSave(data)
        goToHub()
        return data
      },
      list() {
        const saves = listSaves()
        if (saves.length === 0) {
          console.log('[save] セーブデータなし')
        } else {
          console.table(saves.map(s => ({
            slot: s.slot, name: s.name,
            intro: s.introDone ? '✅' : '❌',
            s0: s.s0 ? '🍨' : '', s1: s.s1 ? '🔔' : '', s2: s.s2 ? '🗽' : '', s3: s.s3 ? '🎵' : '',
            time: new Date(s.timestamp).toLocaleString(),
          })))
        }
        return saves
      },
      delete(slot: number) {
        const ok = deleteSave(slot)
        console.log(ok ? '[save] deleted slot %d' : '[save] failed to delete slot %d', slot)
        return ok
      },
      export(slot?: number) {
        const json = exportSave(slot)
        if (!json) { console.warn('[save] nothing to export'); return null }
        console.log('[save] exported:\n%s', json)
        navigator.clipboard?.writeText(json).catch(() => {})
        return json
      },
      import(json: string) {
        const ok = importSave(json)
        if (ok) {
          console.log('[save] imported successfully')
          console.table(listSaves())
        }
        return ok
      },
    },

    // ── Database ──
    db: {
      createTable: (name: string) => createTable(name),
      dropTable: (name: string) => dropTable(name),
      insert: (table: string, row: Record<string, unknown>) => insert(table, row),
      select: (table: string, query?: Record<string, unknown>) => select(table, query),
      selectById: (table: string, id: string) => selectById(table, id),
      update: (table: string, id: string, changes: Record<string, unknown>) => update(table, id, changes),
      remove: (table: string, id: string) => remove(table, id),
      count: (table: string) => count(table),
      tables: () => allTables(),
      export: () => exportDb(),
      import: (data: Record<string, unknown[]>) => importDb(data),
      clear: () => clearDb(),
      seed: () => seedFromUrl('/test.db'),
      loadSave: (id: string) => {
        const row = selectById<{ id: string; name: string; introDone: boolean; puzzleDone: boolean; s0: boolean; s1: boolean; s2: boolean; s3: boolean }>('saves', id)
        if (!row) { console.warn('[db] save not found:', id); return }
        useDogStore.getState().reset()
        if (row.introDone) useDogStore.getState().setIntroDone()
        if (row.puzzleDone) localStorage.setItem('sd_4x4_done', 'true')
        if (row.s0) useDogStore.getState().completeSpot('s0')
        if (row.s1) useDogStore.getState().completeSpot('s1')
        if (row.s2) useDogStore.getState().completeSpot('s2')
        if (row.s3) useDogStore.getState().completeSpot('s3')
        console.log('[db] loaded save:', row.name, row)
        return row
      },
      loadSpell: (code: string) => {
        const sp = (window as any).__debug?.spell
        if (sp) sp.decode(code)
      },
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
      console.group('spell')
      console.log('  encode()       — show current spell code (4 hiragana)')
      console.log('  decode(code)   — restore state from spell code')
      console.log('  list()         — show checkpoint spell codes')
      console.groupEnd()
      console.group('save')
      console.log('  save(s?,name?) — save game to slot (default 0)')
      console.log('  load(s?)       — load game from slot')
      console.log('  list()         — list all saves')
      console.log('  delete(s)      — delete save from slot')
      console.log('  export(s?)     — export saves as JSON (copies to clipboard)')
      console.log('  import(json)   — import saves from JSON')
      console.groupEnd()
      console.group('db')
      console.log('  createTable(n) — create table')
      console.log('  dropTable(n)   — drop table')
      console.log('  insert(t,row)  — insert row')
      console.log('  select(t, q?)  — query rows')
      console.log('  selectById(t,i) — get row by id')
      console.log('  update(t,i,c)  — update row')
      console.log('  remove(t,i)    — delete row')
      console.log('  count(t)       — row count')
      console.log('  tables()       — list tables')
      console.log('  export()       — export all data')
      console.log('  import(d)      — import data')
      console.log('  clear()        — clear all data')
      console.log('  seed()         — load test.db seed data')
      console.log('  loadSave(id)   — restore game from save row')
      console.log('  loadSpell(code) — restore from spell code')
      console.groupEnd()
    },
  }

  Object.defineProperty(globalThis, '__debug', {
    value: api, configurable: true,
  })
  console.log('[debug] __debug API ready')
  console.log('[debug] __debug.help() で全コマンド表示')

  // ── Hash-based command routing ──
  // URL: #debug/<group>/<method>/<arg1>/<arg2>/...
  // e.g. #debug/story/marathon, #debug/screen/complete, #debug/game/puyo
  const hash = location.hash
  if (hash.startsWith('#debug/')) {
    const parts = hash.slice(7).split('/').filter(Boolean)
    // parts[0] = group (e.g. "story"), parts[1] = method (e.g. "marathon")
    // parts[2..] = args
    if (parts.length >= 2) {
      const group = parts[0] as keyof typeof api
      const method = parts[1]
      const args = parts.slice(2).map(a => {
        const n = Number(a)
        return Number.isFinite(n) ? n : a
      })
      const obj = api[group]
      if (obj && typeof obj === 'object') {
        const fn = (obj as Record<string, unknown>)[method]
        if (typeof fn === 'function') {
          console.log('[debug] routing: %s.%s(%s)', group, method, args.map(a => JSON.stringify(a)).join(', '))
          setTimeout(() => (fn as (...a: unknown[]) => void)(...args), 100)
        } else {
          console.warn('[debug] unknown method: %s.%s', group, method)
        }
      } else {
        console.warn('[debug] unknown group: %s', group)
      }
    }
  }
}

export type DebugAPI = ReturnType<typeof setupDebugAPI>
