"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface AdminState {
  isAdmin: boolean
  authToken: string | null
  tokenExpiry: string | null
  authError: string | null
  isAuthenticating: boolean

  setIsAdmin: (isAdmin: boolean) => void
  setAuthToken: (token: string | null, expiry?: string | null) => void
  setAuthError: (error: string | null) => void
  setIsAuthenticating: (authenticating: boolean) => void
  logout: () => void
  isTokenValid: () => boolean
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAdmin: false,
      authToken: null,
      tokenExpiry: null,
      authError: null,
      isAuthenticating: false,

      setIsAdmin: (isAdmin) => set({ isAdmin, authError: null }),
      setAuthToken: (token, expiry = null) => set({ authToken: token, tokenExpiry: expiry }),
      setAuthError: (error) => set({ authError: error }),
      setIsAuthenticating: (authenticating) => set({ isAuthenticating: authenticating }),
      logout: () =>
        set({
          isAdmin: false,
          authToken: null,
          tokenExpiry: null,
          authError: null,
        }),
      isTokenValid: () => {
        const { authToken, tokenExpiry } = get()
        if (!authToken || !tokenExpiry) return false
        return new Date(tokenExpiry) > new Date()
      },
    }),
    {
      name: "admin-store",
    },
  ),
)
