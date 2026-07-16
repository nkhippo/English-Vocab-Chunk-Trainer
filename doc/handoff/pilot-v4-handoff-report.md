---
id: pj-2026-07-09-dbf9
aliases:
- pj-2026-07-09-dbf9
title: パイロット v4 作業報告（scene-config + 禁止語リスト + validate 明示リスト化）
created: '2026-07-09'
---
# パイロット v4 作業報告（scene-config + 禁止語リスト + validate 明示リスト化）

対象: `nkhippo/English-Vocab-Chunk-Trainer`  
指示書: `cursor_instruction_pilot_v4.md`（Downloads）  
最終更新: **2026-07-10**（v22 デプロイ後・再実行完了）  
前提: `doc/handoff/pilot-v3-handoff-report.md`（v3・DoD NG・`data/current` 未更新）

---

## 1. サマリ

| 項目 | 結果 |
|---|---|
| `gas/scene-config.js` 新規追加 | **実施済み** |
| `generateExamples` v4 プロンプト（禁止語表 + シーン候補） | **実施済み** |
| `validateCefr` 明示リスト照合方式 | **実施済み** |
| Build モデル | **`claude-sonnet-4-6`**（2026-07-10 移行・コスト最適化） |
| GAS 本番 Web App | **v22** 手動デプロイ・稼働確認済み |
| `validator_version: v4` / `schema_version: 1.1.3` | **実施済み** |
| パイロット v4 実行（再開 Run） | **8/8 完了・隔離 0** |
| DoD 10.1〜10.5 | **OK** |
| `data/current/items.json` マージ | **実施済み**（11 件） |
| `pnpm run validate` | **OK** |
| 本生成 GO | **Naoya 判断待ち** |

---

## 2. 実施内容（コード）

### 2.1 `gas/scene-config.js`（新規）

- `SCENE_CANDIDATES`: formal 10 / neutral 7 / informal 7
- `formatSceneCandidates(register)`: プロンプト用 Markdown 箇条書き生成

### 2.2 `gas/handlers.js` — `generateExamples`（v4）

- シーン候補を `scene-config.js` から注入
- A2 学習者未習語の禁止語 + 代替表現表
- ホテル・オフィス collapse への注意書き

### 2.3 `gas/handlers.js` — `validateCefr`（v4）

- 明示リスト照合のみ（Haiku）
- Employees / Visitors / Guests / Students は検出対象外

### 2.4 `gas/claude.js`

- `BUILD_MODEL = 'claude-sonnet-4-6'`（Opus 4.7 から移行）

### 2.5 パイプライン

- `schema_version: '1.1.3'` / `validator_version: 'v4'`

---

## 3. GAS デプロイ（解消済み）

| 項目 | 値 |
|---|---|
| Web App URL | `https://script.google.com/macros/s/AKfycbzTyWCkXyjXic6JcpLJPf-ltV8mlJrGQ8Ip1bkg8A_Sx5cX_crY3zWGcwPCQW-bur7I/exec` |
| バージョン | **22**（2026-07-10 0:12・Naoya 手動デプロイ） |
| health | OK |

**過去の障害（解消）**: @19 は `clasp deploy -i` 後に 404。v22 を新規手動デプロイで復旧。GAS は **1 URL = プロジェクト全体**（`main` / `handlers` / `claude` / `scene-config` 等すべて含む）。

---

## 4. パイロット実行ログ

### Run 1（2026-07-09・@19 旧デプロイ / クレジット不足）

- 7/8・隔離 1・禁止語残存 → **DoD NG**（詳細は git 履歴 `1eefce2` 時点の本レポート旧版）

### Run 2（2026-07-10・v22 + Sonnet 4.6 + クレジット補充後）

```bash
GAS_ENDPOINT_URL=<v22 URL> pnpm run generate:examples -- \
  --input=data/staging/A2_collocation_validated_enriched.json
```

