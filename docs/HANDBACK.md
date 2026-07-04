# Stray Dog — 次回引継ぎ書

## プロジェクト

```
C:\Users\dance\Documents\MEGA\yon-straydog
```

## 現在の状態

| 領域 | 進捗 |
|------|------|
| ゲームフロー (Intro→Hub→Map→MiniGames→Ending) | ✅ 完了 |
| サウンド (Web Audio API) | ✅ 完了 |
| Intro タイプライターアニメーション | ✅ 完了 |
| PWA (manifest / SW / iOS meta) | ✅ 完了 |
| シェア機能 (Web Share API) | ✅ 完了 |
| GitHub CI (test + build) | ✅ 完了 |
| ユニットテスト (62→77 tests) | ✅ 完了 |
| Surgeデプロイ | ⏳ トークン未設定 |

## アーキテクチャ

```
src/
├── main.ts          # エントリ: 画面遷移, 全フロー制御
├── store.ts         # 状態管理 (localStorage永続化)
├── hub.ts           # スポットHub表示, ツールバー, 進捗管理
├── map.ts           # Leaflet地図, GPS追跡, 到着検知
├── sound.ts         # Web Audio API 効果音
├── story/
│   ├── spots.ts     # 4スポット定義 (座標/バッジ/ミニゲーム種別)
│   ├── data.ts      # ストーリー台本データ (INTRO_LINES + STORY_SCENES)
│   ├── adventure.ts # アドベンチャーオーバーレイ (Step実行)
│   └── story-mode.ts # ストーリーモード (過去ログ閲覧)
└── game/
    ├── game-state.ts # フェーズ管理 + Stepビルダー
    ├── registry.ts   # ミニゲームstarter登録
    ├── puzzle/       # 4x4スライドパズル
    ├── puyo/         # ぷよぷよ (logic + view)
    ├── simon/        # サイモンゲーム (logic + view)
    └── quiz/         # 四字熟語クイズ
```

## 全フロー

```
起動 → Intro(タイプライター) → 4x4パズル → Hub
  → スポット選択 → Map+GPS → 到着(50m) → ミニゲーム
  → クリア → ストーリー → バッジ → Hub
  → 3バッジ → s3解放 → エンディング(紙吹雪)
```

## コマンド

| コマンド | 用途 |
|---------|------|
| `npm run dev` | 開発サーバー (localhost:5000) |
| `npm test` | 全テスト実行 |
| `npm run build` | プロダクションビルド |
| `npm run deploy` | Surgeデプロイ (straydog.surge.sh) |

## 実装待ち (issues/)

| # | 内容 | ファイル |
|---|------|---------|
| 11 | 実機テスト項目リスト | `issues/11-real-device-testing.md` |

## Surgeデプロイ

GitHub Actions の `SURGE_TOKEN` シークレットを設定すれば自動デプロイ可。
または手動: `npx surge dist/ straydog.surge.sh --token <token>`

## 補足

- `index.html` と `public/index.html` は同一内容（Viteルート + 静的アセット用）
- デバッグモード: URLに `#debug` を付けてアクセス
- モックGPS: 8秒で自動フォールバック（実機未テスト）
- ミニゲームは `test/*.html` で単体テスト可能
