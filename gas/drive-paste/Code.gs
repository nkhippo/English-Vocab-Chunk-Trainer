/**
 * Vocab & Chunk Trainer — GAS Web App entry
 * Deploy as Web App. Call with ?path=generate-seed etc.
 *
 * Script Properties:
 * - ANTHROPIC_API_KEY
 * - ALLOWED_ORIGINS (comma-separated, optional)
 */

function doGet(e) {
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
    const path = (e.parameter && e.parameter.path) || ''
    const body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {}

    const handlers = {
      'generate-seed': generateSeed,
      'enrich-item': enrichItem,
      'generate-examples': generateExamples,
      'generate-insight': generateInsight,
      'validate-cefr': validateCefr,
    }

    const handler = handlers[path]
    if (!handler) {
      return jsonError(400, 'unknown_path', 'Unknown path: ' + path)
    }

    const cacheKey = computeCacheKey(path, body)
    if (path !== 'review-writing') {
      const cached = getCachedResponse(cacheKey)
      if (cached) {
        return jsonResponse(cached, true)
      }
    }

    const result = withRetry(function () {
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
function callClaude(prompt, model, temperature, maxTokens) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY')
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set in Script Properties')
  }

  var response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    payload: JSON.stringify({
      model: model || 'claude-opus-4-6',
      max_tokens: maxTokens || 4000,
      temperature: temperature == null ? 0.4 : temperature,
      messages: [{ role: 'user', content: prompt }],
    }),
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
  // clasp deploys .gs only; prompts are inlined via prompts/*.js functions
  // or stored as Script Properties / Drive files later.
  return PROMPTS[name]
}

var PROMPTS = {}
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
