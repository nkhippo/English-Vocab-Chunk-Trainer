---
id: pj-2026-07-11-9b84
aliases:
- pj-2026-07-11-9b84
title: Chat 内 Opus によるデータ生成 運用ガイド v2
created: '2026-07-11'
---

# Chat 内 Opus によるデータ生成 運用ガイド v2

**Naoya さん専用の運用手順書です。新しい Claude チャットを開いて A2 collocation データを量産するときに、この手順に従ってください。**

- **本ガイド版**: v2(2026-07-11 作成)
- **対応テンプレート**: `chat-generation-template-a2-v2.md`(schema v1.2.4)
- **前バージョン**: v1(schema v1.1.0、contexts なし)

---

## 0. v1 からの変更点(v1 を使ったことがある場合)

- **バッチサイズ**: 10件 → **5件**(contexts の情報量増加のため、1 応答で 5 件が上限)
- **各バッチのターン数**: 3〜4 → **4〜5**(10 件採用時は完全 JSON を 2 分割で出力)
- **1 チャート = 5〜10 バッチ**(=25〜50 件)を目安に区切る
- **A2 collocation 全体 = 500 件想定** → **10〜20 チャート**必要(v1 の 5〜10 チャートから増加)

---

## 1. 全体像(所要時間の目安)

- **1 バッチ = 5〜10 件生成**、Naoya さん作業時間 15〜20 分
- **1 チャート = 5〜10 バッチ = 25〜50 件** を目安に区切る
- **A2 collocation 全体 = 約 500 件** = **10〜20 チャート**
- 1 日 1 チャート進めれば、**約 3 週間で A2 collocation 完了想定**

---

## 2. カテゴリ着手順(既に決定)

以下の順に進めます。1 カテゴリ完了ごとに `data/current/items.json` に統合します。

1. **collocation**(進行中、現行 `data/current` に A2 collocation **9 件**マージ済み、残り約 490 件想定)
2. phrasal_verb
3. idiom
4. binomial
5. compound
6. institutionalized
7. word
8. other

---

## 3. 新チャート開始時の準備

### 3-1. 添付ファイルの準備

新チャートを開くとき、以下を添付します:

1. **`chat-generation-template-a2-v2.md`**(必須・冒頭に添付)
2. **既存 ID の抜粋**(重複回避のため、初回以降必須)

### 3-2. 既存 ID の抽出

```bash
# data/current/items.json から A2 collocation の既存 ID を抽出
node -e '
  const data = JSON.parse(require("fs").readFileSync("data/current/items.json", "utf-8"));
  const ids = data.items
    .filter(i => i.category === "collocation" && i.cefr_level === "A2")
    .map(i => i.id);
  console.log(JSON.stringify(ids));
' > /tmp/existing_ids.json
cat /tmp/existing_ids.json
```

出力される ID 配列をコピーして、初回メッセージに貼ります。

### 3-3. 初回メッセージのテンプレート

```
A2 collocation バッチ 1 を開始します。
既存 ID(重複回避用): ["take_a_picture", "have_breakfast", "do_homework", "catch_a_cold", "take_a_shower", "go_shopping", "get_up_early", "listen_to_music", "make_a_decision"]

10 件の seed を提案してください。
```

Claude は表形式で 10 件の seed を提案してきます。

---

## 4. 各バッチの進め方(4〜5 ターン)

### ターン 2: seed 提案を受け取る

Claude が表形式で 10 件を提案してきます。以下を確認:

- 全 10 件が「A2 レベルで日常的に使う collocation」か
- 既存 ID と重複していないか
- 同じ動詞の派生形が並びすぎていないか

### ターン 3: 採用判定を返す

- 「全件採用」→ 10 件全て採用
- 「3 を X に変更、7 を却下」→ 個別修正
- 「上位 5 件だけ採用」→ 5 件で進める(1 応答で完了する場合)
- 「全部やり直し。今度は身体・健康・食事系を中心にお願いします」→ 別の seed 案を要求

