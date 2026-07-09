# Changelog

## [Unreleased] — 2026-07-09

### Added

- GAS: CORS 許可オリジンゲート（`nkhippo.github.io` / `localhost:5173`）
- GAS: Build モデル `claude-opus-4-7`（`temperature` 非送信）
- `src/lib/gas-client`: リクエストに `?origin=` を付与
- `doc/` 役割別サブフォルダ（`spec/` `ops/` `instructions/` `handoff/`）
- `scripts/pipeline/` + `scripts/gas/` パイプライン配置
- `scripts/pipeline/batch-a2-seeds.ts` / `pnpm run batch:a2-seeds`
- `generate:seed --append`（staging 結合用）
- `scripts/gas/build-gas-paste.ts`（`drive-paste/Code.gs` 自動生成）
- `doc/handoff/pilot-test-handoff-report.md`（A2 collocation 8 件パイロット）

### Changed

- GAS Web App URL を clasp 手動デプロイ v19 に更新（`AKfycbzXBNFU...`、health + validate-cefr 確認済み）
- 環境変数: `.env` 不要化（`.env.example` / `.env.development` フォールバック、`pnpm run env:sync`）
- `gas/handlers.js`: enrich / generate-examples プロンプトを設計書 §2.2 / §2.3 準拠に強化
- `generate:examples` から `temperature` パラメータ送信を削除
- `doc/repository-structure.md`: AI 入口・現状サマリ・handoff 一覧を拡充

### Pending (Naoya)

- パイロット再テスト（8 件 collocation）→ DoD OK
- Step 3: `/review` で全カテゴリ検証 → enrich → examples → merge（目標 2,430 件）
- register 表記（`informal` vs `casual`）の仕様・スキーマ統一
