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
