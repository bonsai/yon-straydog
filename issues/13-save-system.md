# SAVE/LOAD 機能

> **Status: ✅ Done (2026-07-03)** — `src/save.ts` 実装 + auto-save + `__debug.save` API

## 実装

### 13.1 統一セーブAPI ✅
- `src/save.ts` 新規作成
- `SaveData` インターフェース
- `saveGame(slot, name)` / `loadGame(slot)` / `listSaves()` / `deleteSave(slot)`
- `restoreSave(data)` — localStorage に状態復元
- `exportSave(slot?)` / `importSave(json)` — JSON エクスポート/インポート

### 13.2 自動セーブ ✅
- `autoSave(slot?)` — デフォルト slot 0, name="auto"
- トリガー: 4×4パズル完了 / バッジ獲得時 / ゲーム完了時 (`src/main.ts`)

### 13.3 手動セーブ/ロードUI ✅
- `__debug.save.save(slot?,name?)` / `.load(slot?)` / `.list()` / `.delete(slot)`
- `__debug.save.export(slot?)` / `.import(json)`
- Hash routing: `#debug/save/save/0` / `#debug/save/load/0`

### 13.4 複数スロット ✅
- 0-2 の3スロット (`MAX_SLOTS = 3`)
- 各スロットに `SaveData` (timestamp + full state)

### 13.5 エクスポート/インポート ✅
- 単一スロット or 全スロットを JSON でエクスポート
- import でバルク復元
- クリップボードコピー付き

### 保存する状態
| 項目 | localStorage key | SaveData field |
|------|-----------------|----------------|
| introDone | sd_intro_done | introDone |
| 4x4 puzzle完了 | sd_4x4_done | puzzleDone |
| スポット完了 | sd_completed | s0, s1, s2, s3 |
| ストーリー進行度 | sd_story_progress | storyProgress |
| メモ内容 | sd_memo | memo |

## テスト
- `src/__tests__/save.test.ts` — 16 tests
