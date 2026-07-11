# v9 UX 簡素化 作業報告

対象: `nkhippo/English-Vocab-Chunk-Trainer`  
指示書: `cursor_instruction_v9_ux_simplification.md`  
最終更新: 2026-07-11  
前提: v8 Mode A/B・schema 1.2.4・confusables 役割分離済み

---

## 1. サマリ

| 項目 | 結果 |
|---|---|
| Mode A: OK/保留削除・次へ常時活性 | **完了** |
| Mode A: 詳細パネル初期非表示 + ドロワー/スライドイン | **完了** |
| Mode A: 日本語訳任意展開 | **完了** |
| Mode A: 学習履歴 ▢ 削除 | **完了** |
| Mode B: OK/保留削除・次へ常時活性（解答後） | **完了**（最小限） |
| Mode B: 詳細は解答後に任意展開 | **完了** |
| 単語帳: タイル感削減・register ラベル復活 | **完了** |
| confusables `example_en` UI 非表示 | **完了**（データは残置） |
| 共有 `detail-sections` コンポーネント | **完了** |
| `pnpm build` | **OK** |
| main push → GitHub Pages | **実施** |

---

## 2. Mode A 変更

- OK / 保留 / 学習履歴 ▢ を削除
- 「次へ」は常時有効（Space/Enter・左スワイプも常時）
- ヘッダー右の ◎ で詳細パネルを開閉
  - モバイル: 右ドロワー
  - md+: 右パネル fade-in（パッセージは約 60%）
- パッセージ下「日本語訳を見る」で `text_ja` を展開
- 次のパッセージへ進むと詳細・日本語訳はリセット

## 3. Mode B（最小限）

- OK / 保留削除
- 解答前: 「解答を見る」のみ
- 解答後: 「次へ」常時活性 + 詳細トグル表示（初期は閉じたまま）

## 4. 単語帳詳細モーダル

- セクション内の境界線カードを撤廃（余白 + subtle 下線）
- 例文右上に register ラベル（フォーマル / ニュートラル / インフォーマル）
- confusables の `example_en` をレンダリングしない
- common_errors は薄いカード維持（❌/✅ 対比）
- 見出しは Crimson Pro 強め、本文は sans

## 5. 主なファイル

| パス | 内容 |
|---|---|
| `src/components/detail-sections/*` | 新規・モーダル/Mode A 共有 |
| `src/features/train/mode-a/ModeAPage.tsx` | UX 簡素化 |
| `src/features/train/mode-b/ModeBPage.tsx` | 最小限揃え |
| `src/features/train/components/TargetSidePanel.tsx` | 情報のみドロワー |
| `src/features/train/components/DetailToggleButton.tsx` | 新規 |
| `src/features/train/components/JaTranslationToggle.tsx` | 新規 |
| `src/components/item-detail-modal/ItemDetailModal.tsx` | 折衷案 UI |
| 削除 | `EvalButtons` / `ConfusablesInline` / `RelatedUsesInline` / `TrainCheckmarks` |

---

## 6. 非スコープ（触っていない）

- Mode B の本格 UX 改修
- セクション順序変更
- confusables `example_en` のデータ削除
- checkmark 機能拡張
- Insight コンポーネント本体
- スキーマ / items.json

---

## 7. 残タスク・判断待ち

詳細は `doc/handoff/v9-scope-questions.md`。

| 内容 | 備考 |
|---|---|
| Mode A から Hold 削除に伴い Insight 自動表示が消えた | 単語帳側の手動展開は維持。Mode A に再導線が必要か |
| Mode B 本格 UX | 次回指示書 |
| 学習履歴 ▢ を Mode A に戻すか | 指示どおり削除済み |

---

## 8. 検証

```bash
pnpm build   # OK
```

Pages: https://nkhippo.github.io/English-Vocab-Chunk-Trainer/

確認: Mode A で詳細◎・日本語訳・次へ常時 / 単語帳で register ラベルと confusable 例文非表示。
