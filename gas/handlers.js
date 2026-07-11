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

  var text = callClaude(prompt, BUILD_MODEL, 0.4, 4000)
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
    '- **hypernyms / hyponyms は出力しない**（スキーマから削除済み）',
    '- **synonyms / antonyms は nuance_contrast_ja 必須**（difference_ja は使わない）。example_en / example_ja も付与する',
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
    '    { "item": "類義表現", "nuance_contrast_ja": "対象語との対比を明示した説明", "example_en": "English example", "example_ja": "日本語訳" }',
    '  ],',
    '  "antonyms": [',
    '    { "item": "反意表現", "nuance_contrast_ja": "対象語との対比を明示した説明", "example_en": "English example", "example_ja": "日本語訳" }',
    '  ],',
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
    '      "metaphor_ja": "メタファー説明（任意）",',
    '      "example_en": "English example",',
    '      "example_ja": "日本語訳"',
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

  var text = callClaude(prompt, BUILD_MODEL, 0.3, 4000)
  return extractJson(text)
}

function generateExamples(body) {
  var item = body.item || body
  var cefr = item.cefr_level || 'A2'
  var temperature = body.temperature == null ? 0.5 : body.temperature
  var category = item.category || 'collocation'
  var surface = item.surface || ''

  var formalScenes = formatSceneCandidates('formal')
  var neutralScenes = formatSceneCandidates('neutral')
  var informalScenes = formatSceneCandidates('informal')

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
    '## 判断順序(必ずこの順序で判断すること。逆順は禁止)',
    '1. 対象語/チャンクの意味・用法・pattern を確定する',
    '2. その語が自然に使われる register の集合を特定する(下記の register 判定基準を参照)',
    '3. 各 register で、下記のシーン候補から対象語に自然なものを1つ選ぶ',
    '4. 選んだシーンで、対象語の学習に最適な例文を1つ作成する',
    '',
    '**制約A(重要): シーンや register を先に決めてから対象語を無理に嵌める順序は禁止。**対象語が浮くような不自然な文脈での使用は、学習者に誤った用法を刷り込むため。',
    '',
    '## register 判定基準',
    '- **formal**: ビジネス・学術・公式文書で使われる書き言葉的表現',
    '- **neutral**: 一般的な書き言葉、標準的な表現。register の中庸',
    '- **informal**: 日常会話・SNS・友人との会話などのくだけた表現',
    '',
    '対象語が自然に使われうる register にのみ例文を作成すること。例外規定:',
    '- 慣習表現で register が固有な場合: 該当する register のみ',
    '- 学術・専門用語で informal 使用が不自然な場合: formal + neutral のみ',
    '- 口語イディオムで formal 使用が不自然な場合: neutral + informal のみ',
    '',
    '**日常コロケーション・句動詞 (' + category + ') は原則 formal + neutral + informal の 3 例文を出力すること。**',
    '',
    '## シーン候補',
    '各 register で使うシーンは以下から選ぶ。ただし対象語(' + surface + ')に自然でない場合は無理に選ばず、リスト外を判断で使ってよい(制約A 優先)。',
    '',
    '### formal のシーン候補',
    formalScenes,
    '',
    '### neutral のシーン候補',
    neutralScenes,
    '',
    '### informal のシーン候補',
    informalScenes,
    '',
    '**シーン選択の重要指針**: 過去のパイロットで formal 例文が「Guests may... / Students are... 」等のホテル・オフィス系に collapse する傾向があった。**対象語に自然な範囲で、シーンの多様性を意識すること**。同じような文型・シーンばかりにしない。',
    '',
    '## A2 学習者未習語(使用禁止・最重要)',
    '',
    '以下は A2 学習者には未習の B1 以上の語。**対象語(' + surface + ')の外側では使用禁止**。formal を作るときに特に混入しやすいので細心の注意を払うこと。',
    '',
    '| 禁止語 | 代わりに使う表現 |',
    '| --- | --- |',
    '| kindly, respectfully | please, thank you |',
    '| expected, is/are expected to | must, need to |',
    '| required, is/are required to | must, need to |',
    '| generally, typically | usually(A2) |',
    '| appreciate, appreciated | thank you |',
    '| provide, provided | give |',
    '| consider, considering | think about |',
    '| prefer, would prefer | like better |',
    '| request(名詞・動詞とも) | ask |',
    '| available, unavailable | free, open |',
    '| accommodate | have room, help |',
    '| premises | building, place |',
    '| lounge | living room, hall, room |',
    '| refrain from | do not (don\'t) |',
    '| schedule(動詞) | plan |',
    '| opportunity | chance |',
    '| particular / particularly | special / specially |',
    '| specific / specifically | certain |',
    '| ensure | make sure |',
    '',
    'その他、A1〜' + cefr + ' レベルを超える語は使わない。対象語のニュアンス上どうしても B1 以上の語が必要な場合は、より簡単な代替表現を優先する。',
    '',
    '## その他の制約',
    '- 対象語の使い方は **典型的なもの** を選ぶ(例外的用法は避ける)',
    '- 日本語訳は自然な日本語で(直訳調を避ける)',
    '- register の値は "formal" / "neutral" / "informal" の 3 種のみ("casual" は使わない)',
    '- surrounding_cefr_ceiling はすべて "' + cefr + '"',
    '',
    '## 出力形式',
    '',
    '```json',
    '{',
    '  "example_sentences": [',
    '    {"en": "...", "ja": "...", "register": "formal", "surrounding_cefr_ceiling": "' + cefr + '"},',
    '    {"en": "...", "ja": "...", "register": "neutral", "surrounding_cefr_ceiling": "' + cefr + '"},',
    '    {"en": "...", "ja": "...", "register": "informal", "surrounding_cefr_ceiling": "' + cefr + '"}',
    '  ]',
    '}',
    '```',
    '',
    'JSON オブジェクトのみ出力。マークダウンコードブロック不要、前置き・説明も不要。',
  ].join('\n')

  var text = callClaude(prompt, BUILD_MODEL, temperature, 2500)
  return extractJson(text)
}

