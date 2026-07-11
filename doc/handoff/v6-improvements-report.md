# v6 UI 改善 作業報告

対象: `nkhippo/English-Vocab-Chunk-Trainer`  
指示書: `cursor_instruction_v6_ui_improvements.md`（Downloads）  
最終更新: 2026-07-11  
前提: `doc/handoff/full-redesign-handoff-report.md` / `doc/handoff/addendum-v5-1-handoff-report.md`

---

## 1. サマリ

| 項目 | 結果 |
|---|---|
| Step 1 モーダル IA 改善 | **実装済み** |
| Step 2 IPA タブ + EPT 同期 | **実装済み**（フレーズは合成。EPT connected 完全一致 0 件） |
| Step 3 Insight UI | **実装済み**（プレースホルダー 3 件で動作確認） |
| Step 4 カテゴリ確認 | **部分完了**（word 除外・8 ラベル確認。パイロット 10 件は未到着） |
| `pnpm build` / `pnpm validate` | **OK** |
| checkmark / 音声 / Build モデル | **未変更**（非スコープ遵守） |

---

## 2. Step 1 — 詳細モーダル IA

| 変更 | 内容 |
|---|---|
| E/F/G デフォルト畳 | 既に `defaultOpen={false}`。維持 |
| 空セクション非表示 | C/D/E/F が空なら見出しごと非表示（whats_up で「特になし」連続なし） |
| 二重言語見出し | ja: 「混同しやすい語」等。en は英語のみ |
| skill_focus / category | `labelSkillFocus` / 既存 `labelCategory` |
| Common Errors | 横並び `❌ … → ✅ …`（狭幅は縦矢印） |
| メタ未設定 | `（未設定）` を小さく表示 |

---

## 3. Step 2 — IPA / EPT

### 配置

```
data/reference/ept/
├── wordlist_GA_a1a2_plus_phonics.csv   # EPT からコピー（2840 語）
├── connected_speech.json                # 201 件
├── weak_forms.json
└── README.md
```

### スクリプト

| コマンド | 役割 |
|---|---|
| `pnpm run sync:ipa-ept` | word カテゴリの `ipa_careful` を EPT 置換（現状 word 0 件） |
| `pnpm run sync:phrase-ipa-ept` | フレーズの `ipa_connected` を EPT 引用 or 単語 IPA 連結合成 |

### UI

- `IpaTabs`: 「語ごと / 連結」タブ（デフォルト: 語ごと）
- 適用箇所: 詳細モーダルヘッダー、Mode A/B `TargetSidePanel`

### 合成例

| surface | 旧 connected（例） | 新 connected |
|---|---|---|
| catch a cold | `/ˈkætʃ ə ˈkoʊld/`（アクセント差のみ） | `/kætʃəkoʊld/` |
| What's up? | — | `/wʌtʌp/` |

EPT `connected_speech` に現行 11 フレーズの完全一致は **0**。高度な linking（同化・脱落）は残課題。

---

## 4. Step 3 — Insight

| パス | 役割 |
|---|---|
| `src/components/insight-card/InsightCard.tsx` | カード UI（type バッジ・本文・関連） |
| 詳細モーダル | `insight_id` があるとき「💡 語源・由来を見る」→ モーダル内展開 |
| Mode A/B | 「保留」後 2 秒で InsightCard フェードイン |

### サンプルデータ（プレースホルダー）

| insight id | target | type |
|---|---|---|
| `insight_catch_a_cold_metaphor` | catch_a_cold | metaphor |
| `insight_take_a_picture_core` | take_a_picture | core_image |
| `insight_have_breakfast_cultural` | have_breakfast | cultural |

本文先頭に【サンプル】と明記。Naoya 公式 3 件到着後に差し替え予定。  
`schema_version` を **1.2.1** に上げ、Dexie 再同期を保証。

---

## 5. Step 4 — カテゴリ

- 8 カテゴリの日本語ラベルは `enum.category.*` で既存対応
- `filterEligibleTrainItems`: `category !== 'word' && contexts?.length === 5`
- **パイロット 10 件（5×2）は未到着のため未マージ** → 残タスク

---

## 6. Definition of Done

### 7.1 UI

- [x] E/F/G デフォルト畳
- [x] 「特になし」セクション非表示
- [x] 二重言語表記整理
- [x] skill_focus / category ラベル
- [x] Common Errors 視覚改善

### 7.2 IPA/EPT

- [x] EPT 3 ファイル配置
- [x] 単語 IPA スクリプト（word 0 件のため更新 0）
- [x] フレーズ IPA スクリプト（合成 11）
- [x] careful/connected タブ（モーダル + Mode A/B）

### 7.3 Insight

- [x] InsightCard
- [x] モーダル導線
- [x] 保留時自動提示
- [x] サンプル 3 件で動作（公式データ待ち）

### 7.4 カテゴリ

- [x] 8 カテゴリバッジラベル
- [x] word の Mode A/B 除外
- [ ] パイロット 10 件マージ → 21 件 validate（**未実施・データ待ち**）

### 7.5 全体

- [x] `pnpm build` OK
- [x] 本レポート / scope-questions / repository-structure 更新
- [x] main マージ + push

---

## 7. 残タスク

| 優先度 | タスク | 備考 |
|---|---|---|
| 高 | パイロット 10 件（5 カテゴリ×2）マージ | 到着後 `items.json` → validate → 21 件 |
| 高 | Insight 公式サンプル 3 件への差し替え | 現状はプレースホルダー |
| 中 | connected IPA の高度 linking | assimilation / elision（weak_forms 活用） |
| 中 | EPT connected_speech に無いフレーズの人手校正 | 合成の `[decision]` 等 |
| 低 | 音声再生・GA/RP 切替・IPA Trainer 遷移 | 指示書 §1.2 保留 |
| 低 | 探索モード（Insight 絞り込み） | §4.4 ③ 今回保留 |

スコープ外の疑問は `doc/handoff/v6-scope-questions.md` を参照。

---

## 8. Claude 向けブリーフィング

1. **体験改善の中心**は詳細モーダルの情報密度削減（空セクション非表示・E/F/G 畳・見出し整理）。
2. **IPA**は EPT 参照データをリポジトリに同梱。現行フレーズは合成連結。タブ UI は仕様 §5.2 準拠。
3. **Insight**は UI 完了。データはサンプル 3 件。公式データとカテゴリ 10 件は Naoya 提供待ち。
4. **触っていないもの**: checkmark 拡張、音声、Build モデル、SRS、Mode C、新規 UX テスト。
5. 確認 URL: https://nkhippo.github.io/English-Vocab-Chunk-Trainer/ — 単語帳で whats_up / catch_a_cold、Mode A で保留→ Insight。

---

## 9. 参照

- 指示書: `cursor_instruction_v6_ui_improvements.md`
- スコープ外疑問: `doc/handoff/v6-scope-questions.md`
- 全面刷新: `doc/handoff/full-redesign-handoff-report.md`
- contexts: `doc/handoff/addendum-v5-1-handoff-report.md`
