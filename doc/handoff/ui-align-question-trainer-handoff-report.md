---
id: pj-2026-07-10-6ef0
aliases:
- pj-2026-07-10-6ef0
title: UI 寄せ作業報告（疑問文トレーナー準拠）
created: '2026-07-10'
---
# UI 寄せ作業報告（疑問文トレーナー準拠）

対象: `nkhippo/English-Vocab-Chunk-Trainer`  
日付: 2026-07-10  
ブランチ: `feature/ui-align-question-trainer` → `main`  
参照 UI: `english-question-trainer`（疑問文トレーナー）

## 1. 方針（事前合意）

| # | 項目 | 決定 |
|---|---|---|
| 1 | 適用範囲 | **A. シェル中心**（背景・ヘッダー／ブランド・ナビ・主要ボタン・トグル・カードのトーン） |
| 2 | ナビ構造 | **サイドバー現状維持**。トップヘッダーを疑問文トレーナー寄せ |
| 3 | 主ボタン色 | **teal を primary のまま**（トーンだけ寄せる） |
| 4 | ブランド | eyebrow `English · Vocab & Chunk Trainer` / wordmark「語彙・チャンクトレーナー」/ loom アイコン流用 |
| 5 | タイポ | UI は **sans**、見出しは **serif（`font-display`）を残す** |

Mode A/B のクイズ内部・Review 詳細フローはトークン継承のみ（個別リデザインは未実施）。

## 2. 実施した作業

| # | 作業 | 結果 |
|---|---|---|
| 1 | `@theme` を暖色紙面パレットへ更新（`--paper` `#eceeea` 系、`--ink` `#20262b`、`--line` `#d9dcd6`、`--shadow-soft`） | 完了 |
| 2 | brand を QT の teal（`#1c6e6a`）へ寄せ、accent orange（`#b5701a`）を追加。lavender グラデ背景を廃止し flat paper | 完了 |
| 3 | `BrandMark`（loom + eyebrow + wordmark + 橙→teal 下線）を新設 | 完了 |
| 4 | `AppLayout` トップヘッダーを BrandMark + LanguageToggle + 3 本レールに変更。サイドバーはナビ専用 | 完了 |
| 5 | `LanguageToggle` / Browse CEFR ピルを QT 風セグメント（soft 背景 + 白浮き active）に変更 | 完了 |
| 6 | Home / Train / Settings / Browse カード・主要 CTA・GuideModal ボタンの角丸・太字・ghost 枠を寄せ | 完了 |
| 7 | i18n に `app.eyebrow` / `app.wordmark` を追加 | 完了 |
| 8 | `pnpm build` | 成功 |
| 9 | `main` へマージし GitHub Pages 向けに push | 本報告作成時点で実施 |

## 3. 主な変更ファイル

- `src/styles/index.css` — デザイントークン・body 背景
- `src/components/brand/BrandMark.tsx` — 新規
- `src/components/layout/AppLayout.tsx`
- `src/components/language-toggle/LanguageToggle.tsx`
- `src/components/guide-modal/GuideModal.tsx`
- `src/components/checkmark-reset/CheckmarkResetButton.tsx`
- `src/features/home/HomePage.tsx`
- `src/features/train/TrainPage.tsx`
- `src/features/settings/SettingsPage.tsx`
- `src/features/browse/BrowsePage.tsx`
- `src/lib/i18n/locales/ja.json` / `en.json`
- `index.html` — `theme-color`

## 4. ビジュアル差分の要点

| 要素 | Before | After |
|---|---|---|
| 背景 | teal/slate/lavender グラデ | flat `#eceeea` |
| ヘッダー | テキストのみの sticky bar | loom + eyebrow + 日本語 wordmark + 3 本レール |
| 言語トグル | 丸 pill + brand 塗り | soft トラック + 白浮き active |
| Primary CTA | teal（旧 `#0f766e`） | teal（`#1c6e6a`）+ bold + 軽い lift |
| カード | `rounded-3xl` 中心 | `rounded-[13–14px]` + `shadow-soft` + hair border |
| 見出し | serif display | **維持**（合意どおり） |

## 5. 確認 URL

GitHub Pages（デプロイ完了後）:

```
https://nkhippo.github.io/English-Vocab-Chunk-Trainer/
```

ローカル:

```bash
pnpm install
pnpm dev
```

## 6. 残課題・次の候補

- Mode A/B・Review・ItemDetailModal の細部を同じトーンに揃える（スコープ B）
- favicon / PWA アイコンを loom 系に更新
- 共通 `Button` / `Card` コンポーネント化（現状はユーティリティ直書き）
- EN ロケールの wordmark は英語名のまま（JA は「語彙・チャンクトレーナー」）。常時日本語 wordmark にするかは要判断

## 7. Claude 向けメモ

- 仕様書（`doc/spec/app-specification.md`）の機能要件は変更していない。見た目のみ。
- Primary は ink ではなく **teal 維持**（ユーザー合意）。ink はテキスト・番号バッジ・ナビ非 active に使用。
- 疑問文トレーナーの CSS 正本は `english-question-trainer/src/App.css`（`--paper` / `--t1` / `--t2` / `--shadow`）。
