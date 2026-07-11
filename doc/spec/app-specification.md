# 語彙学習アプリ 最終仕様 v3.3 (統合版)

v1/v2 を統合し、以下の追加要件を反映した最終仕様:
- PWA(Vite + React + Service Worker + IndexedDB)確定
- "What's up?" などの informal 慣習表現を明示的スコープに
- A1 レベルの **フレーズのみ** を追加(Basic 2400 の空隙補完)
- 日英 UI 切り替え、ガイドモーダル
- IPA 表記(単語)と linking 対応表記(フレーズ)
- モード設計と科学的根拠の体系化
- **意味関係・混同語・派生用法・典型誤用の enrichment フィールド追加**(全て事前計算)
- **CEFR 単語帳ビュー(参照・閲覧用)追加**
- **Mode A/B は文脈パッセージ型**(4 択ドリルは採用しない)

作業指示書・実装は本ドキュメントを唯一の参照ソースとする。

**v3.3 (2026-07-11) 改訂ノート**: v5〜v8 実装を仕様に反映:
- Mode A/B を文脈パッセージ型に確定(`contexts[]`・ハイライト / 穴埋め・OK/保留)
- Mode A/B UI からタイマー・中断・出会い回数・上部 CEFR バッジを削除(モバイル最適化)
- サイド/下部パネルに confusables・related_uses・学習履歴(▢表示)を追加
- IPA UI は語ごと(`ipa_careful`)を主表示。`ipa_connected` はデータに残置(将来 EPT フル引用用)

**v3.2 (2026-07-11) 改訂ノート**: v7 実装フィードバックを反映:
- `hypernyms` / `hyponyms` フィールドを廃止(A2 学習者にオーバースペック)
- synonyms / antonyms の `difference_ja` を `nuance_contrast_ja` に変更(対象語との対比を明示)
- synonyms / antonyms / related_uses に `example_en` / `example_ja` フィールドを追加
- `schema_version` を 1.2.3 に更新

**v3.1 (2026-07-09) 改訂ノート**: パイロットテスト結果に基づく整合性修正:
- register 表記を `informal` に統一（旧 `casual` は廃止）
- item.register を配列型に変更（複数 register 対応 item のブラウズビュー絞り込み対応）
- collocation_pattern enum を実データに基づき拡張（`V+Ving` / `V+Prep+N` / `V+Adv` を追加）

**実装ステータス (2026-07-11)**:
- Phase 1 PWA 骨格・ガイド・`/review`・`/browse`・Mode A/B(文脈型・v9 UX): **稼働中**（GitHub Pages）
- `data/current`: **21 件**（スキーマ v1.2.4）+ Insight 公式 3
- 日英 UI: 設定トグル + ガイド二言語。**実装方針**は `doc/ops/i18n-strategy.md`（3 層モデル）
- Mode C・SRS・音声再生: **Phase 2+**
- UX スモークテスト: **合格**（`doc/ops/ux-smoke-test-checklist.md`）
- confusables / common_errors 役割分離: **11 items 修正済み**
- A2 量産テンプレート: **v2 配置済み**
- Mode A: OK/保留なし・詳細任意・日本語訳任意（v9）
- 残: 空 example スロット補充・A2 collocation 本生成（9/〜500）・Mode B 本格 UX

---

## 1. アプリ概要

### 1.1 名称(仮)
Vocab & Chunk Trainer(仮称、後で確定)

### 1.2 ミッション
CEFR A1 レベルの学習者(貴殿)が、書籍(Basic 2400)完走後に、**IELTS 7.0(C1 下位)相当の語彙とチャンク運用力**を段階的に構築するための PWA。

### 1.3 到達目標
- 受容語彙: **6,000〜8,000 word families**
- 産出可能な語彙・チャンク: **3,000〜4,000**
- Speaking で自然にイディオムを使える水準(Band 7+ の要件)
- Writing でコロケーションを正確に使える水準

### 1.4 学習時間前提
1 日 15 分、期間 4〜5 年(週末に集中して短縮可能)。

---

## 2. スコープと非スコープ

