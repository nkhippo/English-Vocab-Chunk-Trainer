---
id: pj-2026-07-08-8240
aliases:
- pj-2026-07-08-8240
title: リポジトリ構成表
created: '2026-07-08'
---
# リポジトリ構成表

English Vocab Chunk Trainer のフォルダ・ファイル配置の**正本**。  
AI エージェントは本ファイルを最初に読み、役割ごとのサブツリーへ進む。

最終更新: 2026-07-11（synonym/antonym/related 例文 132 スロット充填・schema 1.2.5）

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
| 11 | `doc/handoff/pilot-v3-handoff-report.md` | パイロット v3（validate-cefr・DoD 一部 NG） |
| 12 | `doc/handoff/pilot-v4-handoff-report.md` | パイロット v4（scene-config・禁止語・DoD OK） |
| 13 | `doc/handoff/mvp-ui-handoff-report.md` | MVP UI（詳細モーダル・Mode A/B） |
| 14 | `doc/handoff/checkmark-feature-handoff-report.md` | チェックマーク（☑️×3・重み付き出題） |
| 15 | `doc/ops/ux-evaluation-checklist.md` | Naoya 向け情報充足度評価シート |
| 16 | `doc/handoff/ui-align-question-trainer-handoff-report.md` | UI を疑問文トレーナー寄せ（シェル） |
| 17 | `doc/handoff/full-redesign-handoff-report.md` | ERT 全面刷新（Mode A/B 再設計・contexts） |
| 18 | `doc/handoff/addendum-v5-1-handoff-report.md` | v5.1（公式 40 contexts・Mode B 下線） |
| 19 | `doc/handoff/v6-improvements-report.md` | v6（モーダル IA・IPA/EPT・Insight） |
| 20 | `doc/handoff/v6-scope-questions.md` | v6 スコープ外の判断待ち事項 |
| 21 | `doc/handoff/v6-pilot10-merge-handoff-report.md` | v6 §5.3 カテゴリパイロット 10 件マージ |
| 22 | `doc/handoff/v6-insight-official-merge-handoff-report.md` | Insight 公式サンプル 3 件差し替え |
| 23 | `doc/handoff/v7-refinement-report.md` | v7（モーダル精緻化・schema 1.2.3） |
| 24 | `doc/handoff/v7-scope-questions.md` | v7 スコープ外の判断待ち |
| 25 | `doc/handoff/v8-mode-a-redesign-report.md` | v8（Mode A/B モバイル最適化） |
| 26 | `doc/handoff/v8-scope-questions.md` | v8 スコープ外の判断待ち |
| 27 | `doc/handoff/confusables-role-separation-handoff-report.md` | confusables/common_errors 役割分離 |
| 28 | `doc/ops/confusables-common-errors-role-separation.md` | 役割分離ガイドライン |
| 29 | `doc/ops/chat-generation-template-a2-v2.md` | A2 量産テンプレート（Claude 添付用） |
| 30 | `doc/ops/chat-generation-workflow-v2.md` | A2 量産運用ガイド（Naoya 用） |
| 31 | `doc/handoff/chat-generation-template-v2-handoff-report.md` | テンプレート v2 取り込み報告 |
| 32 | `doc/handoff/v9-ux-simplification-report.md` | v9 Mode A UX 簡素化・単語帳折衷 |
| 33 | `doc/handoff/v9-scope-questions.md` | v9 判断待ち |
| 34 | `doc/handoff/synonym-examples-fill-handoff-report.md` | 類義語・反意語・関連用法例文埋め込み報告 |
| 35 | `doc/handoff/synonyms_antonyms_related_examples_patches.json` | 例文パッチアーカイブ |
| 34 | `doc/handoff/synonym-examples-fill-handoff-report.md` | 関連語例文 132 スロット充填 |

### 現状サマリ（2026-07-11）

