---
id: pj-2026-07-09-149f
aliases:
- pj-2026-07-09-149f
title: パイロット v3 作業報告（validate-cefr 精度改善）
created: '2026-07-09'
---

# パイロット v3 作業報告（validate-cefr 精度改善）

対象: `nkhippo/English-Vocab-Chunk-Trainer`  
指示書: `cursor_instruction_pilot_v3.md`（Downloads）  
最終更新: 2026-07-09  
前提: `doc/handoff/pilot-retry-handoff-report.md`（v2・11 件マージ済み）

---

## 1. サマリ

| 項目 | 結果 |
|---|---|
| `validateCefr` プロンプト更新 | **実施済み**（false negative 優先方針） |
| GAS `clasp push` | **実施済み** |
| `validator_version: 'v3'` キャッシュ回避 | **実施済み** |
| パイロット再々実行 | **6/8 完了・隔離 2** |
| DoD 5.1（8/8・隔離 0） | **NG** |
| DoD 5.2（formal 禁止語なし） | **NG**（`do_homework` に `expected` 残存） |
| `data/current` マージ | **未実施**（DoD 未達のため v2 の 11 件を維持） |
| 本生成 GO | **Naoya 判断待ち**（Opus 化の判断を含む） |

---

## 2. 実施内容

### 2.1 `gas/handlers.js` — `validateCefr`

指示書どおりプロンプトを差し替え:

- 「迷ったら違反」方針（false negative 回避を最優先）
- 判定対象外を真の機能語のみに限定
- kindly / expected / lounge 等の見逃しやすい語リストを明示
- `violations[].reason` フィールドを要求

### 2.2 `scripts/pipeline/generate-examples.ts`

- `validate-cefr` 呼び出しに `validator_version: 'v3'` を追加
- `generate-examples` に `schema_version: '1.1.1'` を指定（例文キャッシュ回避）

### 2.3 GAS デプロイ

```bash
pnpm run build:gas-paste
clasp push   # 5 files pushed
```

**注意**: Web App 本番はエディタで「新バージョン」デプロイを推奨（従来どおり `clasp deploy -i` は非推奨）。

### 2.4 バックアップ

```
data/current/items.json.pilot-v2.bak  # v2 の 11 件を保存
```

---

## 3. 再々実行ログ

### Run 1（`schema_version: 1.1.0` のまま・validator v3 のみ）

- **8/8 完了・隔離 0**
- ただし **GAS キャッシュ**により例文が v2 と同一のまま
- formal 例文に **kindly / expected / lounge が残存**（実質ノーオペ）

### Run 2（`schema_version: 1.1.1` + `validator_version: v3`）

| item | 結果 | 備考 |
|---|---|---|
| take_a_picture | **隔離** | 3 回とも `kindly` + `Visitors` 違反 → リトライ後も同系 |
| have_breakfast | OK | formal 問題なし |
| do_homework | OK（通過） | formal に **`expected` 残存**（validate が未検出） |
| catch_a_cold | OK | |
| take_a_shower | OK | kindly なしの新 formal |
| go_shopping | OK | |
| get_up_early | **隔離** | `Employees` を B1 違反と判定（3 回）— 過検出の疑い |
| listen_to_music | OK | `lounge` なしの新 formal |

**出力**: staging に **6 件**（`needs_manual_review.json` に 2 件）

### validate-cefr 単体テスト（診断）

| 入力 | 結果 |
|---|---|
| formal のみ「…kindly asked…」 | `kindly` **検出** ✓ |
| formal のみ「…expected to…」 | **未検出** ✗ |
| formal のみ「…in the lounge…」 | **未検出** ✗ |
| 3 register セット全体 | 多くの場合 **未検出**（キャッシュ/文脈依存） |

**結論**: v3 プロンプトは **kindly に対しては効果あり**だが、**expected / lounge は Haiku が構造的に見逃す**。3 例文まとめて渡すと検出率がさらに低下。

---

## 4. Definition of Done チェック

### 5.1 構造チェック

| 項目 | 判定 |
|---|---|
| 8/8 完了・隔離 0 | **NG**（6/8・隔離 2） |
| register 配列・enrichment・IPA 等 | 通過 6 件は v2 と同水準（リグレッションなし） |

### 5.2 CEFR 内容チェック（6 件の formal 目視）

| 禁止語 | 判定 |
|---|---|
| kindly | **OK**（残存なし） |
| expected | **NG** — `do_homework` formal |
| lounge | **OK** |
| require / generally / typically 等 | **OK**（6 件中） |

### 5.3 ログ確認

| 項目 | 判定 |
|---|---|
| リトライ発生 | **OK** — `take_a_picture` / `get_up_early` で violations ログあり |
| 隔離 3 件以上 | **該当せず**（2 件） |

---

## 5. 判定と推奨（指示書 §6 準拠）

### 6.1 マージ

**実施せず。** `data/current/items.json` は v2 の **11 件**のまま（`.pilot-v2.bak` あり）。

### 6.2 Opus 化の提案（Naoya 判断待ち）

指示書どおり **Haiku → Opus への切り替えは未実施**。以下を報告:

- `expected` / `lounge` はプロンプトに明示しても Haiku が安定検出できない
- `Visitors` / `Employees` を B1 とする **false positive** も発生（`get_up_early` 隔離）
- **推奨**: `validateCefr` のモデルを `claude-opus-4-7` に変更して同一 8 件で再試行、または generateExamples の formal 制約を強化

### 6.3 隔離

2 件（閾値 3 未満）。`get_up_early` の `Employees` 判定は要レビュー（A2 圏内の可能性）。

---

## 6. 変更ファイル

| ファイル | 変更 |
|---|---|
| `gas/handlers.js` | validateCefr プロンプト v3 |
| `gas/drive-paste/Code.gs` | build:gas-paste 再生成 |
| `scripts/pipeline/generate-examples.ts` | `validator_version: v3` / `schema_version: 1.1.1` |

---

## 7. Naoya への報告

1. validate-cefr は **厳しくなったが不十分**（kindly は改善、expected/lounge は未解決）
2. **data/current は v2 の 11 件を維持**（v3 マージなし）
3. 次の判断:
   - **A**: validate-cefr を **Opus 4.7** に切り替えて再パイロット
   - **B**: generateExamples 側で formal 例文の語彙制約を追加（Haiku 維持）
   - **C**: 上記両方
4. 本生成 2,430 件は **上記解決後**に GO 推奨

---

## 8. クイックコマンド（再試行時）

```bash
clasp push
# → GAS エディタで新バージョン

pnpm run generate:examples -- --input=data/staging/A2_collocation_validated_enriched.json
pnpm run validate -- # staging 出力を指定して手動検証
```
