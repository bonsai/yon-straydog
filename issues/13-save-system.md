# SAVE/LOAD 機能

## 概要
現在のセーブは `localStorage` に `sd_intro_done`, `sd_4x4_done`, `sd_completed` の3キーのみ。
スポット到着状態、ストーリー進行度、ツール状態などが永続化されていない。

## 保存すべき状態

| 項目 | 現在 | 理想 |
|------|------|------|
| introDone | ✅ localStorage | ✅ |
| 4x4 puzzle完了 | ✅ localStorage | ✅ |
| スポット完了 | ✅ `sd_completed` | ✅ |
| ストーリー進行度 | ✅ `sd_story_progress` | ✅ |
| 到着済みスポット | ❌ (メモリのみ) | ❌ → localStorage保存 |
| ツール(メモ)内容 | ❌ | ❌ → localStorage保存 |
| 最終GPS位置 | ❌ | ❌ → localStorage保存 |

## 要件

### 13.1 統一セーブAPI
- `saveGame()` / `loadGame()` 関数を `src/store.ts` または新規 `src/save.ts` に実装
- 全状態を1つのJSONオブジェクトにまとめて `localStorage.setItem('sd_save', ...)` で保存
- 読み込み時にまとめて復元

### 13.2 自動セーブ
- ミニゲームクリア時 → 自動セーブ
- スポット到着時 → 自動セーブ
- ストーリー進行時 → 自動セーブ

### 13.3 手動セーブ/ロードUI
- デバッグメニューに「保存」「読み込み」ボタン
- `__debug.save.save()` / `__debug.save.load()` / `__debug.save.list()`
- URLハッシュ: `#debug/save/save` / `#debug/save/load`

### 13.4 複数スロット (任意)
- スロット0〜2 の3世代保存
- 各スロットに保存日時を記録
- `__debug.save.list()` でスロット一覧表示

### 13.5 エクスポート/インポート
- JSON文字列として出力 (`__debug.save.export()`)
- JSON文字列から復元 (`__debug.save.import(json)`)
- スロット一覧と中身を表示

## 実装方針
- `src/save.ts` を新規作成
- `SaveData` インターフェースを定義
- `__debug.save` に全機能を追加
- E2Eテストで save/load/export/import を検証

## 優先度
中。localStorage のままでも進行に支障なし。デバッグ体験向上と破損防止が目的。
