# P2/P3/P6 残テストカバレッジ + E2E

> **E2E: ✅ Done (2026-07-03)** — Playwright 40/40 pass
>
> Unit 残: Canvas/Leaflet依存の P2/P3 のみ

## ✅ E2E Tests (Playwright)
- インストール: `@playwright/test` + Chromium
- `playwright.config.ts`: timeout 90s, workers 2
- `e2e/flow.spec.ts`: 40 tests, all pass
  - 画面フロー (6 tests)
  - デバッグモード (13 tests)
  - ツールバー (2 tests)
  - リザルト画面 (3 tests)
  - コンプリート画面 (2 tests)
  - ストーリー (4 tests)
  - エッジケース (10 tests)

## P2: Canvas 描画テスト (未)
### 対象
- `src/game/puyo.ts` — `drawFrame()`, `createCanvas()`
- `src/game/simon.ts` — `drawSimon()` 各フェーズ, `playNote()`

### 要件
- `canvas` npm package for jsdom Canvas 2D API

## P3: Leaflet/GPS テスト (未)
### 対象
- `src/map/map.ts` — `startMap()`, `startGPS()`, `checkArrival()`

### 要件
- Leaflet + geolocation mock

## P6: status.ts スタブ (未)
- `src/status.ts` — `useGameStore.setState()` 実装未完了

## 優先度
低。E2E で全画面フロー検証済み。
