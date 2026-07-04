# テストカバレッジ未達箇所の洗い出し

> **Status: ✅ Done (2026-07-03)** — 273 tests / 29 files

## 完了

### P1: main.ts lifecycle (2026-07-03)
- [x] `startIntro()` — phase/hide toolbar/bg set/skip/if introDone branch
- [x] `finishIntroState()` — sd_4x4_done=true→hub / false→puzzle
- [x] `start4x4Puzzle()` — 16 tiles render, tap→select→swap, solved hint, close→hub
- [x] `onPuzzleComplete()` → goToHub
- [x] `goToHub()` — hub open, 4 cards, lock state, badge balls
- [x] `showResultScreen()`, `showCompleteScreen()`
- [x] `switchScreen()`, `showScreen()`, `hideEl()`
- [x] `enableDebugMode()`, `renderDebugPanel()`, `shareResult()`, `confetti()`

**Test file**: `src/__tests__/main-lifecycle.test.ts` (19 tests)

### P4: Memo persistence (2026-07-03)
- [x] save/restore memo via localStorage on close/reopen
- [x] empty memo save
- [x] overlay close on close button

**Test file**: `src/map/__tests__/memo.test.ts` (4 tests)

### P5: Story buttons (2026-07-03)
- [x] next button advances scenes
- [x] prev button hidden on scene 0, visible after advance
- [x] prev goes back to previous scene
- [x] last scene → close button text + close on click
- [x] closeStory persists index, calls onClose callback

**Test file**: `src/story/__tests__/story-buttons.test.ts` (8 tests)

## 未達 (残り)

### P2: ミニゲーム UI (Canvas/Web Audio依存)
- [ ] `game/puyo.ts` — `drawFrame()`, `createCanvas()` (Canvas描画)
- [ ] `game/simon.ts` — `drawSimon()` 全フェーズ, `playNote()` (Web Audio)

### P3: マップ/GPS (Leaflet依存)
- [ ] `map/map.ts` — `startMap()`, `startGPS()`, `startMockGPS()`, `checkArrival()`

### P6: スタブ
- [ ] `status.ts` — `useGameStore.setState()` 実装未完了
