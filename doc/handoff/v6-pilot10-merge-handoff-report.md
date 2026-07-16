---
id: pj-2026-07-11-499e
aliases:
- pj-2026-07-11-499e
title: v6 §5.3 カテゴリパイロット 10 件マージ報告
created: '2026-07-11'
---
# v6 §5.3 カテゴリパイロット 10 件マージ報告

対象: `nkhippo/English-Vocab-Chunk-Trainer`  
指示書: `cursor_instruction_v6_ui_improvements.md` §5.3  
入力: `pilot_10items_full.json`（Downloads）  
最終更新: 2026-07-11  
前提: `doc/handoff/v6-improvements-report.md`

---

## 1. サマリ

| 項目 | 結果 |
|---|---|
| マージ | **追加 10 件**（既存 11 → **合計 21**） |
| スキーマ | **1.2.1** 維持 |
| Insight | 既存サンプル 3 件を保持 |
| `pnpm validate` | **OK**（warnings のみ・errors なし） |
| `pnpm build` | **OK** |
| Mode A/B 出題対象 | contexts×5 かつ非 word → **16 件** |

---

## 2. 追加した 10 件

| id | category | contexts | 備考 |
|---|---|---|---|
| `actually` | word | 0 | Mode A/B 対象外 |
| `however` | word | 0 | Mode A/B 対象外 |
| `piece_of_cake` | idiom | 5 | |
| `under_the_weather` | idiom | 5 | |
| `black_and_white` | binomial | 5 | |
| `day_and_night` | binomial | 5 | |
| `airport` | compound | 5 | |
| `living_room` | compound | 5 | |
| `of_course` | other | 5 | |
| `for_example` | other | 5 | |

- ID 重複: **なし**
- 全 40 contexts（8×5）は提供データ側で target_span / cloze_spans 検証済みとのこと

---

## 3. カテゴリ内訳（マージ後）

| category | 件数 |
|---|---|
| collocation | 9 |
| word | 2 |
| idiom | 2 |
| binomial | 2 |
| compound | 2 |
| other | 2 |
| phrasal_verb | 1 |
| institutionalized | 1 |
| **合計** | **21** |

8 カテゴリすべてに少なくとも 1 件あり（v6 §5.4 のカテゴリバリエーション確認が可能）。

---

## 4. 実施手順

```bash
cp ~/Downloads/pilot_10items_full.json data/staging/pilot_10items_full.json
pnpm run merge -- --new=data/staging/pilot_10items_full.json --into=data/current/items.json
# → added=10 overwritten=0 skipped=0 total=21
pnpm run sync:ipa-ept   # word 2 件は既に EPT 相当 IPA・更新 0
pnpm run validate       # OK
pnpm build              # OK
```

付随更新:

- ホーム文言: 「11 件」→「21 件」（ja / en）
- `doc/repository-structure.md` 件数表記

---

## 5. validate 警告（エラーではない）

既存分 + 新規 synonym が plain text の警告が中心。例:

- `make_a_decision` / `look_forward_to`: register 数不足（既存）
- `actually` / `however` / `airport` 等: synonym が id ではなく文字列（仕様上 OK）

**FAILED なし。**

---

## 6. v6 §5.4 DoD（カテゴリ）

- [x] 8 カテゴリすべてでデータが存在し、バッジ日本語ラベルで表示可能
- [x] word は Mode A/B から除外（`filterEligibleTrainItems`）
- [x] idiom / binomial / compound / other を含む 21 件で `pnpm validate` 通過
- [x] パイロット 10 件マージ完了

---

## 7. 残タスク（関連）

| 優先度 | タスク |
|---|---|
| 中 | Insight 公式サンプルへの差し替え（現状プレースホルダー 3） |
| 低 | 新規 10 件の実機 UI 確認（単語帳バッジ・詳細モーダル・Mode A/B） |
| 低 | register 警告の解消（既存サンプル 3 件側） |

---

## 8. Claude 向けブリーフィング

1. v6 §5.3 完了。`data/current/items.json` は **21 件 / schema 1.2.1 / insights 3**。
2. Mode A/B は **16 件**（contexts 付き・word 除外）。word の `actually` / `however` は単語帳のみ。
3. GitHub Pages: https://nkhippo.github.io/English-Vocab-Chunk-Trainer/ — A2 タブで新規カテゴリを確認可能。
4. 次の判断待ちは Insight 公式データと、必要なら register 警告の手入れ。
