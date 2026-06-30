# アーキテクチャ: 物語進行 / ゲーム部分 分轄案

## 基本構造

```
                   ┌─────────────────┐
                   │   Bridge (Main)  │
                   │  イベントの橋渡し  │
                   └──┬──────────┬───┘
                      │          │
              ┌───────▼──┐  ┌───▼────────┐
              │ Story     │  │ Game       │
              │ Engine    │  │ System     │
              │ (物語進行)  │  │ (ゲーム部分) │
              └───────────┘  └────────────┘
```

## 2層の責務

| | Story Engine | Game System |
|--|-------------|-------------|
| **担当** | 台本の進行 | パズル・地図・GPS |
| **状態** | 現在シーン、表示済みダイアログ | 完了スポット一覧、謎の状態、位置情報 |
| **トリガー** | 「次へ」タップ、ゲームからのイベント | GPS更新、タイルタップ、回答送信 |
| **出力** | 画面上のテキスト・会話表示 | 地図更新、正誤判定、バッジ獲得 |
| **純粋性** | ほぼ純粋（データ駆動） | Ports経由で不純（GPS/Leaflet） |
| **テスト** | `story.json` を差し替えで全分岐確認可 | GPS/カメラはMock必須 |

## データフロー

```
           Story Engine                  Game System
           ┌──────────┐                ┌──────────┐
           │ Scene 1  │                │ spot s0  │
           │ Scene 2  │                │ spot s1  │
           │ Scene 3  │                │ spot s2  │
           │ Scene 4  │                │ spot s3  │
           │ Scene 5  │                │ Map/GPS  │
           │ Scene 6  │                │ 4x4puzzle│
           │ Scene 7  │                │ complete │
           └────┬─────┘                └────┬─────┘
                │                          │
                ▼                          ▼
           ┌──────────────────────────────────┐
           │           Bridge (Main)          │
           │                                  │
           │  StoryEvent → GameAction         │
           │  GameEvent  → StoryAction        │
           │                                  │
           │  例:                              │
           │  "intro完了" → unlockMap()        │
           │  "spotクリア" → showStory(idx)     │
           │  "全クリア"    → showEnding()       │
           └──────────────────────────────────┘
```

## インターフェース定義

### StoryEngine → Bridge

```typescript
interface StoryEvent {
  type: 'scene_advanced' | 'story_complete' | 'choice_made'
  sceneId?: number
  choice?: string
}
```

### GameSystem → Bridge

```typescript
interface GameEvent {
  type: 'spot_solved' | 'puzzle_done' | 'gps_arrived' | 'all_complete'
  spotId?: string
  data?: unknown
}
```

### Bridge → StoryEngine

```typescript
type StoryAction =
  | { type: 'advance' }
  | { type: 'show_scene'; id: number }
  | { type: 'reset' }
```

### Bridge → GameSystem

```typescript
type GameAction =
  | { type: 'unlock_map' }
  | { type: 'complete_spot'; id: string }
  | { type: 'complete_all' }
  | { type: 'reset' }
```

## 現状コードへのマッピング

### 物語層（Story Engine）

| ファイル | 内容 |
|---------|------|
| `straydog-script.md` | 台本データ（全セリフ・地の文） |
| `src/main.ts` INTRO_LINES | 導入14行のタイプライター |
| `src/main.ts` SPOTS[n].story | 各スポットの物語テキスト |
| `src/main.ts` 幕3・幕4 | エンディング・Goldberg層 |

### ゲーム層（Game System）

| ファイル | 内容 |
|---------|------|
| `src/puzzle.ts` | 4x4パズル純粋ロジック |
| `src/store.ts` | 状態管理（完了済み、現在地） |
| `src/main.ts` GPS部 | 位置情報追跡 |
| `src/main.ts` map部 | Leaflet地図操作 |
| `src/main.ts` submit部 | 回答検証 |

### Bridge（現状は混在）

| 箇所 | ブリッジ動作 |
|------|------------|
| `finishIntro()` → `start4x4Puzzle()` | Story完了 → Game開始 |
| `onSolved()` → PuzzleGoMap | パズル完了 → マップ開放 |
| `submitAnswer()` → story表示 | 謎正解 → 物語テキスト表示 |
| `d-complete-all` + DismissResult | 全完了 → エンディング |

## 分轄後のファイル構成案

```
src/
├── story/
│   ├── engine.ts       # 物語状態機械 (Scene → Event → next Scene)
│   ├── data.ts         # 台本データ (セリフ、ナレーション)
│   └── view.ts         # 物語表示UI (タイプライター、会話ウィンドウ)
│
├── game/
│   ├── system.ts       # ゲーム状態機械
│   ├── puzzle.ts       # 4x4パズル (現状維持)
│   ├── spots.ts        # スポット定義・回答検証
│   ├── gps.ts          # GPS追跡・位置判定
│   └── map.ts          # Leaflet地図操作
│
├── bridge.ts           # StoryEvent ↔ GameAction の変換
├── main.ts             # 初期化・サブスクリプション
└── store.ts            # 共通状態 (Zustand)
```

## この分轄のメリット

1. **TS版でも恩恵がある** — 関数型言語にしなくても、この境界を守れば「物語だけ差し替える」「ゲームだけテストする」が可能
2. **Elm移植が容易** — StoryEngine は純粋関数の塊なので、Elmの `update` にそのまま載る
3. **台本編集がUIに影響しない** — `story/data.ts` のJSONを変えるだけで物語が変わる
4. **デバッグが楽** — 物語のバグなのかゲームのバグなのか一発で分かる

## やらないこと

- **過度な抽象化はしない** — 2層の境界さえ守れば、内部の実装は自由
- **イベントバスは作らない** — Bridge は単なる関数呼び出し。メッセージキューは不要
- **StoryEngine に状態を持たせすぎない** — 今はシーンインデックスだけで十分
