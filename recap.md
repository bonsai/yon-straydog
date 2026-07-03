# Stray Dog Recap — 2026-07-03 Session

## Pull & Integrate (14 commits behind)
- puyo/simon subdirs → flat files (`puyo.ts`, `simon.ts`, `quiz.ts`)
- New modules: `db.ts`, `debug-api.ts`, `status.ts`, `game-state.ts`
- `map/hub.ts` extracted, `story/data.ts` → merged into `story/spots.ts`
- Chrome extension (`chrome-ext/`), Docker (`Dockerfile`), Playwright e2e (`e2e/`)
- Story data consolidated into `story/spots.ts`

## Fixes
- `vitest.config.ts`: `/gdog.png` alias → `public/gdog.png` (2 test suites were failing)
- `src/story/adventure.ts`: `closeStory` exported for testing

## Issue #12 — Test Coverage (P1/P4/P5)

| P | Area | File | Tests |
|---|------|------|-------|
| P1 | main.ts lifecycle | `src/__tests__/main-lifecycle.test.ts` (new) | 19 |
| P1 | main.ts exports | `src/main.ts` | — |
| P4 | Memo persistence | `src/map/__tests__/memo.test.ts` (new) | 4 |
| P5 | Story buttons | `src/story/__tests__/story-buttons.test.ts` (new) | 8 |

## Issue #13 — Save/Load System

### Implementation
- `src/save.ts` (new): `saveGame/loadGame/listSaves/deleteSave/restoreSave/autoSave/exportSave/importSave`
- Auto-save hooks in `src/main.ts`: puzzle solved / badge earned / game complete
- `__debug.save` API: save/load/list/delete/export/import + hash routing
- 3 slots (0-2), full state persistence
- `src/__tests__/save.test.ts` (new): 16 tests

## E2E Testing (Playwright)

- Installed `@playwright/test` + Chromium
- `playwright.config.ts`: timeout 90s, workers 2, webServer auto-start
- `e2e/flow.spec.ts`: fixed tests 1-2 (`waitForSelector` for intro)
- **40/40 tests pass** (6.8min single-worker)

## Final State

| Layer | Count | Result |
|-------|-------|--------|
| Unit (Vitest) | 29 files / 273 tests | ✅ |
| E2E (Playwright) | 1 file / 40 tests | ✅ |
| Build (Vite) | 214.88 kB JS | ✅ |

**Total: 313 tests pass**

```
Dev: http://localhost:5000
Debug: http://localhost:5000#debug
```

## Remaining

| # | Issue | Priority |
|---|-------|----------|
| 11 | 実機テスト (GPS/カメラ/iOS Safari) | High |
| 14 | Surge deploy token | Low |
| 15 | P2/P3/P6 残テスト (Canvas/Leaflet/status stub) | Low |
