# パイロット v4 作業報告（scene-config + 禁止語リスト + validate 明示リスト化）

対象: `nkhippo/English-Vocab-Chunk-Trainer`  
指示書: `cursor_instruction_pilot_v4.md`（Downloads）  
最終更新: 2026-07-09  
前提: `doc/handoff/pilot-v3-handoff-report.md`（v3・DoD NG・`data/current` 未更新）

---

## 1. サマリ

| 項目 | 結果 |
|---|---|
| `gas/scene-config.js` 新規追加 | **実施済み** |
| `generateExamples` v4 プロンプト（禁止語表 + シーン候補） | **実施済み** |
| `validateCefr` 明示リスト照合方式 | **実施済み** |
| `build-gas-paste` に `scene-config.js` 結合 | **実施済み** |
| `doc/ops/claude-api-gas-design.md` §2.3.1 / §2.3.2 / §2.5.1 | **実施済み** |
| `validator_version: v4` / `schema_version: 1.1.2` | **実施済み** |
| `clasp push`（v4 ソース反映） | **実施済み** |
| GAS 本番 Web App デプロイ（v4 反映） | **未完了**（後述） |
| パイロット v4 実行 | **部分完了**（7/8・旧デプロイ上 / クレジット不足） |
| DoD 10.1〜10.5 | **NG** |
| `data/current/items.json` マージ | **未実施**（DoD 未達のため v2 の 11 件を維持） |
| main マージ（コード・ドキュメント） | **実施済み** |

---

## 2. 実施内容（コード）

### 2.1 `gas/scene-config.js`（新規）

- `SCENE_CANDIDATES`: formal 10 / neutral 7 / informal 7
- `formatSceneCandidates(register)`: プロンプト用 Markdown 箇条書き生成
- シーン候補の唯一のソース（今後はこのファイルのみ編集 → `clasp push` → 手動デプロイ）

### 2.2 `gas/handlers.js` — `generateExamples`（v4）

主な変更:

- `formatSceneCandidates` で register 別シーン候補をプロンプトに注入
- A2 学習者未習語の **禁止語 + 代替表現** を表形式で明示
- ホテル・オフィス collapse への注意書き（過去パイロット知見）
- 判断順序に「シーン候補から選ぶ」ステップを追加（制約 A 維持）

### 2.3 `gas/handlers.js` — `validateCefr`（v4）

方針転換:

- Haiku に「B1 かも」と推測させない
- **検出対象語リスト**との照合のみ（safety net）
- **検出対象外**: Employees / Visitors / Guests / Students 等（false positive 抑制）

### 2.4 パイプライン・ビルド

- `scripts/build-gas-paste.ts`: `scene-config.js` を `handlers.js` より前に結合
- `scripts/pipeline/generate-examples.ts`: `schema_version: '1.1.2'`, `validator_version: 'v4'`

### 2.5 ドキュメント

- `doc/ops/claude-api-gas-design.md`: §2.3.1 / §2.3.2 / §2.5.1 追記

---

## 3. GAS デプロイ状況（重要）

### 3.1 実施したこと

```bash
pnpm run build:gas-paste   # SCENE_CANDIDATES 結合確認済み
clasp push                 # scene-config.js 含む 6 ファイル
```

### 3.2 本番 Web App が v4 を実行していない理由

`clasp push` は **エディタ上のソース**を更新するだけで、既存 Web App デプロイ（@19）は古いスナップショットのまま。

指示書どおり **Apps Script エディタの「デプロイ → 新バージョン」** が必要だが、作業中に `clasp deploy -i <本番ID>` を試行した結果:

| URL（デプロイ ID） | 状態 |
|---|---|
| `AKfycbzXBNFU...`（本番 @19） | **404**（`clasp deploy -i` 後に応答不能。`-V 19` ロールバックでも復旧せず） |
| `AKfycbymECuc_1QayB...`（旧 @18） | **稼働中**（health OK。ただし v4 ソース未反映の旧バージョン） |

**暫定対応**: リポジトリの GAS URL を **稼働中の @18** にフォールバック（GitHub Pages の GAS 呼び出しを復旧）。v4 パイロット再実行前に、Naoya がエディタで本番デプロイを **新バージョン**で作り直し、URL を再同期すること。

### 3.3 Anthropic API クレジット

