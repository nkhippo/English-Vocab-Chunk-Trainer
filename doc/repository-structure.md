# リポジトリ構成表

English Vocab Chunk Trainer のフォルダ・ファイル配置の**正本**。  
AI エージェントは本ファイルを最初に読み、役割ごとのサブツリーへ進む。

最終更新: 2026-07-09（パイロット v2・GAS v19・UX/i18n 整備）

---

## 0. AI エージェント向けクイックリファレンス

### 最初に読むもの（優先順）

| 順 | パス | 内容 |
|---|---|---|
| 1 | `doc/repository-structure.md` | 本ファイル（配置の地図） |
| 2 | `doc/spec/app-specification.md` | **仕様の唯一のソース**（指示書と矛盾したら実装を止めて報告） |
| 3 | `doc/spec/learning-data-schema.json` | LearningItem / Insight JSON スキーマ |
| 4 | `CLAUDE.md` | スタック・コマンド・品質基準の要約 |
| 5 | `doc/handoff/phase1-handoff-report.md` | Phase 1 完了状況・残課題 |
| 6 | `doc/handoff/step1-3-handoff-report.md` | CORS / Opus 4.7 / A2 パイプライン |
| 7 | `doc/handoff/pilot-test-handoff-report.md` | 初回 8 件パイロット（v1・NG・履歴） |
| 8 | `doc/handoff/pilot-retry-handoff-report.md` | パイロット v2（スキーマ v1.1・全 DoD OK・マージ済） |
| 9 | `doc/ops/ux-smoke-test-checklist.md` | 5 分 UX スモークテスト（初見向け） |
| 10 | `doc/ops/i18n-strategy.md` | 多言語 UI 方針（3 層モデル） |

### 現状サマリ（2026-07-09）

| 項目 | 状態 |
|---|---|
| GitHub Pages | https://nkhippo.github.io/English-Vocab-Chunk-Trainer/（Actions デプロイ・稼働中） |
| GAS 本番 | 下記 URL（**v19**・clasp + 手動デプロイ）。CORS + Opus 4.7 |
| `data/current/items.json` | **11 件**（サンプル 3 + パイロット 8・スキーマ v1.1.0） |
| A2 本生成（2,430 件） | **未着手**（パイロット v2 OK・Naoya GO 待ち） |
| UX スモークテスト | **合格**（`doc/ops/ux-smoke-test-checklist.md`） |
| i18n | 方針 `doc/ops/i18n-strategy.md`・`/review` ラベル i18n 化済み |
| Phase 2（Mode A/B/C 等） | 未着手 |

### レイヤー一覧（何を触るか）

```
┌─────────────────────────────────────────────────────────────┐
│  doc/          設計・運用・指示・ハンドオフ（読み取り中心）   │
├─────────────────────────────────────────────────────────────┤
│  src/          PWA フロント（React 19 + Vite + Tailwind v4） │
│  data/         学習データ正本（current）と生成物（staging）   │
├─────────────────────────────────────────────────────────────┤
│  scripts/      データパイプライン CLI（GAS 経由 Claude）      │
│  gas/          GAS Web App（Claude API プロキシ・キャッシュ） │
├─────────────────────────────────────────────────────────────┤
│  .github/      Pages デプロイ（Actions）                      │
│  public/       静的アセット                                   │
└─────────────────────────────────────────────────────────────┘
```

### パスエイリアス・環境変数

| 記法 | 実パス / 用途 |
|---|---|
| `@data` | `data/`（`vite.config.ts` / `tsconfig`） |
| `@data/current/items.json` | PWA がバンドルする学習データ正本 |
| `VITE_GAS_ENDPOINT_URL` | `.env.development`（dev）/ `.env.production`（build）— フロントから GAS 呼び出し |
| `GAS_ENDPOINT_URL` | `scripts/lib/load-env.ts` → `.env` または `.env.example` — パイプライン CLI |

### よく使うコマンド

