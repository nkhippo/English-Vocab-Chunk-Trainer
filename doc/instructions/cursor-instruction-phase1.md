# Cursor 作業指示書 v1 - Phase 1

対象リポジトリ: `nkhippo/English-Vocab-Chunk-Trainer`（指示書原文の `nkhipko/vocab-chunk-trainer` から実リポジトリ名に置換）

> **実装結果・指示書からの差分・残課題**は `doc/handoff/phase1-handoff-report.md` を参照（2026-07-08）。  
> **稼働 GAS**: `https://script.google.com/macros/s/AKfycbz_94XYG6UzI4v5Na6VF-_yxnG5VWmit3KceNhHJiFZjGvbJKp6m-RnEYXdaV4hnlIH/exec`

> **パス注記（本リポジトリ）**  
> 指示書の `docs/` は既存の `doc/` を使用する。  
> - `docs/spec.md` → `doc/spec/app-specification.md`  
> - `docs/data-schema.json` → `doc/spec/learning-data-schema.json`  
> - GitHub Pages base → `/English-Vocab-Chunk-Trainer/`

## 参照ドキュメント(必読)

以下を `doc/` 配下に配置してから本作業を開始する:

- `doc/spec/app-specification.md` = 仕様の唯一の参照ソース
- `doc/spec/learning-data-schema.json`(データベーススキーマ)
- `doc/ops/data-operations-guide.md`(運用手順)
- `doc/ops/claude-api-gas-design.md`(GAS 経由 Claude API 設計)

**本指示書と仕様書の内容に矛盾がある場合は仕様書が優先**。矛盾を検出した場合は実装を止めて Naoya に報告すること。

---

## 全体ゴール

Phase 1 は以下を成し遂げる:

1. **PWA 骨格の構築**: Vite + React + TypeScript + Tailwind、Service Worker 対応、GitHub Pages でデプロイ可能な状態
2. **UI シェルの準備**: レイアウト、ルーティング、日英切り替え、ガイドモーダル、デザイントークン
3. **データパイプラインの構築**: GAS 経由 Claude API 呼び出し、seed 生成 → 検証 → enrichment → マージのフロー
4. **検証 UI(社内ツール)の構築**: 生成されたデータを Naoya が高速に採用/却下判定できる Web UI

**非ゴール(Phase 1 では実装しない)**:
- Mode A/B/C の学習画面(Phase 2)
- SRS ロジック(Phase 2)
- CEFR 単語帳ビューの検索・詳細画面(Phase 2、骨格のみ)
- B1 以降のデータ生成(Phase 3 以降)

---

## リポジトリ構造(推奨)

> **本リポジトリの実配置**は `doc/repository-structure.md` を正とする（`doc/spec/` `doc/ops/` `doc/instructions/` `doc/handoff/`、`scripts/pipeline/` 等）。以下は指示書原文の推奨ツリー。

```
vocab-chunk-trainer/
├── docs/
│   ├── spec.md
│   ├── data-schema.json
│   ├── data-operations-guide.md
│   └── claude-api-gas-design.md
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   └── main.tsx
│   ├── components/
│   │   ├── layout/
│   │   ├── guide-modal/
│   │   └── language-toggle/
│   ├── features/
│   │   ├── train/               # Phase 2 で実装
│   │   ├── browse/              # 骨格のみ
│   │   └── review/              # 検証 UI
│   ├── lib/
│   │   ├── db/                  # IndexedDB (Dexie 想定)
│   │   ├── gas-client/          # GAS エンドポイント呼び出し
│   │   └── i18n/                # 日英切り替え
│   ├── data/
│   │   └── current/             # 生成データ(Git 管理)
│   └── styles/
├── scripts/
│   ├── generate-seed.ts
│   ├── enrich-items.ts
│   ├── generate-examples.ts
│   ├── validate-cefr.ts
│   ├── merge-data.ts
│   └── validate-schema.ts
├── gas/                          # GAS ソース(clasp 管理推奨)
│   ├── main.js
│   ├── prompts/
│   └── cache.js
├── public/
│   ├── manifest.webmanifest
│   └── icons/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── CLAUDE.md
└── README.md
```

