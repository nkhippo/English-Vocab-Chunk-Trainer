# Claude API via GAS 設計書

`vocab-chunk-trainer` から Claude API を呼び出す際は、貴殿の既存 GAS 資産(IPA Trainer / Structure Trainer のパターン)に倣い、必ず **GAS(Google Apps Script)を経由**する。API キーをフロントエンドに露出させず、レート制御・キャッシュ・課金管理を一元化する。

---

## 1. アーキテクチャ

```
[PWA (Vite+React)]
  ↓ POST/GET
[GAS Endpoint (WebApp)]
  ├─→ Google Drive (キャッシュ層、SHA-256 キー)
  ├─→ Claude API (キャッシュヒットしない時のみ)
  └─→ Response
```

### 1.1 キャッシュ戦略

- 入力(プロンプト + パラメータ)から SHA-256 ハッシュを算出
- Google Drive に `cache/{sha256}.json` として保存
- 同じ入力に対する応答はキャッシュから返す(コスト削減 + 再現性)
- Build 時の全項目 enrichment は基本的にキャッシュヒットしない(初回)

### 1.2 GAS エンドポイント一覧

| エンドポイント | 用途 | タイミング |
|---|---|---|
| `/generate-seed` | カテゴリ × CEFR の候補生成 | Build時 |
| `/enrich-item` | 個別項目の全 enrichment 生成 | Build時 |
| `/generate-examples` | register 別例文生成 | Build時 |
| `/generate-insight` | 語源・由来生成 | Build時 |
| `/validate-cefr` | 例文中の周辺語彙 CEFR チェック | Build時 |
| `/review-writing` | Mode C ユーザ産出添削 | Runtime |

---

## 2. Build 時の呼び出し(データ構築)

### 2.1 `/generate-seed`

**目的**: カテゴリ × CEFR レベルの学習項目候補を生成する。

**モデル**: `claude-opus-4-6`(生成品質を優先、Build 時は速度より品質)  
**Temperature**: `0.4`(多様性は要るが品質もほしい)  
**max_tokens**: `4000`

**入力パラメータ**:
```json
{
  "category": "collocation",
  "cefr_level": "A2",
  "batch_size": 30,
  "existing_ids": ["make_a_decision", "..."]
}
```

**プロンプト**:
```
あなたは英語教材のデータキュレーターです。CEFR {cefr_level} レベルの日本人学習者(IELTS 7.0 目標)向けに、{category} カテゴリの高頻度学習項目を {batch_size} 個生成してください。

## 制約
- CEFR {cefr_level} レベルでネイティブ・学習者双方に頻出する項目のみ
- 既に登録済みの以下 ID は除外: {existing_ids}
- 各項目は "surface" フィールドで一意に識別できる形式(小文字化、記号は最低限)

## カテゴリ定義
{category_definition}
（例: "collocation" = 統計的に一緒に現れる 2〜4 語の組み合わせ。V+N, Adj+N, Adv+V が主なパターン。イディオムや句動詞は除外）

## 出力形式
JSON 配列のみを出力。前置きや説明は不要。

[
  {
    "surface": "make a decision",
    "id": "make_a_decision",
    "translations_ja": ["決定する", "決断を下す"],
    "collocation_pattern": "V+N",
    "register": "neutral",
    "semantic_field": ["thinking", "work"],
    "frequency_hint": "high"
  },
  ...
]
```

**バリデーション**:
- 出力は JSON Array
- 全項目に必須フィールドあり
- ID の一意性

### 2.2 `/enrich-item`

**目的**: seed 生成で確定した 1 項目に対し、意味関係・混同語・派生用法・典型誤用を生成する。

**モデル**: `claude-opus-4-6`  
**Temperature**: `0.3`  
**max_tokens**: `3000`

**入力パラメータ**:
```json
{
  "id": "make_a_decision",
  "surface": "make a decision",
  "cefr_level": "A2",
  "category": "collocation",
  "translations_ja": ["決定する"]
}
```

**プロンプト**:
```
あなたは英語教材の意味関係データを作成します。以下の学習項目について、指定されたフィールドを埋めてください。

## 対象
- Surface: {surface}
- CEFR: {cefr_level}
- Category: {category}
- 日本語訳: {translations_ja}

## 生成するフィールド

### synonyms (最大5個)
類義語または類義チャンク。register とニュアンス差を明示。

### antonyms (最大3個)
反意語または反意チャンク。

### hypernyms, hyponyms
上位語・下位語(該当する場合のみ、なければ空配列)

### confusables (最大5個)
意味は似ているがコノテーションや register が異なる語。日本人学習者が混同しやすいものを優先。
- similarity_ja: どこが似ているか
- key_difference_ja: 何が違うか
- correct_usage_ja: どう使い分けるか
- example_en: 対象語の適切な使用例

### related_uses (最大5個)
同じ動詞・核語の他の使い方、メタファー拡張。句動詞展開など。
- metaphor_ja: 基本義からどう拡張されているか

### common_errors_ja (最大3個)
日本人学習者に特有の典型誤用。L1(日本語)からの干渉を意識。
- incorrect: 誤った形
- correct: 正しい形
- why_ja: なぜ間違えやすいか、正しくどう捉えるか

## 制約
- 説明はすべて {cefr_level} レベルの学習者にも理解できる日本語で
- 冗長にせず、簡潔に。1 フィールドあたり 2 行以内
- 該当なしのフィールドは空配列 [] を返す

## 出力形式
JSON オブジェクトのみ。前置き不要。
```

