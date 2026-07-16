---
id: pj-2026-07-11-67bf
aliases:
- pj-2026-07-11-67bf
title: confusables と common_errors_ja の役割分離ガイドライン
created: '2026-07-11'
---

# confusables と common_errors_ja の役割分離ガイドライン

対象: `nkhippo/English-Vocab-Chunk-Trainer`  
本ガイドラインの作成: Claude Opus 4.7  
用途: 
- 既存 items の修正判断基準
- 将来の量産テンプレート改訂(`doc/ops/chat-generation-template-a2-v2.md`)への反映
- Cursor / Claude Desktop での生成品質担保

---

## 0. 背景と目的

v7 実装後の実機評価で、Naoya から「混同しやすい語 と 日本人がしがちな間違い の差がわからない」との指摘。分析の結果、21 items のうち **11 items(52%)** で両フィールドに同じ内容が重複していることが判明。

原因は、両フィールドの役割定義が曖昧だったこと。本ガイドラインで役割を厳密に分離する。

---

## 1. 役割の定義

### 1.1 confusables(混同しやすい語)

**定義**: 対象語と混同されやすい **実在する別の表現** との比較

**含めるもの**:
- 意味が似ているが微妙に違う実在表現(例: `catch the flu` vs `catch a cold` = 別の病気)
- 同じ意味だが register / 場面が違う実在表現(例: `have a shower`(英)vs `take a shower`(米))
- 語形が似ているが意味が違う実在表現(例: `feel cold`(体感)vs `catch a cold`(病気))
- 同じ意味の同義表現とニュアンス差(例: `get a cold`(口語)vs `catch a cold`(中立))

**含めないもの**:
- 誤用パターン(→ common_errors_ja に移動)
- 存在しない表現(例: `take a cold` は英語として存在しない)
- 冠詞・時制・前置詞の間違い(→ common_errors_ja)
- 日本語話者特有の直訳誤り(→ common_errors_ja)

### 1.2 common_errors_ja(日本人がしがちな間違い)

**定義**: **対象語自体の誤用パターン**(日本語話者に特徴的なもの)

**含めるもの**:
- 時制の誤り(例: `I catched a cold` → `I caught a cold`)
- 冠詞の誤り(例: `caught cold` → `caught a cold`)
- 前置詞の誤り(例: `listen music` → `listen to music`)
- 動詞誤用(例: `take a cold` → `catch a cold`、`make homework` → `do homework`)
- 語順の誤り(例: `white and black` → `black and white`)
- 直訳による不自然な表現(例: `I make a picture` → `I take a picture`)
- 単複の誤り(例: `homeworks` → `homework`(不可算))

**含めないもの**:
- 別の正しい表現の紹介(→ confusables に移動)
- 単純に「〜も使える」の情報(→ synonyms または confusables)

---

## 2. 分離ルール(2 秒判定チェック)

各候補について、以下を順にチェック:

### チェック 1: それは実在するか?

- **YES** → confusables 候補
- **NO** → common_errors_ja 候補

例:
- `catch cold`(古風・文語的だが実在) → confusables
- `take a cold`(実在しない誤用) → common_errors_ja

### チェック 2: 対象語との違いは「使い分け」か「誤り」か?

- **使い分け(両方正しい)** → confusables
- **一方が誤り** → common_errors_ja

例:
- `have breakfast` vs `eat breakfast`(両方正しい) → confusables
- `have breakfast` vs `have a breakfast`(a が誤り) → common_errors_ja

### チェック 3: 説明文に「英語では言わない」「誤用」「不自然」の語があるか?

- **YES** → common_errors_ja に配置すべき(confusables に置いていたら誤り)
- **NO** → confusables で OK

例:
- 「英語では take a cold とは言わない」→ common_errors_ja
- 「catch cold は古風・文語的な形」→ confusables(実在するが古い)

---

## 3. 良い例と悪い例の対比

### 悪い例(重複あり)

```json
{
  "surface": "go shopping",
  "confusables": [
    {
      "item": "go to shopping",           // ❌ 実在しない誤用
      "key_difference_ja": "英語では go shopping で to は不要"
    }
  ],
  "common_errors_ja": [
    {
      "incorrect": "I go to shopping.",   // ❌ 上と重複
      "correct": "I go shopping.",
      "why_ja": "go + ing の後に to は入れない"
    }
  ]
}
```