| 項目 | 状態 |
|---|---|
| GitHub Pages | https://nkhippo.github.io/English-Vocab-Chunk-Trainer/（Actions デプロイ） |
| GAS 本番 | **v22**（`AKfycbzTyWCk...`・Sonnet 4.6 + scene-config v4） |
| `data/current/items.json` | **21 件** + Insight 公式 3・schema **1.2.5**（関連語例文 132 スロット充填） |
| UI | 仕様 **v3.3** + v9（Mode A 簡素化・単語帳折衷・詳細任意展開） |
| A2 量産 | テンプレート **v2** 配置済み・本生成は未着手（A2 collocation 9/〜500） |
| Phase 2 残り | SRS / Mode C / 音声・GA-RP / Mode B 本格 UX |

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
https://script.google.com/macros/s/AKfycbzTyWCkXyjXic6JcpLJPf-ltV8mlJrGQ8Ip1bkg8A_Sx5cX_crY3zWGcwPCQW-bur7I/exec
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
│   │   ├── ux-evaluation-checklist.md #   MVP UI 情報充足度評価（Naoya 用）
│   │   ├── i18n-strategy.md           #   多言語 UI 方針（3層モデル）
│   │   ├── confusables-common-errors-role-separation.md  # confusables/errors 役割分離
│   │   ├── chat-generation-template-a2-v2.md  # A2 量産テンプレ（Claude 添付）
│   │   ├── chat-generation-workflow-v2.md     # A2 量産運用ガイド
│   │   └── claude-api-gas-design.md   #   GAS エンドポイント・プロンプト設計
│   ├── instructions/                  # Cursor / 作業指示書
│   │   └── cursor-instruction-phase1.md
│   └── handoff/                       # 作業結果・差分・残課題レポート
│       ├── phase1-handoff-report.md   #   Phase 1 全体
│       ├── step1-3-handoff-report.md  #   CORS / Opus 4.7 / 本生成準備
│       ├── pilot-test-handoff-report.md # 初回パイロット（v1・履歴）
│       ├── pilot-retry-handoff-report.md # パイロット v2・DoD OK
│       ├── pilot-v3-handoff-report.md   # パイロット v3・validate-cefr
│       ├── pilot-v4-handoff-report.md   # パイロット v4・scene-config
│       ├── mvp-ui-handoff-report.md     # MVP UI・Mode A/B
│       ├── checkmark-feature-handoff-report.md  # ☑️×3・localStorage・重み付き出題
│       ├── ui-align-question-trainer-handoff-report.md  # UI 寄せ（疑問文トレーナー）
│       ├── full-redesign-handoff-report.md
│       ├── addendum-v5-1-handoff-report.md
│       ├── v6-improvements-report.md            # v6 IA・IPA・Insight
│       ├── v6-scope-questions.md
│       ├── v7-refinement-report.md              # v7 モーダル精緻化
│       ├── v7-scope-questions.md
│       ├── v8-mode-a-redesign-report.md         # v8 Mode A/B モバイル最適化
│       ├── v8-scope-questions.md
│       ├── confusables-role-separation-handoff-report.md
│       ├── confusables_common_errors_fix_patches.json  # 適用パッチ原本
│       ├── chat-generation-template-v2-handoff-report.md
│       ├── v9-ux-simplification-report.md
│       ├── v9-scope-questions.md
│       ├── synonym-examples-fill-handoff-report.md  # 類義語・反意語・関連用法例文
│       └── synonyms_antonyms_related_examples_patches.json
│
├── src/                               # PWA 本体
│   ├── app/                           #   main.tsx / App / router
│   ├── components/                    #   layout, modal, checkmark, ipa-tabs, insight-card, detail-sections
│   ├── content/guide/                 #   ガイドモーダル用 Markdown
│   ├── features/
│   │   ├── home/
│   │   ├── browse/
│   │   ├── review/
│   │   ├── settings/
│   │   └── train/
│   │       ├── TrainPage.tsx
│   │       ├── mode-a/ModeAPage.tsx   #   文脈読解(v9: 詳細任意・次へ常時)
│   │       ├── mode-b/ModeBPage.tsx   #   穴埋め想起
│   │       ├── hooks/useTrainInteractions.ts
│   │       └── components/
│   │           ├── TargetSidePanel.tsx
│   │           ├── DetailToggleButton.tsx
│   │           └── JaTranslationToggle.tsx
│   ├── lib/                           #   db, gas-client, i18n, checkmarks, passage-history, train, stores
│   ├── data/                          #   開発用サンプルのみ（sample-seeds.json）
│   ├── styles/
│   └── types/                         #   learning.ts 等（scripts も参照）
│
├── data/
│   ├── current/                       # 【正本】Git 管理・PWA バンドル元
│   │   └── items.json                 #   現状 21 件 + insights 公式 3（schema 1.2.5）
│   ├── reference/ept/                 # EPT 参照（wordlist / connected_speech / weak_forms）
│   └── staging/                       # 生成物（.gitignore）
│
├── scripts/
│   ├── pipeline/                      # データ生成・検証 CLI
│   │   ├── generate-seed.ts           #   seed 生成（--append 対応）
│   │   ├── enrich-items.ts            #   enrichment
│   │   ├── generate-examples.ts       #   例文生成 + validate-cefr リトライ
│   │   ├── merge-data.ts              #   current へのマージ
│   │   ├── validate-schema.ts         #   スキーマ検証
│   │   ├── verify-contexts.ts         #   contexts インデックス検証（量産バッチ用）
│   │   ├── sync-ipa-from-ept.ts       #   単語 IPA を EPT から同期
│   │   ├── sync-phrase-ipa-from-ept.ts #  フレーズ connected IPA
│   │   ├── migrate-schema-v1-2-3.ts   #   v7: nuance_contrast / hypernyms 削除
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
│   ├── claude.js                      #   Claude API（Sonnet 4.6 Build、Haiku 判定）
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
| `ops/` | データ追加・GAS 変更・デプロイ・UX/i18n テスト・A2 量産 | `data-operations-guide.md`, `chat-generation-template-a2-v2.md`, `chat-generation-workflow-v2.md`, `confusables-common-errors-role-separation.md`, … |
| `instructions/` | Phase 作業の元指示を確認するとき | `cursor-instruction-phase1.md` |
| `handoff/` | 何が終わっていて何が残っているか | `phase1-handoff-report.md` … `v8-mode-a-redesign-report.md` / `v8-scope-questions.md`（クイックリファレンス表参照） |

