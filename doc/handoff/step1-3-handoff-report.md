# Step 1〜3 作業ハンドオフレポート

対象: `nkhippo/English-Vocab-Chunk-Trainer`  
最終更新: 2026-07-09（GAS 本番 URL 更新・パイロットテスト実施）  
指示書: `cursor_instruction_step1-3.md`（Downloads）  
前提: `doc/handoff/phase1-handoff-report.md`（Phase 1 骨格完了後）  
関連: `doc/handoff/pilot-test-handoff-report.md`（本生成前の 8 件パイロット）

---

## サマリ

| Step | リポジトリ実装 | 本番 GAS 反映 | 備考 |
|---|---|---|---|
| 1 CORS 限定 | **完了** | **完了** | 許可外 origin → `403 origin_forbidden` 確認済み |
| 2 Opus 4.7 | **完了** | **完了** | 現行 URL で seed 疎通確認済み |
| 3 A2 本生成 | **準備完了** | **パイロット待ち** | seed CLI・batch 追加。先に 8 件パイロット再テスト |
| パイロット（8 件） | **初回実施済み** | **再テスト待ち** | 詳細は `pilot-test-handoff-report.md` |

**次のアクション（Naoya）**

1. ~~GAS 新バージョンデプロイ~~ → **完了**（下記 URL）
2. ~~CORS / Opus 4.7 疎通確認~~ → **完了**
3. **パイロット再テスト**（A2 collocation 8 件）→ DoD OK を確認
4. `pnpm run batch:a2-seeds` → `/review` で全件検証 → enrich / examples / merge

---

## Step 1: CORS 許可オリジン

### 実装

- `gas/main.js`: `originForbiddenResponse_()` で `?origin=` を検証
- 許可: `https://nkhippo.github.io` / `http://localhost:5173`
- 未指定（CLI/curl）: 許可
- `src/lib/gas-client/index.ts`: `window.location.origin` をクエリに付与

### テスト（コード反映後に実施）

```bash
U="https://script.google.com/macros/s/AKfycbymECuc_1QayB_u3Zhf07Ls5HYzkASEXdYz4kDYi7vzvutwP5ZLvGWIwyQuRLye3954/exec"
curl -sL "$U"                                    # OK
curl -sL "${U}?origin=https://nkhippo.github.io" # OK
curl -sL "${U}?origin=https://evil.example.com"  # 403 origin_forbidden
```

### 本番状態（2026-07-09 午後）

- Naoya が GAS エディタから **新 Web App デプロイ**（下記 URL）
- GET health / 許可 origin / 許可外 origin（403）を **curl で確認済み**

---

## Step 2: Build モデル Opus 4.7

### パラメータ差分と対応

| 項目 | Opus 4.6 | Opus 4.7 対応 |
|---|---|---|
| `temperature` / `top_p` / `top_k` | 使用可 | **送信しない**（400 回避） |
| `thinking.budget_tokens` | — | 未使用のため影響なし |
| モデル ID | `claude-opus-4-6` | `claude-opus-4-7` |

変更ファイル: `gas/claude.js`, `gas/handlers.js`, `scripts/pipeline/generate-examples.ts`

### テスト結果（2026-07-09 新デプロイ後）

```bash
pnpm run generate:seed -- --cefr=A2 --category=word --batch=3
# → 3 件生成成功（Opus 4.7・新 URL）
```

---

## Step 3: A2 本生成

### 実装済みツール

| コマンド | 用途 |
|---|---|
| `pnpm run generate:seed -- --cefr=A2 --category=<cat> --batch=N` | カテゴリ seed |
| `pnpm run generate:seed -- ... --append` | 同一 staging へ追記 |
| `pnpm run batch:a2-seeds` | 8 カテゴリ・目標件数を自動分割実行 |
| `/review` | 人力検証（Y/N/1–6/E） |
| `pnpm run generate:enrichment` / `generate:examples` / `merge` | 以降パイプライン |

### 目標件数（指示書どおり）

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
| **合計** | **2,430** |

### 現状

- `data/current/items.json`: **3 件**（サンプルのまま）
- `data/staging/`: パイロット生成物あり（gitignore。collocation 8 件 seed / enrich / examples 6 件）
- **未完了**: パイロット再テスト → 本生成 `batch:a2-seeds` → 全カテゴリ `/review`（想定 12〜15 時間）

### 推奨手順（Naoya）

1. **パイロット再テスト**（`cursor_instruction_pilot_test.md` 参照。8 件 collocation）
2. `pnpm run batch:a2-seeds`（長時間・API 課金あり）
3. カテゴリ順に `/review` → validated JSON エクスポート
4. enrich → examples → merge（指示書ループ）
5. `pnpm run validate` → `data/releases/v1.0.0/` スナップショット

---

## GAS URL（現行）

```
https://script.google.com/macros/s/AKfycbymECuc_1QayB_u3Zhf07Ls5HYzkASEXdYz4kDYi7vzvutwP5ZLvGWIwyQuRLye3954/exec
```

（2026-07-09 Naoya 手動デプロイ。旧 `AKfycbz_94XY...` / `AKfycbx...` / `AKfycbz_gk2...` は使用しない）

更新済み: `.env.example`, `.env.production`, `CLAUDE.md`, `gas/README.md`, 関連 `doc/*`

---

## Git / Pages

- `main` へ push 後、GitHub Actions が Pages に `dist/` をデプロイ
- 公開: https://nkhippo.github.io/English-Vocab-Chunk-Trainer/

---

## Phase 2 / 残 P1 への申し送り

- **パイロット再テスト OK** → Step 3 本生成（≥2,000 件 merge）→ Phase 2 着手
- Pages からの `callGas` を実機確認（CORS + 現行 URL は本番反映済み）
- `needs_manual_review.json` はパイロット・本生成後に Naoya が一括判断

---

## クイックコマンド

```bash
clasp push
# → GAS エディタで「新バージョン」デプロイ

curl -sL "$GAS_ENDPOINT_URL"
pnpm run generate:seed -- --cefr=A2 --category=word --batch=10
pnpm run batch:a2-seeds   # 全カテゴリ（長時間）
pnpm run validate
pnpm build
```
