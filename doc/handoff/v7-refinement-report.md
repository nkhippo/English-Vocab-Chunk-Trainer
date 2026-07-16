---
id: pj-2026-07-11-4734
aliases:
- pj-2026-07-11-4734
title: v7 UI 精緻化 作業報告
created: '2026-07-11'
---
# v7 UI 精緻化 作業報告

対象: `nkhippo/English-Vocab-Chunk-Trainer`  
指示書: `cursor_instruction_v7_ui_refinements.md`  
最終更新: 2026-07-11  
前提: v6 完了・21 件・Insight 公式 3 件

---

## 1. サマリ

| 項目 | 結果 |
|---|---|
| スキーマ改訂 | **完了**（`nuance_contrast_ja`・例文フィールド・hypernyms/hyponyms 削除） |
| データマイグレーション | **完了**（21 items） |
| 詳細モーダル UI | **完了**（順序・IPA・例文・関連語形式） |
| Mode A/B IPA | **完了**（連結タブ削除） |
| confusables / common_errors 内容修正 | **未実施**（領域 C・スコープ外） |
| 例文の自動生成 | **未実施**（スコープ外・設計チャット待ち） |
| `pnpm validate` / `pnpm build` | **OK** |

---

## 2. スキーマ・バージョン注記

指示書は dataset `schema_version` を **1.2.2** と指定。  
ただし **1.2.2 は Insight 公式差し替えで既使用**のため、構造マイグレーション後は **`1.2.3`** とした（Dexie 再同期のため）。

| 層 | 内容 |
|---|---|
| `doc/spec/learning-data-schema.json` | synonym/antonym/related_uses 更新、hypernyms/hyponyms 削除 |
| `data/current/items.json` | `schema_version: "1.2.3"` |
| `pnpm run migrate:v1.2.3` | `scripts/pipeline/migrate-schema-v1-2-3.ts` |

### マイグレーション結果

| 指標 | 数 |
|---|---|
| Items touched | 18 |
| Synonyms migrated (`difference_ja` → `nuance_contrast_ja`) | 52 |
| Antonyms migrated | 21 |
| Hypernyms removed | 18 items |
| Hyponyms removed | 18 items |

---

## 3. UI 変更（詳細モーダル）

### セクション順序

A ヘッダー → B 例文（全表示）→ **E' 類義語・反意語** → C confusables → D common_errors → F related_uses → G メタ

### その他

- IPA: 「語ごと」のみ（`IpaTabs` 簡略化）。`ipa_connected` フィールドはデータ上残置
- 例文: register タブ・ラベル・`[A2]` タグ削除、3 件縦並び
- 類義語・反意語: `nuance_contrast_ja` + 例文（空なら非表示）
- 上位語・下位語: UI 削除
- related_uses: 例文欄追加（空なら非表示）

Mode A/B `TargetSidePanel` も IPA 連結タブなし。

---

## 4. 補充対象数（設計チャット向け）

マイグレーション後、例文が空のエントリ数:

| 種別 | 空の例文ペア数 |
|---|---|
| synonyms | **52** |
| antonyms | **21** |
| related_uses | **59** |
| **合計** | **132** |

※ Cursor は例文を生成していない。UI は空欄を非表示にするのみ。

---

## 5. Definition of Done

### スキーマ

- [x] スキーマ定義更新
- [x] 型定義更新
- [x] validate 追随
- [x] マイグレーション実行・validate OK

### UI

- [x] セクション順序
- [x] IPA タブ廃止
- [x] 例文タブ廃止 + ラベル/タグ削除
- [x] 上位語・下位語削除
- [x] nuance_contrast_ja 表示
- [x] related_uses 例文欄
- [x] 空フィールドで崩れない

### 全体

- [x] `pnpm build` OK
- [x] 本レポート / scope-questions
- [x] main push

---

## 6. 残タスク

| 優先度 | 担当 | タスク |
|---|---|---|
| 高 | 設計チャット | synonyms/antonyms/related_uses の例文 132 件補充 |
| 高 | 設計チャット | confusables / common_errors の役割明確化・再生成（領域 C） |
| 中 | Naoya | GAS 再デプロイ（handlers の enrich テンプレート更新済み・未デプロイ） |
| 中 | — | 本番 Pages でハードリロード後のモーダル確認 |
| 低 | — | 指示書の「1.2.2」表記と実データ「1.2.3」のドキュメント整合 |

詳細な判断待ちは `doc/handoff/v7-scope-questions.md`。

---

## 7. Claude 向けブリーフィング

1. v7 の Cursor スコープ（スキーマ + UI）は完了。領域 C（データ中身）は未着手。  
2. 例文 132 スロットが空。補充後は UI が自動表示。  
3. schema **1.2.3**（指示書の 1.2.2 は既使用のため繰り上げ）。  
4. Pages: https://nkhippo.github.io/English-Vocab-Chunk-Trainer/ — 単語帳で go_shopping / catch_a_cold を確認。
