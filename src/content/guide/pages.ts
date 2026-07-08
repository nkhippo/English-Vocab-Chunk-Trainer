export interface GuidePage {
  id: string
  title: { ja: string; en: string }
  body: { ja: string; en: string }
}

export const guidePages: GuidePage[] = [
  {
    id: 'purpose',
    title: {
      ja: 'アプリの目的',
      en: 'What this app is for',
    },
    body: {
      ja: 'Basic 2400 完走後に、IELTS 7.0（C1 下位）相当の語彙とチャンク運用力を段階的に構築します。学ぶのは単語・イディオム・コロケーション・二項表現・複合語・句動詞・慣習表現など。独立した文法学習や詳細な発音訓練はスコープ外です。',
      en: 'After Basic 2400, build IELTS 7.0-level vocabulary and chunk fluency step by step. In scope: words, idioms, collocations, binomials, compounds, phrasal verbs, and institutionalised expressions. Pure grammar study and deep pronunciation drills are out of scope.',
    },
  },
  {
    id: 'modes',
    title: {
      ja: 'Mode A / B / C',
      en: 'Modes A / B / C',
    },
    body: {
      ja: 'Mode A は識別（意味・レジスターの受容）、Mode B は想起（訳から英語を産出）、Mode C は運用（短い作文＋Claude 添削）。Phase 1 では骨格のみで、学習画面は Phase 2 です。',
      en: 'Mode A: recognition. Mode B: recall. Mode C: productive writing with Claude feedback. Phase 1 only scaffolds the shell; full training UIs land in Phase 2.',
    },
  },
  {
    id: 'cefr',
    title: {
      ja: 'CEFR とレベル選択',
      en: 'CEFR and level choice',
    },
    body: {
      ja: 'A1 はフレーズのみ、A2 以降は全カテゴリ。レベルは「今の到達点」ではなく、書籍学習と並行して広げる地図として使います。単語帳ビューでレベル別件数を確認できます。',
      en: 'A1 is phrases only; A2+ covers all categories. Levels are a growth map beside book study—not a hard walls. The browse view shows counts per CEFR band.',
    },
  },
  {
    id: 'basic2400',
    title: {
      ja: 'Basic 2400 との連携',
      en: 'Basic 2400 alignment',
    },
    body: {
      ja: '書籍のユニット完了ごとに、該当項目へ basic_2400_units タグを付与します。データ運用手順書のマッピング手順に従い、週末バッチで更新するのが効率的です。',
      en: 'After finishing a book unit, tag matching items with basic_2400_units. Follow the data-operations guide and batch updates on weekends.',
    },
  },
  {
    id: 'srs',
    title: {
      ja: 'SRS の仕組み',
      en: 'How SRS works',
    },
    body: {
      ja: '間隔反復で復習タイミングを自動調整します（FSRS 想定）。Phase 1 ではロジック未実装。正答連続や難易度に応じて次回復習日が伸びる想定です。',
      en: 'Spaced repetition (FSRS-oriented) schedules reviews automatically. Not implemented in Phase 1. Streaks and difficulty will stretch or shorten the next review date.',
    },
  },
  {
    id: 'ipa',
    title: {
      ja: 'IPA と発音',
      en: 'IPA and pronunciation',
    },
    body: {
      ja: '単語は IPA（careful）、フレーズは careful + connected speech 表記を持ちます。詳細な発音訓練は IPA Pronunciation Trainer に委譲し、本アプリは表示と連携に留めます。',
      en: 'Words carry careful IPA; phrases also carry connected-speech forms. Deep pronunciation practice stays in the IPA Pronunciation Trainer; this app shows IPA and links out.',
    },
  },
]
