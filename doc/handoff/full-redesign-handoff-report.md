---
id: pj-2026-07-10-c9ca
aliases:
- pj-2026-07-10-c9ca
title: 全面刷新（ERT トーン + Mode A/B 再設計）作業報告
created: '2026-07-10'
---

# 全面刷新（ERT トーン + Mode A/B 再設計）作業報告

対象: `nkhippo/English-Vocab-Chunk-Trainer`  
指示書: `/Users/naoya.k/Downloads/cursor_instruction_full_redesign.md`（v5）  
参考: `english-reader-trainer`（product-overview / claude-api / index.html）  
最終更新: 2026-07-10  
ブランチ: `feature/full-redesign-ert` → `main`

---

## 1. サマリ

| 項目 | 結果 |
|---|---|
| 段階 1: ERT トーン基盤 + 単語帳刷新 | **実装済み** |
| 段階 2: Mode A（文脈型） | **実装済み** |
| 段階 3: Mode B（穴埋め型） | **実装済み** |
| スキーマ `contexts[]` / v1.2.0 | **反映済み** |
| パッセージデータ | **11 件 × 5 = 55 本**（指示の 8×5=40 を全 item に拡張） |
| 旧 4 択 Mode A / 旧想起 Mode B / quiz distractor | **削除済み** |
| SRS / Mode C / checkmark 量産統合 / GAS Runtime | **未実装**（スコープ外どおり） |
| `pnpm validate` | **OK**（既存 warning のみ） |
| `pnpm build` | **OK** |
| GitHub Pages | main push 後に Actions で公開 |

指示書は段階ごとに GO 判定を求めていましたが、依頼どおり **3 段階を一括実装 → main マージ → Pages 公開** まで完了しています。実機確認後の微調整は別途対応可能です。

---

## 2. 段階 1 — ERT トーン基盤

### 削除

- `src/features/train/mode-a/`（旧 4 択）
- `src/features/train/mode-b/`（旧想起）
- `src/components/item-detail-modal/`（旧版 → 再作成）
- `src/lib/quiz/`（distractor / 重み付き出題）

### デザインシステム

| 項目 | 内容 |
|---|---|
| Fonts | Crimson Pro + Inter（`index.html` Google Fonts） |
| Colors | `--color-bg-base` ほか指示書 §4.2 の ERT パレット（`src/styles/index.css`） |
| レイアウト | バーガーメニュー + SideNav、Mode A/B はフルハイト reader |

### 刷新した画面

| 画面 | パス |
|---|---|
| シェル | `AppLayout` / `AppHeader` / `AppFooter` / `SideNav` |
| UI  primitive | `Button` / `Modal` |
| ホーム | `HomePage` |
| 学習ハブ | `TrainPage` |
| 単語帳 | `BrowsePage`（2 列カード） |
| 詳細モーダル | `ItemDetailModal`（セクション A〜G 配置は前回踏襲、トーンのみ ERT） |
| 設定 / ガイド | `SettingsPage` / `GuideModal` |
| 検証 UI | カラートークンのみ ERT 寄せ |

---

## 3. 段階 2 — Mode A（文脈型）

| パス | 役割 |
|---|---|
| `src/features/train/mode-a/ModeAPage.tsx` | パッセージ + ハイライト + サイドパネル |
| `src/features/train/components/TargetSidePanel.tsx` | surface / IPA / 訳 / 例文 / OK・保留 |
| `src/lib/passage-history/index.ts` | `vct_passage_history_v1` |
| `src/lib/train/passage.ts` | ハイライト・穴埋め生成 |

### 挙動

- 11 件からランダム出題（直前 item は除外）
- 対象語を `target_span` でイエローハイライト
- 右パネル（モバイルは下）に詳細 + ✓ OK / △ 保留
- 評価後に「次へ →」有効化
- 「次へ」で passage 遭遇を localStorage 記録（未遭遇優先）
- ヘッダー: CEFR + 表示専用タイマー / フッター: 中断・次へ

---

## 4. 段階 3 — Mode B（穴埋め型）

| パス | 役割 |
|---|---|
| `src/features/train/mode-b/ModeBPage.tsx` | 日本語訳 + cloze + 解答表示 |

### 挙動

- Mode A と同じ `contexts[]`、履歴は `mode_b` で独立
- 上: `text_ja` / 下: `cloze_spans` を `xx`/`yy`/`zz` で置換
- 「解答を見る」→ 穴を埋め、`target_span` をハイライト、サイドパネル表示
- OK / 保留 → 「次へ →」

---

## 5. データ / スキーマ

| 項目 | 内容 |
|---|---|
| `doc/spec/learning-data-schema.json` | `context` definition + `contexts`（min/max 5）、version **1.2.0** |
| `src/types/learning.ts` | `ItemContext` / `ClozeSpan` / `TextSpan` |
| `scripts/lib/validate.ts` | span 範囲・answer 一致・5 件必須チェック |
| `data/current/items.json` | schema 1.2.0、全 11 item に `contexts[5]` |
| 生成スクリプト | `scripts/merge-contexts.py`（再生成用） |
| Dexie | schema_version 不一致時にバンドル再同期（`src/lib/db/index.ts`） |

パッセージは設計チャット提供前のため、Cursor 側で A2 向けの短い文脈パッセージを手書き生成しています。品質レビュー後の差し替えを想定。

---

## 6. ナビゲーション

| 画面 | GitHub Pages |
|---|---|
| ホーム | https://nkhippo.github.io/English-Vocab-Chunk-Trainer/ |
| Mode A | `/train/mode-a` |
| Mode B | `/train/mode-b` |
| 単語帳 | `/browse` |
| 学習ハブ | `/train` |

ローカル: `pnpm dev` → `http://localhost:5173/English-Vocab-Chunk-Trainer/`

---

## 7. Definition of Done チェック

### 段階 1

- [x] 旧 UI 削除
- [x] Crimson Pro / ERT パレット
- [x] ホーム・単語帳・詳細モーダル・設定・ガイド刷新
- [x] `pnpm build` OK
- [x] main へマージ・push（本報告と同時）

### 段階 2

- [x] `contexts[]` + パッセージ投入（11×5）
- [x] Mode A ハイライト / サイドパネル / OK・保留 / 次へ
- [x] 未遭遇優先 + localStorage
- [x] モバイル上下分割レイアウト

### 段階 3

- [x] Mode B 日本語 + cloze / 解答表示
- [x] mode_b 履歴独立
- [x] OK・保留 → 次へ

### 全体

- [x] 旧緑基調 UI 削除、ERT トーン統一
- [x] スキーマ v1.2.0
- [x] ハンドオフレポート（本ファイル）
- [x] `doc/repository-structure.md` 更新

---

## 8. Naoya への確認依頼

1. ERT トーン（ベージュ + Crimson Pro）の印象
2. Mode A: パッセージからの意味推測が学習体験として成立するか
3. Mode B: 穴埋め → 解答表示の操作感
4. 単語帳詳細の情報配置（前回と同じか）
5. パッセージ文面の自然さ（差し替え候補があれば指示ください）

気に入らない箇所があれば、色・行間・穴の見た目は微調整可能です。checkmark 統合・SRS は別指示で実装予定です。

---

## 9. 残課題（スコープ外）

- SRS フル実装
- Mode C
- checkmark を新 Mode A/B 評価フローへ統合
- GAS Runtime でのパッセージ動的生成
- 設計チャット提供の正式 40 本への差し替え（現状は Cursor 生成 55 本）
