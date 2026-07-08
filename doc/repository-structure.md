# リポジトリ構成表

English Vocab Chunk Trainer の長期運用を見据えたフォルダ・ファイル構成の正本。

最終更新: 2026-07-08（Phase 1 骨格投入）

---

## 1. 現状（Phase 1）

```
english-vocab-chunk-trainer/
├── .github/workflows/deploy-pages.yml
├── .env.example
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
│   └── cursor-instruction-phase1.md
├── public/
│   ├── favicon.svg
│   └── icons/
├── src/
│   ├── app/                           # main / App / router
│   ├── components/                    # layout, guide-modal, language-toggle
│   ├── content/guide/
│   ├── features/                      # home, train, browse, review, settings
│   ├── lib/                           # db, gas-client, i18n, stores
│   ├── data/                          # バンドル用サンプル + current コピー
│   ├── styles/
│   └── types/
├── data/
│   ├── current/                       # Git 管理の現行データ
│   └── staging/                       # 生成物（gitignore）
├── scripts/                           # seed / enrich / examples / merge / validate
└── gas/                               # clasp 管理の Claude API プロキシ
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
| `data/` | 学習データ（current は Git、staging はローカル） | `learning-data-schema.json` |
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
