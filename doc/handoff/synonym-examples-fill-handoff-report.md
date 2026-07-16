---
id: pj-2026-07-11-b66e
aliases:
- pj-2026-07-11-b66e
title: synonyms / antonyms / related_uses 例文補充 作業報告
created: '2026-07-11'
---
# synonyms / antonyms / related_uses 例文補充 作業報告

対象: `nkhippo/English-Vocab-Chunk-Trainer`  
入力: `synonyms_antonyms_related_examples_patches.json`（設計チャット）  
最終更新: 2026-07-11  
前提: schema 1.2.4・21 件・空 example スロット約 132

---

## 1. サマリ

| 項目 | 結果 |
|---|---|
| 18 items の synonyms / antonyms / related_uses 差し替え | **完了** |
| 他フィールド保持（surface / contexts / confusables / IPA 等） | **完了** |
| 例文ペア充填数 | **132 / 132**（空スロット 0） |
| Dexie 再同期用 `schema_version` | **1.2.4 → 1.2.5** |
| `pnpm validate` | **OK**（既存 warnings のみ） |
| 単語帳詳細モーダル実機確認 | **OK**（`catch a cold`） |
| main push → GitHub Pages | **完了**（`d26c149`・Deploy OK） |

---

## 2. 対象 items（18）

`take_a_picture`, `have_breakfast`, `do_homework`, `catch_a_cold`, `take_a_shower`, `go_shopping`, `get_up_early`, `listen_to_music`, `actually`, `however`, `piece_of_cake`, `under_the_weather`, `black_and_white`, `day_and_night`, `airport`, `living_room`, `of_course`, `for_example`

**未変更 3**（当該フィールドが空 / 対象外）: `make_a_decision`, `look_forward_to`, `whats_up`

注: パッチに `antonyms` キーがない item（例: `take_a_picture`, `airport`）は既存 antonyms を保持（キーがあるフィールドのみ差し替え）。

---

## 3. UI 確認（ローカル preview）

`catch a cold` 詳細モーダル:

- 類義語: `come down with a cold` 等に EN/JA 例文表示
- 反意語: `recover from a cold` 等に EN/JA 例文表示
- 派生・関連: `catch a fever` 等に EN/JA 例文表示

---

## 4. 変更ファイル

| パス | 内容 |
|---|---|
| `data/current/items.json` | 18 items 部分更新 + schema **1.2.5** |
| `doc/spec/learning-data-schema.json` | version 表記 1.2.5 |
| `doc/handoff/synonyms_antonyms_related_examples_patches.json` | 適用パッチ保管 |
| `doc/handoff/synonym-examples-fill-handoff-report.md` | 本レポート |

---

## 5. 残タスク

| 内容 | 担当 |
|---|---|
| A2 collocation 本生成 | Naoya + テンプレ v2 |
| Mode B 本格 UX | 次回指示 |
| nuance_contrast_ja 品質見直し | 設計チャット（任意） |
| GAS enrich 本番デプロイ | 保留 |

---

## 6. 検証

```bash
pnpm validate   # OK
# empty example pairs across all items: 0
```

Pages: https://nkhippo.github.io/English-Vocab-Chunk-Trainer/
