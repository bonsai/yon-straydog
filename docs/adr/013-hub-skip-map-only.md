# ADR-013: Hub スキップ — Map のみで進行

> 決定 | Date: 2026-07-04

---

## 状況

現在のフローは `intro → s0-game → s0-result → hub → spot選択 → story → game → result → hub` のループだが、Hub 画面は単なるスポットカード一覧であり、地図で十分代用できる。

Hub の中間画面を挟まず、Map をデフォルトのスポット選択 UI とする。

---

## 決定

- **Hub の中間画面を廃止**。spot カード一覧は map に統合。
- 進行フロー: `intro → s0-game → s0-result → map → (spot tap → story → game → result → map)`

### 理由

| 現状 | 問題 |
|---|---|
| Hub でカードを選ぶ | Map 上のマーカーで同じ情報を得られる |
| Hub → Map 遷移の往復 | 不要な画面切り替え |
| ツールバーとHubヘッダーの二重管理 | 整理済み（ツールバーに統一済み） |

### Map が担う役割

- 各スポットのマーカー表示（ロック/開放/完了 状態）
- スポットタップで `goToScene(spotSceneId(id, 'story'))`
- バッジ進捗はツールバーの👜カバン内で確認
- 地図上で現在地・スポット位置を可視化

---

## 影響

- `goToHub()` の呼び出しを `goToScene(mapSceneId)` に置換
- `#hub` URL ハッシュは map にリダイレクト
- Hub カード関連のDOM/CSS/テストを整理
- ツールバーに map ボタンが既に存在（`🗺️`）

---

## 却下した代替案

- **Hub と Map の併存**: 画面遷移が増え、メンテナンスコストが上がる
- **Hub に Map を埋め込む**: レイアウトが複雑化。Map 単体で十分
