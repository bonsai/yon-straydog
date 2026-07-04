# AGENTS.md — Stray Dog プロジェクト構造 (2026-07-04)

## アーキテクチャ

### シーン管理 (`src/scenes.ts`)
- `goToScene(id|name)` — 全画面遷移を一元管理
- `registerScene({id, name, enter})` — シーン登録
- `routeFromHash()` — 初回ロード時のみ `#0` `#s1-game` 等で直接シーン起動
- URL操作なし（hashchangeリスナーなし、history.replaceStateなし）

### シーンID

```
0  intro          1  s0-game(puzzle)
2  s0-result      3  hub(debug only)
4  s1-story       5  s1-game(puyo)       6  s1-result
7  s2-story       8  s2-game(simon)      9  s2-result
10 s3-story       11 s3-game(match)      12 s3-result
13 s4-story       14 s4-complete         15 map
17 s4-game(D&D)
```

### 画面フロー

```
intro(0) → s0-game(1) → s0-result(2) → map(15)
map → spotタップ → distance表示 → 到着(≤10m) → story → game → result → map
                                                                ↑_______________|
s4: s4-story(13) → s4-game(17: D&D) → s4-complete(14)
```

### 状態管理
- **`src/store.ts`**: `useDogStore` — `appState`, `introDone`, `completed[]`
- **`src/game-state.ts`**: `GamePhase`, ステップキュー, `buildStorySteps()`

### スポット

| id | 名前 | game | scene base |
|---|---|---|---|
| s0 | YON 2F | puzzle(2x2 photo) | 0 |
| s1 | さぼうる | puyo(6x12 4消し) | 4 |
| s2 | 響(野外彫刻) | simon(4色記憶) | 7 |
| s3 | 神田橋公園 | match(人物×古層D&D) | 10 |
| s4 | YON 3F | s4-game(西洋×東洋D&D) | 13 |

### GPS座標 (分散済み)

| spot | lat | lng |
|---|---|---|
| s0 | 35.6960 | 139.7575 |
| s1 | 35.6940 | 139.7600 |
| s2 | 35.6930 | 139.7630 |
| s3 | 35.6920 | 139.7660 |
| s4 | 35.6970 | 139.7560 |

### マップ (`src/map/map.ts`)
- Leaflet + OSMタイル
- モックGPS (`forceMock`)、10m到着閾値
- Spotマーカー (z-index 2000) > ユーザー👤 (500) > 犬🐕 (100)
- ポップアップ: 距離表示 + `📍ここへ移動` (>10m) or `▶謎を解く` (≤10m)
- 犬: 未踏破spot間をランダム移動 + 1-8秒停留
- 重複座標の自動オフセット

### ツールバー
`👜(bag)` `📝(memo)` `🗺️(map)` `📷(camera)` `🎤(mic)` `🔄(reset)`
- カバン: バッジ進捗表示 (🟡/⚪ x4)
- リセット: 全状態クリア + リロード

### intro
- `<img>` タグで `/0.jpg`(夫妻) → `/gdog.png`(犬) に切り替え
- CSS background-image 不使用

### favicon
- `/gdog.png`

---

## ビルド・配置

```
npm run dev        # localhost:5000
npm run build      # dist/
npm run test       # vitest (272 tests, 26 pre-existing failures)
npm run test:e2e   # playwright surge-flow (14 tests, all pass)
npm run deploy     # build + surge dist/ straydog.surge.sh
```

## デバッグ

`https://straydog.surge.sh#debug` — デバッグモード + `window.__debug` API 全開放

### よく使うdebugコマンド
```js
__debug.screen.hub()          // Hub (debug only)
__debug.game.puyo()           // ぷよぷよ
__debug.state.completeAll()   // 全バッジ取得
__debug.state.reset()         // リセット
__debug.map.mock()            // モックGPS地図
__debug.help()                // 全コマンド表示
```

### debug用シーンURL
`#debug/screen/hub` `#debug/game/s4` `#debug/screen/complete`

## 既知の問題

1. Unit test 26件 pre-existing failure (未export関数、座標距離、adventureタイミング等)
2. Surge E2E 14/14 pass
3. SW: `sw.js` 簡略化済み (addAll削除)
4. favicon.ico 404 → `/gdog.png` を favicon に設定済み
