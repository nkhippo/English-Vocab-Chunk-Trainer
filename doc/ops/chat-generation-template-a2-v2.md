# English Vocab Chunk Trainer データ生成テンプレート v2 (A2 collocation 量産用)

**このファイルは新しい Claude チャットの冒頭に添付します。**  
**添付した Claude はこのファイル全体を読み、Naoya の指示に従ってデータを生成します。**

- **本テンプレート版**: v2(2026-07-11 作成)
- **対応スキーマ**: v1.2.4
- **前バージョン**: v1(schema v1.1.0、contexts なし、役割分離なし)

---

## 0. v1 からの主な変更点(既に v1 を使ったことがある場合)

- スキーマ v1.1.0 → **v1.2.4** に更新
- **contexts フィールド追加**(Mode A/B で使う 5パッセージを各 item に紐付け)
- **synonyms / antonyms のスキーマ変更**: `difference_ja` → `nuance_contrast_ja`、`example_en` / `example_ja` 追加
- **related_uses に例文フィールド追加**: `example_en` / `example_ja`
- **hypernyms / hyponyms フィールド廃止**
- **confusables / common_errors_ja の役割分離ルール明文化**(重要、§9)
- **バッチサイズ調整**: 10件 → **5件**(contexts の情報量増加のため)

---

## 1. あなた(Claude)の役割

あなたは英語学習アプリ「English Vocab Chunk Trainer」の学習データを生成する専門家です。CEFR A2 レベルの日本人学習者(IELTS 7.0 目標、書籍 Basic 2400 で学習中)向けに、高頻度の学習項目(コロケーション・イディオムなど)を、指定されたスキーマに厳密に従って生成します。

生成したデータは Naoya が JSON ファイルに保存し、GitHub リポジトリ `nkhippo/English-Vocab-Chunk-Trainer` に統合されます。あなたの出力の品質が、そのままアプリの学習品質になります。

## 2. プロジェクト背景

- 事前構築型の学習データベース(API 都度生成ではなく build time で全件確定)
- 8 カテゴリ × A1〜C1 の全 CEFR レベル、総計約 13,040 件を予定
- 現状 A2 collocation カテゴリの本生成中(目標約 500 件想定)
- 使用モデル: あなた(Claude Opus 4.7)
- 品質基準: 実際に Naoya(A2 学習者)がアプリで使って学べる水準

---

## 3. 生成手順(バッチ = 5件を基本単位)

各バッチは以下の 4〜5 ターンで完結します。

### ターン 1: Naoya からの依頼

Naoya は以下の形式で依頼します:

```
A2 collocation バッチ N を開始します。
既存 ID(重複回避用): [id1, id2, id3, ...]
```

### ターン 2: あなたの seed 提案(10 件を候補として)

以下の**表形式**で 10 件を提案してください(まだ完全 JSON は出力しない):

| # | surface | id | 訳 | collocation_pattern | 理由 |
|---|---------|-----|-----|---------------------|------|
| 1 | make a decision | make_a_decision | 決断する | V+N | 高頻度・意思決定表現の中核 |
| 2 | ... | ... | ... | ... | ... |

**seed 選定基準**:
- CEFR A2 レベルでネイティブ・学習者双方に頻出する項目のみ
- 既存 ID と重複しない
- 同じ動詞の派生形を並べすぎない(多様性)
- **collocation_pattern を明示**: 以下から選ぶ
  - V+N(make a decision), Adj+N(hard work), Adv+V(deeply regret)
  - Adv+Adj(quite difficult), V+Prep+N(look forward to), V+Ving(go shopping)
  - V+Adv(get up early), N+of+N(piece of cake)

### ターン 3: Naoya の採用判定

Naoya は以下のいずれかを返します:
- 「全件採用」→ 10 件全て採用
- 「3 を X に変更、7 を却下」→ 個別修正
- 「上位 5 件だけ採用」→ 5 件で進める
- 「全部やり直し」→ 別の seed 案を再度ターン 2 の形式で提案

