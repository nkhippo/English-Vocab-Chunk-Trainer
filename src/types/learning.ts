export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export type Category =
  | 'word'
  | 'collocation'
  | 'phrasal_verb'
  | 'idiom'
  | 'binomial'
  | 'compound'
  | 'institutionalized'
  | 'other'

export type Register = 'formal' | 'neutral' | 'casual'

export type SkillFocus = 'receptive_only' | 'receptive_and_productive'

export interface ExampleSentence {
  en: string
  ja: string
  register: Register
  surrounding_cefr_ceiling: CefrLevel
}

export interface SynonymEntry {
  item: string
  difference_ja: string
  difference_en?: string
  register?: Register
}

export interface AntonymEntry {
  item: string
  difference_ja: string
}

export interface ConfusableEntry {
  item: string
  similarity_ja: string
  key_difference_ja: string
  correct_usage_ja?: string
  example_en?: string
}

export interface RelatedUseEntry {
  form: string
  meaning_ja: string
  type: 'phrasal_verb' | 'metaphor' | 'collocation' | 'compound' | 'other'
  metaphor_ja?: string
}

export interface CommonError {
  incorrect: string
  correct: string
  why_ja: string
}

export interface LearningItem {
  id: string
  surface: string
  category: Category
  cefr_level: CefrLevel
  frequency_rank_in_level: number
  translations_ja: string[]
  definition_en?: string
  example_sentences: ExampleSentence[]
  semantic_field: string[]
  register: Register
  collocation_pattern?: string | null
  function_tag?: string[]
  skill_focus: SkillFocus
  ipa_careful: string
  ipa_connected?: string
  audio_ref?: string
  book_alignment?: {
    basic_2400_units?: number[]
    daily_1500_units?: number[]
  }
  insight_id?: string | null
  synonyms?: SynonymEntry[]
  antonyms?: AntonymEntry[]
  hypernyms?: string[]
  hyponyms?: string[]
  confusables?: ConfusableEntry[]
  related_uses?: RelatedUseEntry[]
  common_errors_ja?: CommonError[]
  meta?: {
    schema_version?: string
    created_at?: string
    updated_at?: string
    validated_by_user?: boolean
    source?: string
  }
}

export interface Insight {
  id: string
  target_id: string
  type: 'morphology' | 'metaphor' | 'cultural' | 'cognate' | 'core_image'
  content_ja: string
  content_en?: string
  related_items?: string[]
  claude_generated?: boolean
  validated_at?: string
}

export interface Dataset {
  schema_version: string
  generated_at?: string
  cefr_levels_included?: CefrLevel[]
  total_items?: number
  items: LearningItem[]
  insights?: Insight[]
}

/** Seed / review intermediate item (before full enrichment) */
export interface SeedItem {
  id: string
  surface: string
  category: Category
  cefr_level: CefrLevel
  translations_ja: string[]
  collocation_pattern?: string | null
  register?: Register
  frequency_hint?: string
  [key: string]: unknown
}

export type ReviewDecision = 'accepted' | 'rejected' | 'pending'

export interface ReviewStateItem extends SeedItem {
  decision: ReviewDecision
  cefr_override?: CefrLevel
  translations_override?: string[]
}

export interface ReviewSession {
  sourceFile: string
  updatedAt: string
  items: ReviewStateItem[]
}
