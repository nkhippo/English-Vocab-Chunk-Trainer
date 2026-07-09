# パイロットテスト作業報告

対象: `nkhippo/English-Vocab-Chunk-Trainer`  
指示書: `cursor_instruction_pilot_test.md`（Downloads）  
最終更新: 2026-07-09（GAS 本番 URL 更新・手動デプロイ反映確認済み）  
前提: Step 1〜3 完了後（`doc/handoff/step1-3-handoff-report.md`）  
関連: `doc/handoff/phase1-handoff-report.md`（Phase 1 全体）

---

## 1. 実施した作業

| # | 作業 | 結果 |
|---|---|---|
| 1 | `doc/` / `scripts/` の役割別サブフォルダ化 + `repository-structure.md` 更新 | 完了 |
| 2 | `pnpm run generate:seed -- --cefr=A2 --category=collocation --batch=8` | 8 件生成 → `data/staging/A2_collocation_seeds.json` |
| 3 | `/review` 相当の採用判定 | 8 件すべて採用（内容目視で妥当。`A2_collocation_validated.json` 作成） |
| 4 | `pnpm run generate:enrichment` | 8/8 成功（約 103 秒） |
| 5 | `pnpm run generate:examples` | **6/8 成功**、2 件隔離 |
| 6 | `gas/handlers.js` プロンプト修正（設計書 §2.2 / §2.3 準拠） | リポジトリ + `clasp push` 済み |
| 7 | `data/current` へのマージ | **未実施**（下記 NG のため） |
| 8 | GAS 本番 URL 復旧（Naoya 手動デプロイ） | **完了**（下記 URL・CORS 確認済み） |

### 稼働中 GAS Web App（本番）

```
https://script.google.com/macros/s/AKfycbzXBNFUfmG6dTbHhw4xNI-n_gB0QYNL-dYpddSHEK9Pe4a-4hp-CmhjL4c8iTPcPqsU/exec
```

**2026-07-09 確認**（Cursor 実施）:

```bash
U="https://script.google.com/macros/s/AKfycbzXBNFUfmG6dTbHhw4xNI-n_gB0QYNL-dYpddSHEK9Pe4a-4hp-CmhjL4c8iTPcPqsU/exec"
curl -sL "${U}?path=health&origin=https://nkhippo.github.io"
# → {"ok":true,"data":{"service":"vocab-chunk-trainer-gas",...}}

curl -sL "${U}?path=health&origin=https://evil.example.com"
# → 403 origin_forbidden
```

プロンプト修正込みの HEAD が本番に載っている前提。リポジトリ側は `.env.example` / `.env.production` / `CLAUDE.md` / `gas/README.md` 等を上記 URL に同期済み。

### 旧 URL（廃止）

`AKfycbz_94XYG6UzI4v5Na6VF-...` — `clasp deploy` 後に 404 化。手動デプロイで新 URL に移行済み。

---

## 2. Definition of Done チェックリスト（初回パイロット実行時）

> 以下は **プロンプト修正前** の GAS 上で実行した初回結果。`gas/handlers.js` 修正・本番手動デプロイ後に **同一 8 件で再テスト** し、本節を上書き更新すること。

対象ファイル: `data/staging/A2_collocation_validated_enriched_with_examples.json`（6 件）+ `needs_manual_review.json`（2 件）

| 項目 | 判定 | 所見 |
|---|---|---|
| synonyms / antonyms / hypernyms / hyponyms | **NG** | 内容は入っているが **文字列配列** で出力。スキーマは `{item, difference_ja}` オブジェクト必須 |
| confusables | **NG** | 同上（文字列配列。オブジェクト必須） |
| related_uses | **NG** | 同上 |
| common_errors_ja | **△** | 日本語として妥当だが **文字列配列**（`{incorrect,correct,why_ja}` 必須） |
| example_sentences（neutral+formal+casual） | **△** | 6 件中: 3 register 揃い **3 件**、不足 **3 件**（`do_homework` は全 neutral、`take_a_picture` / `take_a_shower` は formal 欠如） |
| surrounding_cefr_ceiling ≤ A2 | **OK** | 成功 6 件はすべて A2。目視でも問題なし |
| 制約 A（語彙優先） | **OK** | 大きな不自然さなし（主観） |
| ipa_careful / ipa_connected | **NG** | `ipa_careful` は全件あり。**`ipa_connected` は 0/6**（句なのに未出力） |
| item.register（casual vs informal） | **要確認** | 全 8 件 **`"neutral"`** のみ。`doc/spec/app-specification.md` §3.1 データモデルは item.register に **`informal`**、例文 register に **`casual`**。`learning-data-schema.json` は item.register も **`casual`**（`informal` なし）。**`pnpm run validate` はスキーマ（`casual`）を正とする** |
| temperature 非送信（Opus 4.7 Build 系） | **OK** | `gas/claude.js` L14–17: `claude-opus-4-7` では `payload.temperature` を付与しない。`handlers.js` は引数を渡すが API には届かない |
| `pnpm run validate`（パイロット出力） | **NG** | 必須フィールド欠如・型不一致多数（`frequency_rank_in_level`、`semantic_field` 配列化、`skill_focus` enum 等） |
| 例文生成完走（8/8） | **NG** | `get_up_early` / `listen_to_music` が `/validate-cefr` 3 回失敗で隔離 |

