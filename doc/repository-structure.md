# リポジトリ構成表

English Vocab Chunk Trainer の長期運用を見据えたフォルダ・ファイル構成の正本。

最終更新: 2026-07-09（Pages Actions 配信・data 一本化）

---

## 1. 現状（Phase 1）

```
english-vocab-chunk-trainer/
├── .github/workflows/deploy-pages.yml
├── .env.example
├── .env.production                   # Pages 用 VITE_GAS_ENDPOINT_URL
├── .gitignore
├── CLAUDE.md
├── README.md
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── index.html
├── vite.config.ts
├── tsconfig*.json
├── doc/                               # 設計・運用ドキュメント（指示書の docs/ に相当）
│   ├── repository-structure.md
│   ├── app-specification.md
│   ├── learning-data-schema.json
│   ├── data-operations-guide.md
│   ├── claude-api-gas-design.md
│   ├── cursor-instruction-phase1.md
│   └── phase1-handoff-report.md       # Cursor 作業結果・差分・残課題（Claude 共有用）
├── public/
│   ├── favicon.svg
│   └── icons/
├── src/
│   ├── app/                           # main / App / router
│   ├── components/                    # layout, guide-modal, language-toggle
│   ├── content/guide/
│   ├── features/                      # home, train, browse, review, settings
│   ├── lib/                           # db, gas-client, i18n, stores
│   ├── data/                          # 開発用サンプルのみ（sample-seeds.json）
│   ├── styles/
│   └── types/
├── data/
│   ├── current/                       # 【正本】Git 管理の現行データ（Vite がバンドル）
│   └── staging/                       # 生成物（gitignore）
├── scripts/                           # seed / enrich / examples / merge / validate
├── .clasp.json                        # clasp 紐付け（gitignore）
├── .claspignore                       # gas/ 内の除外（drive-paste 等）
└── gas/                               # Claude API プロキシ（clasp push + drive-paste フォールバック）
    ├── README.md
    ├── main.js / cache.js / claude.js / handlers.js
    └── drive-paste/Code.gs            # エディタ貼り付け用結合ファイル
```

学習データの正本は `data/current/` のみ。アプリは `@data/current/items.json`（`vite.config.ts` / `tsconfig` の alias）から直接 import し、`src/data/current` への複製は置かない。

GAS は clasp 紐付け済み。Web App URL 変更時は `.env.example` / `.env.production` / `gas/README.md`（および関連 doc）を揃えて更新する。

### 稼働中 GAS

```
https://script.google.com/macros/s/AKfycbz_gk2WigbcJKX7DH-pq14Mp-O5v5f9f1_MfwvooGZGnwTGrMylQVhFgkFWIxB4ZVbX/exec
```

### 指示書パスとの対応

| 指示書 (`cursor-instruction-phase1`) | 本リポジトリ |
|---|---|
| `docs/` | `doc/` |
| `docs/spec.md` | `doc/app-specification.md` |
| `docs/data-schema.json` | `doc/learning-data-schema.json` |
| base `/vocab-chunk-trainer/` | `/English-Vocab-Chunk-Trainer/`（実 repo 名） |

---

## 2. 主要ディレクトリの責務

| パス | 責務 | 主な参照 |
|---|---|---|
| `doc/` | 仕様・スキーマ・運用・指示書の正本 | — |
| `src/` | PWA 本体 | `app-specification.md` |
| `data/` | 学習データ正本（current は Git・PWA バンドル元、staging はローカル） | `learning-data-schema.json` |
| `scripts/` | データ生成・検証 CLI（GAS 経由） | `data-operations-guide.md` |
| `gas/` | Claude API プロキシ・キャッシュ | `claude-api-gas-design.md` |

---

## 3. Phase 2 以降で追加予定

- `src/features/train/` Mode A/B/C 本体
- SRS（FSRS）
- browse 検索・詳細
- GAS `/review-writing`
- `doc/migrations/`

---

## 4. 更新ルール

1. ディレクトリ追加・改名時は本ファイルを更新する。
2. 指示書のパスと異なる判断をしたら、対応表と `CLAUDE.md` に理由を残す。
3. 秘密情報はリポジトリに置かない。
