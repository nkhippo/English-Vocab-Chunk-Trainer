# Phase 1 作業結果ハンドオフレポート

対象リポジトリ: [`nkhippo/English-Vocab-Chunk-Trainer`](https://github.com/nkhippo/English-Vocab-Chunk-Trainer)  
作成日: 2026-07-08  
最終更新: 2026-07-09（Pages Actions 配信修正・data 一本化・clasp 紐付け・GAS URL 更新）  
目的: Claude / 他エージェントへの作業共有（実装内容・指示書からの差分・残課題）

仕様の唯一のソース: `doc/app-specification.md`  
Phase 1 指示書: `doc/cursor-instruction-phase1.md`  
構成の正本: `doc/repository-structure.md`

---

## 1. このチャットで対応した内容

### 1.1 リポジトリ初期化・ドキュメント整理

- 空フォルダを Git 初期化し、`origin` を GitHub リポジトリに接続
- `doc/` 内の設計書を分かりやすい名前にリネーム
  - `vocab_app_spec_v3_final.md` → `app-specification.md`
  - `data-schema.json` → `learning-data-schema.json`
- `doc/repository-structure.md`（構成表）を新規作成
- Cursor Phase 1 指示書を `doc/cursor-instruction-phase1.md` として格納（パス注記付き）

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
| データ CLI | `scripts/generate-seed.ts` ほか enrich / examples / merge / validate-schema |
| GAS | `gas/*.js` + Drive 貼り付け用 `gas/drive-paste/Code.gs` |
| ドキュメント | `README.md` / `CLAUDE.md` |

### 1.3 GAS デプロイ連携

1. Apps Script API 未有効のため `clasp create` は失敗 → Drive 手動デプロイ手順と結合 `Code.gs` を用意
2. Naoya がスタンドアロン GAS + Script Properties（`ANTHROPIC_API_KEY`）を設定
3. Web App URL を `.env`（gitignore）/ `.env.example` / `.env.production` / `gas/README.md` に反映
4. **現行 Web App URL**（2026-07-09 clasp push 後の新バージョン。GET health OK）:

```
https://script.google.com/macros/s/AKfycbxKVKogM8dKeHNuNOvjp7M8i9nsEEmtg943VYc5t_yzTtNG7geSN3fOQ3AZ8HBhVXPW/exec
```

（旧 URL `...AKfycbxKVKogM8d...` は無効扱い。`.env*` / docs は新 URL に更新済み）

5. 疎通確認
   - GET health: `{ ok: true, data: { service, paths } }`（新 URL でも再確認済み）
   - POST `generate-seed`: 成功（キャッシュヒット含む・旧デプロイ時）
   - POST `validate-cefr`: 成功（旧デプロイ時）
6. **clasp 紐付け**（2026-07-09）: Apps Script API ON → `.clasp.json`（gitignore）→ `clasp push` 成功。手順は `gas/README.md`

### 1.4 モデル ID 点検（存在しないモデル事故の予防）

| 用途 | コード上の ID | 公式（2026-07-08） | 実呼び出し |
|---|---|---|---|
| Build 系 | `claude-opus-4-6` | Legacy だが **現役** | generate-seed OK |
| 判定系 | `claude-haiku-4-5-20251001` | **現行 Haiku 正式 ID** | validate-cefr OK |

**結論**: 存在しないモデル ID はない。任意で Build を `claude-opus-4-8` に上げる余地はあるが必須ではない。

### 1.5 主要コミット（main）

| SHA | 内容 |
|---|---|
| `d99bff8` | 設計 docs リネーム + 構成表 |
| `976fbdb` | Phase 1 PWA / pipeline / GAS ソース |
| `ec1c58b` | 初回 Web App URL 配線 |
| `6f39353` | 再デプロイ URL・doc・本ハンドオフ初版 |
| `edfe096` | Pages Actions 修正・data `@data` 一本化・clasp・現行 GAS URL |

---

## 2. Cursor 指示書からそれた実装と理由

指示書原文は `docs/`・仮リポジトリ名・仮 base path を前提としていた。**仕様書優先**および既存 `doc/`・実 GitHub 名との整合のため、以下を意図的に変更した。

| # | 指示書 | 実装 | 理由 |
|---|---|---|---|
| 1 | ドキュメントを `docs/` 配下に配置 | 既存の **`doc/`** を継続使用 | 既にリネーム済みの設計書群があり、二重管理を避ける |
| 2 | `docs/spec.md` | `doc/app-specification.md` | 内容が分かる命名を維持 |
| 3 | `docs/data-schema.json` | `doc/learning-data-schema.json` | 同上。検証スクリプトもこのパスを参照 |
| 4 | GitHub Pages base `/vocab-chunk-trainer/` | **`/English-Vocab-Chunk-Trainer/`** | 実リポジトリ名に合わせないと Pages が 404 になる |
| 5 | 対象 repo `nkhipko/vocab-chunk-trainer` | **`nkhippo/English-Vocab-Chunk-Trainer`** | ユーザー指定の実リポジトリ |
| 6 | GAS を clasp で作成・push（必須寄り） | **Drive 手動 + `drive-paste/Code.gs`**（clasp は任意） | Apps Script API が未有効で `clasp create` が失敗。既存トレーナーと同様の手動 Web App デプロイで先行 |
| 7 | `pnpm-workspace.yaml` で monorepo 前提に見えるが、指示構造は単一 app | ルート単一パッケージ。`pnpm-workspace.yaml` は **esbuild onlyBuiltDependencies** 用でワークスペース分割はない | pnpm v10 の build script 許可のため |
| 8 | 検証 UI が `data/staging/*.json` を直接読み書き | ブラウザからは **ファイル選択 + LocalStorage + JSON ダウンロード** | ブラウザがローカル `data/staging/` に直接書けないため。CLI で staging に配置する運用と併用 |
| 9 | `scripts/validate-cefr.ts` を別ファイル | CEFR 再試行は **`generate-examples.ts` 内**、スキーマ検証は `validate-schema.ts` | 指示の「validate-cefr 呼び出し」は満たしつつファイル分割を簡略化 |
| 10 | Phase 1 DoD: A2 データ 100 件以上を `data/current` | 現状は **サンプル 3 件** | GAS 疎通後の本生成・人力検証が未実施（Naoya の週末検証待ち） |

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
| 7 GAS | 完了（手動デプロイ） | clasp 紐付けは未（API 有効化後に任意） |
| 8 browse 骨格 | 完了 | |
| 9 CLAUDE.md | 完了 | |
| 10 README | 完了 | |

### 3.2 Phase 1 全体 DoD

| 項目 | 状態 |
|---|---|
| Pages で PWA 稼働・iPhone ホーム追加 | **未確認**（Actions / Pages ソース有効化・実機はユーザー側） |
| 日英切替 | 完了 |
| ガイド 6 ページ | 完了 |
| GAS 5 エンドポイント + キャッシュ | **稼働確認済み** |
| `generate:seed` コマンド動作 | GAS 疎通済み。CLI 一式は実装済み |
| 検証 UI で 100 件処理 | **未**（サンプルのみ） |
| `data/current` に A2 ≥100 件 | **未**（3 件サンプル） |
| スキーマ検証自動化 | 完了（`pnpm run validate`） |

---

## 4. 残課題（優先度順）

### P0 — Phase 1 クローズに必要

1. **A2 seed 本生成 → `/review` で検証 → enrich / examples → merge**（目標 100 件以上）
2. ~~GitHub Pages を Actions ソースで有効化・workflow 修正~~ → **完了**（`edfe096`。公開 URL でビルド成果物配信を確認済み）。オフライン動作の最終確認はユーザー側。
3. iPhone Safari でホーム画面追加の実機確認

### P1 — 運用・品質

4. ~~Apps Script API + clasp push~~ → **完了**（2026-07-09）。以後は `clasp push` → エディタで新バージョンデプロイ。手順は `gas/README.md`
5. Build モデルを **`claude-opus-4-8` に上げるか**方針決定（現状 `opus-4-6` で問題なし）
| P1-6 GAS CORS | コード完了・**GAS 新バージョンデプロイ待ち**（`doc/step1-3-handoff-report.md`） |
7. ~~`data/current` と `src/data/current` の二重管理~~ → **完了**: 正本は `data/current/` のみ（`@data` alias）

### P2 — Phase 2（指示書どおり前倒ししない）

8. Mode A / B / C 学習画面
9. SRS（FSRS）
10. browse 検索・詳細
11. GAS `/review-writing`
12. ダークモード検討

---

## 5. Claude への申し送り（作業再開時）

1. **仕様書 `doc/app-specification.md` を唯一のソース**とし、指示書と矛盾したら Naoya に報告して止める。
2. パスは **`doc/`**、base は **`/English-Vocab-Chunk-Trainer/`**、スキーマは **`learning-data-schema.json`** を正とする（本レポート §2）。
3. Claude API は **必ず GAS 経由**。キーは Script Properties のみ。フロントに置かない。
4. 現行 GAS URL は `gas/README.md` / `.env.production` を参照。URL が変わったら三箇すべてを更新する。
5. Phase 2 機能を「ついで」で実装しない。
6. データ増加時は `doc/data-operations-guide.md` と本構成表を更新する。

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
