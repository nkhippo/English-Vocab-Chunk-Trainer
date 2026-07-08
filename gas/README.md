# Google Apps Script (Claude API proxy)

Implements the endpoints described in `doc/claude-api-gas-design.md`.

**推奨**: スタンドアロン GAS（Google Drive 上のスクリプト）+ 本リポジトリの `gas/` をソース正本にする。

## Deployed endpoint (Phase 1)

```
https://script.google.com/macros/s/AKfycbz_gk2WigbcJKX7DH-pq14Mp-O5v5f9f1_MfwvooGZGnwTGrMylQVhFgkFWIxB4ZVbX/exec
```

- Script Properties: `ANTHROPIC_API_KEY`（設定済み）
- Local: `.env` / `.env.example` の `GAS_ENDPOINT_URL`
- Pages build: `.env.production` の `VITE_GAS_ENDPOINT_URL`
- Health GET 応答は `{ ok: true, data: { service, paths } }`（二重ラップなし）

Health check:

```bash
curl -sL "$GAS_ENDPOINT_URL"
# → {"ok":true,"data":{"service":"vocab-chunk-trainer-gas","paths":[...]}}
```

### Models in use (verified 2026-07-08)

| Endpoint group | Model ID | Status |
|---|---|---|
| generate-seed / enrich-item / generate-examples / generate-insight | `claude-opus-4-6` | Valid (legacy, still available) |
| validate-cefr | `claude-haiku-4-5-20251001` | Valid (current Haiku) |

Optional later upgrade for Build quality: `claude-opus-4-8`.

---

## clasp sync（任意・推奨）

手動の `drive-paste/Code.gs` 貼り付けから、リポジトリ `gas/` を `clasp push` で同期する運用へ移行する手順。**既存 Web App のデプロイ URL・Script Properties は変えない**（紐付けとソース同期のみ）。

### 前提

- 既に Drive 上でスタンドアロン GAS が動いている（Phase 1 で設定済み）
- ローカルに Node / npm があり、本リポジトリを clone 済み

### 1. Google Apps Script API を有効化

1. ブラウザで [Apps Script ユーザー設定](https://script.google.com/home/usersettings) を開く
2. **Google Apps Script API** を **オン** にする
3. 初回は Google アカウントの同意画面が出ることがある → 許可

### 2. SCRIPT_ID を控える

1. [Apps Script ホーム](https://script.google.com/home) で本プロジェクト（Vocab Chunk Trainer 用）を開く
2. アドレスバーの URL から ID を取る:

```
https://script.google.com/home/projects/{SCRIPT_ID}/edit
```

`{SCRIPT_ID}` は長い英数字（例: `1AbC...`）。`/macros/s/.../exec` のデプロイ ID とは別物なので間違えない。

### 3. clasp をインストールしてログイン

リポジトリのどこからでも可:

```bash
npm install -g @google/clasp
clasp login
```

ブラウザが開くので、Script API を有効にしたのと同じ Google アカウントでログインする。

### 4. 既存プロジェクトに紐付け

リポジトリ**ルート**に `.clasp.json` を作り、`rootDir` で `gas/` を指す（`SCRIPT_ID` を置き換え）:

```bash
cd "/path/to/english-vocab-chunk-trainer"
printf '%s\n' '{"scriptId":"SCRIPT_ID","rootDir":"gas"}' > .clasp.json
```

`.clasp.json` は `.gitignore` 済み（コミットしない）。

リポジトリルートの `.claspignore` で、`rootDir`（`gas/`）相対の不要ファイルを除外する（`drive-paste/`、README、プロンプト説明など）。`gas/.claspignore` ではなく **ルートの `.claspignore`** が効く点に注意。

### 5. プッシュしてデプロイ版を更新

リポジトリルートで:

```bash
clasp status
clasp push
```

エディタを再読み込みし、ファイルが分割ソース（`main.js` 等）になっていることを確認する。

**Web App の公開 URL は自動では変わらない。** コード変更を本番 URL に載せるには、従来どおり:

1. エディタ → **デプロイ** → **デプロイを管理**
2. 鉛筆アイコン → **新バージョン** → デプロイ

URL が変わった場合のみ `.env` / `.env.production` / 本 README の endpoint を三箇更新する。

### 6. 以後の日常フロー

```bash
# ローカルで gas/*.js を編集
clasp push
# → エディタで「新バージョン」デプロイ
curl -sL "$GAS_ENDPOINT_URL"   # health
```

問題が出たら `drive-paste/Code.gs` をエディタに貼り直す旧手順に一時フォールバックできる。

---

## Drive 手動デプロイ

貼り付け用の結合ファイル: [`drive-paste/Code.gs`](./drive-paste/Code.gs)

1. https://script.google.com/home/start → 新しいプロジェクト
2. `Code.gs` を上書き保存
3. プロジェクトの設定 → スクリプト プロパティ → `ANTHROPIC_API_KEY`
4. デプロイ → ウェブアプリ（実行: 自分 / アクセス: 全員）→ **新バージョン**

---

## Call convention

```
POST {WEB_APP_URL}?path=generate-seed
Content-Type: text/plain;charset=utf-8
Body: JSON
```

Response:

```json
{ "ok": true, "data": { }, "cached": false }
```

or

```json
{ "ok": false, "error": { "code": "...", "message": "..." } }
```

## Phase 1 endpoints

- `generate-seed`
- `enrich-item`
- `generate-examples`
- `generate-insight`
- `validate-cefr`

`review-writing` is Phase 2.
