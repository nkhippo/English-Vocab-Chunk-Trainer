# データ運用手順書 (Data Operations Guide)

`english-vocab-chunk-trainer`（GitHub: `nkhippo/English-Vocab-Chunk-Trainer`）のデータベースを段階的に拡張・保守する運用手順を記述する。データが A2 → B1 → B2 → C1 と拡張されるたび、Basic 2400 の学習が進行するたびに、本手順に沿って更新を行う。

**GAS エンドポイント（Phase 1）**:  
`https://script.google.com/macros/s/AKfycbzXBNFUfmG6dTbHhw4xNI-n_gB0QYNL-dYpddSHEK9Pe4a-4hp-CmhjL4c8iTPcPqsU/exec`  
（ローカルは `.env` の `GAS_ENDPOINT_URL`。詳細は `gas/README.md`）

スキーマ正本: `doc/spec/learning-data-schema.json`（旧称 `data-schema.json`）。

### データの置き場（一本化）

- **正本**: `data/current/`（Git 管理）。CLI（seed / merge / validate）もここを読む。
- **PWA**: `src/lib/db` が `@data/current/items.json` を import（`vite.config.ts` の alias）。`src/data/current` へのコピーは置かない。
- merge 後は `pnpm run validate` を実行し、コミット対象は `data/current/` のみでよい。

---

## 1. データバージョニング

### 1.1 バージョン体系

データベース(items + insights + schema)を **SemVer** で管理する。

- **MAJOR**: 後方互換性のないスキーマ変更(フィールド削除、型変更)
- **MINOR**: 後方互換のあるスキーマ変更(フィールド追加、CEFR レベル追加)
- **PATCH**: 個別データの追加・修正・誤字訂正

現在: `1.0.0`(A1 フレーズ + A2 全カテゴリ)

### 1.2 バージョン別スナップショットの管理

各 MINOR / MAJOR リリースで `data/releases/v{MAJOR}.{MINOR}.0/` に完全スナップショットを保存する。ロールバック時に使う。

```
data/
├── current/                    # 現在稼働中のデータ
│   ├── items.json
│   ├── insights.json
│   └── schema.json
├── releases/
│   ├── v1.0.0/                 # A1 フレーズ + A2
│   ├── v1.1.0/                 # + B1
│   └── v1.2.0/                 # + B2
└── migrations/                  # スキーマ差分
    └── 1.0.0-to-1.1.0.md
```

---

## 2. 新しい CEFR レベルの追加(例: B1 → B2)

### 2.1 事前準備

- [ ] 現在のデータ(`data/current/items.json`)をバックアップ
- [ ] Basic 2400 の進捗を確認、該当ユニット範囲を把握
- [ ] Claude API 用の GAS エンドポイントの稼働確認

### 2.2 実行手順

1. **seed 生成**: `scripts/pipeline/generate-seed.ts` を新レベル指定で実行
   ```bash
   pnpm run generate:seed --cefr=B2 --category=all
   ```
   - GAS 経由で Claude API を呼び、カテゴリ × B2 の候補を生成
   - 出力: `data/staging/B2_seeds.json`

2. **貴殿の検証**: `scripts/review-ui.ts` で検証 UI を起動
   ```bash
   pnpm run review --input=data/staging/B2_seeds.json
   ```
   - ブラウザで採用/却下/レベル修正を判断
   - 出力: `data/staging/B2_validated.json`

3. **enrichment 生成**: 検証済みデータに対して意味関係・混同語・派生用法・典型誤用・例文・IPA を生成
   ```bash
   pnpm run generate:enrichment --input=data/staging/B2_validated.json
   ```
   - 出力: `data/staging/B2_enriched.json`

4. **enrichment レビュー**: サンプル 10% を目視確認、全体は自動バリデーションのみ
   - スキーマ検証: `pnpm run validate --input=data/staging/B2_enriched.json`
   - 周辺語彙 CEFR 上限違反の検出: `pnpm run check:cefr-ceiling`

5. **統合**: 既存 items.json にマージ
   ```bash
   pnpm run merge --new=data/staging/B2_enriched.json --into=data/current/items.json
   ```
   - 重複 ID の検出 → 上書き or スキップの選択
   - 出力: `data/current/items.json` 更新

6. **リリース**: バージョンを更新、スナップショット保存
   ```bash
   pnpm run release --version=minor
   ```

### 2.3 想定工数(B2 の場合)

- seed 生成: 30 分(Claude API 実行時間)
- 貴殿の検証: 4〜6 時間(4,700 件 × 3〜5 秒/件)
- enrichment 生成: 2 時間
- レビュー・統合: 1 時間
- **合計: 8〜10 時間**(週末 1〜2 日で完了)

---

## 3. Basic 2400 完走進捗に伴うマッピング更新

貴殿が Basic 2400 の学習を進めるたびに、`book_alignment.basic_2400_units` タグを追加していく。

### 3.1 タグ付けの実施タイミング

- **書籍のユニット単位で終えた時**: そのユニットに登場した語彙・フレーズをアプリ側で検索し、`book_alignment.basic_2400_units` にユニット番号を追加
- **一括バッチ**: 5〜10 ユニット分をまとめて 1 回で処理するのが効率的

### 3.2 実施手順

