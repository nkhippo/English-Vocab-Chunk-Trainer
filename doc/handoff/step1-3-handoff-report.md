---
id: pj-2026-07-09-5f9e
aliases:
- pj-2026-07-09-5f9e
title: Step 1〜3 作業ハンドオフレポート
created: '2026-07-09'
---
# Step 1〜3 作業ハンドオフレポート

対象: `nkhippo/English-Vocab-Chunk-Trainer`  
最終更新: 2026-07-09（パイロット v2 完了・GAS v19・UX テスト合格）  
指示書: `cursor_instruction_step1-3.md`（Downloads）  
前提: `doc/handoff/phase1-handoff-report.md`（Phase 1 骨格完了後）  
関連:

- `doc/handoff/pilot-test-handoff-report.md`（初回パイロット・履歴）
- `doc/handoff/pilot-retry-handoff-report.md`（パイロット v2・DoD OK・マージ済）
- `doc/ops/ux-smoke-test-checklist.md`（UX スモークテスト）
- `doc/ops/i18n-strategy.md`（多言語方針）

---

## サマリ

| Step | リポジトリ実装 | 本番 GAS 反映 | 備考 |
|---|---|---|---|
| 1 CORS 限定 | **完了** | **完了** | 許可外 origin → `403 origin_forbidden` |
| 2 Opus 4.7 | **完了** | **完了** | Build 系 `claude-opus-4-7` |
| 3 A2 本生成 | **準備完了** | **稼働中** | CLI・batch 実装済み。**Naoya GO 待ち** |
| パイロット v1（8 件） | 履歴 | — | NG（`pilot-test-handoff-report.md`） |
| パイロット v2（8 件） | **完了** | **完了** | 8/8・隔離 0・`data/current` マージ済 |

**次のアクション（Naoya）**

1. ~~GAS clasp + 手動デプロイ v19~~ → **完了**
2. ~~パイロット v2（スキーマ v1.1）~~ → **完了**（11 件マージ）
3. ~~UX スモークテスト~~ → **合格**
4. **本生成 GO の判断** → `pnpm run batch:a2-seeds` → `/review` → enrich / examples / merge

---

## Step 1: CORS 許可オリジン

### 実装

- `gas/main.js`: `originForbiddenResponse_()` で `?origin=` を検証
- 許可: `https://nkhippo.github.io` / `http://localhost:5173`
- `src/lib/gas-client/index.ts`: `window.location.origin` をクエリに付与

### テスト

```bash
U="https://script.google.com/macros/s/AKfycbzXBNFUfmG6dTbHhw4xNI-n_gB0QYNL-dYpddSHEK9Pe4a-4hp-CmhjL4c8iTPcPqsU/exec"
curl -sL "$U"                                    # OK
curl -sL "${U}?origin=https://nkhippo.github.io" # OK
curl -sL "${U}?origin=https://evil.example.com"  # 403 origin_forbidden
```

---

## Step 2: Build モデル Opus 4.7

| 項目 | 対応 |
|---|---|
| モデル ID | `claude-opus-4-7` |
| `temperature` | Opus 4.7 では **送信しない**（`gas/claude.js`） |
| validate-cefr | `claude-haiku-4-5-20251001` |

変更ファイル: `gas/claude.js`, `gas/handlers.js`, `scripts/pipeline/generate-examples.ts`

---

## Step 3: A2 本生成

### 実装済みツール

| コマンド | 用途 |
|---|---|
| `pnpm run generate:seed -- --cefr=A2 --category=<cat> --batch=N` | カテゴリ seed |
| `pnpm run batch:a2-seeds` | 8 カテゴリ・目標 2,430 件を自動分割 |
| `/review` | 人力検証（Y/N/1–6/E） |
| `pnpm run generate:enrichment` / `generate:examples` / `merge` | 以降パイプライン |

### 目標件数（合計 2,430）

| カテゴリ | 目標 |
|---|---:|
| word | 1,500 |
| collocation | 500 |
| phrasal_verb | 80 |
| idiom | 30 |
| compound | 200 |
| binomial | 30 |
| institutionalized | 50 |
| other | 40 |

### 現状（2026-07-09 夜）

| 項目 | 状態 |
|---|---|
| `data/current/items.json` | **11 件**（サンプル 3 + パイロット collocation 8） |
| スキーマ | **v1.1.0**（`informal`・register 配列） |
| 本生成 | **未着手**（パイロット v2 OK・GO 待ち） |
| 環境変数 | `.env` 不要（`doc/ops` 参照） |

### 推奨手順（本生成 GO 後）

1. `pnpm run batch:a2-seeds`（長時間・API 課金あり）
2. カテゴリ順に `/review` → validated JSON エクスポート
3. enrich → examples → merge（パイロット v2 と同フロー）
4. `pnpm run validate` → `data/releases/v1.0.0/` スナップショット

---

## GAS 運用（clasp + 手動デプロイ）

| 項目 | 内容 |
|---|---|
| ソース正本 | ルート `gas/*.js`（`scripts/build-gas-paste.ts` は結合ビルドのみ） |
| 同期 | `clasp push` |
| 本番反映 | エディタ **デプロイ → 新バージョン**（v19 稼働中） |
| URL | 下記（`clasp deploy -i` は非推奨） |

```
https://script.google.com/macros/s/AKfycbzXBNFUfmG6dTbHhw4xNI-n_gB0QYNL-dYpddSHEK9Pe4a-4hp-CmhjL4c8iTPcPqsU/exec
```

---

## UX / i18n（2026-07-09 フィードバック）

- **UX スモークテスト**: 合格（`doc/ops/ux-smoke-test-checklist.md`）
- **検証 UI レイアウト**: Phase 2 以降に改善（今は触らない）
- **言語切替**: 方針を `doc/ops/i18n-strategy.md` に固定。`/review` フィールドラベルは i18n 化済み

---

## Git / Pages

- 公開: https://nkhippo.github.io/English-Vocab-Chunk-Trainer/
- Actions デプロイ: **成功**（11 件データ・GAS v19 URL 反映済み）

---

## クイックコマンド

```bash
clasp push
# → GAS エディタで「新バージョン」デプロイ

pnpm run env:sync          # 任意: ローカル .env の GAS URL 同期
pnpm run generate:seed -- --cefr=A2 --category=word --batch=10
pnpm run batch:a2-seeds    # 全カテゴリ（GO 後・長時間）
pnpm run validate
pnpm build
```