### 2.3 `/generate-examples`

**目的**: register 別(neutral/formal/casual)の例文を生成。**制約 A/B/C を厳守**。

**モデル**: `claude-opus-4-6`  
**Temperature**: `0.5`(例文の自然さのため、やや高め)  
**max_tokens**: `2000`

**入力パラメータ**:
```json
{
  "surface": "make a decision",
  "cefr_level": "A2",
  "category": "collocation",
  "translations_ja": ["決定する"],
  "collocation_pattern": "V+N"
}
```

**プロンプト**:
```
あなたは英語教材の例文作成者です。以下の学習項目について、register 別の例文を作成してください。

## 対象語/チャンク
{surface} (CEFR {cefr_level}, {category})

## 判断順序(必ず守る)
1. 対象語/チャンクの意味・用法・pattern を確定
2. その語が自然に使われる register の可能集合を特定
3. 各 register で、対象語の学習に最適な例文を作成

シーンや register を先に決めて対象語を無理に嵌めることは禁止。対象語が浮く不自然な例文は絶対に作らない。

## register 別例文
以下の 3 register で最低 1 文ずつ作成:
- **formal**: ビジネス、学術、公式文書
- **neutral**: 一般的な書き言葉、標準
- **casual**: 日常会話、SNS、友人との会話

ただし対象語の性質上、以下は例外:
- 慣習表現で register が固有な場合: 該当 register のみ
- 学術・専門用語: formal + neutral のみ
- 口語イディオム: neutral + casual のみ

## 制約(必ず守る)
- **周辺語彙 CEFR 上限**: 例文中の対象語以外の全語が CEFR {cefr_level} 以下であること。B2 以上の語は使用禁止(対象が {cefr_level} = B1 なら A1〜B1 のみ)
- 対象語の使い方を **典型的なもの**にする(例外的用法は避ける)
- 日本語訳は自然な日本語で

## 出力形式
JSON 配列のみ:
[
  {
    "en": "...",
    "ja": "...",
    "register": "formal|neutral|casual",
    "surrounding_cefr_ceiling": "{cefr_level}"
  }
]
```

### 2.4 `/generate-insight`

**目的**: 語源・メタファー・文化背景など Insight カードのコンテンツを生成する。

**モデル**: `claude-opus-4-6`  
**Temperature**: `0.3`  
**max_tokens**: `1000`

**プロンプト概要**: 対象項目に語源・メタファー・文化背景・コアイメージのいずれかが存在するか判定 → 存在すれば 3 行以内の日本語で解説 + 関連語 3 個 → 存在しなければ null。

Insight が意味のあるのは全項目の 30〜40% 程度と見込む。全項目に無理に生成しない設計にする。

### 2.5 `/validate-cefr`

**目的**: 生成された例文中の各語の CEFR レベルを判定し、上限違反を検出する。

**モデル**: `claude-haiku-4-5-20251001`(判定のみで速度優先)  
**Temperature**: `0`  
**max_tokens**: `500`

**入力**: 例文英文 + 対象 CEFR 上限  
**出力**: 上限を超える語のリスト、なければ空

これは意味関係生成のあとに走る **自動 QA ゲート**。違反があれば `/generate-examples` を再実行してリトライ。3 回失敗したら人手判断キューへ。

---

## 3. Runtime の呼び出し(Mode C)

### 3.1 `/review-writing`

**目的**: ユーザが自由に書いた英文を対象語の観点で添削する。

**モデル**: `claude-haiku-4-5-20251001`(即応性優先)  
**Temperature**: `0.3`  
**max_tokens**: `1500`

**入力パラメータ**:
```json
{
  "target_item_id": "make_a_decision",
  "target_surface": "make a decision",
  "target_cefr": "A2",
  "user_ui_language": "ja",
  "user_text": "I made a decision to study English every day.",
  "user_cefr": "A2"
}
```

