# Step 1〜3 作業ハンドオフレポート

対象: `nkhippo/English-Vocab-Chunk-Trainer`  
作成日: 2026-07-09  
指示書: `cursor_instruction_step1-3.md`（Downloads）  
前提: `doc/phase1-handoff-report.md`（Phase 1 骨格完了後）

---

## サマリ

| Step | リポジトリ実装 | 本番 GAS 反映 | 備考 |
|---|---|---|---|
| 1 CORS 限定 | **完了** | **要デプロイ** | コードは `gas/main.js`。稼働中は v2（CORS 未適用） |
| 2 Opus 4.7 | **完了** | **要デプロイ** | `temperature` 削除済み。稼働中は v2（Opus 4.6） |
| 3 A2 本生成 | **準備完了** | Naoya 作業待ち | seed CLI・batch 追加。検証 UI は人力 |

**次のアクション（Naoya）**

1. `clasp push` 済みコードを GAS エディタで確認 → **デプロイ → 新バージョン**
2. `curl` / `pnpm run generate:seed` で Opus 4.7・CORS を確認
3. `pnpm run batch:a2-seeds` → `/review` で全件検証 → enrich / examples / merge

---

## Step 1: CORS 許可オリジン

### 実装

- `gas/main.js`: `originForbiddenResponse_()` で `?origin=` を検証
- 許可: `https://nkhippo.github.io` / `http://localhost:5173`
- 未指定（CLI/curl）: 許可
- `src/lib/gas-client/index.ts`: `window.location.origin` をクエリに付与

### テスト（コード反映後に実施）

```bash
U="https://script.google.com/macros/s/AKfycbxKVKogM8dKeHNuNOvjp7M8i9nsEEmtg943VYc5t_yzTtNG7geSN3fOQ3AZ8HBhVXPW/exec"
curl -sL "$U"                                    # OK
curl -sL "${U}?origin=https://nkhippo.github.io" # OK
curl -sL "${U}?origin=https://evil.example.com"  # 403 origin_forbidden
```

### 本番状態（2026-07-09 時点）

- Web App デプロイは **バージョン 2** に固定（`clasp deploy -i AKfycbx... -V 2`）
- v2 は CORS 未適用の旧コード。`clasp push` で HEAD は更新済みだが、新バージョンの公開はエディタ操作が確実

---

## Step 2: Build モデル Opus 4.7

### パラメータ差分と対応

| 項目 | Opus 4.6 | Opus 4.7 対応 |
|---|---|---|
| `temperature` / `top_p` / `top_k` | 使用可 | **送信しない**（400 回避） |
| `thinking.budget_tokens` | — | 未使用のため影響なし |
| モデル ID | `claude-opus-4-6` | `claude-opus-4-7` |

変更ファイル: `gas/claude.js`, `gas/handlers.js`, `scripts/generate-examples.ts`

### テスト（新バージョンデプロイ後）

```bash
pnpm run generate:seed -- --cefr=A2 --category=word --batch=10
```

2026-07-09: 稼働 v2（Opus 4.6）で `word` 5 件 seed 成功（パイプライン疎通）。Opus 4.7 は新デプロイ後に再実行。

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
- `data/staging/A2_word_seeds.json`: **5 件**（疎通テスト生成・gitignore）
- **未完了**: Naoya による全カテゴリ `/review` 検証（想定 12〜15 時間）

### 推奨手順（Naoya）

1. GAS 新バージョンデプロイ後 `pnpm run batch:a2-seeds`（長時間・API 課金あり）
2. カテゴリ順に `/review` → validated JSON エクスポート
3. enrich → examples → merge（指示書ループ）
4. `pnpm run validate` → `data/releases/v1.0.0/` スナップショット

---

## GAS URL 更新

旧 URL（`AKfycbz...`）はデプロイ不整合で 404。**稼働 URL に統一**:

```
https://script.google.com/macros/s/AKfycbxKVKogM8dKeHNuNOvjp7M8i9nsEEmtg943VYc5t_yzTtNG7geSN3fOQ3AZ8HBhVXPW/exec
```

更新済み: `.env.example`, `.env.production`, `CLAUDE.md`, `gas/README.md`, 関連 `doc/*`

---

## Git / Pages

- `main` へ push 後、GitHub Actions が Pages に `dist/` をデプロイ
- 公開: https://nkhippo.github.io/English-Vocab-Chunk-Trainer/

---

## Phase 2 / 残 P1 への申し送り

- Step 3 完了（≥2,000 件 merge）後に Phase 2 着手
- GAS CORS は本番デプロイ反映後、Pages からの `callGas` を実機確認
- `needs_manual_review.json` は全カテゴリ後に Naoya が一括判断

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
