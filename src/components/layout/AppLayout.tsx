import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/lib/stores/app-store'
import { LanguageToggle } from '@/components/language-toggle/LanguageToggle'

const links = [
  { to: '/', key: 'home' as const, end: true },
  { to: '/train', key: 'train' as const },
  { to: '/browse', key: 'browse' as const },
  { to: '/review', key: 'review' as const },
  { to: '/settings', key: 'settings' as const },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const navOpen = useAppStore((s) => s.navOpen)
  const setNavOpen = useAppStore((s) => s.setNavOpen)
  const reopenGuide = useAppStore((s) => s.reopenGuide)

  return (
    <div className="min-h-full">
      <div className="mx-auto flex min-h-full max-w-6xl gap-0 md:gap-6 md:px-4 md:py-6">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-line bg-paper-elevated/95 p-5 shadow-xl backdrop-blur transition md:static md:z-auto md:w-56 md:translate-x-0 md:rounded-2xl md:border md:shadow-sm ${
            navOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="mb-8">
            <p className="font-display text-xl font-bold tracking-tight text-brand-strong">{t('app.name')}</p>
            <p className="mt-1 text-sm text-ink-muted">{t('app.tagline')}</p>
          </div>
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setNavOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-brand text-white' : 'text-ink-muted hover:bg-brand-soft hover:text-brand-strong'
                  }`
                }
              >
                {t(`nav.${link.key}`)}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            className="mt-6 text-sm font-medium text-brand hover:underline"
            onClick={() => {
              setNavOpen(false)
              reopenGuide()
            }}
          >
            {t('nav.help')}
          </button>
        </aside>

        {navOpen ? (
          <button
            type="button"
            aria-label={t('nav.close')}
            className="fixed inset-0 z-30 bg-ink/40 md:hidden"
            onClick={() => setNavOpen(false)}
          />
        ) : null}

        <div className="flex min-h-full flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line/80 bg-paper/80 px-4 py-3 backdrop-blur md:rounded-2xl md:border md:px-5">
            <button
              type="button"
              className="rounded-lg border border-line bg-paper-elevated px-3 py-1.5 text-sm md:hidden"
              onClick={() => setNavOpen(true)}
            >
              {t('nav.menu')}
            </button>
            <p className="hidden font-display text-lg font-semibold text-brand-strong md:block">{t('app.name')}</p>
            <LanguageToggle />
          </header>
          <main className="flex-1 px-4 py-5 md:px-1 md:py-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
