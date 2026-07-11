import { useTranslation } from 'react-i18next'
import { labelRegister } from '@/lib/i18n/labels'
import type { ExampleSentence } from '@/types/learning'

interface ExamplesListProps {
  examples: ExampleSentence[]
}

/** Examples with register label top-right; no tile cards. */
export function ExamplesList({ examples }: ExamplesListProps) {
  const { t } = useTranslation()

  if (examples.length === 0) {
    return <p className="font-sans text-sm text-text-muted">{t('itemDetail.none')}</p>
  }

  return (
    <ul className="space-y-4">
      {examples.map((example) => (
        <li
          key={`${example.register}-${example.en}`}
          className="space-y-1.5 border-b border-border/60 pb-4 last:border-b-0 last:pb-0"
        >
          <p className="text-right font-sans text-xs text-text-muted">
            {labelRegister(t, example.register)}
          </p>
          <p className="font-serif text-[15px] leading-relaxed text-text-primary md:text-base">
            {example.en}
          </p>
          <p className="font-sans text-sm leading-snug text-text-secondary">{example.ja}</p>
        </li>
      ))}
    </ul>
  )
}
