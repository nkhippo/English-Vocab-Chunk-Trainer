# MVP UI 作業報告（情報充足度判断用）

対象: `nkhippo/English-Vocab-Chunk-Trainer`  
指示書: `cursor_instruction_mvp_ui.md`（Downloads）  
最終更新: 2026-07-10  
前提: `doc/handoff/pilot-v4-handoff-report.md`（11 件データ・DoD OK）

---

## 1. サマリ

| 項目 | 結果 |
|---|---|
| 単語帳詳細モーダル | **実装済み** |
| Mode A（識別）MVP | **実装済み** |
| Mode B（想起）MVP | **実装済み** |
| SRS / Mode C / 検索 / GAS Runtime | **未実装**（スコープ外どおり） |
| `pnpm build` | **OK** |
| `data/current` 変更 | **なし** |
| Naoya 向け評価シート | `doc/ops/ux-evaluation-checklist.md` |

---

## 2. 実装した 3 つの UI

### 2.1 単語帳詳細モーダル

| パス | 役割 |
|---|---|
| `src/components/item-detail-modal/ItemDetailModal.tsx` | 詳細モーダル本体（セクション A〜G） |
| `src/features/browse/BrowsePage.tsx` | CEFR タブ + 一覧カード + モーダル起動 |

- A2 タブに 11 件（`getItemsByCefr`）を surface + `translations_ja[0]` のカードで表示
- モーダル: ヘッダー / 例文 register タブ / confusables・common_errors（展開）/ 関連語・派生・メタ（折りたたみ）
- 閉じる: 外側タップ・×・ESC

### 2.2 Mode A（識別）

| パス | 役割 |
|---|---|
| `src/features/train/mode-a/ModeAPage.tsx` | 問題画面 |
| `src/lib/quiz/distractors.ts` | distractor 生成 |

- ルート: `/train/mode-a`
- 4 択（正解 1 + distractor 3）
- 右上トグル: **confusables 優先（デフォルト ON）** ↔ ランダム
- 正誤フィードバック →「詳細を見る」「次の問題」
- セッション連続正解数表示（localStorage 保存なし）

### 2.3 Mode B（想起）

| パス | 役割 |
|---|---|
| `src/features/train/mode-b/ModeBPage.tsx` | 問題画面 |

- ルート: `/train/mode-b`
- ヒントレベル 1〜3（右上トグルで循環）
  - Lv1: 日本語訳のみ
  - Lv2: + `definition_en`
  - Lv3: + `semantic_field`
- 「タップで解答を見る」→ surface / IPA / neutral 例文
- 入力欄なし（自己申告 MVP）

---

## 3. ナビゲーション（アクセス手順）

| 画面 | URL（GitHub Pages） |
|---|---|
| ホーム | `https://nkhippo.github.io/English-Vocab-Chunk-Trainer/` |
| 単語帳 | `/browse` → A2 タブ → カードタップ |
| Mode A | `/train/mode-a` または ホーム「Mode A」 |
| Mode B | `/train/mode-b` または ホーム「Mode B」 |
| 学習ハブ | `/train` |

ローカル: `pnpm dev` → `http://localhost:5173/English-Vocab-Chunk-Trainer/`（base path 要確認）

---

## 4. トグル挙動確認

| トグル | 期待 | 実装 |
|---|---|---|
| Mode A distractor | confusables 優先 / ランダム切替、次問題から反映 | OK（切替時は未回答なら選択肢再生成） |
| Mode A confusables 補充 | 3 件未満はランダム補充 | OK（`buildModeAChoices`） |
| Mode A confusables 訳 | items に無い場合 `correct_usage_ja` → item 文字列 | OK |
| Mode B ヒント Lv1〜3 | トグルで即時反映 | OK |

---

## 5. Definition of Done（§7）

| # | 項目 | 判定 |
|---|---|---|
| 7.1 | 単語帳詳細モーダル | **OK** |
| 7.2 | Mode A | **OK** |
| 7.3 | Mode B | **OK** |
| 7.4 | build / 型 | **OK**（実機 3 環境は Naoya 確認待ち） |
| 7.5 | ハンドオフ | **本ファイル + checklist** |

---

## 6. 既知の制約・妥協点

1. **スクリーンショット**: CI 環境のため未添付。Naoya が実機評価時に撮影推奨。
2. **サンプル 3 件**（make_a_decision 等）は例文 register が 1 種のみ → モーダルのタブは 1 つのみ表示（データ仕様どおり）。
3. **Mode A distractor**: confusables の多くは 11 items 外の語 → フォールバック表示が英語 item 名になる場合あり（指示書 §8.2 どおり）。
4. **ダークモード・アニメーション**: スコープ外。
5. **Dexie 初回ロード**: ブラウザに古い IndexedDB があると件数がずれる場合あり → 設定または DevTools で DB クリアで解消。

---

## 7. Claude への展開ガイド（Naoya 用）

### 7.1 最初に伝える結論

> MVP UI（単語帳詳細・Mode A・Mode B）を実装し main push 済み。11 件で情報充足度の実機評価に入れる状態。量産 GO/NO-GO は Naoya のチェックリスト結果待ち。

### 7.2 添付・参照ファイル

| 優先 | ファイル |
|---|---|
| 1 | 本ファイル `doc/handoff/mvp-ui-handoff-report.md` |
| 2 | `doc/ops/ux-evaluation-checklist.md`（Naoya 記入用） |
| 3 | `doc/handoff/pilot-v4-handoff-report.md`（データ品質の前提） |
| 4 | `doc/spec/learning-data-schema.json`（改定議論時） |

### 7.3 技術サマリ（Claude 向け）

- データ: `data/current/items.json` 11 件を Dexie 経由でバンドル読込。**GAS 呼び出しなし**
- 新規: `ItemDetailModal`, `ModeAPage`, `ModeBPage`, `lib/quiz/distractors.ts`
- ルート: `/train/mode-a`, `/train/mode-b`
- Mode A: distractor 方式比較用トグル（Naoya が confusables vs random を判断）
- Mode B: ヒント 3 段階トグル（Naoya がデフォルトレベルを判断）

### 7.4 依頼例

- 「チェックリスト結果に基づきスキーマ改定指示書を作成」
- 「判定 A なら A2 collocation 量産 GO のバッチ手順を確認」
- 「Mode A distractor を confusables 固定にすべきか設計判断」

### 7.5 次のアクション（評価後）

| Naoya の判定 | 次ステップ |
|---|---|
| A（量産 GO） | `doc/ops/data-operations-guide.md` に沿い A2 collocation 量産 |
| B/C/D | スキーマ or プロンプト改訂指示書 → 再パイロット |
| E | 追加 8 件パイロット |

---

## 8. 変更ファイル一覧

```
src/components/item-detail-modal/
src/features/train/mode-a/
src/features/train/mode-b/
src/features/train/TrainPage.tsx
src/features/browse/BrowsePage.tsx
src/features/home/HomePage.tsx
src/lib/quiz/
src/lib/db/index.ts          # getItemsByCefr
src/app/App.tsx              # routes
src/lib/i18n/locales/*.json
doc/ops/ux-evaluation-checklist.md
doc/handoff/mvp-ui-handoff-report.md
```