パイロット実行中、後半で以下エラーが発生:

```
Your credit balance is too low to access the Anthropic API.
```

`listen_to_music` の validate が失敗し隔離。クレジット補充後に再実行が必要。

---

## 4. パイロット実行ログ

### Run 1（本番 @19・**v4 未デプロイ**の状態）

デプロイ @19 上の **旧 generate/validate** で実行（`schema_version: 1.1.2` によりキャッシュは回避）。

| item | 結果 | 備考 |
|---|---|---|
| take_a_picture | **出力に含まれた** | formal: `Visitors are kindly asked...`（禁止語 `kindly` 残存） |
| have_breakfast | OK | formal: `Guests may have breakfast...` |
| do_homework | OK | formal: `Students must do their homework...` |
| catch_a_cold | OK | formal: 手洗い案内（多様性あり） |
| take_a_shower | OK | formal: `Guests may take a shower...` |
| go_shopping | OK | formal: 週末の買い物（多様性あり） |
| get_up_early | OK | formal: `Employees are **expected** to...`（禁止語残存） |
| listen_to_music | **隔離** | API クレジット不足で validate 失敗 |

**出力**: staging **7 件**（`needs_manual_review` に 1 件＋以前分）

### Run 2（`clasp deploy -i` 後・本番 @19 404）

全 8 件 generate が HTML 404 → **0 件出力**。本番 URL 障害による中断。

---

## 5. Definition of Done 判定

| # | 項目 | 判定 | 根拠 |
|---|---|---|---|
| 10.1 | 8/8・隔離 0 | **NG** | 7/8・隔離 1（クレジット） |
| 10.2 | formal 禁止語 0 件 | **NG** | `kindly`（take_a_picture）, `expected`（get_up_early） |
| 10.3 | シーン多様性 | **NG** | formal 6 件中 Guests/Students/Employees が 4 件以上 |
| 10.4 | ログ・false positive | **一部** | v4 validate 未デプロイのため評価不能。Run1 で `Visitors` 過検出は旧 validate |
| 10.5 | 制約 A | **おおむね OK** | 対象語の用法は自然（シーンはホテル偏り） |

**結論**: `data/current/items.json` は **更新しない**（指示書 §11.1 未達）。

---

## 6. formal 例文抜粋（Run 1・旧デプロイ）

| id | formal `en` |
|---|---|
| take_a_picture | Visitors are kindly asked not to take a picture inside the museum. |
| have_breakfast | Guests may have breakfast in the main dining room from seven to ten. |
| do_homework | Students must do their homework before the next class. |
| catch_a_cold | Please wash your hands often so that you do not catch a cold this winter. |
| take_a_shower | Guests may take a shower in their room before dinner. |
| go_shopping | Many people go shopping on weekends to buy food and clothes for the week. |
| get_up_early | Employees are expected to get up early on training days. |

v4 プロンプト（禁止語表 + scene-config）が本番に載れば、上記 `kindly` / `expected` / Guests 偏りの改善が期待される。

---

## 7. Naoya 向け次アクション

1. **Anthropic クレジット補充**
2. **Apps Script エディタ**で Web App を **新バージョン**デプロイ（`clasp push` 済みソース = v4）
   - `clasp deploy -i` は **使わない**（404 事例あり）
   - 本番 URL が復旧したら `.env.example` / `.env.production` / `CLAUDE.md` を再同期
3. **パイロット v4 再実行**:
   ```bash
   pnpm run generate:examples -- --input=data/staging/A2_collocation_validated_enriched.json
   ```
4. DoD 10.1〜10.5 を再確認 → OK なら `data/current` マージ（指示書 §11.1 の node + merge）
5. **本生成 GO** の判断

---

## 8. 本生成 GO 判断の材料

| 観点 | v4 実装後の期待 | 現状 |
|---|---|---|
| 禁止語根絶 | generate 側で Opus に明示禁止 | 本番未反映のため未検証 |
| シーン多様化 | scene-config で候補提示 | 本番未反映のため未検証 |
| validate 精度 | 明示リスト + false positive 抑制 | 本番未反映のため未検証 |
| 運用コスト | Haiku のまま safety net | 設計どおり |

**推奨**: v4 コードは main にマージ済み。データマージと本生成 GO は、**GAS 手動デプロイ + クレジット補充後の再パイロット成功**を待つ。