---

## タスク一覧

### Task 1: PWA 骨格の構築

**Definition of Done**:
- [ ] Vite + React + TypeScript プロジェクトが起動する
- [ ] Tailwind CSS が動作する
- [ ] PWA Manifest + Service Worker(`vite-plugin-pwa` 使用)
- [ ] GitHub Pages に自動デプロイする GitHub Actions ワークフロー
- [ ] `pnpm dev` で開発サーバ起動、`pnpm build` で本番ビルド
- [ ] iPhone(Safari)でホーム画面追加 → オフライン起動できる

**技術選定**:
- パッケージマネージャ: pnpm
- ルーティング: React Router v6
- 状態管理: Zustand
- IndexedDB: Dexie.js
- PWA: vite-plugin-pwa
- スタイル: Tailwind CSS

**注意**:
- 既存の Structure Trainer / IPA Trainer の設定を可能な限り流用する
- ベースパス設定を GitHub Pages 用に忘れずに(`/vocab-chunk-trainer/`)

---

### Task 2: デザイントークンと UI シェル

**Definition of Done**:
- [ ] Tailwind の theme をカスタマイズし、色・タイポグラフィのトークンを定義
- [ ] `AppLayout` コンポーネント(ヘッダー + サイドナビ + メインコンテンツ)
- [ ] レスポンシブ対応(モバイル: サイドナビは折りたたみ、デスクトップ: 常時表示)
- [ ] ルート:
  - `/` トップ(将来のダッシュボード、Phase 1 は空 or 説明のみ)
  - `/train` 学習モード入口(Phase 1 はプレースホルダー)
  - `/browse` CEFR 単語帳(Phase 1 は骨格のみ、検索・詳細は Phase 2)
  - `/review` 検証 UI(Task 6 で実装)
  - `/settings` 設定(言語切り替え等)

**デザイン方針**:
- ミニマルで読みやすさ優先
- IPA 表示にモノスペースフォント(例: JetBrains Mono, Fira Code)
- 日本語表示は Noto Sans JP など日本語向けを指定
- ダーク/ライト切り替えは Phase 2 以降で検討(Phase 1 はライトのみ)

---

### Task 3: 日英切り替えとガイドモーダル

**Definition of Done**:
- [ ] `i18n` ライブラリ導入(`react-i18next` 推奨)
- [ ] `ja` / `en` の 2 ロケール、翻訳キー方式で全 UI テキストを管理
- [ ] 設定画面 or ヘッダーからトグル切り替え
- [ ] LocalStorage に選択を保存、次回起動時に反映
- [ ] 初期言語は日本語
- [ ] ガイドモーダル(Task 4 参照)

---

### Task 4: ガイドモーダルの実装

**Definition of Done**:
- [ ] 初回起動時に自動表示、以降は「ヘルプ」から呼び出し可能
- [ ] 以下 6 ページのステッパー形式(前へ/次へ、スキップ可)
  1. アプリの目的: 何を学ぶ、何を学ばない
  2. モード解説: Mode A/B/C の目的と使い分け
  3. CEFR とレベル選択の意味
  4. 書籍(Basic 2400)との連携方法
  5. SRS の仕組み
  6. IPA と発音、IPA Trainer との連携
- [ ] 日英両対応
- [ ] 「完了」で LocalStorage にフラグ保存、次回以降は自動表示しない
- [ ] コンテンツは `src/content/guide/` に MDX or JSON で分離

**設計意図**: Naoya が半年後・1 年後に触った時に設計意図を再確認できるようにする。

---

### Task 5: データパイプラインスクリプトの実装

