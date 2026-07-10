# 追加指示 v5.1 作業報告（公式 contexts マージ + Mode B 下線）

対象: `nkhippo/English-Vocab-Chunk-Trainer`  
指示書: `cursor_addendum_v5_1.md`  
入力データ: `contexts_pilot_full.json`（8 items × 5 = 40 passages）  
前提: `doc/handoff/full-redesign-handoff-report.md`（ERT 全面刷新）  
最終更新: 2026-07-10  
ブランチ: `feature/addendum-v5-1-contexts` → `main`

---

## 1. サマリ

| 項目 | 結果 |
|---|---|
| 公式 `contexts` を 8 件へマージ | **完了**（各 5 本） |
| サンプル 3 件の Cursor 仮パッセージ | **削除**（`contexts` なし） |
| Mode A/B 出題対象 | **contexts がちょうど 5 の 8 件のみ** |
| Mode B 穴表示 | **`____` / `______` 下線**（xx/yy 廃止） |
| `schema_version` | **1.2.0** |
| `pnpm validate` | **OK** |
| `pnpm build` | **OK** |
| GitHub Pages | main push 後に Actions デプロイ |

---

## 2. データマージ

### 対象（contexts あり・8 件）

`have_breakfast` / `take_a_picture` / `do_homework` / `catch_a_cold` /  
`take_a_shower` / `go_shopping` / `get_up_early` / `listen_to_music`

### 対象外（contexts なし・3 件）

`make_a_decision` / `look_forward_to` / `whats_up`  
→ 単語帳には表示されるが Mode A/B では出題されない。

### 検証結果

```
Items with 5 contexts: 8
Items without contexts: make_a_decision, look_forward_to, whats_up
```

各 `target_span` のスライスは対象語（または自然な活用形）と一致することを確認済み。  
例: `took a picture` / `gets up early` / `do my homework` など。

ソース JSON は指示どおり `data/staging/contexts_pilot_full.json` に配置してマージ（`data/staging/**` は `.gitignore` のためリポジトリには含めず、正本は `data/current/items.json`）。

---

## 3. Mode B 穴表示の変更

| 変更前 | 変更後 |
|---|---|
| `xx` / `yy` / `zz` | 答え長 ≤4 → `____`、≥5 → `______` |
| 黄背景の blank | `border-bottom: 2px` + muted 色、上下 padding 4px |

実装箇所:

- `src/lib/train/passage.ts` — `generateClozeSegments` / `clozeUnderlineForAnswer`
- `src/styles/index.css` — `.cloze-blank`

コードベースに `xx`/`yy`/`zz` 表記は残っていない。

---

## 4. 出題フィルタ

`filterEligibleTrainItems()`（`src/lib/train/passage.ts`）:

```ts
item.contexts?.length === 5
```

Mode A / Mode B の両方で使用。eligible が 0 件のときは「パッセージデータが未整備です」を表示。

バリデータ: `contexts` は任意。存在する場合のみ「ちょうど 5」と span 整合を検証（サンプル 3 件がエラーにならないように変更）。

---

## 5. Definition of Done（v5.1 追記分）

### 段階 2 追加

- [x] 8 items に `contexts[]`（各 5）
- [x] `schema_version` 1.2.0
- [x] Mode A が 8 件に限定
- [x] target_span 検証スクリプト相当を実行

### 段階 3 追加

- [x] 穴が `____` / `______`
- [x] 下線スタイル（border-bottom / muted）
- [x] 短語と長語で幅が異なる

---

## 6. 公開 URL

https://nkhippo.github.io/English-Vocab-Chunk-Trainer/

- Mode A: `/train/mode-a`
- Mode B: `/train/mode-b`（下線穴を確認）
- 単語帳: `/browse`（11 件すべて）

---

## 7. Claude / Naoya 向けメモ

- 仮パッセージ（全面刷新時の Cursor 生成 55 本）は公式 40 本で置換済み（パイロット 8 件分）。
- サンプル 3 件への contexts 追加は別途データ作業が必要。
- 実機で Mode B の下線の見やすさを確認し、必要なら幅・色の微調整を依頼してください。
