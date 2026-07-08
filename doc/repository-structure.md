# リポジトリ構成表

English Vocab Chunk Trainer の長期運用を見据えたフォルダ・ファイル構成の正本。  
現状は設計ドキュメントのみ。実装が進むたびに本表を更新する。

最終更新: 2026-07-08

---

## 1. 現状（Phase 0）

```
english-vocab-chunk-trainer/
├── .gitignore
├── README.md                          # （未作成）プロジェクト概要・起動手順
└── doc/                               # 設計・運用ドキュメント
    ├── repository-structure.md        # 本ファイル（構成の正本）
    ├── app-specification.md           # アプリ最終仕様 v3（実装の唯一の参照ソース）
    ├── learning-data-schema.json      # LearningItem / Insight の JSON Schema
    ├── data-operations-guide.md       # CEFR 追加・スキーマ変更などのデータ運用手順
    └── claude-api-gas-design.md       # Claude API を GAS 経由で呼ぶ設計（Build / Runtime）
```

### doc/ ファイル対応表

| 現ファイル名 | 旧ファイル名 | 役割 |
|---|---|---|
| `app-specification.md` | `vocab_app_spec_v3_final.md` | アプリ全体仕様（スコープ、モード、UI、ロードマップ） |
| `learning-data-schema.json` | `data-schema.json` | 学習データ（items / insights）のスキーマ定義 |
| `data-operations-guide.md` | （変更なし） | データ拡張・保守の運用手順書 |
| `claude-api-gas-design.md` | （変更なし） | GAS + Claude API のエンドポイント・プロンプト設計 |
| `repository-structure.md` | （新規） | 本リポジトリのフォルダ・ファイル構成表 |

---

## 2. 目標構成（Phase 1 以降）

仕様書（`app-specification.md`）および運用手順（`data-operations-guide.md`）から導いた、長期運用時の全体像。

```
english-vocab-chunk-trainer/
│
├── README.md                      # 概要・セットアップ・開発コマンド
├── CHANGELOG.md                   # データ / アプリの変更履歴
├── LICENSE
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
├── index.html
├── .env.example                   # GAS URL など公開可能な設定例（秘密情報は入れない）
├── .gitignore
│
├── doc/                           # 設計・運用ドキュメント（本フォルダ）
│   ├── repository-structure.md
│   ├── app-specification.md
│   ├── learning-data-schema.json
│   ├── data-operations-guide.md
│   ├── claude-api-gas-design.md
│   └── migrations/                # スキーマ差分メモ（MAJOR/MINOR 時）
│       └── 1.0.0-to-1.1.0.md
│
├── public/                        # 静的アセット（PWA）
│   ├── manifest.webmanifest
│   ├── icons/
│   └── sw.js                      # Service Worker（構成は実装時に確定）
│
├── src/                           # PWA アプリケーション（Vite + React + TypeScript）
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── components/                # UI 部品
│   ├── pages/                     # 画面（Mode A/B/C、単語帳、設定など）
│   ├── features/                  # 機能単位（SRS、モードロジック、単語帳フィルタなど）
│   ├── lib/                       # 共通ユーティリティ / IndexedDB / GAS クライアント
│   ├── stores/                    # Zustand 等の状態管理
│   ├── types/                     # TypeScript 型（スキーマと対応）
│   └── i18n/                      # 日英 UI 文言
│
├── data/                          # 学習データベース（SemVer 管理）
│   ├── current/                   # 現在稼働中のデータ
│   │   ├── items.json
│   │   ├── insights.json
│   │   └── schema.json            # learning-data-schema.json のコピーまたは参照
│   ├── staging/                   # 生成・検証途中のデータ（コミット方針は運用で決定）
│   ├── releases/                  # MINOR/MAJOR ごとの完全スナップショット
│   │   └── v1.0.0/
│   └── basic2400/                 # Basic 2400 ユニット CSV など連携用入力
│
├── scripts/                       # データ生成・検証・同期用 CLI
│   ├── generate-seed.ts
│   ├── generate-enrichment.ts
│   ├── review-ui.ts
│   ├── validate.ts
│   ├── merge.ts
│   ├── migrate.ts
│   ├── map-basic2400.ts
│   ├── sync-ipa.ts
│   └── release.ts
│
├── gas/                           # Google Apps Script（Claude API プロキシ）
│   ├── Code.gs                    # エンドポイント実装
│   ├── prompts/                   # プロンプトテンプレート（設計書と同期）
│   └── README.md                  # デプロイ手順
│
└── tests/                         # 単体・統合テスト
    ├── unit/
    └── e2e/
```

---

## 3. 主要ディレクトリの責務

| パス | 責務 | 主な参照ドキュメント |
|---|---|---|
| `doc/` | 仕様・スキーマ・運用の正本。実装判断の起点 | — |
| `src/` | PWA 本体（Mode A/B/C、SRS、単語帳、日英 UI） | `app-specification.md` |
| `data/` | CEFR 付き学習項目・Insight の実データとリリース | `learning-data-schema.json`, `data-operations-guide.md` |
| `scripts/` | seed / enrichment / 検証 / Basic 2400 マッピング / IPA 同期 | `data-operations-guide.md` |
| `gas/` | Claude API のプロキシ・キャッシュ・レート制御 | `claude-api-gas-design.md` |
| `public/` | PWA マニフェスト・アイコン・Service Worker | `app-specification.md` §8 |

---

## 4. 命名方針

- **ドキュメント**: kebab-case、役割がファイル名からわかる（例: `app-specification.md`）
- **スキーマ JSON**: 対象を明示（例: `learning-data-schema.json`）
- **データ成果物**: SemVer ディレクトリ（例: `data/releases/v1.1.0/`）
- **スクリプト**: 動詞 + 対象（例: `generate-seed.ts`, `sync-ipa.ts`）
- **アプリコード**: 一般的な Vite/React 慣習（`src/components`, `src/features`）

---

## 5. ドキュメント間の関係

```
app-specification.md          ← 実装の唯一の参照ソース
        │
        ├── learning-data-schema.json   ← §3 データモデルの機械可読版
        ├── data-operations-guide.md    ← データの段階拡張・保守手順
        └── claude-api-gas-design.md    ← Build/Runtime の AI 呼び出し設計
                │
                └── repository-structure.md  ← 本ファイル（配置と責務の地図）
```

---

## 6. 更新ルール

1. ディレクトリの追加・改名・削除時は、必ず本ファイルの「現状」または「目標構成」を更新する。
2. Phase が進んで目標構成の一部が実装されたら、該当パスを「現状」に移し、実装ステータスを明記する。
3. ドキュメントのリネーム時は、本ファイルの対応表と他ドキュメント内の参照パスを同時に更新する。
4. 秘密情報（API キー、GAS のデプロイ秘密など）はリポジトリに置かない。`.env` / Drive 権限で管理する。
