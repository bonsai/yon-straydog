# PWA対応とシェア機能

## 概要
アプリをホーム画面に追加可能にし、クリア後にシェアできるようにする。

## タスク

### PWA
- [ ] `public/manifest.json` を作成（name: Stray Dog, アイコン, theme_color: #0a0a0f）
- [ ] `public/sw.js` でHTML/CSS/JSをプリキャッシュ
- [ ] index.html に `<link rel="manifest">` と iOS用 meta tags を追加
- [ ] iOS splash screen 設定

### シェア
- [ ] コンプリート画面に「シェアする」ボタンを追加
- [ ] Web Share API でテキスト + URL をシェア
- [ ] フォールバック: クリップボードコピー
- [ ] ハッシュタグ: #StrayDogYON #神保町

## 関連ファイル
- `public/index.html` - manifest link追加
- `src/main.ts` - シェアボタン実装
- PRD: F6.1, F6.2, N4
