# Vocab & Chunk Trainer

CEFR に沿った語彙・チャンク訓練用 PWA。Basic 2400 完走後に IELTS 7.0（C1 下位）相当の語彙・チャンク運用力を段階的に構築する。

- リポジトリ: https://github.com/nkhippo/English-Vocab-Chunk-Trainer
- 仕様の正本: [`doc/spec/app-specification.md`](doc/spec/app-specification.md)
- Phase 1 指示書: [`doc/instructions/cursor-instruction-phase1.md`](doc/instructions/cursor-instruction-phase1.md)
- 構成表: [`doc/repository-structure.md`](doc/repository-structure.md)
- Phase 1 作業報告（差分・残課題）: [`doc/handoff/phase1-handoff-report.md`](doc/handoff/phase1-handoff-report.md)
- Step 1〜3 作業報告: [`doc/handoff/step1-3-handoff-report.md`](doc/handoff/step1-3-handoff-report.md)

## Phase 1 の範囲

- Vite + React + TypeScript + Tailwind PWA 骨格
- 日英 UI・ガイドモーダル・レイアウト
- `/browse` 骨格・`/review` 検証 UI
- `scripts/` データパイプライン（GAS 経由 Claude）
- `gas/` Claude API プロキシ

**未実装（Phase 2）**: Mode A/B/C 学習画面、SRS、単語帳検索・詳細、`/review-writing`

## セットアップ

```bash
pnpm install
cp .env.example .env
# GAS Web App URL を GAS_ENDPOINT_URL / VITE_GAS_ENDPOINT_URL に設定
pnpm dev
```

開発サーバ: http://localhost:5173/English-Vocab-Chunk-Trainer/

## 開発コマンド

| コマンド | 説明 |
|---|---|
| `pnpm dev` | 開発サーバ |
| `pnpm build` | 本番ビルド |
| `pnpm preview` | ビルド結果のプレビュー |
| `pnpm run generate:seed -- --cefr=A2 --category=collocation --batch=30` | seed 生成 |
| `pnpm run generate:enrichment -- --input=data/staging/A2_validated.json` | enrichment |
| `pnpm run generate:examples -- --input=data/staging/..._enriched.json` | 例文生成 |
| `pnpm run merge -- --new=data/staging/A2_final.json --into=data/current/items.json` | マージ |
| `pnpm run validate` | スキーマ検証 |

## GAS

手順と稼働 URL は [`gas/README.md`](gas/README.md)。Script Properties に `ANTHROPIC_API_KEY` を設定する（設定済み）。

現行 Web App:

```
https://script.google.com/macros/s/AKfycbz_94XYG6UzI4v5Na6VF-_yxnG5VWmit3KceNhHJiFZjGvbJKp6m-RnEYXdaV4hnlIH/exec
```

## GitHub Pages

`main` への push で Actions が `dist/` を Pages にデプロイする。  
Settings → Pages → Source: **GitHub Actions**（「Deploy from a branch」ではない）。

公開 URL: https://nkhippo.github.io/English-Vocab-Chunk-Trainer/

ブランチ直出しだと未ビルドの `index.html`（`/src/app/main.tsx` 参照）が配信され空白になる。Actions の Deploy GitHub Pages が緑になることを確認してからハードリロードする。

学習データの正本は `data/current/`。アプリはそのままバンドルする（`src/data/current` へのコピーは不要）。

想定 URL: `https://nkhippo.github.io/English-Vocab-Chunk-Trainer/`

## ライセンス

TBD
