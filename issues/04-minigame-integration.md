# ミニゲーム連携とクリア処理

## 概要
各スポットで起動するミニゲーム（ぷよぷよ/サイモン/四字熟語クイズ）と、クリア後の処理フローを実装する。

## タスク
- [ ] `puyo-game.ts` の完了 → スポットクリア処理
- [ ] `simon-game.ts` の完了 → スポットクリア処理
- [ ] `quiz4-game.ts` の完了 → スポットクリア処理
- [ ] ミニゲームクリア後、`hub.ts` の `completeCurrentSpot()` を呼ぶ
- [ ] 次のスポットへの案内を表示する
- [ ] クリア状況をストアに保存する

## 関連ファイル
- `src/game/puyo/logic.ts`（テスト済み）
- `src/game/simon/logic.ts`（テスト済み）
- `src/game/quiz4-game.ts` - 要リファクタリング（DOM密結合）
- `src/game/hub.ts` - 進捗管理

## 備考
各ミニゲームのロジックは pure function としてテスト済み。UIとの結合部分の実装が必要。