```bash
pnpm dev                              # ローカル開発
pnpm build                            # 型チェック + 本番ビルド
pnpm run generate:seed -- --cefr=A2 --category=collocation --batch=8
pnpm run generate:enrichment -- --input=data/staging/A2_collocation_validated.json
pnpm run generate:examples -- --input=data/staging/A2_collocation_validated_enriched.json
pnpm run merge -- --new=data/staging/A2_final.json --into=data/current/items.json
pnpm run validate
pnpm run batch:a2-seeds               # A2 全カテゴリ seed 一括（本生成用）
pnpm run build:gas-paste              # gas/drive-paste/Code.gs 生成（手動 GAS フォールバック用）
```

### 触ってはいけないもの

- `src/data/current/` — **置かない**（正本は `data/current/` のみ）
- フロントへの Claude API キー直書き — 必ず GAS 経由
- `data/staging/` — gitignore。コミットしない
- `.clasp.json` — gitignore（ローカル clasp 紐付け）

### 稼働中 GAS Web App

```
https://script.google.com/macros/s/AKfycbzXBNFUfmG6dTbHhw4xNI-n_gB0QYNL-dYpddSHEK9Pe4a-4hp-CmhjL4c8iTPcPqsU/exec
```

URL 変更時は `.env.example` / `.env.development` / `.env.production` / `gas/README.md` / `CLAUDE.md` / 関連 `doc/handoff/*` を揃えて更新する（`.env` は任意・`pnpm run env:sync` で同期可）。

**GAS デプロイ注意**: `clasp push` でソース更新後、本番反映は **Apps Script エディタの「新バージョン」デプロイを優先**。`clasp deploy -i <本番ID> -V <N>` は Web App が 404 になる事例あり（`doc/handoff/pilot-test-handoff-report.md` 参照）。

---

## 1. ディレクトリツリー（現状・Phase 1）

```
english-vocab-chunk-trainer/
├── .github/workflows/deploy-pages.yml
├── .env.example                       # パイプライン既定（GAS URL・コミット可）
├── .env.development                   # Vite dev 用 VITE_GAS_ENDPOINT_URL
├── .env.production                    # Pages ビルド用 VITE_GAS_ENDPOINT_URL
├── .gitignore
├── .claspignore                       # clasp push 時の除外（drive-paste 等）
├── CLAUDE.md                          # AI / 開発者向け要約
├── README.md
├── CHANGELOG.md
├── package.json
├── index.html
├── vite.config.ts
├── tsconfig*.json
│
├── doc/                               # 設計・運用ドキュメント（指示書の docs/ に相当）
│   ├── repository-structure.md        # ★ 本ファイル — 配置の正本・AI 入口
│   ├── spec/                          # プロダクト仕様・データスキーマ
│   │   ├── app-specification.md       #   仕様の唯一のソース
│   │   └── learning-data-schema.json  #   JSON Schema（validate が参照）
│   ├── ops/                           # 運用手順・インフラ設計
│   │   ├── data-operations-guide.md   #   データ生成・SemVer・チェックリスト
│   │   ├── ux-smoke-test-checklist.md #   5分 UX スモークテスト（初見向け）
│   │   ├── i18n-strategy.md           #   多言語 UI 方針（3層モデル）
│   │   └── claude-api-gas-design.md   #   GAS エンドポイント・プロンプト設計
│   ├── instructions/                  # Cursor / 作業指示書
│   │   └── cursor-instruction-phase1.md
│   └── handoff/                       # 作業結果・差分・残課題レポート
│       ├── phase1-handoff-report.md   #   Phase 1 全体
│       ├── step1-3-handoff-report.md  #   CORS / Opus 4.7 / 本生成準備
│       ├── pilot-test-handoff-report.md # 初回パイロット（v1・履歴）
│       └── pilot-retry-handoff-report.md # パイロット v2・DoD OK
│
├── src/                               # PWA 本体
│   ├── app/                           #   main.tsx / App / router
│   ├── components/                    #   layout, guide-modal, language-toggle
│   ├── content/guide/                 #   ガイドモーダル用 Markdown
│   ├── features/                      #   home, train, browse, review, settings
│   ├── lib/                           #   db, gas-client, i18n, stores
│   ├── data/                          #   開発用サンプルのみ（sample-seeds.json）
│   ├── styles/
│   └── types/                         #   learning.ts 等（scripts も参照）
│
├── data/
│   ├── current/                       # 【正本】Git 管理・PWA バンドル元
│   │   └── items.json                 #   現状 11 件（サンプル 3 + パイロット 8）
│   └── staging/                       # 生成物（.gitignore）
│
├── scripts/
│   ├── pipeline/                      # データ生成・検証 CLI
│   │   ├── generate-seed.ts           #   seed 生成（--append 対応）
│   │   ├── enrich-items.ts            #   enrichment
│   │   ├── generate-examples.ts       #   例文生成 + validate-cefr リトライ
│   │   ├── merge-data.ts              #   current へのマージ
│   │   ├── validate-schema.ts         #   スキーマ検証
│   │   └── batch-a2-seeds.ts          #   A2 全カテゴリ一括 seed
│   ├── build-gas-paste.ts             #   gas/drive-paste/Code.gs 結合（Node 用・GAS 本体ではない）
│   └── lib/                           # 共有ユーティリティ
│       ├── utils.ts                   #   GAS 呼び出し・JSON I/O
│       ├── load-env.ts                #   パイプライン env（.env → .env.example）
│       ├── validate.ts                #   Ajv 検証（doc/spec/learning-data-schema.json）
│
├── gas/                               # Google Apps Script（clasp push）
│   ├── README.md
│   ├── main.js                        #   doGet/doPost・CORS origin ゲート
│   ├── cache.js
│   ├── claude.js                      #   Claude API（Opus 4.7、temperature 除外）
│   ├── handlers.js                    #   ビルド系エンドポイント・プロンプト
│   ├── prompts/                       #   プロンプト参照用（doc/ops と対応）
│   └── drive-paste/Code.gs            #   手動デプロイ用結合ファイル（build:gas-paste）
│
└── public/
    ├── favicon.svg
    └── icons/
```

