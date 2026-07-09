function generateSeed(body) {
  var category = body.category
  var cefr = body.cefr_level
  var batchSize = body.batch_size || 30
  var existing = (body.existing_ids || []).slice(0, 200)

  var prompt = [
    'あなたは英語教材のデータキュレーターです。CEFR ' +
      cefr +
      ' レベルの日本人学習者(IELTS 7.0 目標)向けに、' +
      category +
      ' カテゴリの高頻度学習項目を ' +
      batchSize +
      ' 個生成してください。',
    '',
    '## 制約',
    '- CEFR ' + cefr + ' レベルでネイティブ・学習者双方に頻出する項目のみ',
    '- 既に登録済みの以下 ID は除外: ' + JSON.stringify(existing),
    '- 各項目は "surface" フィールドで一意に識別できる形式',
    '',
    '## 出力形式',
    'JSON 配列のみを出力。前置きや説明は不要。',
    '[',
    '  {',
    '    "surface": "make a decision",',
    '    "id": "make_a_decision",',
    '    "translations_ja": ["決定する"],',
    '    "collocation_pattern": "V+N",',
    '    "register": "neutral",',
    '    "frequency_hint": "high",',
    '    "category": "' + category + '",',
    '    "cefr_level": "' + cefr + '"',
    '  }',
    ']',
  ].join('\n')

  var text = callClaude(prompt, 'claude-opus-4-7', 0.4, 4000)
  return { items: extractJson(text) }
}

function enrichItem(body) {
  var item = body.item || body
  var surface = item.surface || ''
  var isPhrase = String(surface).indexOf(' ') >= 0
  var prompt = [
    'あなたは英語教材の意味関係データを作成します。以下の学習項目について、指定されたフィールドを埋めてください。',
    '',
    '## 対象',
    '- Surface: ' + surface,
    '- CEFR: ' + (item.cefr_level || 'A2'),
    '- Category: ' + (item.category || 'collocation'),
    '- 日本語訳: ' + JSON.stringify(item.translations_ja || []),
    '',
    '## 生成するフィールド（JSON Schema に準拠したオブジェクト配列）',
    '',
    '### synonyms (最大5) — 各要素は {"item":"類義語","difference_ja":"ニュアンス差"}',
    '### antonyms (最大5) — 各要素は {"item":"反意語","difference_ja":"違い"}',
    '### hypernyms / hyponyms — 文字列の配列（該当なしは []）',
    '### confusables (最大5) — {"item","similarity_ja","key_difference_ja","correct_usage_ja","example_en"(任意)}',
    '### related_uses (最大5) — {"form","meaning_ja","type":"collocation|phrasal_verb|metaphor|compound|other","metaphor_ja"(任意)}',
    '### common_errors_ja (最大5) — {"incorrect","correct","why_ja"}',
    '### definition_en — 英語の簡潔な定義（1文）',
    '### semantic_field — 文字列の配列（例: ["daily routine"]）',
    '### skill_focus — "receptive_only" または "receptive_and_productive" のいずれか1つ',
    '### ipa_careful — IPA（慎重発音）',
    isPhrase
      ? '### ipa_connected — 句の連結発音 IPA（必須）'
      : '### ipa_connected — 単語のみの場合は省略可',
    '### frequency_rank_in_level — 整数（1以上。パイロットでは暫定で 500 でも可）',
    '',
    '## 制約',
    '- 説明は ' + (item.cefr_level || 'A2') + ' 学習者向けの簡潔な日本語',
    '- 該当なしは空配列 []',
    '- 文字列の配列で synonyms/antonyms/confusables を返さない（必ずオブジェクト）',
    '',
    '## 出力',
    'JSON オブジェクトのみ。前置き不要。',
  ].join('\n')

  var text = callClaude(prompt, 'claude-opus-4-7', 0.3, 4000)
  return extractJson(text)
}

function generateExamples(body) {
  var item = body.item || body
  var cefr = item.cefr_level || 'A2'
  var temperature = body.temperature == null ? 0.5 : body.temperature
  var prompt = [
    'あなたは英語教材の例文作成者です。以下の学習項目について、register 別の例文を作成してください。',
    '',
    '## 対象語/チャンク',
    JSON.stringify({
      surface: item.surface,
      cefr_level: cefr,
      category: item.category,
      translations_ja: item.translations_ja,
      collocation_pattern: item.collocation_pattern,
    }),
    '',
    '## 判断順序（必ず守る）',
    '1. 対象語/チャンクの意味・用法・pattern を確定',
    '2. その語が自然に使われる register の可能集合を特定',
    '3. 各 register で、対象語の学習に最適な例文を作成',
    'シーンや register を先に決めて対象語を無理に嵌めることは禁止。',
    '',
    '## register 別例文',
    '原則 **formal・neutral・casual の3文**（各 register 最低1文）。',
    '日常コロケーションでは3 register すべてを満たすこと。',
    '',
    '## 制約',
    '- 周辺語彙 CEFR 上限: 対象語以外はすべて CEFR ' + cefr + ' 以下（簡単な語のみ）',
    '- surrounding_cefr_ceiling は "' + cefr + '" を設定',
    '- 日本語訳は自然な日本語',
    '',
    '## 出力形式',
    '{"example_sentences":[{"en":"...","ja":"...","register":"formal|neutral|casual","surrounding_cefr_ceiling":"' +
      cefr +
      '"}]}',
    'JSON のみ。',
  ].join('\n')

  var text = callClaude(prompt, 'claude-opus-4-7', temperature, 2500)
  return extractJson(text)
}

function generateInsight(body) {
  var item = body.item || body
  var prompt = [
    '学習項目の語源・コアイメージ Insight を JSON で生成。',
    JSON.stringify(item),
    '形式: {"id":"insight_<id>","target_id":"<id>","type":"core_image","content_ja":"...","content_en":"..."}',
  ].join('\n')
  var text = callClaude(prompt, 'claude-opus-4-7', 0.4, 1500)
  return extractJson(text)
}

function validateCefr(body) {
  var prompt = [
    '例文の周辺語彙 CEFR が item レベルを超えていないか検証し、JSON で返してください。',
    JSON.stringify(body),
    '形式: {"ok":true,"violations":[]} または violations に問題語を列挙。',
  ].join('\n')
  var text = callClaude(prompt, 'claude-haiku-4-5-20251001', 0.1, 1000)
  return extractJson(text)
}
