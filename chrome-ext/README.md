# Chrome拡張: Stray Dog DevTools

## 概要
`chrome-ext/` にChrome拡張を配置。ブラウザツールバーからStray Dogの全デバッグAPIをGUI操作できる。

## インストール
```bash
1. chrome://extensions を開く
2. 「デベロッパーモード」ON
3. 「パッケージ化されていない拡張機能を読み込む」
4. `chrome-ext/` ディレクトリを選択
```

## 機能
| タブ | 操作 |
|------|------|
| 📺 画面 | Hub/Home/Intro/地図/結果/完了 |
| 🎮 ゲーム | ぷよ/シモン/クイズ/クリア |
| 🗺️ 地図 | モックGPS/開く/閉じる/現在地 |
| 📖 ストーリー | マラソン/個別シーン表示 |
| 🔮 復活の呪文 | 生成/入力/復元/一覧 |
| 💾 データベース | Seed/セーブ読込/エクスポート |
| ⚙️ 状態 | 表示/全バッジ/リセット/紙吹雪/シェア |

## アーキテクチャ
```
popup.html / popup.js → chrome.scripting.executeScript()
  → content.js → window.postMessage()
    → page (window.__debug)
```

## 注意
- `#debug` ハッシュが必要 (拡張が自動付与しない場合)
- localhost + straydog.surge.sh でのみ動作
- Manifest V3
