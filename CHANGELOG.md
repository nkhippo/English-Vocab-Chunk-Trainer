# Changelog

## [Unreleased] — 2026-07-11

### Added

- カテゴリパイロット 10 件マージ（word/idiom/binomial/compound/other ×2）→ **合計 21 件**
- `doc/handoff/v6-pilot10-merge-handoff-report.md`

### Changed

- ホーム文言を 21 件表記に更新

### Added (earlier same day)

- v6 UI: 詳細モーダル IA（空セクション非表示・skill_focus ラベル・Common Errors 横並び）
- `IpaTabs`（語ごと / 連結）+ EPT 参照データ `data/reference/ept/`
- `pnpm run sync:ipa-ept` / `sync:phrase-ipa-ept`
- InsightCard + モーダル導線 + Mode A/B 保留時フェードイン
- Insight サンプル 3 件（プレースホルダー）
- `doc/handoff/v6-improvements-report.md` / `v6-scope-questions.md`

### Changed (earlier same day)

- `data/current/items.json` schema **1.2.1**（合成 connected IPA・insight_id）
- Mode A/B: `word` カテゴリを出題対象から明示除外

## [Unreleased] — 2026-07-10

### Added

- チェックマーク機能（☑️×3・browse / mode_a / mode_b 独立・`vct_checkmarks_v1`）
- `src/lib/checkmarks/`（store・hooks・sort）
- `src/components/checkmark-row/` / `checkmark-reset/`
- `src/lib/quiz/weighted-selection.ts`（8/4/2/1 重み付き出題）
- `doc/handoff/checkmark-feature-handoff-report.md`

### Changed

- 単語帳: カード・詳細モーダルにチェックマーク、チェック数昇順ソート
- Mode A/B: 回答・解答後にチェック記録、出題を `pickWeightedItem` に変更
- 学習ハブ・単語帳: モード別チェックリセットボタン

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

### Added (MVP UI — 2026-07-10)

- 単語帳詳細モーダル（`ItemDetailModal`）+ Browse 一覧カード
- Mode A `/train/mode-a`（4 択・distractor トグル）
- Mode B `/train/mode-b`（想起・ヒント Lv1〜3）
- `doc/handoff/mvp-ui-handoff-report.md` / `doc/ops/ux-evaluation-checklist.md`

### Changed (2026-07-10)

- パイロット v4 **再実行完了**: 8/8・DoD OK・`data/current` 11 件マージ
- GAS 本番 URL → **v22** 手動デプロイ（`AKfycbzTyWCk...`）
- GAS Build モデル: `claude-opus-4-7` → **`claude-sonnet-4-6`**（トークンコスト最適化）
- `gas/claude.js`: `BUILD_MODEL` 定数、Sonnet は `temperature` 送信可
- パイプラインキャッシュキー: `generate-examples` `schema_version: 1.1.3` / `enrich-items` `1.1.1`

### Changed (pilot v4)

- `gas/scene-config.js`: register 別シーン候補の一元管理
- `gas/handlers.js`: generateExamples 禁止語表 + シーン多様化 / validateCefr 明示リスト照合
- `generate-examples.ts`: `validator_version: v4` / `schema_version: 1.1.2`
- `doc/ops/claude-api-gas-design.md`: §2.3.1 / §2.3.2 / §2.5.1
- GAS URL 暫定フォールバック @18（@19 404）

### Added (pilot v4)

- `doc/handoff/pilot-v4-handoff-report.md`

### Pending (Naoya)

- **UX 情報充足度評価**（`doc/ops/ux-evaluation-checklist.md`）→ 量産 GO/スキーマ改定判断
- **A2 本生成 GO**（評価後）
- iPhone Safari ホーム画面追加（任意）
- `/review` UI の情報設計・レイアウト改善（Phase 2 以降）

### Historical

- 初回パイロット（v1）: 6/8 examples・スキーマ非準拠 → **v2 で解消**（`pilot-test-handoff-report.md` 参照）
