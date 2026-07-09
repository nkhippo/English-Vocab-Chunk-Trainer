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
  var cefr = item.cefr_level || 'A2'
  var category = item.category || 'collocation'

  var ipaConnectedLine = isPhrase
    ? '  "ipa_connected": "/... linking/reduction 適用後 .../",'
    : ''
  var ipaConnectedNote = isPhrase
    ? '- ' + surface + ' はフレーズ（空白を含む）なので ipa_connected は必須（linking/reduction を含む narrow 表記）'
    : '- ' + surface + ' は単語のみなので ipa_connected は省略可'

  var prompt = [
    'あなたは英語教材の意味関係データを作成します。以下の学習項目について、指定されたスキーマ通りの JSON オブジェクトを1つ返してください。',
    '',
    '## 対象',
    '- Surface: ' + surface,
    '- CEFR: ' + cefr,
    '- Category: ' + category,
    '- 日本語訳: ' + JSON.stringify(item.translations_ja || []),
    '',
    '## 出力仕様（最重要 — スキーマ違反は自動リジェクトされる）',
    '',
    '- **synonyms / antonyms / confusables / related_uses / common_errors_ja は必ずオブジェクト配列**（文字列配列は絶対に NG）',
    '- **hypernyms / hyponyms のみ文字列配列**',
    '- **semantic_field は文字列配列**（1つの文字列でスラッシュ区切りは NG。例: NG "photography / everyday" → OK ["photography", "everyday actions"]）',
    '- **skill_focus は "receptive_only" または "receptive_and_productive" の単一文字列**（配列 NG、その他の値 NG）',
    '- **frequency_rank_in_level は整数**（1 以上。パイロットでは 100〜999 の範囲で頻度感覚に基づき設定）',
    '- **definition_en は英語 1 文の簡潔な定義**',
    '',
    '## 出力テンプレート（この構造を厳密に模倣）',
    '',
    '```json',
    '{',
    '  "definition_en": "簡潔な英語定義（1文）",',
    '  "semantic_field": ["主要フィールド", "副次フィールド"],',
    '  "skill_focus": "receptive_and_productive",',
    '  "frequency_rank_in_level": 100,',
    '  "ipa_careful": "/careful IPA/",',
    ipaConnectedLine,
    '  "synonyms": [',
    '    { "item": "類義表現", "difference_ja": "ニュアンス差の簡潔な説明" }',
    '  ],',
    '  "antonyms": [',
    '    { "item": "反意表現", "difference_ja": "違いの簡潔な説明" }',
    '  ],',
    '  "hypernyms": ["上位概念"],',
    '  "hyponyms": ["下位概念1", "下位概念2"],',
    '  "confusables": [',
    '    {',
    '      "item": "混同語",',
    '      "similarity_ja": "似ている点",',
    '      "key_difference_ja": "違うポイント",',
    '      "correct_usage_ja": "使い分けの目安",',
    '      "example_en": "使用例文（任意）"',
    '    }',
    '  ],',
    '  "related_uses": [',
    '    {',
    '      "form": "派生形",',
    '      "meaning_ja": "意味",',
    '      "type": "collocation",',
    '      "metaphor_ja": "メタファー説明（任意）"',
    '    }',
    '  ],',
    '  "common_errors_ja": [',
    '    {',
    '      "incorrect": "誤った形",',
    '      "correct": "正しい形",',
    '      "why_ja": "日本語話者が間違えやすい理由と正しい捉え方"',
    '    }',
    '  ]',
    '}',
    '```',
    '',
    '## 制約',
    '- 各配列の要素数: synonyms/antonyms/confusables/common_errors_ja は最大 5、related_uses は最大 8',
    '- 該当項目がない場合は空配列 [] を返す（絶対に omit しない）',
    '- 説明はすべて ' + cefr + ' 学習者にも理解できる簡潔な日本語（1 フィールドあたり 2 行以内）',
    ipaConnectedNote,
    '- confusables の type や related_uses の type は上記 enum 値のみ使用（related_uses.type は "phrasal_verb" | "metaphor" | "collocation" | "compound" | "other" のいずれか）',
    '',
    '## 出力',
    '上記テンプレートに準拠した JSON オブジェクトのみ。マークダウンコードブロックの ``` は不要。前置き・説明も不要。',
  ].join('\n')

  var text = callClaude(prompt, 'claude-opus-4-7', 0.3, 4000)
  return extractJson(text)
}