function generateInsight(body) {
  var item = body.item || body
  var prompt = [
    '学習項目の語源・コアイメージ Insight を JSON で生成。',
    JSON.stringify(item),
    '形式: {"id":"insight_<id>","target_id":"<id>","type":"core_image","content_ja":"...","content_en":"..."}',
  ].join('\n')
  var text = callClaude(prompt, BUILD_MODEL, 0.4, 1500)
  return extractJson(text)
}

function validateCefr(body) {
  var item_id = body.item_id || ''
  var cefr = body.cefr_level || 'A2'
  var examples = body.example_sentences || []

  var prompt = [
    'あなたは英語語彙 CEFR 判定の補助ツールです。以下の例文群を、A2 学習者禁止語リストと照合して違反を検出してください。',
    '',
    '## 判定対象',
    '- Item ID: ' + item_id,
    '- CEFR 上限: ' + cefr,
    '- 例文:',
    JSON.stringify(examples, null, 2),
    '',
    '## 判定の基本方針',
    '',
    'この検証は **明示リストベースの照合** です。以下の「検出対象語リスト」に該当する語を例文中で探し、該当があれば violations に列挙してください。**リストにない語について「これは B1 かも」と推測して列挙しないでください**(false positive を避ける)。',
    '',
    'この検証はあくまで補助であり、主たる品質管理は generateExamples 側のプロンプトで行われています。したがって明示リストの語を確実に拾うことが唯一の役割です。',
    '',
    '## 検出対象語リスト(A2 学習者に未習の B1 以上の語)',
    '',
    '例文中に以下の語(または語形変化)が対象語の外側で使われていれば、必ず violations に列挙する:',
    '',
    '- kindly, respectfully',
    '- expected, expects (be expected to の受動構文も含む)',
    '- required, requires (be required to の受動構文も含む)',
    '- generally, typically',
    '- appreciate, appreciated, appreciation',
    '- provide, provided, provides',
    '- consider, considering, considered, consideration',
    '- prefer, preferred, prefers, preference',
    '- request, requested, requests(名詞・動詞とも)',
    '- available, unavailable, availability',
    '- accommodate, accommodating, accommodation',
    '- premises',
    '- lounge',
    '- refrain (from)',
    '- schedule(動詞: 「予定を組む」), scheduled',
    '- opportunity, opportunities',
    '- particular, particularly',
    '- specific, specifically',
    '- ensure, ensures, ensured',
    '',
    '## 検出対象外(A2 圏内・列挙しないこと)',
    '',
    '以下のような語は A2 学習者にも既習の場合が多く、たとえ formal な文脈でも列挙しないでください:',
    '',
    '- 職業・立場を表す名詞: Employees, Visitors, Guests, Students, Staff, Members, Passengers, Customers',
    '- 複合語・借用語: check-in, check-out, WiFi, email, online, coffee',
    '- 場所名詞: office, hall, library, hospital, station, restaurant, museum',
    '- 感情形容詞: happy, sad, tired, angry, excited',
    '- 基本副詞: usually, often, sometimes, always, never',
    '',
    '## 判定手順',
    '',
    '1. 各例文について、上記「検出対象語リスト」の語を1つずつ確認する',
    '2. 対象語(item.surface)の一部として含まれる語はスキップ',
    '3. 該当語が見つかったら violations に列挙',
    '4. 検出対象語リストにない語は、たとえ B1 以上に感じても列挙しない',
    '',
    '## 出力形式(JSON のみ、前置き不要)',
    '',
    '違反なし: { "ok": true, "violations": [] }',
    '違反あり: { "ok": false, "violations": [{"word": "...", "cefr": "B1", "example_index": 0, "reason": "..."}] }',
    '',
    'reason には「検出リストの expected を検出」など、リスト照合の結果として簡潔に書く。',
  ].join('\n')

  var text = callClaude(prompt, 'claude-haiku-4-5-20251001', 0.1, 1500)
  return extractJson(text)
}
