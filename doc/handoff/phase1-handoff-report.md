---
id: pj-2026-07-08-48dc
aliases:
- pj-2026-07-08-48dc
title: Phase 1 作業結果ハンドオフレポート
created: '2026-07-08'
---
# Phase 1 作業結果ハンドオフレポート

対象リポジトリ: [`nkhippo/English-Vocab-Chunk-Trainer`](https://github.com/nkhippo/English-Vocab-Chunk-Trainer)  
作成日: 2026-07-08  
最終更新: 2026-07-09（パイロット v2・GAS v19・UX テスト合格）  
目的: Claude / 他エージェントへの作業共有（実装内容・指示書からの差分・残課題）

仕様の唯一のソース: `doc/spec/app-specification.md`  
Phase 1 指示書: `doc/instructions/cursor-instruction-phase1.md`  
構成の正本: `doc/repository-structure.md`  
関連: `doc/handoff/step1-3-handoff-report.md` / `doc/handoff/pilot-test-handoff-report.md`

---

## 1. このチャットで対応した内容

### 1.1 リポジトリ初期化・ドキュメント整理

- 空フォルダを Git 初期化し、`origin` を GitHub リポジトリに接続
- `doc/` 内の設計書を分かりやすい名前にリネーム
  - `vocab_app_spec_v3_final.md` → `app-specification.md`
  - `data-schema.json` → `learning-data-schema.json`
- `doc/repository-structure.md`（構成表）を新規作成
- Cursor Phase 1 指示書を `doc/instructions/cursor-instruction-phase1.md` として格納（パス注記付き）

### 1.2 Phase 1 実装（Task 1〜10 相当）

| 領域 | 実装内容 |
|---|---|
| PWA 骨格 | Vite + React + TypeScript + Tailwind v4 + `vite-plugin-pwa` |
| 配布 | GitHub Actions → GitHub Pages（`base: /English-Vocab-Chunk-Trainer/`） |
| UI シェル | `AppLayout`、ルート `/` `/train` `/browse` `/review` `/settings` |
| i18n | `react-i18next`（ja/en）、LocalStorage 永続 |
| ガイドモーダル | 6 ページステッパー（`src/content/guide/pages.ts`） |
| browse | CEFR タブ + IndexedDB（Dexie）件数表示（検索・詳細は未） |
| 検証 UI `/review` | Y/N/1–6/E/←→、LocalStorage レジューム、validated JSON エクスポート |
| データ CLI | `scripts/pipeline/generate-seed.ts` ほか enrich / examples / merge / validate-schema |
| GAS | `gas/*.js` + Drive 貼り付け用 `gas/drive-paste/Code.gs` |
| ドキュメント | `README.md` / `CLAUDE.md` |

### 1.3 GAS デプロイ連携

1. Apps Script API 未有効のため `clasp create` は失敗 → Drive 手動デプロイ手順と結合 `Code.gs` を用意
2. Naoya がスタンドアロン GAS + Script Properties（`ANTHROPIC_API_KEY`）を設定
3. Web App URL を `.env`（gitignore）/ `.env.example` / `.env.production` / `gas/README.md` に反映
4. **現行 Web App URL**（2026-07-09 Naoya 手動デプロイ。CORS + Opus 4.7 + プロンプト修正反映）:

```
https://script.google.com/macros/s/AKfycbzXBNFUfmG6dTbHhw4xNI-n_gB0QYNL-dYpddSHEK9Pe4a-4hp-CmhjL4c8iTPcPqsU/exec
```

5. 疎通確認（現行 URL）
   - GET health: OK
   - `?origin=https://nkhippo.github.io`: OK
   - `?origin=https://evil.example.com`: `403 origin_forbidden`
   - POST `generate-seed`（Opus 4.7）: OK
6. **clasp 紐付け**（2026-07-09）: Apps Script API ON → `.clasp.json` → `clasp push` 済み。本番公開は **エディタ「新バージョン」デプロイを優先**（`clasp deploy -i <本番ID> -V <N>` は 404 を誘発しやすい）

### 1.4 doc / scripts 再構成・パイロット（2026-07-09 追記）

- `doc/` を `spec/` `ops/` `instructions/` `handoff/` に整理。入口は `doc/repository-structure.md`
- `scripts/` を `pipeline/` + `lib/` + `build-gas-paste.ts` に整理
- **パイロット v1**（8 件）: NG → `pilot-test-handoff-report.md`
- **パイロット v2**（8 件）: 全 DoD OK → `data/current` **11 件** → `pilot-retry-handoff-report.md`
- **GAS**: clasp 運用 + 手動デプロイ **v19**（`AKfycbzXBNFU...`）
- **UX**: スモークテスト合格（`doc/ops/ux-smoke-test-checklist.md`）
- **i18n**: `doc/ops/i18n-strategy.md`（3 層モデル）

### 1.5 モデル ID 点検（存在しないモデル事故の予防）

| 用途 | コード上の ID | 公式（2026-07-08） | 実呼び出し |
|---|---|---|---|
| Build 系 | `claude-opus-4-7` | 現行 Build（2026-07-09 移行） | generate-seed OK（新デプロイ） |
| 判定系 | `claude-haiku-4-5-20251001` | **現行 Haiku 正式 ID** | validate-cefr OK |

**結論**: 存在しないモデル ID はない。任意で Build を `claude-opus-4-8` に上げる余地はあるが必須ではない。

### 1.6 主要コミット（main）

| SHA | 内容 |
|---|---|
| `d99bff8` | 設計 docs リネーム + 構成表 |
| `976fbdb` | Phase 1 PWA / pipeline / GAS ソース |
| `ec1c58b` | 初回 Web App URL 配線 |
| `6f39353` | 再デプロイ URL・doc・本ハンドオフ初版 |
| `1935f90` | Step 1〜3: CORS / Opus 4.7 / A2 seed ツール |
| `7f5531d` | doc/scripts 再構成・パイロット・GAS プロンプト修正 |
| `7f16c69` | GAS 本番 URL 更新（手動デプロイ反映） |
| `a1fba80` | スキーマ v1.1 パイロット v2・11 件マージ |
| `720ef4c` | i18n 方針 + `/review` ラベル多言語化 |

---

## 2. Cursor 指示書からそれた実装と理由

指示書原文は `docs/`・仮リポジトリ名・仮 base path を前提としていた。**仕様書優先**および既存 `doc/`・実 GitHub 名との整合のため、以下を意図的に変更した。

| # | 指示書 | 実装 | 理由 |
|---|---|---|---|
| 1 | ドキュメントを `docs/` 配下に配置 | 既存の **`doc/`** を継続使用 | 既にリネーム済みの設計書群があり、二重管理を避ける |
| 2 | `docs/spec.md` | `doc/spec/app-specification.md` | 内容が分かる命名を維持 |
| 3 | `docs/data-schema.json` | `doc/spec/learning-data-schema.json` | 同上。検証スクリプトもこのパスを参照 |
| 4 | GitHub Pages base `/vocab-chunk-trainer/` | **`/English-Vocab-Chunk-Trainer/`** | 実リポジトリ名に合わせないと Pages が 404 になる |
| 5 | 対象 repo `nkhipko/vocab-chunk-trainer` | **`nkhippo/English-Vocab-Chunk-Trainer`** | ユーザー指定の実リポジトリ |
| 6 | GAS を clasp で作成・push（必須寄り） | **clasp push + 手動デプロイ v19**（推奨運用に移行） | Phase 1 は Drive 手動で開始。2026-07-09 に clasp 分割ファイル運用へ |
| 7 | `pnpm-workspace.yaml` で monorepo 前提に見えるが、指示構造は単一 app | ルート単一パッケージ。`pnpm-workspace.yaml` は **esbuild onlyBuiltDependencies** 用でワークスペース分割はない | pnpm v10 の build script 許可のため |
| 8 | 検証 UI が `data/staging/*.json` を直接読み書き | ブラウザからは **ファイル選択 + LocalStorage + JSON ダウンロード** | ブラウザがローカル `data/staging/` に直接書けないため。CLI で staging に配置する運用と併用 |
| 9 | `scripts/validate-cefr.ts` を別ファイル | CEFR 再試行は **`generate-examples.ts` 内**、スキーマ検証は `validate-schema.ts` | 指示の「validate-cefr 呼び出し」は満たしつつファイル分割を簡略化 |
| 10 | Phase 1 DoD: A2 データ 100 件以上を `data/current` | 現状 **11 件**（パイロット 8 + サンプル 3）。本生成は GO 待ち | パイロット v2 OK。`batch:a2-seeds` は Naoya GO 後 |

矛盾として止めた事項はなし（仕様書と指示書の致命的衝突は検出していない）。

---

## 3. Task / DoD チェックリスト

### 3.1 指示書 Task

| Task | 状態 | メモ |
|---|---|---|
| 1 PWA 骨格 | 完了 | `pnpm build` / PWA plugin / Pages workflow |
| 2 UI シェル | 完了 | ライトテーマのみ |
| 3 日英切替 | 完了 | |
| 4 ガイドモーダル | 完了 | |
| 5 パイプライン scripts | 完了 | GAS URL 設定済みなら実行可 |
| 6 検証 UI | 完了 | 上記 #8 の制約あり |
| 7 GAS | 完了 | `clasp push` 済み。本番はエディタ手動デプロイ |
| 8 browse 骨格 | 完了 | |
| 9 CLAUDE.md | 完了 | |
| 10 README | 完了 | |

### 3.2 Phase 1 全体 DoD

| 項目 | 状態 |
|---|---|
| Pages で PWA 稼働・iPhone ホーム追加 | **Pages 配信・UX スモークテスト合格**。iPhone ホーム追加は未確認 |
| 日英切替 | 完了（方針: `doc/ops/i18n-strategy.md`） |
| ガイド 6 ページ | 完了 |
| GAS 5 エンドポイント + キャッシュ | **v19 稼働確認済み** |
| `generate:seed` コマンド動作 | GAS 疎通済み |
| 検証 UI で 100 件処理 | **未**（サンプル・パイロット規模のみ） |
| `data/current` に A2 ≥100 件 | **未**（11 件。本生成 GO 待ち） |
| スキーマ検証自動化 | 完了（`pnpm run validate`・v1.1.0） |

---

## 4. 残課題（優先度順）

### P0 — Phase 1 クローズに必要

1. ~~**パイロット再テスト**~~ → **完了**（v2・11 件マージ）
2. **A2 本生成 GO** → `batch:a2-seeds` → `/review` → enrich / examples / merge（2,430 件）
3. iPhone Safari でホーム画面追加の実機確認（任意）

### P1 — 運用・品質

4. ~~Apps Script API + clasp push~~ → **完了**
5. Build モデルを **`claude-opus-4-8` に上げるか**方針決定（現状 4.7 で問題なし）
6. ~~GAS CORS~~ → **完了**
7. ~~`data/current` 二重管理~~ → **完了**
8. ~~register `informal` vs `casual`~~ → **決定済み**（`informal` 統一・スキーマ v1.1）
9. `/review` UI 情報設計の改善 → **Phase 2 以降**（UX テストでレイアウト改善は保留と合意）

### P2 — Phase 2（指示書どおり前倒ししない）

8. Mode A / B / C 学習画面
9. SRS（FSRS）
10. browse 検索・詳細
11. GAS `/review-writing`
12. ダークモード検討

---

## 5. Claude への申し送り（作業再開時）

1. **仕様書 `doc/spec/app-specification.md` を唯一のソース**とし、指示書と矛盾したら Naoya に報告して止める。
2. パスは **`doc/`**、base は **`/English-Vocab-Chunk-Trainer/`**、スキーマは **`learning-data-schema.json`** を正とする（本レポート §2）。
3. Claude API は **必ず GAS 経由**。キーは Script Properties のみ。フロントに置かない。
4. 現行 GAS URL は `gas/README.md` / `.env.production` を参照。URL が変わったら三箇すべてを更新する。
5. Phase 2 機能を「ついで」で実装しない。
6. データ増加時は `doc/ops/data-operations-guide.md` と本構成表を更新する。
7. パイロット・本生成の進捗は `doc/handoff/pilot-retry-handoff-report.md` を参照。
8. i18n 方針は `doc/ops/i18n-strategy.md`。UX テストは `doc/ops/ux-smoke-test-checklist.md`。

---

## 6. クイックコマンド

```bash
pnpm install
pnpm dev          # http://localhost:5173/English-Vocab-Chunk-Trainer/
pnpm build
pnpm run validate
pnpm run generate:seed -- --cefr=A2 --category=collocation --batch=30
curl -sL "$GAS_ENDPOINT_URL"
```
