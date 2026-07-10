import { useLocation } from 'react-router-dom'
import { AppHeader } from '@/components/layout/AppHeader'
import { SideNav } from '@/components/layout/SideNav'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isReader = location.pathname.startsWith('/train/mode-a') || location.pathname.startsWith('/train/mode-b')

  return (
    <div className="flex h-full min-h-0 flex-col bg-bg-base text-text-primary">
      <SideNav />
      {!isReader ? <AppHeader /> : null}
      <main className={`min-h-0 flex-1 ${isReader ? 'overflow-hidden' : 'overflow-auto px-4 py-6 md:px-8'}`}>
        {isReader ? children : <div className="mx-auto w-full max-w-5xl">{children}</div>}
      </main>
    </div>
  )
}
