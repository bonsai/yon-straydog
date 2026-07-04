# Progression API — URL一覧 (進行順)

各進行ステップを URL で直接呼び出せる (`#debug/<group>/<method>/<args>`)。

## 基本URL

| Step | URL | 内容 |
|------|-----|------|
| リセット | `/#reset` | localStorage全消去 → リロード |
| Intro | `https://straydog.surge.sh/` | 夫妻写真→犬写真（タイピング） |
| 2×2 Puzzle | `/#debug/screen/puzzle` | 4枚パズル |

## 進行フロー

```
INTRO → PUZZLE(2×2) → WORRY STORY → MAP(s0 pulse) → s0 GAME → BADGE → s1 GAME → BADGE → s2 GAME → BADGE → s3 GAME → COMPLETE
```

## Screen URLs

| Screen | URL | 備考 |
|--------|-----|------|
| Intro | `/#debug/screen/intro` | 夫妻写真BG |
| Hub | `/#debug/screen/hub` | スポットカード一覧 |
| Map | `/#debug/map/open` | Leaflet地図 |
| Map (Mock) | `/#debug/map/mock` | モックGPS地図 |
| Puzzle | `/#debug/screen/puzzle` | 2×2パズル |
| Result | `/#debug/screen/result/s0` | バッジ獲得画面 |
| Complete | `/#debug/screen/complete` | 紙吹雪＋シェア |
| Home | `/#debug/screen/home` | トップ |

## Game URLs

| Game | URL | 内容 |
|------|-----|------|
| s0 ぷよぷよ | `/#debug/game/puyo` | 6x12 4消し |
| s1 シモン | `/#debug/game/simon` | 4色記憶 |
| s2 クイズ | `/#debug/game/quiz` | 漢字読めますか？ |
| s3 Final | `/#debug/story/show/0` | 最終ストーリー |
| Game list | `/#debug/game/list` | 全ゲーム一覧 |

## Story URLs

| URL | 内容 |
|-----|------|
| `/#debug/story/show/0` | シーン0表示（幕1-1） |
| `/#debug/story/show/7` | シーン7表示（幕4-2） |
| `/#debug/story/show/8` | エンディング |
| `/#debug/story/marathon` | 全ストーリー連続再生 |
| `/#debug/story/adventure` | アドベンチャーモード |
| `/#debug/story/list` | シーン一覧コンソール出力 |

## State URLs

| URL | 内容 |
|-----|------|
| `/#debug/state/get` | 全状態JSON表示 |
| `/#debug/state/reset` | 全リセット |
| `/#debug/state/introDone` | intro完了マーク |
| `/#debug/state/complete/s0` | s0完了 |
| `/#debug/state/complete/s1` | s1完了 |
| `/#debug/state/complete/s2` | s2完了 |
| `/#debug/state/complete/s3` | s3完了 |
| `/#debug/state/completeAll` | 全完了 |
| `/#debug/state/set` | 状態直接設定 |

## Spell URLs

| URL | 内容 |
|-----|------|
| `/#debug/spell/encode` | 現在状態→4文字ひらがな |
| `/#debug/spell/decode/あいうえ` | 呪文→状態復元 |
| `/#debug/spell/list` | 主要チェックポイント一覧 |

## Map URLs

| URL | 内容 |
|-----|------|
| `/#debug/map/open` | 地図表示 |
| `/#debug/map/close` | 地図閉じる |
| `/#debug/map/mock` | モックGPS起動 |
| `/#debug/map/pos` | 現在位置表示 |
| `/#debug/map/moveTo/s0` | s0まで移動（モック時） |

## Tool URLs

| URL | 内容 |
|-----|------|
| `/#debug/tool/toolbar/true` | ツールバー表示 |
| `/#debug/tool/toolbar/false` | ツールバー非表示 |
| `/#debug/tool/show/memo` | メモ表示 |
| `/#debug/tool/show/camera` | カメラ表示 |
| `/#debug/tool/show/mic` | マイク表示 |

## Debug URLs

| URL | 内容 |
|-----|------|
| `/#debug` | デバッグモードON（Hub表示） |
| `/#debug/debug/panel` | デバッグパネル表示 |
| `/#debug/util/confetti` | 紙吹雪エフェクト |

## E2E Testing

```bash
# Surge本番テスト（16 tests）
npx playwright test --config=playwright.surge.config.ts

# ローカル開発テスト（40 tests）
npm run test:e2e

# 全テスト
npm run test:all
```
