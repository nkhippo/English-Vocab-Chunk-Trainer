import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { GuideModal } from '@/components/guide-modal/GuideModal'
import { HomePage } from '@/features/home/HomePage'
import { ModeAPage } from '@/features/train/mode-a'
import { ModeBPage } from '@/features/train/mode-b'
import { TrainPage } from '@/features/train/TrainPage'
import { BrowsePage } from '@/features/browse/BrowsePage'
import { ReviewPage } from '@/features/review/ReviewPage'
import { SettingsPage } from '@/features/settings/SettingsPage'

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/train" element={<TrainPage />} />
          <Route path="/train/mode-a" element={<ModeAPage />} />
          <Route path="/train/mode-b" element={<ModeBPage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
      <GuideModal />
    </BrowserRouter>
  )
}
