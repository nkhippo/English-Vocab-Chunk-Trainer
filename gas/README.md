# Google Apps Script (Claude API proxy)

Implements the endpoints described in `doc/claude-api-gas-design.md`.

**推奨**: スタンドアロン GAS（Google Drive 上のスクリプト）+ 本リポジトリの `gas/` をソース正本にする。

## Deployed endpoint (Phase 1)

```
https://script.google.com/macros/s/AKfycbydkQc4jRLe2N4rr56my_0xRgYHKqwFnCCxQ10ABy09-9GUOGpP9JBHC86WGG8CaoId/exec
```

- Script Properties: `ANTHROPIC_API_KEY`（設定済み）
- Local: `.env` / `.env.example` の `GAS_ENDPOINT_URL`
- Pages build: `.env.production` の `VITE_GAS_ENDPOINT_URL`

Health check:

```bash
curl -sL "$GAS_ENDPOINT_URL"
# → {"ok":true,"data":{"service":"vocab-chunk-trainer-gas","paths":[...]}}
```

---

## clasp sync（任意）

Apps Script API を ON にしたうえで、既存プロジェクトに紐付ける場合:

1. https://script.google.com/home/usersettings で Google Apps Script API を有効化
2. エディタ URL の `/d/{SCRIPT_ID}/edit` から SCRIPT_ID を控える
3. リポジトリルートで:

```bash
echo '{"scriptId":"SCRIPT_ID","rootDir":"gas"}' > gas/.clasp.json
clasp push
```

`gas/.clasp.json` は gitignore 済み。

---

## Drive 手動デプロイ

貼り付け用の結合ファイル: [`drive-paste/Code.gs`](./drive-paste/Code.gs)

1. https://script.google.com/home/start → 新しいプロジェクト
2. `Code.gs` を上書き保存
3. プロジェクトの設定 → スクリプト プロパティ → `ANTHROPIC_API_KEY`
4. デプロイ → ウェブアプリ（実行: 自分 / アクセス: 全員）

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
