"use client"

import { useEffect } from "react"
import { useBettingStore } from "@/lib/stores/betting-store"
import { useToast } from "@/hooks/use-toast"

export function TransactionToast() {
  const { transactionStatus, transactionError } = useBettingStore()
  const { toast } = useToast()

  useEffect(() => {
    if (transactionStatus === "success") {
      toast({
        title: "Transaction Confirmed",
        description: "Bet successfully locked in escrow",
      })
    }
  }, [transactionStatus, toast])

  useEffect(() => {
    if (transactionStatus === "error" && transactionError) {
      toast({
        title: "Transaction Failed",
        description: transactionError,
        variant: "destructive",
      })
    }
  }, [transactionStatus, transactionError, toast])

  return null
}
