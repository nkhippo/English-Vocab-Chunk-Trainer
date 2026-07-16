---
id: pj-2026-07-08-3614
aliases:
- pj-2026-07-08-3614
title: CLAUDE.md — Vocab & Chunk Trainer
created: '2026-07-08'
---
# CLAUDE.md — Vocab & Chunk Trainer

## 概要

英単語・チャンクの CEFR 段階学習 PWA。仕様の唯一のソースは:

- `doc/spec/app-specification.md`

関連:

- `doc/spec/learning-data-schema.json` — LearningItem / Insight スキーマ
- `doc/ops/data-operations-guide.md` — データ運用
- `doc/ops/claude-api-gas-design.md` — GAS + Claude
- `doc/instructions/cursor-instruction-phase1.md` — Phase 1 作業指示
- `doc/repository-structure.md` — フォルダ構成の正本
- `doc/handoff/phase1-handoff-report.md` — Cursor 作業結果・指示書差分・残課題（共有用）
- `doc/handoff/pilot-test-handoff-report.md` — A2 collocation 8 件パイロット結果

**指示書と仕様書が矛盾する場合は仕様書を優先し、実装を止めて報告する。**

稼働中 GAS Web App（**v22**・手動デプロイ 2026-07-10）:

```
https://script.google.com/macros/s/AKfycbzTyWCkXyjXic6JcpLJPf-ltV8mlJrGQ8Ip1bkg8A_Sx5cX_crY3zWGcwPCQW-bur7I/exec
```

## スタック

- Vite + React 19 + TypeScript
- Tailwind CSS v4
- React Router / Zustand / Dexie / react-i18next
- PWA: vite-plugin-pwa
- パッケージマネージャ: pnpm
- AI: Claude API（必ず GAS 経由。フロントに API キーを置かない）

## パス方針

指示書の `docs/` は本リポジトリでは既存の `doc/` を使用する。  
`doc/` は役割別サブフォルダ（`spec/` `ops/` `instructions/` `handoff/`）に整理。入口は `doc/repository-structure.md`。  
スキーマファイル名は `learning-data-schema.json`（旧 `data-schema.json`）。  
GitHub Pages base: `/English-Vocab-Chunk-Trainer/`（実リポジトリ名に合わせた。指示書の `/vocab-chunk-trainer/` とは異なる）。

## コマンド

```bash
pnpm install
pnpm dev
pnpm build
pnpm run generate:seed -- --cefr=A2 --category=collocation
pnpm run generate:enrichment -- --input=data/staging/A2_validated.json
pnpm run generate:examples -- --input=data/staging/A2_validated_enriched.json
pnpm run merge -- --new=data/staging/A2_final.json --into=data/current/items.json
pnpm run validate
pnpm run verify:contexts -- data/staging/A2_collocation_batchN.json
```

## データ運用時の注意

- `data/staging/` は `.gitignore`（生成物）
- `data/current/` は Git 管理の**学習データ正本**（PWA は `@data/current` を直接バンドル。`src/data/current` は置かない）
- SemVer・チェックリストは `doc/ops/data-operations-guide.md` に従う
- Claude 呼び出しはすべて `GAS_ENDPOINT_URL` 経由

## Cursor 作業時の三大品質基準

1. **上流ドキュメント品質**: 仕様書 v3.3（`doc/spec/app-specification.md`）を唯一のソースとする
2. **Cursor 指示書品質**: 変更時は理由を PR / コミットメッセージに記述する
3. **運用ドキュメント更新**: データ増加・スキーマ変更時は `doc/ops/data-operations-guide.md` と `doc/repository-structure.md` を更新する

## Phase 境界

- Phase 1: 骨格・i18n・ガイド・パイプライン・検証 UI・GAS（本ブランチ）
- Phase 2: Mode A/B/C、SRS、browse 検索・詳細、`/review-writing`
- Phase 3+: B1 以降データ拡張