function generateExamples(body) {
  var item = body.item || body
  var cefr = item.cefr_level || 'A2'
  var temperature = body.temperature == null ? 0.5 : body.temperature
  var category = item.category || 'collocation'
  var surface = item.surface || ''

  var prompt = [
    'あなたは英語教材の例文作成者です。以下の学習項目について、register 別の例文を作成してください。',
    '',
    '## 対象語/チャンク',
    JSON.stringify({
      surface: surface,
      cefr_level: cefr,
      category: category,
      translations_ja: item.translations_ja,
      collocation_pattern: item.collocation_pattern,
    }),
    '',
    '## 判断順序（必ずこの順序で判断すること。逆順は禁止）',
    '1. 対象語/チャンクの意味・用法・pattern を確定する',
    '2. その語が自然に使われる register の集合を特定する（下記の register 判定基準を参照）',
    '3. 特定された各 register で、対象語の学習に最適な例文を1つずつ作成する',
    '',
    '**シーンや register を先に決めてから対象語を無理に嵌める順序は禁止。**対象語が浮くような不自然な文脈での使用は、学習者に誤った用法を刷り込むため。',
    '',
    '## register 判定基準',
    '- **formal**: ビジネス・学術・公式文書で使われる書き言葉的表現',
    '- **neutral**: 一般的な書き言葉、標準的な表現。register の中庸',
    '- **informal**: 日常会話・SNS・友人との会話などのくだけた表現',
    '',
    '対象語が自然に使われうる register にのみ例文を作成すること。例外規定:',
    '- 慣習表現で register が固有な場合: 該当する register のみ（例: What\'s up? → informal のみ、How do you do? → formal のみ）',
    '- 学術・専門用語で informal 使用が不自然な場合: formal + neutral のみ',
    '- 口語イディオムで formal 使用が不自然な場合: neutral + informal のみ',
    '',
    '**日常コロケーション・句動詞は原則 formal + neutral + informal の 3 例文を出力すること。**該当項目 (' + category + ') は特別な事情がない限り 3 register 全てを埋めること。',
    '',
    '## 制約',
    '- **周辺語彙 CEFR 上限**: 例文中の対象語（' + surface + '）以外のすべての語が CEFR ' + cefr + ' 以下であること。B1 以上の語彙は使用禁止。',
    '- 対象語の使い方は **典型的なもの** を選ぶ（例外的用法は避ける）',
    '- 日本語訳は自然な日本語で（直訳調を避ける）',
    '',
    '## 出力形式',
    '',
    '```json',
    '{',
    '  "example_sentences": [',
    '    {',
    '      "en": "対象語を含む英文",',
    '      "ja": "自然な日本語訳",',
    '      "register": "formal",',
    '      "surrounding_cefr_ceiling": "' + cefr + '"',
    '    },',
    '    {',
    '      "en": "...",',
    '      "ja": "...",',
    '      "register": "neutral",',
    '      "surrounding_cefr_ceiling": "' + cefr + '"',
    '    },',
    '    {',
    '      "en": "...",',
    '      "ja": "...",',
    '      "register": "informal",',
    '      "surrounding_cefr_ceiling": "' + cefr + '"',
    '    }',
    '  ]',
    '}',
    '```',
    '',
    '**register の値は "formal" / "neutral" / "informal" の 3 種のみ**（"casual" は使わない）。',
    '**すべての surrounding_cefr_ceiling は "' + cefr + '" とする。**',
    'JSON オブジェクトのみ出力。マークダウンコードブロック不要、前置き・説明も不要。',
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
  var item_id = body.item_id || ''
  var cefr = body.cefr_level || 'A2'
  var examples = body.example_sentences || []

  var prompt = [
    'あなたは英語語彙 CEFR 判定の専門家です。以下の例文群において、指定された CEFR 上限を超える語が使われていないか判定してください。',
    '',
    '## 判定対象',
    '- Item ID: ' + item_id,
    '- CEFR 上限: ' + cefr,
    '- 例文:',
    JSON.stringify(examples, null, 2),
    '',
    '## 判定ルール（重要）',
    '- 対象語（そのアイテムが学習ターゲットとする表現）は判定対象外',
    '- 例文内のその他すべての語について、CEFR レベルが上限（' + cefr + '）を超えないか判定',
    '- 名詞・動詞・形容詞・副詞のうち、上限を超える語のみ violations に列挙',
    '- 冠詞（a/an/the）・前置詞（at/in/on/to 等）・代名詞・be 動詞・助動詞（can/will/do 等）は判定対象外',
    '- 判定に確信が持てない場合は違反として列挙しない（false positive を避ける）',
    '- ' + cefr + ' 学習者にとって明らかに未習と判断できる語のみを違反として扱う',
    '',
    '## 出力形式（JSON のみ、前置き不要）',
    '違反なし: { "ok": true, "violations": [] }',
    '違反あり: { "ok": false, "violations": [{"word": "...", "cefr": "...", "example_index": 0}] }',
  ].join('\n')

  var text = callClaude(prompt, 'claude-haiku-4-5-20251001', 0.1, 1500)
  return extractJson(text)
}