### スコープ
- カテゴリ: **単語・イディオム・コロケーション・二項表現・複合語・句動詞・慣習表現・その他** の 8 カテゴリ
- CEFR レベル: A1(フレーズのみ)〜 C1(全カテゴリ)
- レジスター: formal / neutral / informal を明示的にタグ付け(*What's up?* は informal + greeting)
- 目的: 受容と産出の両方(産出はカテゴリ別に強度を調整)

### 非スコープ
- 構文(#7): 独立した文法学習の領域として除外。書籍(『一億人の英文法』等)に委譲
- 発音の詳細訓練: 貴殿の既存 IPA Pronunciation Trainer に委譲
- 会話練習(音声認識): 独立プロジェクト化する場合の別アプリ
- 単語の A1 レベル: Basic 2400 で担保(アプリ内では A1 は「フレーズのみ」に限定)

---

## 3. データモデル

### 3.1 学習項目のスキーマ

```
LearningItem {
  id: string                          // "make_a_decision"
  surface: string                     // "make a decision"
  category: enum {                    // 8 分類 + 単語
    "word", "collocation", "phrasal_verb", "idiom",
    "binomial", "compound", "institutionalized", "other"
  }
  cefr_level: enum { "A1", "A2", "B1", "B2", "C1", "C2" }
  frequency_rank_in_level: int        // レベル内の相対頻度順位
  
  // 意味と用法
  translations_ja: string[]           // ["決定する", "決断を下す"]
  definition_en: string               // 英英定義(B1 以降で表示)
  example_sentences: [
    {
      en: "She made a difficult decision.",
      ja: "彼女は難しい決断を下した。",
      register: "neutral" | "formal" | "informal", // 表現シーン
      surrounding_cefr_ceiling: "A2" | "B1" | ...  // 周辺語彙が超えない上限
    }
  ]
  
  // 分類補助タグ
  semantic_field: string[]            // ["thinking", "work"]
  register: Array<"formal" | "neutral" | "informal">  // 例文が実際に持つ register 集合。パイプラインで自動導出。
  collocation_pattern: enum {         // コロケーションのみ
    "V+N", "Adj+N", "Adv+V", "Adv+Adj", null
  }
  function_tag: string[]              // 慣習表現のみ ["greeting", "conversation_opener"]
  
  // 産出優先度
  skill_focus: enum {
    "receptive_only",                 // 受容のみ(イディオムの多く)
    "receptive_and_productive"        // 産出まで(コロケーション・句動詞)
  }
  
  // 発音
  ipa_careful: string                 // "/meɪk ə dɪˈsɪʒən/" 語ごと(現行 UI の主表示)
  ipa_connected: string               // "/meɪk‿ə‿dɪˈsɪʒən/" 連結。データ残置・UI タブは非表示可
  audio_ref: string                   // IPA Trainer の音声キー(該当時・再生は Phase 2+)
  
  // 書籍連携
  book_alignment: {
    basic_2400_units: int[]           // Basic 2400 の該当 Unit
    daily_1500_units: int[]
  }
  
  // Insight (語源・由来)
  insight_id: string | null           // Insight カードへの参照(存在する場合)
  
  // 意味関係のネットワーク(全て事前計算、Mode A/B/C の解説パネルで表示)
  synonyms: [
    {
      item: "reach a decision",       // 類義語または類義チャンク
      nuance_contrast_ja: "make a decision が意思決定そのものを指すのに対し、reach a decision は合意形成のニュアンスが強い",
      example_en: "After a long meeting, they finally reached a decision.",
      example_ja: "長い会議の末、彼らはようやく決定に至った。"
    }
  ]
  antonyms: [
    {
      item: "postpone a decision",
      nuance_contrast_ja: "make a decision が決断するのに対し、postpone a decision は決断を先送りにする",
      example_en: "They decided to postpone a decision until next week.",
      example_ja: "彼らは来週まで決定を先送りすることにした。"
    }
  ]
  
  // 混同しやすい語(コノテーション・レジスターで異なる近義)
  confusables: [
    {
      item: "cheap",
      similarity_ja: "「安い」意味では inexpensive と似ている",
      key_difference_ja: "cheapは「安っぽい・品質が悪い」ネガティブ含意あり、inexpensiveは中立",
      correct_usage_ja: "友人の服にはinexpensive、市場価格にはcheap",
      example_en: "an inexpensive but well-made shirt"
    }
  ]
  
  // 派生・応用(同じ動詞・核語の他の使い方、メタファー拡張)
  related_uses: [
    {
      form: "take off",
      meaning_ja: "離陸する / 服を脱ぐ / (人気などが)急上昇する",
      type: "phrasal_verb",
      metaphor_ja: "上昇のイメージが基本、そこから比喩的拡張",
      example_en: "The plane took off on time.",
      example_ja: "飛行機は定刻どおり離陸した。"
    },
    {
      form: "take out",
      meaning_ja: "取り出す / (レストランで)持ち帰る",
      type: "phrasal_verb",
      example_en: "We ordered takeout for dinner.",
      example_ja: "夕食はテイクアウトを注文した。"
    }
  ]
  
  // 日本人学習者の典型誤用(L1 干渉)
  common_errors_ja: [
    {
      incorrect: "do a decision",
      correct: "make a decision",
      why_ja: "「決定を作る」感覚で make。「する」を do と直訳する干渉に注意"
    }
  ]

  // Mode A/B 用パッセージ(word 以外。存在するときはちょうど 5 件)
  contexts: [
    {
      id: "make_a_decision_c1",
      text_en: "After thinking for a long time, she finally made a decision.",
      text_ja: "長い時間考えた末、彼女はようやく決断を下した。",
      target_span: { start: 42, end: 58 },
      cloze_spans: [{ start: 42, end: 58, answer: "made a decision" }],
      scene: "everyday",
      register: "neutral"
    }
    // … c2〜c5
  ]
  
  // 進捗管理(Phase 2+ SRS。現状データでは未使用。学習履歴▢は localStorage の checkmarks)
  srs_state: {
    ease_factor: float,
    next_review_at: timestamp,
    correct_streak: int
  }
}
```

### 3.1.1 事前計算 vs API 都度生成の判断

意味関係・混同語・派生用法・典型誤用のフィールドは **全て事前計算(build time で Claude 生成 + 貴殿の検証)** とする。理由:

- **静的情報**: これらは「その語について」の情報で、ユーザ文脈に依存しない。同じ語なら同じ回答になる性質のもの。
- **定量把握の要件**: 貴殿の方針「事前準備で総量を把握」と整合。
- **オフライン動作**: PWA としてネットワーク不要で全機能が動作する。
- **品質担保**: build 時に貴殿が承認 → リリース後の品質が確定する。
- **コスト**: 13,000 項目 × 平均 750 tokens output ≈ 10M tokens 出力。Claude Haiku なら現実的な一回コスト。

**例外**: Mode C(自由産出→添削)のみ、ユーザ文脈が実行時に決まるため API 都度生成のまま。ここは仕様上ズラせない。

### 3.1.2 例文生成の 2 大制約

例文(`example_sentences`)は次の 2 つの制約を必ず守る。

#### 制約 A: 語彙・チャンク優先、シーンは従属

例文生成の判断順序は以下で固定する(逆順にしてはならない):

1. まず対象語/チャンクの意味・用法・collocation_pattern を確定
2. 次に「その語がどの register で自然に使われるか」の可能な集合を判定
3. 最後に、対象語/チャンクの学習に最適な例文を各 register で作成

シーンや register を先に決めてから対象語を無理に嵌める順序は禁止。理由: シーン先行では対象語が例文中で「浮く」ケース(不自然な使われ方)が生じ、学習者が誤った用法を刷り込む。

#### 制約 B: register 別バリエーション

各項目は原則として **neutral 1 + formal 1 + informal 1 = 最低 3 例文**を持つ。ただし以下の例外がある:

- **慣習表現(institutionalized)** で register が固有な場合: *What's up?* は informal のみ、*How do you do?* は formal のみ、といった単一 register 例が正しい
- **学術・専門用語** で informal 使用が不自然な場合: formal + neutral の 2 種のみでよい
- **口語イディオム** で formal 使用が不自然な場合: neutral + informal の 2 種のみでよい

**item.register の導出**: 生成された example_sentences[].register の unique 集合を item.register として自動的に設定する（パイプライン側で処理）。手動でも LLM 出力でも設定しない。これにより両フィールドの整合が常に保たれる。

**設計意図**: 貴殿の目標(IELTS 7.0 Speaking で idiomatic 使用、Writing で collocation 正確)は register 認識に直結する。同じ語でも Speaking と Writing で選び方が変わることを、例文レベルで体感できる設計。

#### 制約 C: 周辺語彙の CEFR 上限

例文中の対象語以外の全語が、対象語の CEFR レベルを超えないこと。

- **B1 の学習項目の例文**: 対象語(B1)以外は A1〜B1 の語彙のみ使用可、B2 以上は禁止
- **A2 の学習項目の例文**: 対象語以外は A1〜A2 のみ

これは **理解可能なインプット仮説**(Krashen, i+1)を例文単位で担保するため。学習者が例文を読んで「対象語だけがわからない、他は既知」状態を作ることで、対象語の意味と使い方に集中できる。

技術的には、Claude API での生成時にプロンプトで明示 → 生成後に語彙レベルチェッカーで検証、を行う。詳細は Claude API 設計書(`doc/ops/claude-api-gas-design.md`)を参照。

### 3.2 Insight カード(語源・由来)スキーマ

```
Insight {
  id: string
  target_id: string                   // 参照される LearningItem の id
  type: enum {
    "morphology",                     // 形態素分解(prefix + root + suffix)
    "metaphor",                       // メタファー起源
    "cultural",                       // 文化的背景
    "cognate",                        // 語族関係
    "core_image"                      // 句動詞のコアイメージ
  }
  content_ja: string
  content_en: string                  // UI 言語切り替え用
  related_items: string[]             // 関連 LearningItem の id
  claude_generated: bool
  validated_at: timestamp
}
```

---

## 4. モード設計と科学的根拠

### 4.1 3 つのコアモード

学習アクションを **識別 / 想起 / 運用** の 3 モードに集約する。

#### Mode A: 識別 (Identify) - 受容語彙拡張
「文脈から意味を認識する」ための入力活動。

**具体タスク(現行実装)**:
- 短い英語パッセージ(`contexts[]`)を読む
- 対象チャンクをハイライト表示し、文脈から意味を推測する
- サイド/下部パネルで surface・IPA(語ごと)・訳・例文・混同語・関連用法・学習履歴を確認
- **OK / 保留** の自己評価後に次のパッセージへ(左スワイプ / `O`・`H`・Space|Enter 対応)
- `word` カテゴリは contexts を持たないため Mode A 出題対象外

**UI 方針(v8)**:
- モバイル優先の縦スクロール。タイマー・中断・出会い回数・上部 CEFR バッジは置かない
- 閉じるはヘッダー ×、またはハンバーガーからホームへ

**鍛えられるもの**:
- 受容語彙(passive vocabulary)
- Reading・Listening の即時理解

**科学的根拠**:
- **テスト効果**(Testing Effect; Roediger & Karpicke, 2006): 再認テストという「思い出す行為」自体が記憶を強化する。
- **必要努力仮説の低負荷版**: 文脈からの弁別作業が定着に寄与。
- **頻度効果**(Ellis, 2002): 高頻度接触が語彙定着の基本条件で、識別モードは接触回数を最大化できる。

#### Mode B: 想起 (Recall) - 発信語彙定着
「自分で引き出す」ための出力活動。

**具体タスク(現行実装)**:
- 上部に日本語訳全文、下部に穴埋め英文(`cloze_spans`)を表示
- 「解答を見る」で対象をハイライト表示し、Mode A と同系の詳細パネルを展開
- **OK / 保留** の自己評価後に次へ(Mode A と同じ操作系)
- タイピング入力は未実装(Phase 2+ の拡張候補)

**鍛えられるもの**:
- 発信語彙(active vocabulary)
- Writing 産出の即応性

**科学的根拠**:
- **想起練習**(Retrieval Practice; Karpicke & Blunt, 2011): 単に再読するより、想起する行為の方が長期記憶への転移が大きい(実験で 50% 以上の差)。
- **望ましい困難**(Desirable Difficulties; Bjork, 1994): 適度に難しい想起は短期成績を下げるが長期定着を高める。穴埋め想起はこれに該当。
- **産出効果**(Production Effect; MacLeod et al., 2010): 声に出す・書くことで記憶が強化される。

#### Mode C: 運用 (Apply) - 実運用力
「自分の状況で使う」ための添削型活動。

**具体タスク**:
- 対象チャンクを指定 → 自分の状況で 1 文書く → Claude API が添削
- 添削観点: 文法・自然さ・レジスター・コロケーション適合性・より良い代替表現

**鍛えられるもの**:
- Writing/Speaking の実運用能力
- コノテーション・レジスターの実感
- 誤用パターンの矯正

**科学的根拠**:
- **関与負荷仮説**(Involvement Load Hypothesis; Laufer & Hulstijn, 2001): 「必要性・探索・評価」を強く感じるタスクほど定着する。自分の状況を英訳する行為は関与負荷が高い。
- **深い処理仮説**(Depth of Processing; Craik & Lockhart, 1972): 意味的加工の深さが記憶の持続に直結する。自由産出は最も深い処理。
- **フィードバック効果**(Corrective Feedback; Ellis, 2009): 個別的な誤り指摘は、一般的説明より効果が大きい。

### 4.2 サポート層(全モード共通で利用可能)

コアモードに横断的に提供される機能。

#### IPA / 音声
- 学習項目カード上で IPA を表示。**現行 UI は語ごと(`ipa_careful`)を主表示**
- `ipa_connected`(連結)はデータに残置。UI タブは v7 で削除(将来 EPT フル引用時に復活可)
- タップで音声再生(IPA Trainer の GAS TTS 資産を利用)は **未実装(Phase 2+)**
- Mode A/B の実行中に発音表記を確認できる導線(サイド/下部パネル)

**根拠**: 音韻ループ(Baddeley の作動記憶モデル)を活用し、subvocalization(内的発音)を通じて記憶を強化。発音が不明確な語は長期定着しない。

#### Insight(語源・由来)
- 初回学習時は非表示(認知負荷回避)
- 単語帳詳細では任意展開
- Mode A/B で **保留** 後、`insight_id` がある項目は約 2 秒後に InsightCard をフェードイン
- 「探索モード」での自由閲覧は将来拡張

**根拠**: 認知負荷理論(Cognitive Load Theory; Sweller)- 新規学習時に語源まで見せると本質的学習(germane load)を圧迫する。定着直前に手がかりを追加するのが最適。

#### 学習履歴(チェックマーク ▢×3)
- browse / mode_a / mode_b 別に localStorage で保持(`vct_checkmarks_v1`)
- 単語帳詳細では操作可能。Mode A/B パネルでは **表示のみ**(操作可否は判断待ち)
- `srs_state` とは独立。SRS 実装時に関係を整理する

#### SRS(間隔反復)
- Mode A/B の結果に応じて自動スケジューリング(**未実装・Phase 2+**)
- 苦手項目は短間隔、定着項目は長間隔
- Mode C の産出結果も SRS 判定に加味

**根拠**: 
- **間隔効果**(Spacing Effect; Cepeda et al., 2006): 間隔を空けた反復は詰め込みより長期定着に優れる。
- **忘却曲線**(Ebbinghaus, 1885): 間隔反復は忘却直前に再学習することで、忘却率を段階的に低下させる。

#### CEFR 単語帳ビュー(Browse)
- Mode A/B/C とは別の **閲覧型 UI**。学習アクションではなく、参照・見通し用。
- CEFR レベル・カテゴリ・意味フィールド・レジスターで自由にフィルタし、一覧表示。
- 各項目に IPA、日本語訳、簡易ステータス(未学習/学習中/定着済み)を表示。
- 項目をタップで詳細画面(意味関係・混同語・派生用法・典型誤用・Insight を全て閲覧)。
- ソート: 頻度順・アルファベット順・進捗順(苦手→定着済み)。
- 検索: キーワード・意味・IPA から検索可能。

**目的**: 
- 学習の「全体像」を貴殿が把握するため。3 モードは項目単位の深掘りで、単語帳ビューはレベルごとの俯瞰。
- Basic 2400 のユニット完了時に、そのユニット対応項目を一覧確認できる導線。
- 参照ツールとして、書籍・記事を読んでいて「この語の周辺情報を確認したい」時に引ける。

**根拠**: 
- **メタ認知**(Metacognition; Flavell, 1979): 学習者が自分の学習状況を俯瞰できる仕組みが、動機付けと学習調整に寄与する。
- **アクセスの柔軟性**: 同じデータに 3 モード(訓練)と単語帳(参照)の 2 系統でアクセスすることで、学習項目の記憶手がかりが増える(手がかり多重化)。

### 4.3 モード × カテゴリ 適用マトリクス

各カテゴリでどのモードを重点的に使うか。○ = 標準実装、◎ = 重点、△ = 限定的、× = 対象外。

| カテゴリ | Mode A 識別 | Mode B 想起 | Mode C 運用 | 備考 |
|---|:-:|:-:|:-:|---|
| 単語 | ◎ | ○ | △ | 高頻度語のみ Mode C 対応 |
| コロケーション | ○ | ◎ | ◎ | 産出訓練の中核 |
| 句動詞 | ◎ | ◎ | ○ | 現行は文脈パッセージ。粒子選択特化は将来拡張 |
| イディオム | ◎ | △ | △ | 受容中心、Speaking 想定の一部のみ産出 |
| 二項表現 | ○ | ○ | × | 短時間ドリル向け |
| 複合語 | ◎ | △ | × | 綴りの正誤を Mode A で扱う |
| 慣習表現 | ○ | ○ | ◎ | Speaking の Discourse Markers で運用重視 |
| その他 | ○ | ○ | △ | サブタイプで差異あり |

---

## 5. IPA と Linking の扱い

貴殿の IPA Pronunciation Trainer 資産を最大限活用する設計。

### 5.1 単語(single word)の IPA

- **General American (GA)** を主表記、**Received Pronunciation (RP)** を副表記として切り替え可
- 貴殿の IPA Trainer の `ipa_ga` / `ipa_rp` フィールドとスキーマ互換
- 例: *decision* → `/dɪˈsɪʒən/` (GA) / `/dɪˈsɪʒn/` (RP)

### 5.2 フレーズの IPA(careful vs connected)

チャンクは **2 段階表記** で持たせる:

#### Careful speech(語ごと):
語境界を明示。学習初期の発音認識用。
例: *find out* → `/faɪnd aʊt/`

#### Connected speech(linking/elision 付き):
実際の口語での発音。IELTS Listening での聞き取り訓練に直結。
例: *find out* → `/faɪndaʊt/` または `/faɪn‿daʊt/`(連結記号)

#### 現象別の表記例

| 現象 | 例 | Careful | Connected |
|---|---|---|---|
| Linking(子音+母音) | *find out* | `/faɪnd aʊt/` | `/faɪndaʊt/` |
| Assimilation | *don't you* | `/doʊnt ju/` | `/doʊntʃu/` |
| Elision(t 省略) | *must be* | `/mʌst bi/` | `/mʌsbi/` |
| Weak form(to) | *want to go* | `/wɑnt tu ɡoʊ/` | `/wɑnəɡoʊ/` |
| Flap-t | *get out* | `/ɡɛt aʊt/` | `/ɡɛɾaʊt/` |

### 5.3 IPA Trainer との連携

- 貴殿の IPA Trainer は既に `connected speech phrases` と `weak forms` をカバー
- 本アプリではフレーズの connected speech 表記を持ちつつ、詳細な発音練習は IPA Trainer にリンクで遷移
- データ源として `nkhipko/English-Pronunciation-Trainer` の word list を再利用

### 5.4 UI での表示

- 学習項目カードの上部に IPA を常時表示
- タップで音声再生(GA/RP 切り替え可能)
- フレーズの場合、careful/connected をタブ切り替え
- 「IPA Trainer で発音練習」ボタンで遷移

---

## 6. UI/UX

### 6.1 日英 UI 切り替え

- 設定画面で **日本語 / 英語** の 2 択トグル
- 対象: メニュー・ボタン・ガイドテキスト・Insight カード・出題文の説明
- **項目の translations_ja は英語 UI モードでは非表示、代わりに `definition_en` を表示**(B1 以降の学習者が英英で理解する練習になる)
- 初期デフォルトは日本語、CEFR B1 到達を検出した段階で英語 UI への切り替えを提案

**設計意図**: 貴殿の言語学習理論(A1〜B1 は L1 介在、B1 以降は英英移行)に沿った段階的移行。他言語(韓国語・中国語・タガログ語等)の追加は将来の需要次第。

**実装メモ (Phase 1)**: UI クロームは `src/lib/i18n/locales/{ja,en}.json`、ガイドは `src/content/guide/pages.ts` の `{ ja, en }`、学習データ本文はスキーマフィールドのまま表示。スキーマキー名を UI に直書きしない（`doc/ops/i18n-strategy.md`）。英語 UI で `definition_en` 優先は Phase 2 の browse/train で適用。

### 6.2 ガイドモーダル

初回起動時、および設定画面からいつでも呼び出せる **オンボーディングモーダル**。以下を含む:

- **アプリの目的**: 何を学ぶアプリか、何を学ばないか
- **モード解説**: Mode A/B/C それぞれの目的・使い分け
- **CEFR とレベル選択**: 現在のレベル判定と、レベルの意味
- **書籍(Basic 2400)との連携方法**: 書籍のユニット完了時にどう使うか
- **SRS の仕組み**: 復習スケジューリングの動作原理
- **産出・受容の使い分け**: どのカテゴリで何を狙うか
- **IPA と発音**: IPA Trainer との連携

**設計意図**: 貴殿が挙げた「今後のプロンプトミスを防ぐ」目的。仕様がドキュメント化されていることで、後から自分でも設計意図を確認できる。

### 6.3 3 デバイス配慮

- **A(MacBook)**: PWA を Chrome/Safari で。デスクトップ用の広い画面レイアウト。
- **B(Windows PC)**: PWA を Chrome/Edge で。同上。
- **C(iPhone)**: PWA をホーム画面追加。モバイル向けの縦画面レイアウト。Safari の PWA サポート範囲内で動作。

同一の GitHub Pages URL / 同一データベースで、UI のみレスポンシブ切り替え。

---

## 7. データ規模(A1 フレーズ追加後)

v2 の 12,800 件に、A1 レベルのフレーズを追加した最終見立て。

| カテゴリ | A1 | A2 | B1 | B2 | C1 | 小計 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| 単語 | 0(書籍で担保) | 1,500 | 1,500 | 2,500 | 1,500 | 7,000 |
| イディオム | 10 | 30 | 80 | 200 | 150 | 470 |
| コロケーション | 100 | 500 | 700 | 1,200 | 700 | 3,200 |
| 二項表現 | 10 | 30 | 30 | 50 | 30 | 150 |
| 複合語 | 50 | 200 | 250 | 400 | 200 | 1,100 |
| 句動詞 | 30 | 80 | 150 | 200 | 100 | 560 |
| 慣習表現 | 30 | 50 | 80 | 100 | 70 | 330 |
| その他 | 10 | 40 | 60 | 80 | 40 | 230 |
| **レベル計** | **240** | 2,430 | 2,850 | 4,730 | 2,790 | **13,040** |

- **総計 約 13,040 件**
- A1 追加は **240 件**(全てフレーズ)
- Basic 2400 の書籍学習と並行して A1 フレーズを Mode A 中心で習得できる

---

## 8. 技術スタック

### 8.1 確定事項

- **フロントエンド**: Vite + React + TypeScript
- **配布**: PWA(Service Worker + Web App Manifest)、GitHub Pages ホスティング
- **データストレージ**: IndexedDB(13,000 件 + メタデータで数十 MB を想定)
- **音声**: 貴殿の GAS TTS + Google Drive キャッシュ資産を利用
- **AI 添削**: Claude API(Mode C 実行時のみ、`claude-haiku-4-5-20251001` 想定)
- **リポジトリ**: `nkhippo/English-Vocab-Chunk-Trainer`（GitHub Pages base: `/English-Vocab-Chunk-Trainer/`）
- **Claude API**: GAS Web App 経由（URL・モデル一覧は `doc/ops/claude-api-gas-design.md` §実装ステータス）

### 8.2 ライブラリ選定候補

- SRS ロジック: `ts-fsrs`(FSRS-4 実装)推奨、または SM-2 自作
- 音声再生: HTML5 Audio + キャッシュ済み URL
- 状態管理: Zustand(既存プロジェクトと整合)
- ルーティング: React Router
- スタイリング: Tailwind CSS(既存プロジェクトと整合)

---

## 9. 実装ロードマップ

### Phase 0: 設計固め(1〜2 週)
- 本仕様の確定
- データベーススキーマの詳細設計(JSON Schema)
- Cursor 指示書 v1 の作成

### Phase 1: データ構築 + PWA 骨格(進行中)
- A1 + A2 レベル全カテゴリの seed 生成(Claude API) — **パイロット 21 件まで完了、本生成未着手**
- **各項目の enrichment(意味関係・混同語・派生用法・典型誤用)を並行生成**
- 貴殿の週末 12〜15 時間での検証・承認
- 約 2,670 件のデータベース完成(目標)
- IPA Trainer / EPT からの IPA データ移植(部分完了)

### Phase 2: MVP 実装(大部分完了・残りあり)
- PWA 骨格 — **完了**
- Mode A(文脈識別) / Mode B(穴埋め想起) — **完了**(v5〜v8)
- **CEFR 単語帳ビュー(フィルタ・詳細モーダル)** — **完了**(検索は限定的)
- 基本 SRS — **未着手**
- 日英 UI 切り替え、ガイドモーダル — **完了**
- Basic 2400 連携タグ表示 — **データフィールドのみ、UI は限定的**
- 音声再生・GA/RP — **未着手**

### Phase 3: 拡張(継続的)
- Mode C(運用 + Claude 添削)実装
- B1 レベルデータ追加(3 ヶ月後)
- Insight カード拡充(現状サンプル 3 件)
- B2 レベルデータ追加(6 ヶ月後)
- C1 レベルデータ追加(12 ヶ月後)

---

## 10. 「なぜこのアプリを作るのか」

貴殿が半年後・1 年後に本仕様を読み返した時に、当初の設計意図を再確認できるように記録:

- **書籍(Basic 2400)だけでは、A2 以降の受容+産出+コロケーション+句動詞+イディオムを効率的にカバーできない**。書籍は良質だが、SRS の科学的スケジューリング、個人プロファイルに合わせた出題、AI 添削は書籍で代替不可能。
- **既存の英語学習アプリ(mikan, Anki, Duolingo など)は、CEFR レベル別のフレーズカテゴリ運用や、Claude API での動的添削を統合的に提供していない**。特に「書籍(Basic 2400)完走との継ぎ目のない連携」を実現しているものはない。
- **貴殿の IPA Trainer / Structure Trainer 資産と統合的に運用することで、語彙・発音・構文の 3 領域をトータルにカバーする貴殿専用の学習環境が構築できる**。
- **13,000 件の CEFR タグ付きデータベースは、貴殿が今後の英語学習を続ける限り、繰り返し使える資産**。書籍のように読み終えて棚に戻す性質のものではない。

---

## 11. 次のアクション

1. **空 example スロット補充** / confusables・common_errors 役割整理(設計チャット)
2. **A2 本生成**(約 2,430 件)の再開判断
3. Mode A/B 学習履歴▢の操作可否判断(`doc/handoff/v8-scope-questions.md`)
4. Mode C / SRS / 音声の Phase 2+ 着手判断
5. GAS enrich 本番デプロイのタイミング判断(現状保留)

まず 1(仕様レビュー)を経て、2〜3 に進むのが順序として自然です。
