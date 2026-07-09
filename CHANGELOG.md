# Changelog

## [Unreleased] — 2026-07-09（夕方更新）

### Added

- スキーマ **v1.1.0**（`informal` 統一・`item.register` 配列・`collocation_pattern` 拡張）
- `doc/handoff/pilot-retry-handoff-report.md`（パイロット v2・全 DoD OK）
- `doc/ops/ux-smoke-test-checklist.md`（5 分 UX スモークテスト）
- `doc/ops/i18n-strategy.md`（UI 3 層モデル・多言語方針）
- `src/lib/i18n/labels.ts`（カテゴリ・register・頻度の表示ヘルパー）
- `.env.development`（Vite dev 用 GAS URL・コミット可）
- `scripts/lib/load-env.ts` / `pnpm run env:sync`（`.env` 不要化）
- `scripts/build-gas-paste.ts`（旧 `scripts/gas/` から移動）
- GAS: CORS 許可オリジンゲート（`nkhippo.github.io` / `localhost:5173`）
- GAS: Build モデル `claude-opus-4-7`（`temperature` 非送信）
- `scripts/pipeline/batch-a2-seeds.ts` / `pnpm run batch:a2-seeds`
- `doc/handoff/pilot-test-handoff-report.md`（初回パイロット・履歴）

### Changed

- **GAS**: clasp 運用 + 手動デプロイ **v19**（`AKfycbzXBNFU...`、health + validate-cefr 確認済み）
- **`data/current/items.json`**: 11 件（サンプル 3 + パイロット 8・スキーマ v1.1.0）
- `gas/handlers.js`: enrich / generate-examples テンプレート化（v1.1 準拠）
- `scripts/pipeline/generate-examples.ts`: `casual`→`informal` 正規化・`schema_version` キャッシュ回避
- `/review` UI: フィールドラベルを i18n 化（スキーマキー直書き廃止）
- 環境変数: `.env` 任意化（`.env.example` フォールバック）
- `doc/spec/app-specification.md` → **v3.1**
- `doc/repository-structure.md` / handoff 一式を現状に同期

### Verified (Naoya)

- UX スモークテスト（5 分版）: **合格**（単語帳・検証・設定）
- clasp 分割ファイル（`main.gs` / `handlers.gs` 等）+ デプロイ v19

### Changed (pilot v3)

- `gas/handlers.js`: validateCefr プロンプト厳格化（false negative 優先）
- `generate-examples.ts`: `validator_version: v3` / `schema_version: 1.1.1`

### Pending (Naoya)

- **validate-cefr Opus 化 or generateExamples 制約強化**（v3 DoD 未達 — `pilot-v3-handoff-report.md`）
- **A2 本生成 GO**（`pnpm run batch:a2-seeds`、2,430 件）
- iPhone Safari ホーム画面追加（任意）
- `/review` UI の情報設計・レイアウト改善（Phase 2 以降）

### Historical

- 初回パイロット（v1）: 6/8 examples・スキーマ非準拠 → **v2 で解消**（`pilot-test-handoff-report.md` 参照）
