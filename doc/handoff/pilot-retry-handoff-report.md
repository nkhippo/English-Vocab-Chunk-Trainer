# パイロット再実行（v2）作業報告

対象: `nkhippo/English-Vocab-Chunk-Trainer`  
指示書: `cursor_instruction_pilot_v2.md`（Downloads）  
最終更新: 2026-07-09  
前提: `doc/handoff/pilot-test-handoff-report.md`（初回パイロット NG）

---

## 1. サマリ

| 項目 | 結果 |
|---|---|
| スキーマ v1.1.0 差し替え | **OK** |
| 仕様書 v3.1 パッチ適用 | **OK** |
| GAS プロンプト更新 + `clasp push` | **OK** |
| バリデータ / 型 / パイプライン更新 | **OK** |
| パイロット再実行（8 件） | **8/8 完了**（隔離 0） |
| DoD 9.1〜9.6 | **OK**（Ajv エラー 0） |
| `data/current` マージ | **OK**（11 件 = サンプル 3 + パイロット 8） |
| 本生成 GO | **Naoya 判断待ち** |

---

## 2. 実施ステップと結果

| Step | 内容 | 判定 |
|---|---|---|
| 1 | `doc/spec/learning-data-schema.json` → v1.1.0 完全差し替え | OK |
| 2 | `doc/spec/app-specification.md` → v3.1 パッチ（informal 統一・register 配列化） | OK |
| 3 | `gas/handlers.js` — enrich / generateExamples / validateCefr テンプレート化 | OK |
| 4 | `scripts/lib/validate.ts` — register 配列・3 register 期待 | OK |
| 5 | `src/types/learning.ts` — `Register` = informal、`item.register` 配列 | OK |
| 6 | `scripts/pipeline/generate-examples.ts` — register 自動導出・casual→informal 正規化 | OK |
| 7 | GAS `clasp push` + `build:gas-paste` | OK（本番は既存 URL で動作確認） |
| 8 | enrich 8 件（`schema_version: 1.1.0` でキャッシュ回避） | OK |
| 9 | examples 8 件 | OK（0 隔離。前回 NG の `get_up_early` / `listen_to_music` も通過） |
| 10 | merge → `data/current/items.json` | OK |

---

## 3. Definition of Done（改訂版）チェック結果

対象: `data/staging/A2_collocation_validated_enriched_with_examples.json`（8 件）

### 9.1 構造チェック

| 項目 | 判定 |
|---|---|
| 8/8 生成完了・隔離 0 | OK |
| synonyms / antonyms / confusables / related_uses / common_errors_ja がオブジェクト配列 | OK |
| hypernyms / hyponyms が文字列配列 | OK |
| semantic_field が文字列配列 | OK |
| skill_focus が enum 単一値 | OK |
| frequency_rank_in_level が整数 | OK |

### 9.2 IPA

| 項目 | 判定 |
|---|---|
| ipa_careful 全件 | OK |
| ipa_connected 全 8 フレーズ | OK |

### 9.3 例文

| 項目 | 判定 |
|---|---|
| 3 register（formal + neutral + informal） | OK（全 8 件） |
| `casual` 残存なし（パイプラインで `informal` に正規化） | OK |
| surrounding_cefr_ceiling = A2 | OK |

### 9.4 register 配列

| 項目 | 判定 |
|---|---|
| item.register が配列 | OK |
| example_sentences の unique 集合と一致 | OK |

### 9.5 スキーマ検証

```
Ajv errors: 0
warnings: 2（synonym ID 参照のみ・許容）
```

### 9.6 制約 A

目視サンプル（`have_breakfast`, `catch_a_cold`, `listen_to_music`）— 対象語の用法は自然。**OK**

---

## 4. 変更ファイル一覧

| ファイル | 目的 |
|---|---|
| `doc/spec/learning-data-schema.json` | v1.1.0（register 配列・informal・collocation_pattern 拡張） |
| `doc/spec/app-specification.md` | v3.1 パッチ |
| `gas/handlers.js` | JSON テンプレートプロンプト・validateCefr 強化 |
| `gas/drive-paste/Code.gs` | 再生成 |
| `scripts/lib/validate.ts` | register 配列クロスチェック |
| `src/types/learning.ts` | 型追随 |
| `scripts/pipeline/generate-examples.ts` | register 導出・casual 正規化・violations ログ |
| `scripts/pipeline/enrich-items.ts` | `schema_version` 付与（GAS キャッシュ回避） |
| `scripts/pipeline/merge-data.ts` | `schema_version: 1.1.0` |
| `data/current/items.json` | サンプル 3 件を v1.1 化 + パイロット 8 件マージ（計 11 件） |
| `src/data/sample-seeds.json` | casual → informal |

---

## 5. 運用上の知見

### GAS キャッシュ

同一 `item` ボディでは旧プロンプト結果が Drive キャッシュから返る。**`schema_version: '1.1.0'` をリクエスト body に含めてキャッシュキーを変える**必要あり（`enrich-items.ts` / `generate-examples.ts` に実装済み）。

### Opus の `casual` 出力

プロンプトで `informal` を指定しても一部レスポンスが `casual` になる事例あり。**`generate-examples.ts` で `casual` → `informal` に正規化**してから validate / merge する（Naoya 決定の informal 統一に合わせる）。

### 稼働中 GAS URL（変更なし）

```
https://script.google.com/macros/s/AKfycbymECuc_1QayB_u3Zhf07Ls5HYzkASEXdYz4kDYi7vzvutwP5ZLvGWIwyQuRLye3954/exec
```

---

## 6. 残課題・本生成への申し送り

1. **本生成（2,430 件）**: パイロット v2 は全 DoD OK。**`pnpm run batch:a2-seeds` 着手は Naoya の明示 GO 待ち**（指示書どおり）。
2. **既存サンプル 3 件**: 例文 register が 1 種のみのため validator warnings あり（パイロット範囲外。必要なら別途 enrich/examples 再生成）。
3. **`doc/ops/claude-api-gas-design.md`**: 本文に `casual` 表記が残存（次回ドキュメント整備時に informal へ統一推奨）。
4. **GAS デプロイ**: 以後も `clasp push` 後はエディタ手動デプロイを優先。

---

## 7. Naoya への報告

- パイロット 8 件は **全 DoD OK**、`data/current` は **11 件**（`pnpm validate` OK）。
- 前回隔離の 2 件（`get_up_early` / `listen_to_music`）は **今回通過**。
- register は **`informal` に統一**（スキーマ・仕様・パイプライン反映済み）。
- **本生成 GO の判断**をお願いします。初回はカテゴリ単位の部分実行も可。
