import { create } from "zustand"

export interface FeedbackState {
  // Submission state
  submitting: boolean
  error: string | null
  success: boolean

  // Actions
  setSubmitting: (submitting: boolean) => void
  setError: (error: string | null) => void
  setSuccess: (success: boolean) => void
  reset: () => void
}

export const useFeedbackStore = create<FeedbackState>((set) => ({
  submitting: false,
  error: null,
  success: false,

  setSubmitting: (submitting) => set({ submitting }),
  setError: (error) => set({ error }),
  setSuccess: (success) => set({ success }),
  reset: () => set({ submitting: false, error: null, success: false }),
}))
