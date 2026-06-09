"use client"

import { useState } from "react"
import { Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

interface WalletButtonStyledProps {
  onClick?: () => void
  isConnected?: boolean
  label?: string
  className?: string
}

export function WalletButtonStyled({
  onClick,
  isConnected,
  label = "Select Wallet",
  className,
}: WalletButtonStyledProps) {
  const [isDripping, setIsDripping] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsDripping(true)}
      onMouseLeave={() => setIsDripping(false)}
      className={cn(
        "relative px-4 py-2 font-semibold rounded-lg transition-all duration-300",
        "bg-gradient-to-br from-pink-600/80 to-amber-900/60 hover:from-pink-500/90 hover:to-amber-800/70",
        "border-2 border-pink-500 hover:border-pink-400",
        "text-pink-100 hover:text-pink-50",
        "shadow-lg hover:shadow-2xl",
        "hover:scale-105 active:scale-95",
        "flex items-center gap-2",
        "before:absolute before:inset-0 before:rounded-lg before:opacity-0 hover:before:opacity-100 before:transition-opacity",
        "before:shadow-[0_0_20px_rgba(233,30,99,0.6),inset_0_0_15px_rgba(93,64,55,0.3),0_0_40px_rgba(233,30,99,0.4)]",
        className,
      )}
      style={{
        textShadow: "0 0 10px rgba(233, 30, 99, 0.8)",
      }}
    >
      <Wallet className="w-5 h-5" />
      <span>{label}</span>

      {isDripping && (
        <>
          <div className="absolute -top-1 left-1/4 w-1 h-8 bg-gradient-to-b from-amber-700/60 to-transparent rounded-full opacity-60 pointer-events-none animate-pulse" />
          <div className="absolute -bottom-1 right-1/4 w-1 h-8 bg-gradient-to-t from-amber-800/60 to-transparent rounded-full opacity-60 pointer-events-none animate-pulse" />
        </>
      )}
    </button>
  )
}
