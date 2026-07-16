---
id: pj-2026-07-09-bec2
aliases:
- pj-2026-07-09-bec2
title: 多言語（i18n）実装方針
created: '2026-07-09'
---
# 多言語（i18n）実装方針

最終更新: 2026-07-09  
参照: `doc/spec/app-specification.md` §6.1

Phase 1 UX スモークテスト（`doc/ops/ux-smoke-test-checklist.md`）で、**UI 切替は動くが表示が中途半端**という指摘を受けた。本ドキュメントは今後の実装の正本とする。

---

## 1. 原則：3 層に分けて考える

| 層 | 内容 | 置き場所 | 言語切替 |
|---|---|---|---|
| **A. UI クローム** | ナビ・ボタン・見出し・エラー | `src/lib/i18n/locales/{ja,en}.json` | `t('...')` |
| **B. プロダクト文** | ガイド・Insight テンプレ・ヘルプ | `src/content/**` の `{ ja, en }` または locale JSON | UI 言語に追従 |
| **C. 学習データ** | `surface`, `definition_en`, `translations_ja` 等 | `data/current/items.json`（スキーマ正本） | **locale ファイルに入れない** |

**禁止**: JSX にスキーマキー名（`register`, `collocation_pattern`, `translations_ja`）をそのまま表示する。  
**許可**: データ値そのもの（`take a break`, `休憩する`）は層 C としてそのまま表示。

### 英語 UI 時の学習データ表示（仕様書 §6.1）

| フィールド | 日本語 UI | 英語 UI |
|---|---|---|
| `translations_ja` | 表示 | **非表示**（B1 以降は英英移行） |
| `definition_en` | 補助表示可 | **主表示** |
| `surface` / 例文 `en` | 表示 | 表示 |
| 列挙値（category 等） | ローカライズラベル | ローカライズラベル |

Phase 1 の `/review` は seed 検証用のため `translations_ja` を常時表示してよい。Phase 2 の学習・browse 詳細から上表を適用する。

---

## 2. 技術スタック（現状）

- **react-i18next** — 層 A
- **Zustand `language`** — ガイド（層 B）と同期。`setLanguage` で `i18n.changeLanguage` を呼ぶ
- **ガイド** — `src/content/guide/pages.ts` の `{ title: { ja, en }, body: { ja, en } }`（良い先例）

### 単一の UI 言語ソース

```
設定トグル → setLanguage(lang)
  → i18n.changeLanguage(lang)
  → zustand language（ガイド用）
```

新画面では **必ず `useTranslation()`**。`language` を直接読むのはガイドなど層 B のみ。

---

## 3. locale JSON の命名規約

```
nav.*           ナビゲーション
home.*          画面固有（ホーム）
review.*        検証画面
review.fields.* フィールドラベル（スキーマキーと分離）
browse.*
settings.*
guide.*
enum.category.*   カテゴリ表示名
enum.register.*   register 値
enum.frequency.*  frequency_hint 値
common.*          共通（Phase 表記など）
```

列挙値の表示は `src/lib/i18n/labels.ts` のヘルパー経由に統一する（直 `t(\`enum...\`)` をコンポーネントに散らさない）。

---

## 4. Phase 1 で判明したギャップ（2026-07-09）

| 箇所 | 問題 | 対応 |
|---|---|---|
| `/review` フィールドラベル | `register` 等が英語スキーマキーのまま | `review.fields.*` + ヘルパー（**対応済み**） |
| `/review` カテゴリ | `COLLOCATION` 等が生値 | `enum.category.*`（**対応済み**） |
| ホーム | `Phase 1` ハードコード | `common.phase1`（**対応済み**） |
| `/review` UI 全体 | レイアウト・情報設計 | Phase 2 以降の UX 改修で着手（**意図的に保留**） |
| browse 詳細・train | 未実装 | Phase 2 で層 C 表示ルールを実装 |

---

## 5. Phase 2 以降のチェックリスト

新コンポーネント・新フィールド追加時:

1. ユーザー向け文言は **すべて** `ja.json` / `en.json` または `content/**` の二言語オブジェクト
2. スキーマフィールド名を UI に出さない（`labels.ts` または `review.fields.*`）
3. 学習項目の本文はデータから。英語 UI では `definition_en` 優先（仕様 §6.1）
4. PR 前: `rg` で JSX 内の生文字列・スキーマキーを spot check
5. Insight カード追加時は `content/insights/` 等に `{ ja, en }` パターンを踏襲

---

## 6. 将来の第三言語

仕様書: 韓国語・中国語等は需要次第。  
拡張時は `locales/ko.json` 追加 + ガイドを `Record<Locale, string>` 化。学習データ層 C は変更しない。

---

## 7. 関連ファイル

| パス | 役割 |
|---|---|
| `src/lib/i18n/index.ts` | i18next 初期化 |
| `src/lib/i18n/locales/ja.json` / `en.json` | UI 文言 |
| `src/lib/i18n/labels.ts` | 列挙値・フィールド表示ヘルパー |
| `src/content/guide/pages.ts` | ガイド二言語本文 |
| `doc/spec/app-specification.md` §6.1 | プロダクト要件 |
