# ISS-015: Map spot click → story が発火しない

> 発生 | 2026-07-04 | Surge デプロイ後

---

## 現象

マップ上のスポットマーカーをタップしても何も起こらない。

## 期待動作

タップ → `onSpotClick` コールバック → `goToScene(spotSceneId(spot.id, 'story'))` → ストーリー開始

## 実装状況

| 箇所 | 状態 |
|---|---|
| `map.ts:13` `onSpotClick` 変数 | 宣言済み |
| `map.ts:14-16` `setOnSpotClick` | export済み |
| `map.ts:88` `marker.on('click', () => onSpotClick?.(s))` | 追加済み |
| `main.ts` map scene enter | `setOnSpotClick` → `startMap` 順でセット済み |

## 調査候補

1. `bindPopup` が click イベントを奪っている可能性（Leaflet の仕様）
2. `startMap` 2回目以降 `map.invalidateSize()` で早期 return → マーカー再生成されない
3. `goToScene` 内部で scene 解決に失敗している
4. モバイルでは `click` イベントが Leaflet の `tap` に変換される必要があるか
