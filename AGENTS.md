# AGENTS.md — Stray Dog プロジェクト構造

## 仕様と実装の乖離 (2026-07-03 判明)

全214 unit test + 30 E2E test が通るのに UX 仕様 (`docs/straydog-ux.md`) と実装が大きく異なる理由:

### テストは「仕様」ではなく「実装」を検証している

テストは仕様書の要求項目をテストしていない。実装時に書いたコードの振る舞いを検証しているだけ。以下、具体例:

| 仕様にあるもの | 実装 | テストが通った理由 |
|---|---|---|
| Splash画面 (ロゴ+「はじめる」) | なし。即座にIntroへ | テストは `showScreen('intro')` のDOM確認のみ |
| ARカメラ (足跡オーバーレイ) | なし。ツールバーのカメラのみ | テストは `#tool-btn-camera` の存在確認のみ |
| Home画面 (8ドット進捗bar) | なし。Intro→Puzzle→Hub直列 | テストは `goToHub()` 後のHubカード確認のみ |
| アルバム (3列グリッド) | なし | テスト自体がない |
| Bottom Sheet ドラッグ可能 | 固定表示 | テストは要素の存在確認のみ |
| CartoDB dark_all タイル | OSM標準タイル | タイルURLをテストしていない |
| 50m到着閾値 | 10m (変更済み) | テストは `getDistance()` の計算のみ |

### 結論

テストは**退行防止 (regression)** として機能しているが、**仕様準拠 (spec compliance)** は検証していない。

必要なら:
- `docs/straydog-ux.md` の各要件に ID を振る
- spec-to-test トレーサビリティマトリクスを作る
- E2E テスト (Playwright等) で画面フローを検証

---

## テスト構成

```
src/
├── __tests__/
│   ├── setup.ts          # localStorage, AudioContext, mediaDevices モック
│   ├── debug-api.test.ts # setupDebugAPI + window.__debug
│   ├── sound.test.ts     # ensureResumed / AudioContext resume
│   ├── status.test.ts    # GameStore stub (useGameStore)
│   ├── store.test.ts     # useDogStore (Zustand)
│   └── ux-flow.test.ts   # 画面遷移, Hub, Result, Complete, Confetti
├── game/__tests__/
│   ├── game-state.test.ts # 位相管理, ステップキュー
│   ├── puyo-logic.test.ts # ぷよぷよ消去判定 (canvas 非依存)
│   ├── puyo.test.ts       # startPuyoGame / closePuyoGame DOM
│   ├── puzzle.test.ts     # 15パズル createPuzzleState / isSolved
│   ├── quiz-dom.test.ts   # startQuiz4 / closeQuiz4 DOM
│   ├── quiz.test.ts       # QUIZZES データ整合性 (37問)
│   ├── registry.test.ts   # registerGameStarters window.__gameStarters
│   ├── simon-dom.test.ts  # startSimon / closeSimon DOM + keydown listener
│   ├── simon-logic.test.ts# clickTest 座標マッピング
│   ├── simon.test.ts      # createSimonCanvas / drawSimon mock
│   ├── spots.test.ts      # isSpotUnlocked / spotLockReason / completeCurrentSpot
│   └── story-mode.test.ts # saveStoryProgressIndex
├── map/__tests__/
│   ├── hub.test.ts        # isSpotUnlocked / spotLockReason / getBadgeCount
│   ├── map.test.ts        # getDistance / arrival detection
│   ├── render.test.ts     # Leaflet mock 描画
│   └── tools.test.ts      # showTools / setupTools ボタン制御
└── story/__tests__/
    ├── adventure-step.test.ts # startAdventure / stopAdventure / goNext
    ├── adventure.test.ts      # startStoryScene / saveStoryProgressIndex
    └── data.test.ts           # INTRO_LINES / STORY_SCENES データ検証
```

全24ファイル、214 unit test + 27 E2E test、全て PASS。

### テスト対象外のソース

| ファイル | 理由 | 優先度 |
|---|---|---|
| `src/hub.ts` | 単なる re-export + DEVログ | 低 |
| `src/main.ts` | DOMContentLoaded にフック → unit test で初期化不可 (E2E でカバー) | 中 |
| `src/story/spots.ts` | データ定義のみ (data.test.ts + E2E でカバー) | 低 |

### テスト方針