`scripts/` 配下に Node.js(TypeScript)スクリプトを作成。全て GAS エンドポイント経由で Claude API を呼ぶ(直接 Anthropic API を叩かない)。

#### 5.1 `scripts/pipeline/generate-seed.ts`

```
pnpm run generate:seed --cefr=A2 --category=collocation --batch=30
```

- `.env` から `GAS_ENDPOINT_URL` を読む
- `POST /generate-seed` を叩く
- 既存 `data/current/items.json` の ID を `existing_ids` に含める
- 出力: `data/staging/{cefr}_{category}_seeds.json`
- レート制御: リクエスト間 1 秒

#### 5.2 `scripts/pipeline/enrich-items.ts`

```
pnpm run generate:enrichment --input=data/staging/A2_validated.json
```

- 検証済みデータの各項目に対し `POST /enrich-item` を叩く
- レスポンスをマージ
- 出力: `data/staging/{同じファイル名}_enriched.json`
- 途中失敗時のレジューム対応(処理済み ID を記録)

#### 5.3 `scripts/pipeline/generate-examples.ts`

- 各項目に対し `POST /generate-examples` を叩く
- 生成後、`POST /validate-cefr` で自動チェック
- 違反があれば `/generate-examples` を temperature 0.3 で再試行(最大 3 回)
- 3 回失敗時は `data/staging/needs_manual_review.json` に隔離

#### 5.4 `scripts/pipeline/merge-data.ts`

```
pnpm run merge --new=data/staging/A2_final.json --into=data/current/items.json
```

- 新規データを既存にマージ
- 重複 ID があれば警告、`--overwrite` 指定で上書き
- マージ後スキーマ検証を自動実行

#### 5.5 `scripts/pipeline/validate-schema.ts`

- `data/current/items.json` を `doc/spec/learning-data-schema.json` で検証(ajv)
- 参照整合性チェック
- 周辺語彙 CEFR 上限違反の検出
- register 網羅性チェック

**Definition of Done**:
- [ ] 5 つのスクリプト全て動作、CLI 引数を受け取る
- [ ] エラーハンドリング(GAS タイムアウト、JSON パース失敗等)
- [ ] 進捗ログの表示
- [ ] `data/staging/` は `.gitignore` 対象、`data/current/` は Git 管理

---

### Task 6: 検証 UI の実装(社内ツール、`/review` ルート)

Naoya が seed 生成結果を高速に採用/却下判定するための Web UI。

**Definition of Done**:
- [ ] `data/staging/*.json` を読み込み表示
- [ ] 1 項目ずつカード形式で表示、以下を含む:
  - Surface, category, CEFR level, translations_ja
  - collocation_pattern, register, frequency_hint
- [ ] キーボードショートカット:
  - `Y` = 採用
  - `N` = 却下
  - `1〜6` = CEFR レベル修正(A1〜C2)
  - `E` = translations 編集モーダル
  - `←/→` = 前後の項目に移動
- [ ] 判定結果を `data/staging/*_validated.json` にリアルタイム保存
- [ ] 進捗表示: 「120 / 500 (24%)」
- [ ] 一時停止 → 再開時にレジューム
- [ ] 完了時に採用件数のサマリ表示

**設計意図**: 1 項目 15〜20 秒の判断コストに耐えるため、マウス操作なしでキーボードのみで完結。

---

### Task 7: GAS 側の実装(別リポジトリ or `gas/` サブディレクトリ)

`doc/ops/claude-api-gas-design.md`（指示書原文: `docs/claude-api-gas-design.md`）を実装する。

**Definition of Done**:
- [ ] 5 つのエンドポイント全て実装(Phase 1 では `/review-writing` は不要)
- [ ] SHA-256 キャッシュ層
- [ ] Script Properties に API キー保存
- [ ] `clasp` で GAS プロジェクトをコード管理
- [ ] `gas/prompts/` にプロンプトテンプレートを分離
- [ ] エラーレスポンスの統一フォーマット
- [ ] CORS 設定(GitHub Pages ドメイン許可)