### ターン 4: 完全 JSON(前半 5 件)を受け取る

Claude が JSON 配列(5 件分)を出力します。

**受け取ったら以下を確認**:
- [ ] JSON として valid か
- [ ] 5 件分あるか
- [ ] formal 例文に禁止語が含まれていないか(`kindly` / `expected` / `lounge` など)
- [ ] confusables に「言わない」「誤用」の表現が含まれていないか(役割違反)
- [ ] hypernyms / hyponyms フィールドが含まれていないか(廃止済み)
- [ ] contexts が各 item に 5 個あるか

問題なければ:
```
問題なさそうです。後半 5 件をお願いします。
```

問題があれば具体的に:
```
2 番目の item の confusables の 3 番目に「言わない」の記述があります。common_errors_ja に移動してください。
```

### ターン 5: 完全 JSON(後半 5 件)を受け取る

同じチェックを実施。問題なければ、この 10 件を保存 → 次のバッチへ。

### ターン 6〜: 次のバッチへ

同じチャートで続けます:

```
バッチ 2 を開始します。今度は「食事・健康」系を中心にお願いします。
既存 ID にはバッチ 1 の 10 件も加わったものとして進めてください。
```

---

## 5. バッチ JSON のローカル保存

### 5-1. 保存先

`data/staging/A2_collocation_batchN.json` に保存します。N はバッチ番号。

### 5-2. 保存方法

各バッチで受け取った JSON(2 応答を結合)をそのままファイルに保存:

```bash
# バッチ 3 の内容を保存
cat > data/staging/A2_collocation_batch3.json << 'EOF'
[
  { "id": "...", ... },
  ...
]
EOF
```

### 5-3. バッチごとの自動検証(推奨)

保存後、以下のコマンドで基本チェックを走らせる:

```bash
# 禁止語チェック
grep -E 'kindly|expected|lounge|required|generally|typically|appreciate|provide|consider|prefer|request|available|accommodate|premises|refrain|schedule|opportunity|particular|specific|ensure' \
  data/staging/A2_collocation_batch3.json
```

**該当行が出なければ OK**。出た場合は、その item を Claude に再生成依頼(その場のチャートで)。

### 5-4. contexts のインデックス検証

**contexts の target_span / cloze_spans は Claude の計算精度が完璧ではないため、必ず自動検証する**:

```bash
pnpm run verify:contexts -- data/staging/A2_collocation_batch3.json
```

成功時は `✓ contexts OK` と表示される。インデックスずれがあれば、Claude に該当 item のみ修正依頼。

（実装: `scripts/pipeline/verify-contexts.ts`。Dataset 形式の `data/current/items.json` も検証可。）

---

## 6. チャート切替の判断

以下のいずれかに当てはまったら、**次のチャートに切り替える**:

- **50 件(5〜10 バッチ)** 生成した
- Claude の応答が明らかに遅く/短くなってきた
- 生成物の品質が下がってきた(禁止語混入率が上がる、シーン多様性が落ちる、役割違反が増える)
- コンテキスト上限の警告が出た

切り替え方法: 新チャートを開き、Step 3 からやり直す(既存 ID には累積分すべて含めること)。

---

## 7. カテゴリ完了時の統合作業

collocation カテゴリで想定 500 件が集まったら、統合作業を行います。

### 7-1. バッチ JSON の結合

```bash
node -e '
  const fs = require("fs");
  const path = require("path");
  const dir = "data/staging";
  const files = fs.readdirSync(dir).filter(f => f.startsWith("A2_collocation_batch") && f.endsWith(".json"));
  const all = [];
  for (const f of files) {
    const items = JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8"));
    all.push(...items);
  }
  fs.writeFileSync(path.join(dir, "A2_collocation_all.json"), JSON.stringify(all, null, 2));
  console.log("Merged", files.length, "batches into", all.length, "items");
'
```

