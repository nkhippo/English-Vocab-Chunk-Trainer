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

// --- scene-config.js ---
/**
 * gas/scene-config.js
 *
 * `/generate-examples` エンドポイントが例文生成時に参照する
 * register 別シーン候補の設定ファイル。
 *
 * ## 目的
 * - Opus が formal 例文を「ホテル・オフィス系」に collapse するのを防ぐ
 * - register 別に多様なシーンを候補として提示する
 * - シーン一覧を単一ファイルで管理し、後日のアップデートを容易にする
 *
 * ## 更新方針
 * - シーンを追加: 新しいドメイン(医療・スポーツ・芸術など)を扱いたくなったとき
 * - シーンを削除: そのシーンが対象語との不自然なペアリングを生む頻度が高いとき
 * - 目安の件数: 各 register 7〜12 個
 *   (少なすぎるとまた collapse、多すぎると Opus が選びきれず希薄化)
 * - formal はビジネス・機関の書き言葉に限定、informal は本当にくだけた会話に限定
 *
 * ## 変更ログ
 * - v1.0 (2026-07-09): 初版。formal 10 / neutral 7 / informal 7。
 *   v3 パイロットで発覚した「ホテル・オフィス collapse」対策として導入。
 *
 * @see doc/ops/claude-api-gas-design.md §2.3
 * @see doc/handoff/pilot-v3-handoff-report.md
 */

var SCENE_CANDIDATES = {
  formal: [
    'ビジネスメール・業務連絡',
    '公共施設・交通機関の公式アナウンス',
    '学校・教育機関の規則説明',
    '医療機関・薬局の案内',
    '行政・公文書',
    '業務マニュアル・作業指示',
    '学術・研究の説明',
    '会議・プレゼンテーション',
    '契約書・利用規約',
    'ホテル・接客サービス案内',
  ],
  neutral: [
    '日常会話(家族・同僚間)',
    '一般記事・ブログ・エッセイ',
    '教科書調の説明文',
    'ニュース・レポート',
    '習慣・日課の描写',
    '個人的な計画・予定',
    '客観的な状況説明',
  ],
  informal: [
    '友人との雑談',
    'SNS・チャット・メッセージ',
    '家族とのカジュアル会話',
    '感情表現(喜び・不満・驚き)',
    '週末・休暇の計画会話',
    '軽い依頼・提案',
    'ちょっとした愚痴・つぶやき',
  ],
}

/**
 * SCENE_CANDIDATES を register 別に整形して返すヘルパー。
 * handlers.js の generateExamples プロンプト構築で使用。
 *
 * @param {string} register  'formal' | 'neutral' | 'informal'
 * @returns {string}         Markdown 箇条書き形式のシーン一覧
 */
function formatSceneCandidates(register) {
  var scenes = SCENE_CANDIDATES[register] || []
  return scenes
    .map(function (s) {
      return '- ' + s
    })
    .join('\n')
}

// GAS の同一 script project 内では他ファイルからグローバル参照可能。
// 明示 export は不要。

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