---

### Task 8: `browse` ルートの骨格(Phase 2 の下地)

**Definition of Done**:
- [ ] `/browse` にアクセス → CEFR レベルタブ(A1/A2/B1/B2/C1)
- [ ] 各タブで対応するデータ件数を表示
- [ ] 検索フィールド・詳細画面は Phase 2 で実装するため、骨格のみでよい
- [ ] IndexedDB からデータ読み込み

---

### Task 9: CLAUDE.md の作成

リポジトリルートに `CLAUDE.md` を作成。以下を含む:

- プロジェクトの概要(仕様書へのポインタ)
- 使用スタック
- 開発コマンド一覧
- データ運用時の注意事項(仕様書 §運用手順書へのポインタ)
- Cursor 作業時の三大品質基準
  1. 上流ドキュメント品質: 仕様書 v3 を唯一のソースとする
  2. Cursor 指示書品質: 変更時は理由を PR コメントに記述
  3. 運用ドキュメント更新: データ増加時は本手順書に沿う

既存の thinkgrindai の CLAUDE.md 構成に倣うのが望ましい。

---

### Task 10: README.md

- プロジェクト概要
- スクリーンショット(Phase 2 以降で追加、Phase 1 は文字のみ)
- セットアップ手順
- 開発コマンド
- ライセンス(MIT or 決めていなければ TBD)

---

## 実装順序(推奨)

1. Task 1(PWA 骨格)
2. Task 9(CLAUDE.md)+ Task 10(README)
3. Task 2(UI シェル)
4. Task 3(日英切り替え)
5. Task 7(GAS 実装) ← ここで Naoya が Claude API キーを Script Properties に設定
6. Task 5(パイプラインスクリプト)+ Task 6(検証 UI)を並行
7. Task 4(ガイドモーダル)
8. Task 8(browse 骨格)

Task 5 と 7 が最も工数がかかる。ここに集中する。

---

## Phase 1 の Definition of Done(全体)

- [ ] PWA が GitHub Pages で稼働、iPhone でホーム画面追加可能
- [ ] 日英切り替えが全 UI で動作
- [ ] ガイドモーダルが 6 ページで表示される
- [ ] GAS エンドポイント 5 つが稼働、キャッシュも動作
- [ ] `pnpm run generate:seed --cefr=A2 --category=collocation` が動作
- [ ] 検証 UI で 100 件を実際に処理できる
- [ ] `data/current/items.json` にスキーマ準拠の A2 データが 100 件以上入る
- [ ] スキーマ検証・参照整合性・CEFR 上限チェックが自動化されている

---

## Naoya が事前に準備するもの

- [ ] Google Apps Script プロジェクト作成、`clasp` セットアップ
- [ ] Anthropic API キーの取得(まだであれば)
- [ ] Script Properties に `ANTHROPIC_API_KEY` を設定
- [ ] リポジトリのシークレット設定(GitHub Pages デプロイ用)
- [ ] 検証時間の確保(A2 全カテゴリで 12〜15 時間 = 週末 2 日)

---

## 質問がある場合

Cursor は本指示書に従って作業を進めるが、以下の場合は実装を止めて Naoya に確認する:

- 仕様書と本指示書の内容が矛盾する場合
- スキーマ設計上、複数の選択肢があり判断できない場合
- Claude API のプロンプトを大きく変更する必要が生じた場合
- 非ゴール項目を実装する誘惑に駆られた場合(Phase 2 で行うことを前倒しにしない)

---

## 完了報告時に含めてほしい情報

Phase 1 完了時、以下を PR/レポートに含める:

- 各 Task の完了状況(チェックリスト)
- 実際に発生した問題と対応
- Phase 2 で対応が必要な TODO のリスト
- 生成 data の件数と、平均 build 時間
- 次フェーズへの申し送り事項