---

## 2. サブツリー別ガイド

### `doc/` — ドキュメント階層

| サブフォルダ | いつ読むか | 主なファイル |
|---|---|---|
| `spec/` | 機能・データ構造を実装・変更するとき | `app-specification.md`, `learning-data-schema.json` |
| `ops/` | データ追加・GAS 変更・デプロイ・UX/i18n テスト | `data-operations-guide.md`, `claude-api-gas-design.md`, `ux-smoke-test-checklist.md`, `i18n-strategy.md` |
| `instructions/` | Phase 作業の元指示を確認するとき | `cursor-instruction-phase1.md` |
| `handoff/` | 何が終わっていて何が残っているか | `phase1-handoff-report.md`, `step1-3-handoff-report.md`, `pilot-test-handoff-report.md`, `pilot-retry-handoff-report.md` |

ルートの `repository-structure.md` だけが `doc/` 直下に残る。これにより「配置を知りたい」クエリは常に同一パスで解決できる。

### `src/` — フロントエンド

| パス | 責務 |
|---|---|
| `src/app/` | エントリ・ルーティング |
| `src/features/*/` | 画面単位の機能（Phase 2 で train Mode A/B/C 等を拡張） |
| `src/lib/db/` | Dexie。初期データは `@data/current/items.json` から投入 |
| `src/lib/gas-client/` | GAS fetch（`?origin=` 付与で CORS 検証） |
| `src/lib/i18n/` | ja / en ロケール + `labels.ts`（列挙値表示） |
| `src/types/learning.ts` | `LearningItem` 型 — **scripts/pipeline も import** |

### `data/` — 学習データ

| パス | Git | 用途 |
|---|---|---|
| `data/current/items.json` | 管理 | アプリがバンドルする正本 |
| `data/staging/*.json` | ignore | seed → enrich → examples の中間生成物 |

フロー: `scripts/pipeline/*` → `data/staging/` → 検証 → `merge` → `data/current/`。

