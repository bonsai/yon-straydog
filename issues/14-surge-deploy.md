# Surge デプロイ設定

## 概要
GitHub Actions CI で自動デプロイするための SURGE_TOKEN を設定する。

## 現状
- `npm run build` → `dist/` 生成 OK
- `npm run deploy` は `npx surge dist/ straydog.surge.sh` を実行
- GitHub Actions workflow (`.github/workflows/ci.yml`) に deploy step あり

## 必要な作業
- [ ] Surge アカウントでトークン発行 (`npx surge token`)
- [ ] GitHub リポジトリ Secrets に `SURGE_TOKEN` を設定
- [ ] CI で deploy step が実行されることを確認

## 優先度
低。手動デプロイで代替可能（ローカルから `npm run deploy`）
