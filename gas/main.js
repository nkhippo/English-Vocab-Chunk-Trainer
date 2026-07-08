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
    ok: true,
    data: {
      service: 'vocab-chunk-trainer-gas',
      paths: [
        'generate-seed',
        'enrich-item',
        'generate-examples',
        'generate-insight',
        'validate-cefr',
      ],
    },
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
