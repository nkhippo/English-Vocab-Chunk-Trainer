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
