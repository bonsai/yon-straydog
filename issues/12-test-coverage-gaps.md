# テストカバレッジ未達箇所の洗い出し

## 概要
全テスト 182件 Passed (22ファイル)。新規に追加したテスト箇所と、まだカバーできていない箇所を記録する。

## 追加済みテスト (今回の実装分)

### 完了
- [x] `game/puyo.ts` — `startPuyoGame()`, `closePuyoGame()`（DOM表示/非表示, canvas追加, イベントリスナー解除）
- [x] `game/simon.ts` — `startSimon()`, `closeSimon()`（DOM表示/非表示, canvas追加, イベントリスナー解除）
- [x] `game/quiz.ts` — `startQuiz4()`, `closeQuiz4()`（DOM表示, フィールド設定, onSubmit正解/不正解, Enter/Escapeキー）
- [x] `story/adventure.ts` — `startAdventure()`, `stopAdventure()`, ステップ実行（text→choice→action の連続実行）, オーバーレイクリック, yesボタン
- [x] `map/hub.ts` — `showTools()`, `setupTools()`（メモ/カメラ/マイク/マップツールの開閉）, `startSpotHub()`（カードレンダリング, ロック状態, バッジ表示, 完了マーク）
- [x] `status.ts` — `useGameStore` 初期状態, 各アクションスタブ, `buildIntroSteps()`, `buildHintSteps()`, `buildStorySteps()`
- [x] バグ修正: `simon.ts` の `closeSimon()` に `removeEventListener('keydown')` が欠けていたため追加

## 未達 (P1-P6)

### P1: ゲームフローの要 (要 jsdom + DOM モック)
- [ ] `main.ts` — `startIntro()`, `start4x4Puzzle()`, `goToHub()`, `startSpotMap()`, `showClearedStory()`, `showResultScreen()`, `showCompleteScreen()`
- [ ] `main.ts` — `switchScreen()`, `showScreen()`（画面遷移アニメーション制御）
- [ ] `main.ts` — `finishIntroState()`, `onPuzzleComplete()`（状態に応じた分岐）
- [ ] `main.ts` — `enableDebugMode()`, `renderDebugPanel()`, `shareResult()`, `confetti()`

### P2: ミニゲーム UI (Canvas/Web Audio依存)
- [ ] `game/puyo.ts` — `drawFrame()`, `createCanvas()`, `createCanvasSize()`（Canvas描画ロジック）
- [ ] `game/simon.ts` — `drawSimon()` の全フェーズ（showing, input, correct, wrong, clear）
- [ ] `game/simon.ts` — `playNote()`（Web Audio）

### P3: マップ/GPS (Leaflet依存でモック必須)
- [ ] `map/map.ts` — `startMap()`, `stopMap()`, `startGPS()`, `startMockGPS()`
- [ ] `map/map.ts` — `checkArrival()`, `showBottomSheet()`, `updateUserPos()`
- [ ] `map/map.ts` — `startDogWander()`, `mockStep()`, `onPosition()`

### P4: ツールバーUI残り
- [ ] `map/hub.ts` — `showMemo()`（テキストエリア内容の永続化検証）
- [ ] `map/hub.ts` — `stopCamera()`, `stopMic()`（ストリーム解放）

### P5: アドベンチャー残り
- [ ] `story/adventure.ts` — `setupStoryButtons()`（prev/nextボタンの動作）, `renderScene()`（全パラグラフタイプ）
- [ ] `story/adventure.ts` — `closeStory()`, `readStoredStoryIndex()`（異常値ハンドリング）

### P6: スタブ・補助モジュール
- [ ] `status.ts` — `useGameStore.setState()`（状態更新の実装未完了）

## 関連ファイル
- `src/main.ts`
- `src/game/puyo.ts`
- `src/game/simon.ts`
- `src/game/quiz.ts`
- `src/map/map.ts`
- `src/map/hub.ts`
- `src/story/adventure.ts`
- `src/status.ts`
- `src/hub.ts`

## 備考
- Canvas (`getContext('2d')`) のテストには `canvas` npm パッケージが必要
- Leaflet (`L.map`) のテストには leaflet のモックが必要
- Web Audio (`AudioContext`) は既存 setup.ts でモック済み
- メディアAPI (`getUserMedia`) は setup.ts でモック済み
