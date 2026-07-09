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
