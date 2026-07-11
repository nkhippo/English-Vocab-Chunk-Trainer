interface IpaTabsProps {
  careful: string
  /** Kept for call-site compatibility; connected IPA is no longer shown (v7). */
  connected?: string | null
  className?: string
}

/** Careful (語ごと) IPA only — connected tab removed in v7. */
export function IpaTabs({ careful, className }: IpaTabsProps) {
  return (
    <div className={className}>
      <p className="ipa text-base text-text-secondary">{careful}</p>
    </div>
  )
}