**プロンプト**:
```
あなたは英語学習者の作文を添削する講師です。以下の英文を、指定された観点で評価してください。

## 対象語/チャンク
{target_surface} (CEFR {target_cefr})

## ユーザの英文
{user_text}

## ユーザのレベル
CEFR {user_cefr}

## 評価観点
1. 対象語/チャンクを **正しく自然に**使えているか
2. その使い方のレジスターが文全体と整合しているか
3. その組み合わせより自然な代替表現があるか
4. 文法・冠詞・時制などの基本的な正誤

## フィードバック方針
- ユーザレベル({user_cefr})を超える語彙で説明しない
- 「なぜ」を必ず含める(単に「正しい/間違い」で終わらない)
- 悪い点だけでなく、良い点も 1 つ挙げる
- 出力言語: {user_ui_language}

## 出力形式(JSON)
{
  "verdict": "excellent" | "good" | "needs_improvement" | "incorrect",
  "score": 0-100,
  "positives": ["..."],
  "issues": [
    { "aspect": "collocation|register|grammar|other", "detail": "...", "suggestion": "..." }
  ],
  "improved_version": "...",
  "explanation": "..."
}
```

---

## 4. GAS 実装の要点

### 4.1 セキュリティ

- Claude API キーは Script Properties に保存、コードにハードコードしない
- WebApp の実行権限は「本人のみ」から開始
- CORS ヘッダで許可オリジンを GitHub Pages ドメインに限定

### 4.2 エラーハンドリング

- API エラー時は再試行(exponential backoff、最大 3 回)
- レスポンス JSON パース失敗時はエラーコード返却
- タイムアウト(GAS の 6 分制限)を考慮しバッチサイズを調整

### 4.3 キャッシュ

- 全エンドポイントで SHA-256 キーによるキャッシュ
- 例外は `/review-writing`(runtime、ユーザ入力に依存するためキャッシュしない)
- キャッシュヒット率のログを取り、Build コストを可視化

### 4.4 レート制御

- Build 時のバッチ処理は 1 リクエスト/秒に制限
- Runtime は同一ユーザで 1 分あたり 10 リクエストまで(スパム防止)

### 4.5 GAS コード構造(参考)

```javascript
function doPost(e) {
  const path = e.parameter.path;
  const body = JSON.parse(e.postData.contents);
  
  const handlers = {
    'generate-seed': generateSeed,
    'enrich-item': enrichItem,
    'generate-examples': generateExamples,
    'generate-insight': generateInsight,
    'validate-cefr': validateCefr,
    'review-writing': reviewWriting
  };
  
  const handler = handlers[path];
  if (!handler) return jsonError(400, 'unknown_path');
  
  try {
    const cacheKey = computeCacheKey(path, body);
    const cached = getCachedResponse(cacheKey);
    if (cached && path !== 'review-writing') return jsonResponse(cached);
    
    const result = handler(body);
    if (path !== 'review-writing') saveCachedResponse(cacheKey, result);
    return jsonResponse(result);
  } catch (err) {
    return jsonError(500, err.message);
  }
}

function callClaude(prompt, model, temperature, maxTokens) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  const response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify({
      model: model,
      max_tokens: maxTokens,
      temperature: temperature,
      messages: [{ role: 'user', content: prompt }]
    }),
    muteHttpExceptions: true
  });
  const data = JSON.parse(response.getContentText());
  return data.content[0].text;
}
```

---

## 5. 呼び出しタイミング全体像

### 5.1 Phase 1 データ構築時
1. `/generate-seed` × カテゴリ数 × CEFR レベル数 バッチ
2. 貴殿の検証(採用/却下)
3. 採用項目に対し `/enrich-item`
4. 採用項目に対し `/generate-examples` → `/validate-cefr` チェーン
5. 該当項目に対し `/generate-insight`

### 5.2 段階リリース時
CEFR レベル追加のたびに §5.1 のフローを反復。既存レベルのデータは再生成しない。

### 5.3 Runtime
- Mode C 実行時のみ `/review-writing`
- ユーザ 1 回の添削 = API 1 回
- 上限: 1 日 30 回程度(概算コスト管理)

---

## 6. コスト見積もり

### 6.1 Build 時(A2 レベル全カテゴリ、2,430 件)

- `/generate-seed`: 約 30 バッチ × 5,000 tokens = 150K tokens
- `/enrich-item`: 2,430 × 平均 2,500 tokens = 6M tokens
- `/generate-examples`: 2,430 × 平均 1,500 tokens = 3.6M tokens
- `/validate-cefr`: 2,430 × 平均 300 tokens = 730K tokens
- `/generate-insight`: 800(30%) × 平均 800 tokens = 640K tokens
- **合計: 約 11M tokens 出力**

Claude Opus 4.6 の出力 tokens 単価(2026年時点想定): 数千円〜1万円台前半のオーダー。全 CEFR レベル(A1〜C1)で合計 5 万円程度と見込む。

### 6.2 Runtime 時(通常運用)

- Mode C: 30 回/日 × 1500 tokens = 45K tokens/日 = 1.35M tokens/月
- Claude Haiku 4.5: 月額 100〜300 円程度

---

## 7. 実装優先度

Phase 1 で必要な GAS エンドポイント:
1. `/generate-seed`(必須)
2. `/enrich-item`(必須)
3. `/generate-examples`(必須)
4. `/validate-cefr`(必須、QA ゲート)
5. `/generate-insight`(あってもよい、後回し可)

Phase 2 で追加:
6. `/review-writing`(Mode C 実装時)
