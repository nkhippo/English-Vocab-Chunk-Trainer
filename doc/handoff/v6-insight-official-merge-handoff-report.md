---
id: pj-2026-07-11-7327
aliases:
- pj-2026-07-11-7327
title: Insight 公式サンプル 3 件マージ報告
created: '2026-07-11'
---

# Insight 公式サンプル 3 件マージ報告

対象: `nkhippo/English-Vocab-Chunk-Trainer`  
入力: `insight_samples_official.json`（Downloads）  
最終更新: 2026-07-11  
前提: `doc/handoff/v6-improvements-report.md` / `doc/handoff/v6-pilot10-merge-handoff-report.md`

---

## 1. サマリ

| 項目 | 結果 |
|---|---|
| マージ | 既存プレースホルダー 3 件を **同 ID で上書き** |
| 【サンプル】表記 | **除去済み**（公式本文） |
| `schema_version` | **1.2.2**（Dexie 再同期のためバンプ） |
| `pnpm validate` | **OK** |
| モーダル表示 | **確認済み**（catch a cold → 公式 metaphor） |
| Mode A 保留→自動提示 | **確認済み**（have breakfast → 公式 cultural、約 2 秒後） |
| Mode B | 同一 `TargetSidePanel` のため同等動作（保留時 Insight） |

---

## 2. 上書きした Insight

| id | target | type | 冒頭 |
|---|---|---|---|
| `insight_catch_a_cold_metaphor` | catch_a_cold | metaphor | 「なぜ風邪を『catch(捕まえる)』のか?」 |
| `insight_take_a_picture_core` | take_a_picture | core_image | 「なぜ写真を『take(取る)』のか?」 |
| `insight_have_breakfast_cultural` | have_breakfast | cultural | 「なぜ朝食を『have(持つ)』のか?」 |

- `related_items`: `take_a_picture` → `take_a_shower` のみ（他は空配列）
- items 側の `insight_id` リンクは維持

---

## 3. 実機確認（ローカル preview）

環境: `pnpm preview` → `http://127.0.0.1:4173/English-Vocab-Chunk-Trainer/`

### 3.1 単語帳モーダル

1. `/browse` → A2 → **catch a cold** を開く  
2. 「💡 語源・由来を見る」表示  
3. タップで InsightCard 展開  
4. 本文が公式（「なぜ風邪を…」）で、【サンプル】なし

### 3.2 Mode A 保留

1. `/train/mode-a` で **have breakfast** 出題時  
2. 「△ 保留」タップ  
3. 約 2 秒後に InsightCard がフェードイン  
4. type バッジ「文化」、公式本文を確認

---

## 4. 実施コマンド

```bash
# insights[] を同 ID 上書き + schema 1.2.2
pnpm run validate   # OK
pnpm build          # OK
```

---

## 5. 残タスク

| 優先度 | タスク |
|---|---|
| 低 | Mode B でも同様に 1 回手動確認（コードパスは Mode A と共通） |
| 低 | Pages デプロイ後、本番 URL でもキャッシュクリアして確認 |

v6 の Insight 公式データ差し替えは **完了**。

---

## 6. Claude 向けブリーフィング

1. プレースホルダー 3 件は公式本文に置換済み。UI 変更なし（既存 InsightCard）。  
2. Dexie 再読込のため schema を **1.2.2** に上げた（1.2.1 のままだと insights だけ差し替えても端末が古いデータを保持しうる）。  
3. GitHub Pages: https://nkhippo.github.io/English-Vocab-Chunk-Trainer/  
4. 確認手順: 単語帳で catch a cold / Mode A で have breakfast を保留。
