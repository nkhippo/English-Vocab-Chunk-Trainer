/** Build パイプライン（seed / enrich / examples / insight）の既定モデル */
var BUILD_MODEL = 'claude-sonnet-4-6'

function callClaude(prompt, model, temperature, maxTokens) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY')
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set in Script Properties')
  }

  var resolvedModel = model || BUILD_MODEL
  var payload = {
    model: resolvedModel,
    max_tokens: maxTokens || 4000,
    messages: [{ role: 'user', content: prompt }],
  }

  // Opus 4.7+ rejects non-default temperature / top_p / top_k (HTTP 400).
  var isOpusNoTemp =
    resolvedModel.indexOf('claude-opus-4-7') === 0 || resolvedModel.indexOf('claude-opus-4-8') === 0
  if (!isOpusNoTemp) {
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