1. Basic 2400 のユニット N を書籍で完了
2. ユニット N の見出し語・熟語リストを CSV で書き出す(手作業、20 分)
3. スクリプト実行:
   ```bash
   pnpm run map:basic2400 --unit=5 --input=data/basic2400/unit5.csv
   ```
   - CSV の各項目を items.json で検索(surface 部分一致)
   - マッチしたら `book_alignment.basic_2400_units` に 5 を追加
   - マッチしなかった項目はレポート出力
4. マッチしなかった項目は貴殿が手動確認、必要ならデータ追加

### 3.3 マッチしない場合の判断

- **単に登録されていない場合**: seed 生成対象に追加
- **カテゴリが異なる場合**(例: 書籍では単語として扱っているが、アプリではコロケーションで登録済み): 手動でリンク
- **Basic 2400 特有の低頻度語で今後も使わない場合**: 登録しない(取捨選択)

---

## 4. スキーマ変更(フィールド追加・変更)

### 4.1 後方互換のあるフィールド追加(MINOR)

例: `learning_note_ja` フィールドを新規追加

1. `learning-data-schema.json` に新フィールドを **optional** として追加
2. マイグレーションスクリプト `scripts/migrate.ts` で既存データに空値を埋める
   ```typescript
   items.forEach(item => {
     if (!item.learning_note_ja) item.learning_note_ja = "";
   });
   ```
3. スキーマ検証を全件に実行
4. MINOR バージョンアップ、`migrations/` に差分メモを追加

### 4.2 後方互換のないスキーマ変更(MAJOR)

例: `translations_ja` を string[] から `[{ ja: string, priority: int }]` に変更

1. 変更計画を `migrations/{version}.md` に記述
2. データ変換スクリプトを作成し、テストデータで検証
3. 本番データにバックアップを取ってから適用
4. MAJOR バージョンアップ

**推奨**: MAJOR 変更は極力避け、新フィールド追加(MINOR)で対応する設計を選ぶ。

---

## 5. データ品質チェック

各リリース前に以下の自動チェックを実行する。

### 5.1 スキーマ検証
- 全 items が `learning-data-schema.json` に準拠
- 必須フィールドの存在確認
- 型・enum の妥当性

### 5.2 参照整合性
- `synonyms[].item` / `antonyms[].item` / `hypernyms` / `hyponyms` が存在する ID を指すか、または plain 表現か
- `insight_id` が実在するか
- `related_uses[].form` の整合性

### 5.3 周辺語彙 CEFR 上限違反
- `example_sentences[].surrounding_cefr_ceiling` が item の `cefr_level` を超えていないか
- 例文本文の語を CEFR 判定し、上限を超える語がないか

### 5.4 register 網羅性
- 対象 item に neutral / formal / casual の例文が仕様通り揃っているか(item 種類による例外規定を含む)

### 5.5 重複検出
- 同じ `surface` + `category` の重複がないか
- 類似 ID の存在(スペルミス検出)

---

## 6. IPA データの管理

### 6.1 IPA Trainer からの供給

貴殿の `nkhipko/English-Pronunciation-Trainer` の wordlist を単一の source of truth とする。

- 単語の `ipa_careful` / `ipa_ga` / `ipa_rp` は IPA Trainer から取得
- IPA Trainer にない語(主にフレーズ)は本アプリ側で生成、貴殿の検証を経る

### 6.2 同期スクリプト

```bash
pnpm run sync:ipa --from=<IPA_TRAINER_JSON_URL>
```

- IPA Trainer 側の更新を検知し、既存項目の IPA を更新
- フレーズは対象外(手動維持)

### 6.3 フレーズ IPA(connected speech)の生成

- Claude API に依頼するのではなく、貴殿の narrow IPA 生成スクリプト(Python)を再利用
- Linking / assimilation / elision / flap-t のルールベース処理

---

## 7. リリースチェックリスト

各バージョンリリース前に必ず確認:

- [ ] 全 items が最新スキーマに準拠(自動)
- [ ] 参照整合性チェック通過(自動)
- [ ] 周辺語彙 CEFR 上限違反ゼロ(自動)
- [ ] 新規追加分の 5% サンプル目視確認(手動)
- [ ] Basic 2400 マッピング進捗の反映(手動、該当時のみ)
- [ ] `data/releases/v{version}/` にスナップショット保存
- [ ] `CHANGELOG.md` 更新
- [ ] タグ push、GitHub Release

---

## 8. トラブルシューティング

### 8.1 Claude API が期待通りの出力を返さない
- プロンプトの `doc/ops/claude-api-gas-design.md` を確認
- temperature を下げる(0.3 → 0.1)
- 出力形式を JSON Schema で明示

### 8.2 スキーマ検証が通らない
- ajv-cli の詳細エラーメッセージを確認
- スキーマ側 or データ側どちらの問題か判別

### 8.3 データが肥大化
- IndexedDB のクォータ確認(通常 50 MB〜数 GB)
- 例文数上限(現状 5)を守っているか

---

## 9. 定期メンテナンス

- **月次**: 貴殿の SRS 進捗を集計、苦手項目の傾向分析
- **四半期**: データ品質チェックのフルスキャン
- **半年**: 新カテゴリ・新 CEFR レベル追加の計画見直し
