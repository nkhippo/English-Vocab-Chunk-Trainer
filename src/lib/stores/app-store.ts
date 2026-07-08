import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n, { setStoredLanguage } from '@/lib/i18n'
import type { ReviewSession, ReviewStateItem, CefrLevel } from '@/types/learning'

interface AppState {
  guideOpen: boolean
  guideSeen: boolean
  navOpen: boolean
  language: 'ja' | 'en'
  reviewSession: ReviewSession | null
  reviewIndex: number
  setGuideOpen: (open: boolean) => void
  markGuideSeen: () => void
  reopenGuide: () => void
  setNavOpen: (open: boolean) => void
  setLanguage: (lang: 'ja' | 'en') => void
  setReviewSession: (session: ReviewSession | null) => void
  setReviewIndex: (index: number) => void
  updateReviewItem: (index: number, patch: Partial<ReviewStateItem>) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      guideOpen: false,
      guideSeen: false,
      navOpen: false,
      language: 'ja',
      reviewSession: null,
      reviewIndex: 0,
      setGuideOpen: (open) => set({ guideOpen: open }),
      markGuideSeen: () => set({ guideSeen: true, guideOpen: false }),
      reopenGuide: () => set({ guideOpen: true }),
      setNavOpen: (open) => set({ navOpen: open }),
      setLanguage: (lang) => {
        setStoredLanguage(lang)
        void i18n.changeLanguage(lang)
        set({ language: lang })
      },
      setReviewSession: (session) => set({ reviewSession: session, reviewIndex: 0 }),
      setReviewIndex: (index) => set({ reviewIndex: index }),
      updateReviewItem: (index, patch) => {
        const session = get().reviewSession
        if (!session) return
        const items = session.items.map((item, i) => (i === index ? { ...item, ...patch } : item))
        set({
          reviewSession: {
            ...session,
            items,
            updatedAt: new Date().toISOString(),
          },
        })
      },
    }),
    {
      name: 'vct.app-store',
      partialize: (state) => ({
        guideSeen: state.guideSeen,
        language: state.language,
        reviewSession: state.reviewSession,
        reviewIndex: state.reviewIndex,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          setStoredLanguage(state.language)
          void i18n.changeLanguage(state.language)
        }
        if (state && !state.guideSeen) {
          state.setGuideOpen(true)
        }
      },
    },
  ),
)

export const CEFR_HOTKEYS: Record<string, CefrLevel> = {
  '1': 'A1',
  '2': 'A2',
  '3': 'B1',
  '4': 'B2',
  '5': 'C1',
  '6': 'C2',
}
