# Architecture Decision: surge = main, local = debug

## 決定 (2026-07-03)

- **https://straydog.surge.sh/** = 本番(main)フロントエンド
- **現在のソース (localhost:5000)** = 開発・デバッグ用

## 差分概要

| 機能 | surge.sh (main) | local (debug) |
|---|---|---|
| Home画面 | ✅ `#home` → 「地図を開く」 | ❌ Intro→Puzzle→Hub直行 |
| Spot Hub | ✅ 簡易(インラインスタイル) | ✅ 拡張(クラスベースCSS) |
| ミニゲーム | ✅ テキストパズル共通 (`#puzzle-wrap`) | ✅ ぷよ/シモン/クイズ(スポット別) |
| ツールバー | ❌ なし | ✅ メモ/カメラ/マイク |
| デバッグパネル | ❌ なし | ✅ `#debug` hash + `__debug` API |
| ストーリーモード | ✅ | ✅ |
| 到着閾値 | 50m | 10m |
| 地図タイル | — | OSM標準(差分確認中) |

## 運用ルール

1. **surge.sh の HTML/CSS/JS が正本** — ここから逸脱する変更は main に影響を与えないこと
2. **local の追加機能(debug API, ツールバー, ミニゲーム)は** `#debug` hash または `import.meta.env.DEV` でのみ有効化
3. **本番同等性の確認**: `npm run build` → `surge dist/ straydog.surge.sh` で surge 版を更新する前に、local の変更が surge の HTML 構造と互換性があることを確認

## 参考

- surge.sh HTML: `docs/surge-reference.html` (fetch on 2026-07-03)
- surge.sh JS: `assets/index-COxFTlYX.js` (Leaflet + 全ロジック)
