import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { GuideModal } from '@/components/guide-modal/GuideModal'
import { HomePage } from '@/features/home/HomePage'
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
