"use client"

import { useWalletStore } from "@/lib/stores/wallet-store"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"

export function useLowBalanceCheck(betAmount: number) {
  const { datxBalance } = useWalletStore()
  const { toast } = useToast()

  const isBetDisabled = datxBalance < betAmount

  useEffect(() => {
    if (isBetDisabled && betAmount > 0) {
      toast({
        title: "Insufficient Balance",
        description: `Need ${betAmount} $DATX, but you have ${datxBalance}`,
        variant: "destructive",
      })
    }
  }, [isBetDisabled, betAmount, datxBalance, toast])

  return { isBetDisabled, hasInsufficientBalance: isBetDisabled }
}

export function LowBalanceWarningBanner({ betAmount }: { betAmount: number }) {
  const { datxBalance } = useWalletStore()

  if (datxBalance >= betAmount) {
    return null
  }

  return (
    <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg animate-pulse">
      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-bold text-red-400">Flush Error: Low Balance!</p>
        <p className="text-xs text-red-300/80 mt-1">
          You need {betAmount} $DATX but only have {datxBalance}. Add funds to continue.
        </p>
      </div>
    </div>
  )
}
