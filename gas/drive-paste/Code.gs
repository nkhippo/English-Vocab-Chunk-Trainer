/** Auto-generated from gas/*.js — run: pnpm run build:gas-paste */
// --- main.js ---
/**
 * Vocab & Chunk Trainer — GAS Web App entry
 */

function doGet(e) {
  var blocked = originForbiddenResponse_(e)
  if (blocked) return blocked

  return jsonResponse({
    service: 'vocab-chunk-trainer-gas',
    paths: [
      'generate-seed',
      'enrich-item',
      'generate-examples',
      'generate-insight',
      'validate-cefr',
    ],
  })
}

function doPost(e) {
  try {
    var blocked = originForbiddenResponse_(e)
    if (blocked) return blocked

    var path = (e.parameter && e.parameter.path) || ''
    var body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {}

    var handlers = {
      'generate-seed': generateSeed,
      'enrich-item': enrichItem,
      'generate-examples': generateExamples,
      'generate-insight': generateInsight,
      'validate-cefr': validateCefr,
    }

    var handler = handlers[path]
    if (!handler) {
      return jsonError(400, 'unknown_path', 'Unknown path: ' + path)
    }

    var cacheKey = computeCacheKey(path, body)
    if (path !== 'review-writing') {
      var cached = getCachedResponse(cacheKey)
      if (cached) {
        return jsonResponse(cached, true)
      }
    }

    var result = withRetry(function () {
      return handler(body)
    }, 3)

    if (path !== 'review-writing') {
      saveCachedResponse(cacheKey, result)
    }
    return jsonResponse(result, false)
  } catch (err) {
    return jsonError(500, 'internal_error', String(err && err.message ? err.message : err))
  }
}

function originForbiddenResponse_(e) {
  var origin = e && e.parameter && e.parameter.origin ? String(e.parameter.origin).trim() : ''
  if (!origin) return null
  if (origin === 'https://nkhippo.github.io' || origin === 'http://localhost:5173') return null
  return jsonError(403, 'origin_forbidden', 'Origin not allowed: ' + origin)
}

function withRetry(fn, maxAttempts) {
  var lastErr
  for (var i = 0; i < maxAttempts; i++) {
    try {
      return fn()
    } catch (err) {
      lastErr = err
      Utilities.sleep(Math.pow(2, i) * 500)
    }
  }
  throw lastErr
}

function jsonResponse(data, cached) {
  var payload = { ok: true, data: data }
  if (cached) payload.cached = true
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  )
}

function jsonError(status, code, message) {
  var payload = {
    ok: false,
    error: { code: code, message: message, status: status },
  }
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  )
}

// --- cache.js ---
function computeCacheKey(path, body) {
  var raw = path + '::' + JSON.stringify(body)
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw)
  var hex = []
  for (var i = 0; i < digest.length; i++) {
    var b = digest[i]
    var v = (b < 0 ? b + 256 : b).toString(16)
    hex.push(v.length === 1 ? '0' + v : v)
  }
  return hex.join('')
}

function getCacheFolder_() {
  var props = PropertiesService.getScriptProperties()
  var folderId = props.getProperty('CACHE_FOLDER_ID')
  if (folderId) {
    return DriveApp.getFolderById(folderId)
  }
  var folders = DriveApp.getFoldersByName('vocab-chunk-trainer-cache')
  if (folders.hasNext()) {
    return folders.next()
  }
  var created = DriveApp.createFolder('vocab-chunk-trainer-cache')
  props.setProperty('CACHE_FOLDER_ID', created.getId())
  return created
}

function getCachedResponse(cacheKey) {
  var folder = getCacheFolder_()
  var files = folder.getFilesByName(cacheKey + '.json')
  if (!files.hasNext()) return null
  var file = files.next()
  return JSON.parse(file.getBlob().getDataAsString())
}

function saveCachedResponse(cacheKey, data) {
  var folder = getCacheFolder_()
  var existing = folder.getFilesByName(cacheKey + '.json')
  while (existing.hasNext()) {
    existing.next().setTrashed(true)
  }
  folder.createFile(cacheKey + '.json', JSON.stringify(data), MimeType.PLAIN_TEXT)
}

// --- claude.js ---
function callClaude(prompt, model, temperature, maxTokens) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY')
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set in Script Properties')
  }

  var resolvedModel = model || 'claude-opus-4-7'
  var payload = {
    model: resolvedModel,
    max_tokens: maxTokens || 4000,
    messages: [{ role: 'user', content: prompt }],
  }

  // Opus 4.7 rejects non-default temperature / top_p / top_k (HTTP 400).
  if (resolvedModel.indexOf('claude-opus-4-7') !== 0) {
    payload.temperature = temperature == null ? 0.4 : temperature
  }

  var response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  })

  var code = response.getResponseCode()
  var text = response.getContentText()
  if (code < 200 || code >= 300) {
    throw new Error('Claude API HTTP ' + code + ': ' + text.slice(0, 500))
  }

  var data = JSON.parse(text)
  if (!data.content || !data.content[0] || !data.content[0].text) {
    throw new Error('Unexpected Claude response shape')
  }
  return data.content[0].text
}

function extractJson(text) {
  var trimmed = String(text).trim()
  var fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) trimmed = fence[1].trim()
  return JSON.parse(trimmed)
}

function loadPrompt_(name) {
  return PROMPTS[name]
}

var PROMPTS = {}

// --- handlers.js ---
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

/**
 * Prefer Script Properties UI. This helper is only a one-shot fallback:
 * replace YOUR_KEY_HERE, run setAnthropicApiKey once, then delete the key string and save again.
 */
function setAnthropicApiKey() {
  var key = 'YOUR_KEY_HERE'
  if (!key || key === 'YOUR_KEY_HERE') {
    throw new Error('Replace YOUR_KEY_HERE with your Anthropic API key, run once, then remove it.')
  }
  PropertiesService.getScriptProperties().setProperty('ANTHROPIC_API_KEY', key)
  Logger.log('ANTHROPIC_API_KEY saved to Script Properties')
}

function hasAnthropicApiKey() {
  var key = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY')
  Logger.log(key ? 'ANTHROPIC_API_KEY is set (len=' + key.length + ')' : 'ANTHROPIC_API_KEY is NOT set')
}
