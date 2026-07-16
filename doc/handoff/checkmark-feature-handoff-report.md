---
id: pj-2026-07-10-fb49
aliases:
- pj-2026-07-10-fb49
title: チェックマーク機能 作業報告
created: '2026-07-10'
---

# チェックマーク機能 作業報告

対象: `nkhippo/English-Vocab-Chunk-Trainer`  
設計仕様: `checkmark-feature-design.md`（Downloads）  
最終更新: 2026-07-10  
前提: MVP UI マージ済み（`doc/handoff/mvp-ui-handoff-report.md`）

---

## 1. サマリ

| 項目 | 結果 |
|---|---|
| CheckmarkRow（☑️×3） | **実装済み** |
| localStorage ストア `vct_checkmarks_v1` | **実装済み**（in-memory fallback あり） |
| 単語帳統合（カード・モーダル・並び替え・リセット） | **実装済み** |
| Mode A/B 統合（フィードバック時のみ表示・重み付き出題） | **実装済み** |
| モード別リセット（確認ダイアログ + トースト） | **実装済み** |
| `pnpm build` | **OK** |
| `data/current` 変更 | **なし** |
| 重み付けの統計検証（100 回出題） | **未実施**（Naoya 手動確認・§10） |
| エクスポート/インポート | **未実装**（スコープ外） |

---

## 2. 実装概要

### 2.1 新規ファイル

| パス | 役割 |
|---|---|
| `src/components/checkmark-row/CheckmarkRow.tsx` | 3 スロット UI（sm/md/lg・キーボード 0–3） |
| `src/components/checkmark-reset/CheckmarkResetButton.tsx` | モード別一括リセット |
| `src/lib/checkmarks/types.ts` | `CheckmarkCount` / `CheckmarkMode` / `CHECKMARK_WEIGHTS` |
| `src/lib/checkmarks/store.ts` | localStorage CRUD + subscribe |
| `src/lib/checkmarks/hooks.ts` | `useCheckmark` / `useModeCheckmarks` / `useCheckmarkVersion` |
| `src/lib/checkmarks/sort.ts` | `sortByBrowseCheckmarks` |
| `src/lib/quiz/weighted-selection.ts` | `pickWeightedItem`（8/4/2/1） |

### 2.2 改修ファイル

| パス | 変更内容 |
|---|---|
| `src/features/browse/BrowsePage.tsx` | カード右上 sm・並び替え・右上リセット |
| `src/components/item-detail-modal/ItemDetailModal.tsx` | ヘッダーに md CheckmarkRow |
| `src/features/train/mode-a/ModeAPage.tsx` | 回答後 lg・`pickWeightedItem('mode_a')` |
| `src/features/train/mode-b/ModeBPage.tsx` | 解答後 lg・`pickWeightedItem('mode_b')` |
| `src/features/train/TrainPage.tsx` | Mode A/B リセットボタン |
| `src/lib/i18n/locales/ja.json` / `en.json` | `checkmarks.*` キー追加 |
| `src/lib/quiz/index.ts` | `pickWeightedItem` エクスポート |

### 2.3 データモデル

- **キー**: `vct_checkmarks_v1`
- **構造**: `{ schema_version: 1, browse: {}, mode_a: {}, mode_b: {} }`
- **items.json の `srs_state` とは独立**（将来 SRS と並存する別機能）

---

## 3. 動作確認手順（GitHub Pages）

| 画面 | URL | 確認ポイント |
|---|---|---|
| 単語帳 | `/browse` | カード右上で☑️操作→モーダルが開かない／詳細モーダルと同期／0 チェックが上に並ぶ |
| Mode A | `/train/mode-a` | 問題中は非表示→回答後に記録→次問題で重み反映 |
| Mode B | `/train/mode-b` | ヒント中は非表示→解答後に記録 |
| 学習ハブ | `/train` | Mode A/B リセットボタン（他モードに影響しない） |

**DevTools**: Application → Local Storage → `vct_checkmarks_v1`

---

## 4. Definition of Done チェックリスト

### 8.1 CheckmarkRow

- [x] 3 つの▢横並び
- [x] タップ動作（N タップで N 設定 / 再タップで N-1）
- [x] sm / md / lg
- [x] キーボード 0–3
- [x] 空/埋の色分け

### 8.2 ストレージ層

- [x] getStore / getCount / setCount / resetMode / getModeEntries
- [x] in-memory fallback
- [x] JSON パースエラー時の空 store 初期化
- [x] useCheckmark 再レンダ

### 8.3 単語帳

- [x] 一覧カード右上
- [x] カードタップと分離（stopPropagation + レイアウト分離）
- [x] 詳細モーダルヘッダー
- [x] カード↔モーダル同期
- [x] チェック数昇順ソート（同点: frequency_rank → id）

### 8.4 Mode A

- [x] フィードバック画面のみ表示
- [ ] 100 回出題で 0 チェック item が多い（**Naoya 統計確認待ち**）
- [x] excludeId で連続同一回避

### 8.5 Mode B

- [x] 解答表示後に表示
- [x] pickWeightedItem 使用

### 8.6 リセット

- [x] 各モードのリセットボタン
- [x] 確認ダイアログ + キャンセル
- [x] 他モード非影響

### 8.7 その他

- [x] `pnpm build` OK
- [x] 本レポート作成

---

## 5. 残タスク（今後の対応）

| 優先度 | タスク | 備考 |
|---|---|---|
| 高 | 重み付け出題の体感・統計確認 | 設計 §10。0 チェックを多めに出すか Naoya が 50–100 問試行 |
| 中 | チェックマークのエクスポート/インポート | 設計 §9.2。localStorage クリアで喪失 |
| 低 | 3 モード一括リセット | 設計 §6。誤タップリスクのため今回スコープ外 |
| Phase 2 | SRS（`srs_state`）との関係整理 | checkmark と SRS は別概念。統合方針は仕様書更新時に決定 |
| 低 | store / weighted-selection のユニットテスト | 任意。CI 整備時に追加可 |

---

## 6. Claude 向けブリーフィング

1. **目的達成**: Basic 2400 型の手動☑️×3 を browse / mode_a / mode_b で独立管理。チェックが少ない項目を優先出題（8:4:2:1）。
2. **触っていないもの**: `data/current/items.json`、`gas/`、スキーマ JSON。
3. **次のマイルストーン**: Naoya の情報充足度評価（`doc/ops/ux-evaluation-checklist.md`）→ A2 本生成（2,430 件）→ checkmark が 2k+ 件でも sort / weight は O(n log n) で問題なし（設計 §9.1）。
4. **確認依頼**: Mode A で一部 item を 3 チェック・一部 0 のまま 30 問以上回し、0 の方が頻出するか体感確認。

---

## 7. 参照

- 設計仕様: `checkmark-feature-design.md`
- MVP UI 報告: `doc/handoff/mvp-ui-handoff-report.md`
- UX 評価シート: `doc/ops/ux-evaluation-checklist.md`