ルートの `repository-structure.md` だけが `doc/` 直下に残る。これにより「配置を知りたい」クエリは常に同一パスで解決できる。

### `src/` — フロントエンド

| パス | 責務 |
|---|---|
| `src/app/` | エントリ・ルーティング |
| `src/features/home/` | ホーム |
| `src/features/browse/` | CEFR 単語帳 + 詳細モーダル |
| `src/features/train/` | Mode A / B（文脈型）。Mode C は未実装 |
| `src/features/review/` | 検証 UI |
| `src/features/settings/` | 設定 |
| `src/lib/db/` | Dexie。初期データは `@data/current/items.json` から投入 |
| `src/lib/gas-client/` | GAS fetch（`?origin=` 付与で CORS 検証） |
| `src/lib/i18n/` | ja / en ロケール + `labels.ts`（列挙値表示） |
| `src/lib/checkmarks/` | localStorage 学習履歴（☑️×3・モード別） |
| `src/lib/passage-history/` | Mode A/B パッセージ遭遇履歴（`vct_passage_history_v1`） |
| `src/lib/train/` | ハイライト / cloze 生成。`use-session-timer.ts` は v8 以降 Mode A/B 未使用（ファイル残置） |
| `src/types/learning.ts` | `LearningItem` 型 — **scripts/pipeline も import** |

### `data/` — 学習データ

| パス | Git | 用途 |
|---|---|---|
| `data/current/items.json` | 管理 | アプリがバンドルする正本 |
| `data/reference/ept/` | 管理 | EPT 由来の IPA 参照（同期スクリプト用） |
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
| `claude.js` | Claude API 呼び出し（Build: Sonnet 4.6、Haiku 判定） |
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

## 4. 実装済み / Phase 2+ で追加予定

| 領域 | 状態 |
|---|---|
| `src/features/train/mode-a` / `mode-b` | **実装済み**(v5 文脈型 → v8 モバイル最適化) |
| `src/features/browse/` | **実装済み**(詳細モーダル・チェックマーク) |
| `src/components/insight-card/` | **実装済み**(サンプル Insight 3) |
| `src/features/train/` Mode C | **未着手** |
| `src/lib/` SRS（FSRS） | **未着手**（`srs_state` はスキーマ予約のみ） |
| browse 全文検索の強化 | **限定的** |
| `gas/handlers.js` `/review-writing` | **未着手**(Mode C 時) |
| 音声再生・GA/RP | **未着手** |
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