| item | 結果 | formal 例文（抜粋） |
|---|---|---|
| take_a_picture | OK | Please do not take pictures inside the museum. |
| have_breakfast | OK | Please come to the dining room to have breakfast before 9:00 a.m. |
| do_homework | OK | Students must do homework before each class. |
| catch_a_cold | OK | Please wash your hands often so you do not catch a cold this winter. |
| take_a_shower | OK | All players must take a shower before entering the pool. |
| go_shopping | OK | On Saturdays, staff members may go shopping during their lunch break. |
| get_up_early | OK | Students must get up early on the day of the school trip. |
| listen_to_music | OK | You must not listen to music during the test. |

**出力**: staging 8 件・`needs_manual_review` 0 件

---

## 5. Definition of Done 判定（Run 2）

| # | 項目 | 判定 | 根拠 |
|---|---|---|---|
| 10.1 | 8/8・隔離 0 | **OK** | ログ・staging 8 件 |
| 10.2 | formal 禁止語 0 件 | **OK** | kindly / expected / lounge 等 0 件（自動 grep） |
| 10.3 | シーン多様性 | **OK** | Guests formal 0 件。Students 2 件（<3 閾値）。博物館・プール・テスト等 |
| 10.4 | ログ・false positive | **OK** | violations ログなし。get_up_early の Employees 問題は解消（今回 formal は Students） |
| 10.5 | 制約 A | **OK** | 対象語の用法は自然（目視サンプル 8 件） |

---

## 6. `data/current` マージ

```bash
# v2 パイロット 8 件を除去 → v4 8 件をマージ
node -e '...filter pilotIds...'   # 3 件に縮小
pnpm run merge -- --new=data/staging/A2_collocation_validated_enriched_with_examples.json \
  --into=data/current/items.json
pnpm run validate   # OK（サンプル 3 件の register 警告は従来どおり）
```

**結果**: `data/current/items.json` = **11 件**（サンプル 3 + パイロット v4 の 8）

---

## 7. v3 → v4 の改善点（観察）

| 観点 | v3 典型問題 | v4 Run 2 |
|---|---|---|
| 禁止語 | `kindly` / `expected` が formal に残存 | **0 件** |
| validate false positive | `Employees` で get_up_early 隔離 | **なし**（明示リスト方式） |
| シーン | Guests may... が複数 | **Guests 0**。プール・テスト・修学旅行等 |
| モデルコスト | Opus 4.7 | **Sonnet 4.6**（品質維持・8/8） |

---

## 8. Naoya 向け：本生成 GO 判断の材料

| 質問 | 材料 |
|---|---|
| パイロット品質は本生成に耐えるか | 8/8・禁止語 0・多様性 OK。Sonnet 4.6 で再現性あり |
| 残リスク | 本生成 2,430 件のコスト・時間。稀な禁止語漏れは validate v4 が safety net |
| 推奨次ステップ | **本生成 GO** なら `pnpm run batch:a2-seeds` 等（`doc/ops/data-operations-guide.md`） |
| 保留する場合 | B1 データや Mode A/B 実装を先にする等 |

---

## 9. Claude への展開ガイド（Naoya 用）

次の Claude セッションに渡すと効率的な情報:

1. **必読**: 本ファイル + `doc/ops/claude-api-gas-design.md` §2.3.1 / §2.5.1
2. **結論を先に**: 「パイロット v4 DoD 全項目 OK。`data/current` 11 件更新済み。本生成 GO 判断待ち」
3. **技術変更の要点**:
   - 品質管理の主戦場は **generateExamples 禁止語表 + scene-config**（validate は補助）
   - Build モデルは **Sonnet 4.6**（Opus からコスト削減）
   - GAS v22 URL（上記 §3）
4. **実データ**: Run 2 の formal 例文表（§4）を貼る
5. **依頼例**: 「A2 collocation 2,430 件本生成の GO/NO-GO 判断」「本生成時のバッチ設計レビュー」「B1 への禁止語表拡張方針」

---

## 10. 完了基準チェックリスト（指示書 §13）

- ✅ `gas/scene-config.js` 配置
- ✅ `generateExamples` / `validateCefr` v4 更新
- ✅ `claude-api-gas-design.md` 更新
- ✅ キャッシュキー `v4` / `1.1.3`
- ✅ GAS v22 デプロイ・パイロット 8/8
- ✅ formal 禁止語 0 件
- ✅ シーン多様性 OK
- ✅ `data/current` 11 件・validate OK
- ✅ 本レポート更新
