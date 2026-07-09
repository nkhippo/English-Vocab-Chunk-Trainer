# Changelog

## [Unreleased] — Step 1〜3 (2026-07-09)

### Added

- GAS: CORS 許可オリジンゲート（`nkhippo.github.io` / `localhost:5173`）
- GAS: Build モデル `claude-opus-4-7`（`temperature` 非送信）
- `src/lib/gas-client`: リクエストに `?origin=` を付与
- `scripts/pipeline/batch-a2-seeds.ts` / `pnpm run batch:a2-seeds`（8 カテゴリ一括 seed）
- `generate:seed --append`（staging 結合用）
- `scripts/gas/build-gas-paste.ts`（`drive-paste/Code.gs` 自動生成）

### Changed

- GAS Web App URL を手動デプロイ本番に更新（`AKfycbymECuc_...`、CORS 確認済み）
- `generate:examples` から `temperature` パラメータ送信を削除

### Pending (Naoya)

- Step 3: `/review` で全カテゴリ検証 → enrich → examples → merge（目標 2,430 件）
