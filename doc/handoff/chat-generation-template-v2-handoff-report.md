# Chat 生成テンプレート v2 取り込み 作業報告

対象: `nkhippo/English-Vocab-Chunk-Trainer`  
入力:
- `chat-generation-template-a2-v2.md`
- `chat-generation-workflow-v2.md`  
最終更新: 2026-07-11  
前提: schema **1.2.4**・confusables/errors 役割分離済み・21 件

---

## 1. サマリ

| 項目 | 結果 |
|---|---|
| 生成テンプレート v2 をリポジトリ配置 | **完了** → `doc/ops/chat-generation-template-a2-v2.md` |
| 運用ワークフロー v2 をリポジトリ配置 | **完了** → `doc/ops/chat-generation-workflow-v2.md` |
| contexts インデックス検証 CLI | **完了** → `pnpm run verify:contexts` |
| 現行 `items.json` の contexts 検証 | **OK**（21 items / 80 passages） |
| 関連ドキュメントのパス更新 | **完了** |
| main push → GitHub Pages | **実施** |

UI コード変更なし（ドキュメント + 検証スクリプトのみ）。Pages は docs 同梱の再デプロイ。

---

## 2. v2 の要点（設計チャット提供）

- 対応スキーマ: **1.2.4**
- バッチサイズ: **5 件**（contexts 情報量のため。seed 提案は 10 件 → 採用後 JSON を前後半分割）
- `contexts[]` 必須（Mode A/B）
- `nuance_contrast_ja` + example フィールド
- hypernyms / hyponyms なし
- confusables / common_errors 役割分離（テンプレ §9）

---

## 3. 追加・変更ファイル

| パス | 内容 |
|---|---|
| `doc/ops/chat-generation-template-a2-v2.md` | Claude 新チャート添付用テンプレート |
| `doc/ops/chat-generation-workflow-v2.md` | Naoya 向け運用手順 |
| `scripts/pipeline/verify-contexts.ts` | target_span / cloze_spans 検証 |
| `package.json` | `verify:contexts` スクリプト |
| `doc/ops/confusables-common-errors-role-separation.md` | テンプレ反映済みに更新 |
| `doc/handoff/chat-generation-template-v2-handoff-report.md` | 本レポート |
| `doc/repository-structure.md` / `CHANGELOG.md` 等 | 現状同期 |

---

## 4. 使い方（Naoya）

1. 新 Claude チャートを開く
2. `doc/ops/chat-generation-template-a2-v2.md` を添付
3. `doc/ops/chat-generation-workflow-v2.md` §3-3 の初回メッセージでバッチ開始
4. バッチ JSON を `data/staging/A2_collocation_batchN.json` に保存
5. `pnpm run verify:contexts -- data/staging/A2_collocation_batchN.json`
6. カテゴリ完了時に `pnpm run merge` → `pnpm validate` → push

既存 A2 collocation ID（重複回避用・現状 9 件）:

```json
["make_a_decision","take_a_picture","have_breakfast","do_homework","catch_a_cold","take_a_shower","go_shopping","get_up_early","listen_to_music"]
```

---

## 5. 非スコープ

- A2 本生成の実行（バッチ JSON の作成）
- GAS デプロイ
- UI 変更
- 空 example スロット補充

---

## 6. 残タスク

| 優先 | 内容 | 担当 |
|---|---|---|
| 高 | 新チャートで A2 collocation バッチ 1 開始 | Naoya |
| 高 | 空 example スロット補充 | 設計チャット |
| 中 | 他カテゴリ用テンプレ（phrasal_verb 等） | 設計チャット（着手時） |
| 低 | GAS enrich 本番デプロイ | 保留 |

---

## 7. 検証

```bash
pnpm run verify:contexts -- data/current/items.json
# ✓ contexts OK (21 items, 80 passages)
```

Pages: https://nkhippo.github.io/English-Vocab-Chunk-Trainer/