### 7-2. `data/current/items.json` にマージ

```bash
pnpm run merge -- \
  --new=data/staging/A2_collocation_all.json \
  --into=data/current/items.json
```

`pnpm run validate` でスキーマ準拠を最終確認。

### 7-3. git コミットと push

```bash
git add data/current/items.json
git commit -m "feat(data): A2 collocation full expansion (500 items)"
git push
```

### 7-4. ハンドオフレポート作成

`doc/handoff/a2-collocation-full-expansion-report.md` を作成し、以下を記録:

- 生成した件数と期間
- 使用したチャート数
- 禁止語混入率(あれば)
- 役割違反の発生回数(あれば)
- シーン多様性の傾向
- 次カテゴリ(phrasal_verb)への申し送り

---

## 8. 次カテゴリへの拡張

phrasal_verb / idiom などに着手する際は、**テンプレートを少し更新**します:

- カテゴリ名 `collocation` → `phrasal_verb` など
- `collocation_pattern` の代わりに phrasal_verb の分類(separable / inseparable など)を追加検討
- シーン候補は原則同じ

新テンプレート `chat-generation-template-a2-phrasal_verb-v1.md` は、その時のセッションで設計チャート(元のチャート)に戻って作成を依頼してください。

---

## 9. トラブルシューティング

### Q. Claude が禁止語を頻繁に混入させる

同じ禁止語が 3 バッチ連続で出たら、その語をテンプレートの禁止語リスト(§7)に追加する必要があるかもしれません。設計チャートに戻って報告してください。

### Q. Claude が confusables に誤用を書いてしまう(役割違反)

§9 の役割分離ルールを再度読み込むよう指示:
```
テンプレートの §9 を再確認してください。confusables は実在する別表現との使い分けのみ。誤用は common_errors_ja に。
```

3 バッチ連続で発生する場合は設計チャートに報告。

### Q. contexts の target_span / cloze_spans がずれる

該当 item のみ修正依頼:
```
{item_id} の contexts の cloze_spans を修正してください。text_en[start:end] が answer と一致しません。
```

### Q. シーンが collapse する

「食事・健康系を中心に」「教育・学校系は避けて」など、バッチごとにシーンを指定すると多様性を保てます。

### Q. Claude の応答品質が急に下がった

コンテキストが埋まってきたサイン。次のチャートに切り替えを推奨。

### Q. 既存 ID の抜粋が長すぎて添付できない

collocation カテゴリの既存 ID だけに絞れば、200 件までなら 1 メッセージに収まります。それ以上になったら、Claude に「重複チェックは surface レベルで判断してください」と伝え、ID リストの一部を省略してもよいです。

### Q. JSON が途中で切れて出力される

Claude の応答トークン上限に達している可能性。「続きを出力してください」と返せば残りを出してくれます。それでも切れる場合、次バッチは 3 件に減らします。

---

## 10. 次のアクション

1. このガイドと `doc/ops/chat-generation-template-a2-v2.md` を用意する
2. 新しい Claude チャートを開く
3. `chat-generation-template-a2-v2.md` を添付し、Step 3-3 の初回メッセージを送る
4. バッチ 1〜10 を進める
5. 50 件たまったら本チャート(設計チャート)に戻って進捗報告

不明点があればいつでもこの設計チャートに戻ってきてください。

---

## 付録: リポジトリ内の正本パス

| 用途 | パス |
|---|---|
| 生成テンプレート(Claude 添付用) | `doc/ops/chat-generation-template-a2-v2.md` |
| 本運用ガイド(Naoya 用) | `doc/ops/chat-generation-workflow-v2.md` |
| confusables / errors 役割分離 | `doc/ops/confusables-common-errors-role-separation.md` |
| contexts インデックス検証 | `pnpm run verify:contexts -- <json>` |
