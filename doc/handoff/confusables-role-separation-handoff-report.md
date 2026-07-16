---
id: pj-2026-07-11-845c
aliases:
- pj-2026-07-11-845c
title: confusables / common_errors 役割分離 作業報告
created: '2026-07-11'
---
# confusables / common_errors 役割分離 作業報告

対象: `nkhippo/English-Vocab-Chunk-Trainer`  
入力:
- `confusables_common_errors_fix_patches.json`（11 items）
- `confusables_common_errors_role_separation_guideline.md`  
最終更新: 2026-07-11  
前提: v8 完了・21 件・schema 1.2.3

---

## 1. サマリ

| 項目 | 結果 |
|---|---|
| 11 items の `confusables` / `common_errors_ja` 差し替え | **完了** |
| 他フィールドの変更 | **なし**（パッチ指示どおり） |
| Dexie 再同期用 `schema_version` | **1.2.3 → 1.2.4** |
| ガイドラインのリポジトリ配置 | `doc/ops/confusables-common-errors-role-separation.md` |
| パッチ原本の保管 | `doc/handoff/confusables_common_errors_fix_patches.json` |
| `pnpm validate` | **OK**（既存 warnings のみ） |
| main push → GitHub Pages | **実施** |

---

## 2. 役割分離の原則（適用済み）

| フィールド | 役割 |
|---|---|
| `confusables` | 実在する別表現との使い分け（意味・register・場面） |
| `common_errors_ja` | 対象語自体の誤用（時制・冠詞・前置詞・動詞・語順など） |

セルフチェック結果:
- 修正後の confusables 説明文に「言わない / 誤用 / 不自然」は **0 件**
- `catch_a_cold`: confusables は `have a cold` / `get a cold` / `catch the flu` / `feel cold`；`take a cold` は errors 側
- `go_shopping`: confusables は `do the shopping` / `go to the store` / `go window shopping`；`go to shopping` は errors 側

---

## 3. 修正対象（11 / 21）

**Cursor 生成 7**: `take_a_picture`, `have_breakfast`, `do_homework`, `catch_a_cold`, `take_a_shower`, `go_shopping`, `listen_to_music`

**設計チャット生成 4**: `however`, `black_and_white`, `of_course`, `for_example`

**未変更 10**: `make_a_decision`, `look_forward_to`, `whats_up`, `get_up_early`, `actually`, `piece_of_cake`, `under_the_weather`, `day_and_night`, `airport`, `living_room`

---

## 4. 変更ファイル

| パス | 内容 |
|---|---|
| `data/current/items.json` | 11 items の 2 フィールド差し替え + schema **1.2.4** |
| `doc/ops/confusables-common-errors-role-separation.md` | ガイドライン正本 |
| `doc/handoff/confusables_common_errors_fix_patches.json` | 適用パッチ保管 |
| `doc/handoff/confusables-role-separation-handoff-report.md` | 本レポート |
| `doc/spec/learning-data-schema.json` | version 表記 1.2.4（構造変更なし） |
| `doc/spec/app-specification.md` / `doc/repository-structure.md` / `CHANGELOG.md` | 現状同期 |

※ 同コミットに、前回未 push だった仕様書 **v3.3** 同期（Mode A/B 文脈型の文書反映）も含む。

---

## 5. 非スコープ（触っていない）

- UI コンポーネント（ItemDetailModal / Mode A/B パネル）
- synonyms / antonyms / related_uses / contexts / Insight
- GAS デプロイ
- 量産テンプレート `chat-generation-template-a2.md` → **v2 として反映済み**（`doc/ops/chat-generation-template-a2-v2.md`）

---

## 6. 残タスク

| 優先 | 内容 | 担当 |
|---|---|---|
| 高 | 実機で `go_shopping` / `catch_a_cold` 等の重複感解消を確認 | Naoya |
| 高 | 空 example スロット補充 | 設計チャット |
| 中 | 量産テンプレートへ本ガイドライン §4 を反映 | **完了**（template v2） |
| 低 | GAS enrich 本番デプロイ | 保留 |

---

## 7. 検証

```bash
pnpm validate   # OK
```

Pages: https://nkhippo.github.io/English-Vocab-Chunk-Trainer/

確認手順: 単語帳で `catch a cold` / `go shopping` を開き、「混同しやすい語」と「日本人がしがちな間違い」が別内容になっていること。
