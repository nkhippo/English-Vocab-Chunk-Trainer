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

export function SideNav() {
  const { t } = useTranslation()
  const navOpen = useAppStore((s) => s.navOpen)
  const setNavOpen = useAppStore((s) => s.setNavOpen)
  const reopenGuide = useAppStore((s) => s.reopenGuide)

  return (
    <>
      {navOpen ? (
        <button
          type="button"
          aria-label={t('nav.close')}
          className="fixed inset-0 z-40 bg-text-primary/35"
          onClick={() => setNavOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-bg-elevated p-5 transition-transform ${
          navOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <p className="mb-8 font-serif text-xl text-text-primary">{t('app.name')}</p>
        <nav className="flex flex-col gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setNavOpen(false)}
              className={({ isActive }) =>
                `rounded px-3 py-2.5 font-sans text-sm font-medium transition ${
                  isActive
                    ? 'bg-accent text-bg-elevated'
                    : 'text-text-secondary hover:bg-bg-panel hover:text-text-primary'
                }`
              }
            >
              {t(`nav.${link.key}`)}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="mt-6 text-left font-sans text-sm font-medium text-accent hover:underline"
          onClick={() => {
            setNavOpen(false)
            reopenGuide()
          }}
        >
          {t('nav.help')}
        </button>

        <div className="mt-auto border-t border-border pt-4">
          <LanguageToggle />
        </div>
      </aside>
    </>
  )
}
