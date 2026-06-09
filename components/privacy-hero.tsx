"use client"

import { useEffect, useState } from "react"

export function PrivacyHero() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) return null

  return (
    <div className="relative w-full py-16 px-4 mb-12 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-20 w-40 h-40 rounded-full bg-accent blur-3xl" />
        <div className="absolute bottom-10 left-20 w-32 h-32 rounded-full bg-primary blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center z-10">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4 text-balance">
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
            Privacy Policy
          </span>
        </h1>
        <p className="text-xl text-foreground/80 font-medium">Sewer Safe – Your Data Stays in the Reserve Hole</p>
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-foreground/60">
          <span className="px-3 py-1 rounded-full border border-accent/50 bg-accent/10">GDPR Compliant</span>
          <span className="px-3 py-1 rounded-full border border-primary/50 bg-primary/10">No Data Sales</span>
          <span className="px-3 py-1 rounded-full border border-accent/50 bg-accent/10">Solo Project</span>
        </div>
      </div>
    </div>
  )
}
