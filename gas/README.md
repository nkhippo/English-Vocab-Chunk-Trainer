# Google Apps Script (Claude API proxy)

Implements the endpoints described in `doc/claude-api-gas-design.md`.

## Setup

1. Install [clasp](https://github.com/google/clasp): `npm i -g @google/clasp`
2. `clasp login`
3. Create a standalone Apps Script project: `clasp create --type standalone --title "vocab-chunk-trainer-gas" --rootDir gas`
   - Or link an existing project by adding `.clasp.json` with the scriptId
4. `clasp push`
5. In the Apps Script UI → Project Settings → Script properties:
   - `ANTHROPIC_API_KEY` = your Anthropic key
6. Deploy → New deployment → Web app
   - Execute as: Me
   - Who has access: Anyone (or Anyone with Google account during testing)
7. Copy the Web App URL into `.env` as `GAS_ENDPOINT_URL` and into `.env` / GitHub Pages env as `VITE_GAS_ENDPOINT_URL` when needed

## Call convention

```
POST {WEB_APP_URL}?path=generate-seed
Content-Type: text/plain;charset=utf-8
Body: JSON
```

Response shape:

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
