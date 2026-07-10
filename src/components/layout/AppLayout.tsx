import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/lib/stores/app-store'
import { LanguageToggle } from '@/components/language-toggle/LanguageToggle'
import { BrandMark } from '@/components/brand/BrandMark'

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
          className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-line bg-paper-elevated/95 p-5 shadow-soft backdrop-blur transition md:static md:z-auto md:w-56 md:translate-x-0 md:rounded-[14px] md:border md:shadow-soft ${
            navOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-ink-muted md:mb-8">
            {t('app.name')}
          </p>
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setNavOpen(false)}
                className={({ isActive }) =>
                  `rounded-[11px] px-3 py-2 text-sm font-bold transition ${
                    isActive
                      ? 'bg-brand text-white shadow-soft'
                      : 'text-ink-muted hover:bg-brand-soft hover:text-brand-strong'
                  }`
                }
              >
                {t(`nav.${link.key}`)}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            className="mt-6 text-sm font-bold text-brand hover:underline"
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
          <header className="sticky top-0 z-20 border-b border-line bg-paper/90 px-4 py-4 backdrop-blur md:rounded-[14px] md:border md:bg-paper-elevated md:px-5 md:py-5 md:shadow-soft">
            <div className="flex items-end justify-between gap-3">
              <div className="flex min-w-0 items-end gap-3">
                <button
                  type="button"
                  className="rounded-[9px] border border-line bg-paper-elevated px-3 py-1.5 text-sm font-bold text-ink-muted hover:border-[#bfc3bc] hover:text-ink md:hidden"
                  onClick={() => setNavOpen(true)}
                >
                  {t('nav.menu')}
                </button>
                <BrandMark compact className="min-w-0 md:hidden" />
                <BrandMark className="hidden md:flex" />
              </div>
              <LanguageToggle />
            </div>
            <div className="mt-4 flex gap-1.5" aria-hidden="true">
              <span className="h-1 flex-1 rounded-sm bg-line" />
              <span className="h-1 flex-1 rounded-sm bg-line" />
              <span className="h-1 flex-1 rounded-sm bg-line" />
            </div>
          </header>
          <main className="flex-1 px-4 py-5 md:px-1 md:py-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
