"use client"

import { useEffect } from "react"
import { useWalletStore } from "@/lib/stores/wallet-store"
import { useToast } from "@/hooks/use-toast"

export function WalletErrorToast() {
  const { error, setError } = useWalletStore()
  const { toast } = useToast()

  useEffect(() => {
    if (error) {
      toast({
        title: "Flush Error",
        description: error,
        variant: "destructive",
      })
      setError(null)
    }
  }, [error, setError, toast])

  return null
}
