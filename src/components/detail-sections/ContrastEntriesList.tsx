import { useTranslation } from 'react-i18next'
import type { AntonymEntry, SynonymEntry } from '@/types/learning'

type ContrastEntry = SynonymEntry | AntonymEntry

interface ContrastEntriesListProps {
  synonyms?: SynonymEntry[]
  antonyms?: AntonymEntry[]
}

function shouldShowExample(entry: { example_en?: string; example_ja?: string }): boolean {
  return Boolean(entry.example_en?.trim()) && Boolean(entry.example_ja?.trim())
}

function ContrastRow({ entry }: { entry: ContrastEntry }) {
  return (
    <li className="space-y-1.5">
      <p className="font-serif text-[15px] text-text-primary md:text-base">{entry.item}</p>
      <p className="font-sans text-sm leading-snug text-text-secondary">{entry.nuance_contrast_ja}</p>
      {shouldShowExample(entry) ? (
        <div className="space-y-0.5">
          <p className="font-serif text-sm text-text-primary">{entry.example_en}</p>
          <p className="font-sans text-sm text-text-secondary">{entry.example_ja}</p>
        </div>
      ) : null}
    </li>
  )
}

/** Synonyms / antonyms without tile cards. */
export function ContrastEntriesList({ synonyms = [], antonyms = [] }: ContrastEntriesListProps) {
  const { t } = useTranslation()
  if (synonyms.length === 0 && antonyms.length === 0) return null

  return (
    <div className="space-y-5">
      {synonyms.length > 0 ? (
        <div className="space-y-3">
          <p className="font-sans text-sm font-medium text-text-primary">{t('itemDetail.synonyms')}</p>
          <ul className="space-y-4">
            {synonyms.map((syn) => (
              <ContrastRow key={syn.item} entry={syn} />
            ))}
          </ul>
        </div>
      ) : null}
      {antonyms.length > 0 ? (
        <div className="space-y-3">
          <p className="font-sans text-sm font-medium text-text-primary">{t('itemDetail.antonyms')}</p>
          <ul className="space-y-4">
            {antonyms.map((ant) => (
              <ContrastRow key={ant.item} entry={ant} />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
