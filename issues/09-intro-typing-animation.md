# INTRO_LINES タイプライターアニメーション

## 概要
現在のIntroは `adventure.ts` のオーバーレイで全文一括表示されている。
`story/data.ts` の `INTRO_LINES` は行ごとの速度/色が定義されているが未使用。
これを活かしたタイプライター演出に切り替える。

## タスク
- [ ] `INTRO_LINES` を読み、1行ずつタイプライター表示する
- [ ] 行間の空白は指定ミリ秒だけ待機（speed 値）
- [ ] color 指定がある行は金色（#ffd700）で表示
- [ ] 背景の gdog.png はフェードイン（4秒）のまま維持
- [ ] 全文表示後、自動で4x4パズルへ遷移（現在のスキップボタンは維持）
- [ ] localStorage `sd_intro_done` で2回目以降スキップ（現状維持）

## 実装場所
- `src/main.ts` の `startIntro()` を修正
- または新規 `src/intro-typing.ts` に分離

## 備考
現在の `INTRO_LINES` の内容（data.ts:7-22）:
- 14行 + 4行の空行（ポーズ用）
- 金色指定: 夫妻の台詞（5-7行目）
- 速度: 35-200ms/文字
