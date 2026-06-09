"use client"

import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"

export function DisclaimersHero() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) return null

  return (
    <div className="relative w-full py-16 px-4 mb-12 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-20 w-40 h-40 rounded-full bg-accent blur-3xl" />
        <div className="absolute bottom-10 left-20 w-32 h-32 rounded-full bg-destructive blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center z-10">
        <div className="flex items-center justify-center mb-4">
          <AlertTriangle className="w-12 h-12 text-destructive animate-pulse" />
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4 text-balance">
          <span className="bg-gradient-to-r from-destructive via-primary to-destructive bg-clip-text text-transparent">
            Disclaimers
          </span>
        </h1>
        <p className="text-xl text-foreground/80 font-medium">Flush the Risk – Read Before You Play</p>
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-foreground/60">
          <span className="px-3 py-1 rounded-full border border-destructive/50 bg-destructive/10">
            At Your Own Risk
          </span>
          <span className="px-3 py-1 rounded-full border border-primary/50 bg-primary/10">Mock Mode Only</span>
          <span className="px-3 py-1 rounded-full border border-accent/50 bg-accent/10">Beta Software</span>
        </div>
      </div>
    </div>
  )
}