**総合**: **本生成（2,430 件）への着手は不可**。新 GAS 本番で **同一 8 件のパイプライン再テスト** が必要（初回パイロットは旧デプロイ上のプロンプト簡略版で実行された可能性あり）。

---

## 3. 根本原因と実施した修正

### 3.1 enrichment 出力がスキーマ非準拠

`gas/handlers.js` の `/enrich-item` プロンプトが簡略版のままで、`doc/ops/claude-api-gas-design.md` §2.2 のオブジェクト構造・`ipa_connected`・`frequency_rank_in_level` 等を指示していなかった。

**修正**: `gas/handlers.js` の `enrichItem` / `generateExamples` を設計書に沿って書き換え（`clasp push` 済み → **本番は Naoya 手動デプロイで反映済み**）。

### 3.2 例文 register 不足・CEFR 隔離

`generateExamples` プロンプトが「最低 1、目標 3」程度で、formal/neutral/casual の明示が弱かった。`/validate-cefr`（Haiku 判定）が厳しく、一部項目で 3 回リトライ後に隔離。

**修正**: 同上プロンプト強化。再テストで隔離率を確認する。

### 3.3 register 表記の仕様矛盾（未解決）

| 文書 | item.register | 例文 register |
|---|---|---|
| `app-specification.md` §3.1 | `formal` / `neutral` / **`informal`** | `formal` / `neutral` / **`casual`** |
| `learning-data-schema.json` | `formal` / `neutral` / **`casual`** | 同上 |

**Naoya 判断待ち**: `informal` と `casual` のどちらを item レベルで正とするか。現行 `validate` はスキーマに従う。

---

## 4. temperature 検証（コード根拠）

`gas/handlers.js` は Build 系で `callClaude(..., temperature, ...)` を呼ぶが、`gas/claude.js` が Opus 4.7 のとき payload から除外:

```javascript
if (resolvedModel.indexOf('claude-opus-4-7') !== 0) {
  payload.temperature = temperature == null ? 0.4 : temperature
}
```

`/validate-cefr` は Haiku 利用のため `temperature: 0.1` が送信される（設計どおり）。

---

## 5. 生成サンプル（成功例: `have_breakfast`）

- enrichment: synonyms オブジェクト化前でも内容は教材として有用
- 例文: neutral / casual / formal の 3 register を満たす
- `surrounding_cefr_ceiling`: すべて A2

---

## 6. 次のアクション（Naoya / Claude）

1. ~~**GAS 本番 URL の復旧**~~ → **完了**（上記本番 URL）
2. **register 表記の統一方針を決定**（`informal` vs `casual`）
3. **同一 8 件でパイプライン再実行**（新本番 GAS・更新プロンプトで enrich → examples）→ DoD 全 OK を確認
4. 再テスト OK 後: `pnpm run merge -- --new=data/staging/A2_collocation_validated_enriched_with_examples.json --into=data/current/items.json`
5. その後 `pnpm run batch:a2-seeds` による本生成へ

---

## 7. Claude への申し送り

- 仕様の正本は引き続き `doc/spec/app-specification.md`。スキーマとの矛盾（register）は Naoya 確認まで勝手に統一しない。
- パイロット staging は `data/staging/`（gitignore）。コミットしない。
- フォルダ構成の正本は `doc/repository-structure.md`（AI 入口）。
- GAS URL 変更時は `.env.example` / `.env.production` / `CLAUDE.md` / `gas/README.md` / 関連 doc を揃えて更新する。
- GAS の `clasp deploy -i <本番ID> -V <N>` は 404 を誘発しやすい。**エディタ手動デプロイを優先**（本番復旧も手動デプロイで実施済み）。