### `scripts/` — データパイプライン

```
batch-a2-seeds ──► generate-seed ──► [人手 /review] ──► enrich-items
                                                              │
                                                              ▼
                                                    generate-examples
                                                     (+ validate-cefr)
                                                              │
                                                              ▼
                         validate ◄── merge-data ◄── staging/*_with_examples.json
                              │
                              ▼
                      data/current/items.json
```

| サブフォルダ | 責務 |
|---|---|
| `pipeline/` | データライフサイクル CLI（`package.json` の `generate:*` / `merge` / `validate` / `batch:a2-seeds`） |
| `build-gas-paste.ts` | `gas/*.js` → `gas/drive-paste/Code.gs` 結合（手動 GAS デプロイ用・**GAS ソースではない**） |
| `lib/` | `utils.ts`（GAS 呼び出し）、`load-env.ts`、`validate.ts`（Ajv） |

### `gas/` — サーバーレス API（ソース正本）

**GAS の実体はルートの `gas/` のみ。** `scripts/` 配下に同名フォルダは置かない（旧 `scripts/gas/` は `scripts/build-gas-paste.ts` へ統合済み）。

| ファイル | 役割 |
|---|---|
| `main.js` | `doGet` / `doPost`、CORS origin ゲート |
| `handlers.js` | ビルド系エンドポイント・プロンプト（**主にここを編集**） |
| `claude.js` | Claude API 呼び出し（Opus 4.7、temperature 除外） |
| `cache.js` | Drive キャッシュ |
| `drive-paste/Code.gs` | **生成物** — `pnpm run build:gas-paste` の出力。手動貼り付け用 |
| `prompts/` | プロンプト参照用（clasp push 対象外） |

clasp の `rootDir` は `gas/`。デプロイは **clasp push + エディタ新バージョン**（推奨）または **build:gas-paste → Code.gs 貼り付け**（フォールバック）。  
エディタに `Code.gs` 1 ファイルだけ見える場合は手動デプロイ経路の名残 — 中身が古い可能性あり。詳細は `gas/README.md`。

---

## 3. 指示書パスとの対応

| 外部指示書 (`cursor-instruction-phase1`) | 本リポジトリ |
|---|---|
| `docs/` | `doc/` |
| `docs/spec.md` | `doc/spec/app-specification.md` |
| `docs/data-schema.json` | `doc/spec/learning-data-schema.json` |
| `scripts/*.ts`（フラット） | `scripts/pipeline/*.ts` + `scripts/lib/` |
| base `/vocab-chunk-trainer/` | `/English-Vocab-Chunk-Trainer/`（実 repo 名） |

指示書と仕様書が矛盾する場合は **仕様書を優先**し、実装を止めて報告する。

---

## 4. Phase 2 以降で追加予定

| 領域 | 追加予定 |
|---|---|
| `src/features/train/` | Mode A / B / C 本体 |
| `src/lib/` | SRS（FSRS） |
| `src/features/browse/` | 検索・詳細 |
| `gas/handlers.js` | `/review-writing` |
| `data/releases/` | SemVer スナップショット（`data-operations-guide` 参照） |
| `doc/migrations/` | スキーマ移行記録 |

---

## 5. 更新ルール

1. **ディレクトリの追加・改名・ファイル移動時** — 本ファイルを必ず更新する。
2. **スキーマ変更時** — `doc/spec/learning-data-schema.json` と `doc/ops/data-operations-guide.md` を更新する。
3. **GAS URL / デプロイ状態変更時** — `.env.example` / `.env.development` / `.env.production` / `CLAUDE.md` / `gas/README.md` / 関連 handoff を更新する。
4. **UI 文言・i18n 方針変更時** — `doc/ops/i18n-strategy.md` と `src/lib/i18n/locales/*.json` を更新する。
5. **指示書パスと異なる判断** — 上記対応表と `CLAUDE.md` に理由を残す。
6. **秘密情報** — API キー・`.clasp.json` はリポジトリに置かない。