**問題**: `go to shopping` が両方に登場。同じ情報を2回学ぶことになる。

### 良い例(役割分離済み)

```json
{
  "surface": "go shopping",
  "confusables": [
    {
      "item": "do the shopping",          // ✓ 実在する別表現
      "key_difference_ja": "go shopping は「買い物のため外出」、do the shopping は「日常の必需品の買い物」",
      "example_en": "My mother does the shopping every Saturday."
    },
    {
      "item": "go to the store",           // ✓ 実在する別表現
      "key_difference_ja": "go to the store は特定の店へ、go shopping は活動全体",
      "example_en": "I need to go to the store to buy some milk."
    }
  ],
  "common_errors_ja": [
    {
      "incorrect": "I go to shopping.",   // ✓ 誤用パターン
      "correct": "I go shopping.",
      "why_ja": "go + 動詞ing の後に to は入れない"
    },
    {
      "incorrect": "I go shopping to the mall.",
      "correct": "I go shopping at the mall.",
      "why_ja": "場所を示すときは at を使うのが自然"
    }
  ]
}
```

**改善点**: 
- confusables には「実在する別表現との使い分け」だけ
- common_errors_ja には「対象語の誤用パターン」だけ
- 内容が重複せず、学習者は 2 種類の情報として理解できる

---

## 4. 量産テンプレート改訂への反映

**反映済み(2026-07-11)**: `doc/ops/chat-generation-template-a2-v2.md` §9 および `doc/ops/chat-generation-workflow-v2.md` に本ガイドラインの役割分離ルールを組み込み済み。

以下は v2 テンプレートに取り込まれた改訂案の要約:

```markdown
### confusables(混同しやすい語)の生成指示

対象語と混同されやすい **実在する別の表現** を 2〜4 件生成する。各要素は以下を含む:
- item: 実在する別表現(必須)
- similarity_ja: 対象語との似ている点(1文)
- key_difference_ja: 対象語との違い(1文、「使い分け」の観点で)
- correct_usage_ja: 使い分けのルール(1文)
- example_en: item を使った例文(A2 レベル、8-15語)

**含めてはいけない**:
- 実在しない表現(例: 冠詞や前置詞が間違った形)
- 誤用パターン(それらは common_errors_ja へ)
- 「英語では言わない」「誤用」「不自然」の記述

### common_errors_ja(日本人がしがちな間違い)の生成指示

対象語自体の誤用パターンを 3〜5 件生成する。各要素は以下を含む:
- incorrect: 誤った英文(1文、日本人がしがちなもの)
- correct: 正しい英文
- why_ja: なぜ間違いなのかの説明(1〜2文、日本語話者向け)

**含めてはいけない**:
- 別の正しい表現の紹介(それらは synonyms または confusables へ)
- 学習者が普通は間違えない事項

### セルフチェック(生成後)

以下を確認してから出力:
1. confusables の item が全て実在する表現か
2. confusables の説明文に「言わない」「誤用」「不自然」の語がないか
3. common_errors_ja の incorrect と confusables の item が語彙的に重複していないか
4. 両フィールドで同じ話題を扱っていないか
```

---

## 5. 修正対象 items(参考)

分析の結果、以下 11 items の confusables / common_errors_ja が修正対象。修正パッチは `confusables_common_errors_fix_patches.json` として別途提供:

**Cursor 生成の 7 items**:
- take_a_picture
- have_breakfast
- do_homework
- catch_a_cold
- take_a_shower
- go_shopping
- listen_to_music

**私(設計チャット)生成の 4 items**:
- however
- black_and_white
- of_course
- for_example

**問題なしの 10 items**(修正不要):
- make_a_decision, look_forward_to, whats_up(サンプル、confusables 少ない/なし)
- get_up_early(Cursor 生成)
- actually, piece_of_cake, under_the_weather, day_and_night, airport, living_room(私生成)

---

## 6. 次のアクション

1. **Cursor**: `confusables_common_errors_fix_patches.json` をマージ(11 items の該当 2 フィールドを差し替え)
2. **Naoya**: 実機で修正後の go_shopping / catch_a_cold などを確認、重複感が解消されているか判定
3. **設計チャット(私)**: 量産テンプレート v2 へ本ガイドラインを反映 → **完了**(`doc/ops/chat-generation-template-a2-v2.md`)

これで、A2 量産開始時には confusables / common_errors_ja の役割分離が担保された状態になる。