- **vitest + jsdom**: DOM操作のunitテスト (214 tests)
- **Playwright + chromium**: E2Eブラウザテスト (27 tests, `localhost:5000` 自動起動)
- **canvas依存**: `createCanvas` は mock 2d context で代用 (`canvas` package 未インストール)
- **Leaflet依存**: `map.test.ts` は `getDistance` の純粋計算のみ。地図描画は `render.test.ts` で mock。
- **音声**: `AudioContext` mock (setup.ts)。`ensureResumed` のみテスト済み。
- **位置情報**: `navigator.geolocation` mock。GPS mock は `startMockGPS` 経由。

---

## アーキテクチャ

### 状態管理
- **`src/store.ts`**: Zustand `useDogStore` — `appState`, `introDone`, `completed[]`, `currentMapCenter`
- **`src/game-state.ts`**: モジュール変数 — `GamePhase`, ステップキュー
- **`src/status.ts`**: `useGameStore` stub — `GamePhase` + step builder。**途中まで実装**

### 画面フロー
```
タイトル → INTRO → PUZZLE(4x4) → HUB → MAP → MINI-GAME → BADGE → HUB → COMPLETE
                                        ↑______________________________|
```

- `src/main.ts` の `DOMContentLoaded` ハンドラが全画面遷移を制御
- `switchScreen(from, to)`: CSS animation `sEnter`/`sExit` で遷移
- `showScreen(id)`: `active` class のみ操作 (アニメーションなし)

### スポット・アンロック条件
- s0 (さぼうる): 常時解放
- s1 (響): 常時解放
- s2 (神田橋公園): s0 + s1 クリアで解放
- s3 (YON 3F): s0 + s1 + s2 (バッジ3個) クリアで解放

### ミニゲーム
| スポット | ゲーム | ファイル |
|---|---|---|
| s0 | ぷよぷよ (6x12, 4消し) | `src/game/puyo.ts` |
| s1 | シモン (4色記憶) | `src/game/simon.ts` |
| s2 | クイズ (漢字読み) | `src/game/quiz.ts` |
| s3 | ファイナル (ストーリー) | - |

### GPS / 地図
- `src/map/map.ts`: Leaflet 地図。`startMap`, `stopMap`, `getDistance`, `setOnArrive`
- 到着閾値: **10m** (`src/map/map.ts:159`)
- デバッグ用モック: `forceMock` + `startMockGPS()`

---

## デバッグ

`http://localhost:5000/#debug` でデバッグモード有効。

### window.__debug API (`src/debug-api.ts`)

```ts
window.__debug = {
  screen: { show(id), hide(id), hub(), home(), intro(), puzzle(), map(), result(spotId?), complete(), all() }
  game:   { start(id), puyo(), simon(), quiz(), clear(), list() }
  map:    { open(), close(), mock(), pos(), moveTo(spotId) }
  story:  { show(index), list(), adventure(), stop(), marathon() }
  tool:   { show(name), hide(name), toolbar(bool), memo(), camera(), mic() }
  state:  { get(), set(partial), complete(id), completeAll(), reset(), introDone(), phase(p) }
  data:   { spots, stories, intro, badgeSpots, sceneIndex }
  debug:  { enable(), panel(), panelClose() }
  util:   { confetti(), share() }
  puzzle: { create(shuffle?), solved(state), swap(state, idx) }
  help()  // console.table
}
```

### debug-only class
`class="debug-only"` の要素は `#debug` hash 時のみ表示 (`enableDebugMode()`)。

---

## ビルド・配置

```
npm run dev      # 開発サーバ localhost:5000
npm run build    # dist/ に出力
npm run test     # vitest run (214 unit tests)
npm run test:e2e # playwright test (30 E2E tests on localhost:5000)
npm run test:all # vitest && playwright (244 tests total)
npm run deploy   # build + surge dist/ straydog.surge.sh
```

**注意**: `dist/index.html` は `index.html` と異なる構造 (古いビルド)。再ビルド推奨。

---

## 既知の問題

1. **dist/ が古い**: `index.html` の構造変更 (puzzle4 → p4 等) がビルドに未反映
2. **Service Worker**: `sw.js` が存在しない (register のみ)
3. **カメラ**: 実際のカメラストリームは動作するが、AR オーバーレイなし
4. **オフライン**: SW 登録のみ。キャッシュ戦略未実装
5. **アクセシビリティ**: aria-label, focus outline, prefers-reduced-motion 未対応
6. **レスポンシブ**: clamp() 未使用。固定値 + vw 混在
