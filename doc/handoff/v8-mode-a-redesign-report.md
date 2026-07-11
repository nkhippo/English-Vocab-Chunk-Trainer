# v8 Mode A/B モバイル最適化 作業報告

対象: `nkhippo/English-Vocab-Chunk-Trainer`  
指示書: `cursor_instruction_v8_mode_a_redesign.md`  
最終更新: 2026-07-11  
前提: v7 完了・21 件・schema 1.2.3・Insight 公式 3 件

---

## 1. サマリ

| 項目 | 結果 |
|---|---|
| §1 schema 1.2.3 表記統一 | **完了**（app-spec v3.2 / schema JSON / i18n） |
| §1 hypernyms/hyponyms i18n 削除 | **完了** |
| §1 GAS 再デプロイ | **未実施**（指示どおり保留） |
| §2 タイマー / 中断 / 出会い / CEFR バッジ削除 | **完了** |
| §2 confusables / related_uses / 学習履歴表示 | **完了** |
| §2 モバイル縦スクロール + sticky CTA | **完了** |
| §2 md+ 左右分割（約 60/40） | **完了** |
| §2 OK/Hold トグル・左スワイプ・キーボード | **完了** |
| §2 Mode B 対称適用（解答を見る維持） | **完了** |
| `pnpm validate` / `pnpm build` | **OK** |
| main push → GitHub Pages | **実施**（本レポート作成時点で push 予定） |

---

## 2. 第 1 部（v7-scope-questions 回答）

| # | 対応 |
|---|---|
| 1 | `schema_version` / ドキュメントを **1.2.3** に統一 |
| 2 | nuance_contrast 品質 → 触らず（設計チャット） |
| 3 | 空 example スロット維持 |
| 4 | confusables/errors 役割 → 触らず |
| 5 | IPA 連結タブ削除は維持（データ残置） |
| 6 | i18n `hypernyms` / `hyponyms` 削除 |
| 7 | GAS 再デプロイなし |
| 8 | `app-specification.md` → **v3.2** + 改訂ノート |

---

## 3. 第 2 部（Mode A/B UI）

### 3.1 削除

- セッションタイマー（`useSessionTimer` 利用を Mode A/B から除去）
- 中断ボタン（`AppFooter` を次へ専用に変更）
- 「出会い N 回」表示
- 上部中央 CEFR バッジ
- 代わりにヘッダー右に **× 閉じる**（ホームへ）

### 3.2 追加（サイド / 下部パネル）

- confusables 上位 3（空なら非表示）
- related_uses 上位 3（空なら非表示）
- 学習履歴 ▢▢▢（既存 `CheckmarkRow` を **表示のみ・disabled**）
- 例文（en + ja、空なら非表示）

### 3.3 レイアウト

- `< md`: 縦スクロール（パッセージ → パネル）+ 下部固定 OK/Hold/次へ
- `>= md`: 左パッセージ ~60% / 右パネル ~40%、OK/Hold はパネル内、次へはフッタ

### 3.4 インタラクション

- OK / Hold: トグル（再タップで解除）→ 次へ有効化
- 左スワイプ: 選択済みなら次へ
- キーボード: `O` / `H` / `Space`|`Enter`
- Mode B: 未解答時は Space/Enter で「解答を見る」；解答後にパネル展開

### 3.5 主な変更ファイル

| パス | 内容 |
|---|---|
| `src/features/train/mode-a/ModeAPage.tsx` | 全面刷新 |
| `src/features/train/mode-b/ModeBPage.tsx` | 対称刷新 |
| `src/features/train/components/TargetSidePanel.tsx` | 情報パネル拡張 |
| `src/features/train/components/EvalButtons.tsx` | 新規 |
| `src/features/train/components/ConfusablesInline.tsx` | 新規 |
| `src/features/train/components/RelatedUsesInline.tsx` | 新規 |
| `src/features/train/components/TrainCheckmarks.tsx` | 新規（表示のみ） |
| `src/features/train/hooks/useTrainInteractions.ts` | 新規 |
| `src/components/layout/AppHeader.tsx` | CEFR/タイマー削除、× 追加 |
| `src/components/layout/AppFooter.tsx` | 中断削除、次へ専用 |
| `doc/spec/app-specification.md` | v3.2 |
| `doc/spec/learning-data-schema.json` | version 1.2.3 |

---

## 4. 非スコープ（触っていない）

- ItemDetailModal
- contexts / Insight ロジック変更
- checkmark 機能の拡張・統合
- GAS 本番デプロイ
- 例文・confusables 内容の再生成
- SRS / Mode C / 音声

---

## 5. 残タスク・判断待ち

詳細は `doc/handoff/v8-scope-questions.md` および下記。

| 優先 | 内容 | 担当想定 |
|---|---|---|
| 高 | 132 空 example スロット補充 | 設計チャット |
| 高 | confusables / common_errors 役割整理 | 設計チャット |
| 中 | Mode A/B 学習履歴 ▢ を操作可能にするか | Naoya 判断（現状 disabled） |
| 低 | GAS enrich プロンプト本番デプロイ | Naoya 判断 |
| 低 | 実機ブラウザ網羅確認（指示 DoD の全端末） | 手動 |

---

## 6. 検証

```bash
pnpm validate   # OK（既存 warnings のみ）
pnpm build      # OK
```

Pages: https://nkhippo.github.io/English-Vocab-Chunk-Trainer/