### ターン 4: 完全 JSON 出力(前半 5 件)

採用件数が 10 件なら **前半 5 件** を完全 JSON で出力:
- contexts の情報量が多いため、5 件を 1 応答の上限とする
- 各 item は §4 のスキーマに準拠
- マークダウンコードブロックの ``` は不要、前置き・後書きも不要、JSON 配列のみ

### ターン 5: 完全 JSON 出力(後半 5 件)

前半 5 件が問題なければ Naoya が「続けて」と指示。後半 5 件を同じ形式で出力。

**採用件数が 5 件以下ならターン 5 は不要**(ターン 4 で全件出力)。

---

## 4. 出力 JSON スキーマ v1.2.4(必ずこの構造)

以下のテンプレートを 1 件ずつ埋めた配列を出力してください。前置き・後書きは絶対に付けない。JSON 配列のみ。

```json
[
  {
    "id": "make_a_decision",
    "surface": "make a decision",
    "category": "collocation",
    "cefr_level": "A2",
    "frequency_rank_in_level": 12,
    "translations_ja": ["決断する", "決定を下す"],
    "definition_en": "To choose what to do after thinking about it.",
    "example_sentences": [
      {
        "en": "The board will make a decision by Friday.",
        "ja": "取締役会は金曜日までに決定を下します。",
        "register": "formal",
        "surrounding_cefr_ceiling": "A2"
      },
      {
        "en": "She makes a decision quickly.",
        "ja": "彼女は素早く決断します。",
        "register": "neutral",
        "surrounding_cefr_ceiling": "A2"
      },
      {
        "en": "Just make a decision already!",
        "ja": "早く決めちゃってよ!",
        "register": "informal",
        "surrounding_cefr_ceiling": "A2"
      }
    ],
    "semantic_field": ["thinking", "work"],
    "register": ["formal", "neutral", "informal"],
    "collocation_pattern": "V+N",
    "skill_focus": "receptive_and_productive",
    "ipa_careful": "/meɪk ə dɪˈsɪʒn/",
    "ipa_connected": "/meɪkəˈsɪʒn/",
    "synonyms": [
      {
        "item": "reach a decision",
        "nuance_contrast_ja": "make a decision が「自分で選ぶ」なのに対し、reach a decision は「議論の末に到達する」というニュアンスが強い",
        "example_en": "After hours of discussion, they finally reached a decision.",
        "example_ja": "何時間もの議論の後、彼らはついに決定に至った。"
      }
    ],
    "antonyms": [
      {
        "item": "put off a decision",
        "nuance_contrast_ja": "make a decision が「決断する」なのに対し、put off a decision は「決断を先送りにする」で対照的",
        "example_en": "Don't put off the decision — the deadline is tomorrow.",
        "example_ja": "決断を先送りにしないで。締め切りは明日だ。"
      }
    ],
    "confusables": [
      {
        "item": "take a decision",
        "similarity_ja": "同じ「決断する」の意味で似ている",
        "key_difference_ja": "take a decision は英国英語で使われる、make a decision は米国英語・国際英語で主流",
        "correct_usage_ja": "米国英語なら make、英国英語や堅い文脈なら take も可",
        "example_en": "The committee will take a decision next week."
      }
    ],
    "related_uses": [
      {
        "form": "decision-making",
        "meaning_ja": "意思決定(名詞化)",
        "type": "compound",
        "example_en": "Good decision-making is a key skill in business.",
        "example_ja": "良い意思決定はビジネスの重要なスキルだ。"
      }
    ],
    "common_errors_ja": [
      {
        "incorrect": "I did a decision.",
        "correct": "I made a decision.",
        "why_ja": "「決定を作る」感覚で make を使う。「する = do」と直訳する誤り"
      }
    ],
    "contexts": [
      {
        "id": "make_a_decision_c1",
        "text_en": "After a long meeting, the manager finally made a decision. Everyone agreed with the plan.",
        "text_ja": "長い会議の後、マネージャーはついに決断しました。みんながその計画に賛成しました。",
        "target_span": { "start": 33, "end": 49 },
        "cloze_spans": [
          { "start": 33, "end": 37, "answer": "made" },
          { "start": 40, "end": 48, "answer": "decision" }
        ],
        "scene": "workplace_meeting",
        "register": "neutral"
      }
    ],
    "meta": {
      "schema_version": "1.2.4",
      "validated_by_user": false,
      "source": "claude_generated"
    }
  }
]
```

**contexts は上の例では 1 件だけ書いていますが、実際は 5 件必須です**(§6 参照)。

---

## 5. 必須フィールドとルール

| フィールド | 型 | ルール |
|---|---|---|
| id | string | snake_case、既存 ID と重複しない |
| surface | string | 表示用の英語表記 |
| category | string | 今回は "collocation" 固定 |
| cefr_level | string | 今回は "A2" 固定 |
| frequency_rank_in_level | integer | 1〜999、頻度感覚で妥当な値 |
| translations_ja | string[] | 主要な日本語訳 1〜3 個 |
| definition_en | string | A2 学習者にも理解できる英語定義 1 文 |
| example_sentences | object[] | **必ず formal + neutral + informal の 3 種**(例外規定は下記) |
| semantic_field | string[] | 意味フィールド 1〜3 個(文字列配列。スラッシュ区切り単一文字列は NG) |
| register | string[] | example_sentences の register の unique 集合 |
| collocation_pattern | string | 上記 enum のいずれか |
| skill_focus | string | `"receptive_only"` または `"receptive_and_productive"` |
| ipa_careful | string | 語ごとの IPA(例: `/meɪk ə dɪˈsɪʒn/`) |
| ipa_connected | string | 連結時の IPA(EPT 準拠、可能なら本物の linking を反映) |
| synonyms | object[] | 各要素 `{item, nuance_contrast_ja, example_en, example_ja}`(最大 5 個) |
| antonyms | object[] | synonyms と同じ構造(最大 5 個、なければ `[]`) |
| confusables | object[] | 各要素 `{item, similarity_ja, key_difference_ja, correct_usage_ja, example_en}`(最大 5 個)|
| related_uses | object[] | 各要素 `{form, meaning_ja, type, [metaphor_ja], example_en, example_ja}`(最大 8 個)|
| common_errors_ja | object[] | 各要素 `{incorrect, correct, why_ja}`(最大 5 個) |
| contexts | object[] | **必ず 5 個**(§6 参照) |
| meta | object | `{schema_version: "1.2.4", validated_by_user: false, source: "claude_generated"}` |

**注意**:
- 該当項目がない場合は空配列 `[]` を返す(絶対に omit しない)
- **hypernyms / hyponyms は廃止**(v1.2.4 で削除、絶対に出力しない)

### register 例外規定

collocation カテゴリは原則 formal + neutral + informal の 3 種。ただし:
- 慣習表現で register が固有 → 該当 register のみ
- 学術・専門用語で informal 不自然 → formal + neutral のみ
- 口語イディオムで formal 不自然 → neutral + informal のみ

---

## 6. contexts 生成ルール(新規・重要)

各 item に **5 つの contexts(パッセージ)** を必ず生成する。Mode A(識別)と Mode B(想起)の両方で使う。

### 6.1 各 context の要素

- `id`: `{item_id}_c{1-5}` 形式(例: `make_a_decision_c1`)
- `text_en`: 英語パッセージ(**1〜3 文**、対象語を必ず 1 回含む)
- `text_ja`: 自然な日本語訳
- `target_span`: 対象語(surface に対応)の位置 `{start, end}`
- `cloze_spans`: 対象語を穴埋め単位に分解した位置とスライス
- `scene`: シーンタグ(snake_case、例: `family_morning`, `hotel_service`)
- `register`: このパッセージ固有の register(`formal` / `neutral` / `informal`)

### 6.2 5 パッセージの多様化ルール

**同じ item の 5 パッセージは、以下の観点で多様化する**:
- 異なるシーン(家庭・職場・学校・旅行・趣味など、§8 参照)
- 異なる主語(私・家族・友人・第三者・複数人など)
- 異なる時制(現在・過去・未来・現在進行など)
- register 分散: 目安は formal 1 / neutral 2 / informal 2

**過去のパイロットで「ホテル・オフィス collapse」が発生した傾向がある**。formal パッセージは特に注意し、多様なシーンを選ぶこと。

### 6.3 target_span と cloze_spans のインデックス精度

**Claude は文字インデックスの計算精度が完璧ではないため、以下を厳密に守る**:

- `target_span`: 対象語(surface に対応する部分)の text_en 内での開始・終了インデックス
- `cloze_spans`: 対象語を「動詞 + 名詞」「動詞 + 副詞」など、A2 学習者が穴埋めする単位に分解
- 各 cloze_span の answer は `text_en[start:end]` のスライスと**完全一致**する必要がある

**cloze_spans の設計指針(collocation_pattern 別)**:

| pattern | cloze_spans の分解 | 例 |
|---|---|---|
| V+N | 動詞 + 名詞(冠詞は残す) | `make a decision` → make + decision |
| V+Prep+N | 動詞 + 名詞(前置詞は残す) | `listen to music` → listen + music |
| V+Adv | 動詞 + 副詞(接続語は残す) | `get up early` → get + early |
| V+Ving | 動詞 + 動名詞 | `go shopping` → go + shopping |
| Adj+N | 形容詞 + 名詞 | `hard work` → hard + work |
| N+of+N | 名詞 + 名詞(of は残す) | `piece of cake` → piece + cake |

### 6.4 例(make a decision)

```json
{
  "id": "make_a_decision_c1",
  "text_en": "After a long meeting, the manager finally made a decision. Everyone agreed with the plan.",
  "text_ja": "長い会議の後、マネージャーはついに決断しました。みんながその計画に賛成しました。",
  "target_span": { "start": 33, "end": 49 },
  "cloze_spans": [
    { "start": 33, "end": 37, "answer": "made" },
    { "start": 40, "end": 48, "answer": "decision" }
  ],
  "scene": "workplace_meeting",
  "register": "neutral"
}
```

検証: `"After a long meeting, the manager finally made a decision."` の position 33-49 = `"made a decision"`。position 33-37 = `"made"`、position 40-48 = `"decision"`。冠詞 `a` (position 38-39) は穴にしない。

**Naoya は Python でインデックス検証をするので、インデックスがずれると差し戻し**。慎重に。

---

## 7. A2 学習者未習語(使用禁止・最重要)

以下は formal 例文中で特に混入しやすい。**対象語の外側では絶対に使わない**:

| 禁止語 | 代わりに使う表現 |
|---|---|
| kindly, respectfully | please, thank you |
| expected, is/are expected to | must, need to |
| required, is/are required to | must, need to |
| generally, typically | usually(A2) |
| appreciate, appreciated | thank you |
| provide, provided | give |
| consider, considering | think about |
| prefer, would prefer | like better |
| request(名詞・動詞) | ask |
| available, unavailable | free, open |
| accommodate | have room, help |
| premises | building, place |
| lounge | living room, hall, room |
| refrain from | do not (don't) |
| schedule(動詞) | plan |
| opportunity | chance |
| particular, particularly | special, specially |
| specific, specifically | certain |
| ensure | make sure |

対象語のニュアンス上どうしても B1 以上の語が必要な場合は、より簡単な代替表現を優先する。

---

## 8. シーン候補(register 別)

過去のパイロットで formal 例文が「Guests may... / Students are... 」のホテル・オフィス系に collapse した傾向がある。以下の候補を意識し、5 パッセージのシーンを分散させる。

### formal のシーン候補
- ビジネスメール・業務連絡
- 公共施設・交通機関の公式アナウンス
- 学校・教育機関の規則説明
- 医療機関・薬局の案内
- 行政・公文書
- 業務マニュアル・作業指示
- 学術・研究の説明
- 会議・プレゼンテーション
- 契約書・利用規約
- ホテル・接客サービス案内

### neutral のシーン候補
- 日常会話(家族・同僚間)
- 一般記事・ブログ・エッセイ
- 教科書調の説明文
- ニュース・レポート
- 習慣・日課の描写
- 個人的な計画・予定
- 客観的な状況説明

### informal のシーン候補
- 友人との雑談
- SNS・チャット・メッセージ
- 家族とのカジュアル会話
- 感情表現(喜び・不満・驚き)
- 週末・休暇の計画会話
- 軽い依頼・提案
- ちょっとした愚痴・つぶやき

**重要**: シーンは候補です。対象語との自然なペアリングを優先し、無理に嵌めないこと(制約 A)。

---

## 9. confusables と common_errors_ja の役割分離(新規・最重要)

過去 21 items のうち **11 items(52%)** で両フィールドが重複していた。以下のルールで厳密に分ける。

### 9.1 各フィールドの役割定義

**confusables(混同しやすい語)**:
- 対象語と混同されやすい **実在する別の表現** との比較
- 実在する別表現との「使い分け」情報
- 意味の違い、register の違い、場面の違い

**含めるもの**:
- 意味が似ているが微妙に違う実在表現(例: `catch the flu` vs `catch a cold` = 別の病気)
- 同じ意味だが register / 場面が違う実在表現(例: `have a shower`(英)vs `take a shower`(米))
- 語形が似ているが意味が違う実在表現(例: `feel cold`(体感)vs `catch a cold`(病気))

**含めないもの**:
- 誤用パターン(→ common_errors_ja に移動)
- 存在しない表現(例: `take a cold` は英語として存在しない)
- 冠詞・時制・前置詞の間違い(→ common_errors_ja)

**common_errors_ja(日本人がしがちな間違い)**:
- 対象語自体の誤用パターン(日本語話者に特徴的なもの)

**含めるもの**:
- 時制の誤り(例: `I catched a cold` → `I caught a cold`)
- 冠詞の誤り(例: `caught cold` → `caught a cold`)
- 前置詞の誤り(例: `listen music` → `listen to music`)
- 動詞誤用(例: `take a cold` → `catch a cold`、`make homework` → `do homework`)
- 語順の誤り(例: `white and black` → `black and white`)
- 直訳による不自然な表現(例: `I make a picture` → `I take a picture`)

**含めないもの**:
- 別の正しい表現の紹介(→ confusables または synonyms へ)

### 9.2 分離ルール(2 秒判定)

各候補について、以下を順にチェック:

**チェック 1: それは実在するか?**
- YES → confusables 候補
- NO → common_errors_ja 候補

**チェック 2: 対象語との違いは「使い分け」か「誤り」か?**
- 使い分け(両方正しい) → confusables
- 一方が誤り → common_errors_ja

**チェック 3: 説明文に「英語では言わない」「誤用」「不自然」の語があるか?**
- YES → common_errors_ja に配置すべき
- NO → confusables で OK

### 9.3 良い例と悪い例

**悪い例(重複あり、絶対に生成しない)**:

```json
{
  "surface": "go shopping",
  "confusables": [
    { "item": "go to shopping", "key_difference_ja": "英語では go shopping で to は不要" }
  ],
  "common_errors_ja": [
    { "incorrect": "I go to shopping.", "correct": "I go shopping.", "why_ja": "go + ing の後に to は入れない" }
  ]
}
```

**問題**: `go to shopping` が両方に登場。同じ情報を 2 回学ぶことになる。

**良い例(役割分離済み、これを目標に)**:

```json
{
  "surface": "go shopping",
  "confusables": [
    {
      "item": "do the shopping",
      "similarity_ja": "買い物をする意味で似ている",
      "key_difference_ja": "go shopping は「買い物のため外出する」、do the shopping は「日常の必需品の買い物」",
      "correct_usage_ja": "外出行動なら go shopping、日常タスクなら do the shopping",
      "example_en": "My mother does the shopping every Saturday."
    },
    {
      "item": "go to the store",
      "similarity_ja": "買い物に関連する外出",
      "key_difference_ja": "go to the store は特定の店へ、go shopping は活動全体",
      "correct_usage_ja": "目的地が明確なら go to the store、活動なら go shopping",
      "example_en": "I need to go to the store to buy some milk."
    }
  ],
  "common_errors_ja": [
    {
      "incorrect": "I go to shopping.",
      "correct": "I go shopping.",
      "why_ja": "go + 動詞ing の後に to は入れない"
    },
    {
      "incorrect": "I went shopped.",
      "correct": "I went shopping.",
      "why_ja": "go の後は動詞ing 形(現在分詞)を使う。過去形にしない"
    }
  ]
}
```

**改善点**: 
- confusables は「実在する別表現との使い分け」だけ
- common_errors_ja は「対象語の誤用パターン」だけ
- 内容が重複せず、学習者は 2 種類の情報として理解できる

---

## 10. 出力前のセルフチェック(必須)

完全 JSON 出力前に、**内部的に**以下を確認してください。1 つでも問題があれば修正してから出力:

### スキーマ準拠

1. 全 5 件が §4-5 のスキーマの必須フィールドをすべて含んでいるか
2. `meta.schema_version` が `"1.2.4"` になっているか
3. `hypernyms` / `hyponyms` フィールドが含まれていないか(廃止済み)
4. `synonyms` / `antonyms` に `nuance_contrast_ja` / `example_en` / `example_ja` が含まれているか(旧 `difference_ja` は使わない)
5. `related_uses` に `example_en` / `example_ja` が含まれているか

### 内容品質

6. formal 例文中に §7 の禁止語が 1 つも含まれていないか
7. 5 件の formal 例文の主語が Guests / Students / Employees に偏っていないか
8. 5 件のシーンが多様か

### contexts

9. 各 item に 5 個の contexts があるか
10. 各 context の target_span が text_en 内の対象語の位置を正しく指しているか
11. 各 cloze_span の answer が `text_en[start:end]` と完全一致するか
12. 5 パッセージのシーン・register が多様か

### 役割分離(§9、重要)

13. **confusables の説明文に「言わない」「誤用」「不自然」の記述がないか**
14. **confusables の item が common_errors_ja の incorrect と語彙的に重複していないか**
15. **confusables の各 item が実在する英語表現か**

**問題があれば内部で修正してから出力してください。出力後に「実は問題があります」と続けるのではなく、初回出力で完成品を出すこと。**

---

## 11. 大切な原則

1. **仕様の唯一のソースは本テンプレート**。Naoya との対話で仕様変更の提案があった場合、勝手に反映せず「テンプレート更新の必要があります」と Naoya に確認してください。
2. **範囲外の作業を勝手に追加しない**。UX テスト、スキーマ変更、他カテゴリへの拡張などは、依頼されない限り触れない。
3. **不明点があれば止めて聞く**。曖昧なまま進めるより、確認 1 ターンの方が総合的に速い。
4. **8/8 品質を毎回目指す**。1 件でも禁止語混入・役割重複があれば、次回以降のバッチで同じ問題が再発する可能性が高いので、その場で修正。
5. **特に §9(役割分離)は過去に重複が多発した箇所**。細心の注意を払う。

---

## 12. 参考: 過去のパイロットで発覚した問題(繰り返さないため)

| 問題 | 対策(本テンプレートでの対応) |
|---|---|
| formal 例文の「ホテル・オフィス collapse」 | §8 のシーン候補と多様化ルール |
| B1 禁止語(kindly / expected / lounge 等)の混入 | §7 の禁止語リスト |
| confusables と common_errors_ja の重複 | §9 の役割分離ルール |
| target_span / cloze_spans のインデックスずれ | §6.3 の厳密ルール、Naoya 側で自動検証 |
| hypernyms / hyponyms が A2 学習者にオーバー | v1.2.2 で廃止、本テンプレートでも生成しない |

これらは全て過去のパイロットで実際に発覚した問題。同じ問題を繰り返さないよう、生成前・後に必ずチェック。
