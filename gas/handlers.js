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

  var text = callClaude(prompt, 'claude-opus-4-6', 0.4, 4000)
  return { items: extractJson(text) }
}

function enrichItem(body) {
  var item = body.item || body
  var prompt = [
    '次の学習項目の enrichment フィールドを JSON で生成してください。',
    JSON.stringify(item),
    '',
    '含めるフィールド: synonyms, antonyms, hypernyms, hyponyms, confusables, related_uses, common_errors_ja, definition_en, semantic_field, skill_focus, ipa_careful',
    'JSON オブジェクトのみ出力。',
  ].join('\n')

  var text = callClaude(prompt, 'claude-opus-4-6', 0.3, 4000)
  return extractJson(text)
}

function generateExamples(body) {
  var item = body.item || body
  var temperature = body.temperature == null ? 0.5 : body.temperature
  var prompt = [
    '対象語/チャンクの例文を register 別に生成してください。',
    JSON.stringify(item),
    '',
    '制約:',
    '- 周辺語彙の CEFR は item.cefr_level を超えない',
    '- 最低 1、目標 3 文',
    '- 出力: {"example_sentences":[{"en":"...","ja":"...","register":"neutral","surrounding_cefr_ceiling":"A2"}]}',
    'JSON のみ。',
  ].join('\n')

  var text = callClaude(prompt, 'claude-opus-4-6', temperature, 2500)
  return extractJson(text)
}

function generateInsight(body) {
  var item = body.item || body
  var prompt = [
    '学習項目の語源・コアイメージ Insight を JSON で生成。',
    JSON.stringify(item),
    '形式: {"id":"insight_<id>","target_id":"<id>","type":"core_image","content_ja":"...","content_en":"..."}',
  ].join('\n')
  var text = callClaude(prompt, 'claude-opus-4-6', 0.4, 1500)
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
