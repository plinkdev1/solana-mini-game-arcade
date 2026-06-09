"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { useWalletStore } from "@/lib/stores/wallet-store"
import { useAdminStore } from "@/lib/stores/admin-store"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Wallet, Lock, AlertCircle, Loader2, ShieldCheck, ExternalLink } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { setVisible } = useWalletModal()
  const { connected, publicKey: realPublicKey } = useWallet()
  const { publicKey, mode } = useWalletStore()
  const { isAdmin, setIsAdmin, setAuthError, setAuthToken, authError, isTokenValid, authToken, logout } =
    useAdminStore()

  const [showAuthModal, setShowAuthModal] = useState(false)
  const [password, setPassword] = useState("")
  const [isVerifying, setIsVerifying] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [walletVerified, setWalletVerified] = useState<boolean | null>(null)
  const [isCheckingWallet, setIsCheckingWallet] = useState(false)

  // Get the wallet address to use (mock or real)
  const walletAddress = mode === "mock" ? "mock-admin-wallet" : publicKey || realPublicKey?.toBase58()
  const isWalletConnected = mode === "mock" || connected || !!publicKey

  const checkWalletPermission = useCallback(
    async (wallet: string) => {
      setIsCheckingWallet(true)
      try {
        // Mock mode always passes
        if (mode === "mock") {
          console.log("[v0] Mock mode - wallet auto-verified")
          setWalletVerified(true)
          return true
        }

        // Call server-side API to verify wallet
        const response = await fetch("/api/admin-verify-wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet }),
        })

        const data = await response.json()
        console.log("[v0] Wallet verification response:", data)

        if (data.permitted) {
          setWalletVerified(true)
          return true
        }

        setWalletVerified(false)
        return false
      } catch (err) {
        console.error("[v0] Error verifying wallet:", err)
        // Mock mode fallback
        if (mode === "mock") {
          setWalletVerified(true)
          return true
        }
        setWalletVerified(false)
        return false
      } finally {
        setIsCheckingWallet(false)
      }
    },
    [mode],
  )

  // Check session token on load
  useEffect(() => {
    const checkAuth = async () => {
      setIsVerifying(true)

      const storedToken = sessionStorage.getItem("admin_token")
      const storedExpiry = sessionStorage.getItem("admin_token_expiry")

      if (storedToken && storedExpiry && new Date(storedExpiry) > new Date()) {
        setAuthToken(storedToken, storedExpiry)
        setIsAdmin(true)
        setIsVerifying(false)
        return
      }

      if (isTokenValid() && authToken) {
        setIsAdmin(true)
        setIsVerifying(false)
        return
      }

      setShowAuthModal(true)
      setIsVerifying(false)
    }

    checkAuth()
  }, [setAuthToken, setIsAdmin, isTokenValid, authToken])

  // Handle wallet disconnect
  useEffect(() => {
    if (isAdmin && !isWalletConnected && mode !== "mock") {
      toast({
        title: "Wallet Disconnected",
        description: "Please reconnect to continue admin access",
        variant: "destructive",
      })
      logout()
      setShowAuthModal(true)
    }
  }, [isWalletConnected, isAdmin, mode, toast, logout])

  // Token expiry check
  useEffect(() => {
    if (!isAdmin) return

    const checkExpiry = setInterval(() => {
      if (!isTokenValid()) {
        toast({
          title: "Session Expired",
          description: "Please re-authenticate to continue",
          variant: "destructive",
        })
        logout()
        setShowAuthModal(true)
      }
    }, 60000)

    return () => clearInterval(checkExpiry)
  }, [isAdmin, isTokenValid, toast, logout])

  // Verify wallet when connected
  useEffect(() => {
    if (isWalletConnected && walletAddress && showAuthModal) {
      checkWalletPermission(walletAddress)
    }
  }, [isWalletConnected, walletAddress, showAuthModal, checkWalletPermission])

  const handleConnectWallet = () => {
    if (mode === "mock") {
      setWalletVerified(true)
      toast({
        title: "Mock Wallet Connected",
        description: "Using mock admin wallet for testing",
      })
    } else {
      setVisible(true)
    }
  }

  const handlePasswordSubmit = async () => {
    if (!password) {
      setAuthError("Password required")
      return
    }

    if (!walletVerified) {
      setAuthError("Wallet not permitted")
      toast({
        title: "Admin Access Denied!",
        description: "Your wallet is not in the admin whitelist",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setAuthError(null)

    try {
      const response = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: walletAddress, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setAuthError(data.error || "Authentication failed")
        setPassword("")
        toast({
          title: "Invalid Credentials",
          description: data.error || "Try again or contact flush admin",
          variant: "destructive",
        })
        return
      }

      sessionStorage.setItem("admin_token", data.token)
      sessionStorage.setItem("admin_token_expiry", data.expires)

      setAuthToken(data.token, data.expires)
      setIsAdmin(true)
      setShowAuthModal(false)
      setPassword("")

      toast({
        title: "Welcome, Admin!",
        description: "Access granted to El Shito Admin Flush",
      })

      window.location.reload()
    } catch (err) {
      setAuthError("Authentication failed")
      toast({
        title: "Error",
        description: "Failed to authenticate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setShowAuthModal(false)
    toast({
      title: "Admin Access Denied!",
      description: "Returning to home page",
      variant: "destructive",
    })
    router.push("/")
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-pink-500 mx-auto" />
          <div className="text-pink-500 text-xl font-bold animate-pulse">Verifying admin access...</div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <Dialog open={showAuthModal} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent
          className="border-2 border-pink-500/50 bg-gradient-to-b from-gray-900/98 via-black/98 to-gray-900/98 backdrop-blur-xl max-w-md"
          style={{
            boxShadow: "0 0 40px rgba(236, 72, 153, 0.3), 0 0 80px rgba(139, 69, 19, 0.2)",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-pink-400 to-amber-700 flex items-center gap-2">
              <ShieldCheck className="h-7 w-7 text-pink-500" />
              Admin Access
            </DialogTitle>
            <DialogDescription className="text-cyan-400/80">
              Connect wallet + enter password (3 attempts/hour)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Step 1: Connect Wallet */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-pink-400 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center text-xs">1</span>
                Connect Admin Wallet
              </label>

              {!isWalletConnected ? (
                <Button
                  onClick={handleConnectWallet}
                  className="w-full h-12 bg-gradient-to-r from-pink-600 to-amber-700 hover:from-pink-500 hover:to-amber-600 text-white font-bold transition-all duration-300"
                  style={{
                    boxShadow: "0 0 20px rgba(236, 72, 153, 0.4)",
                  }}
                >
                  <Wallet className="h-5 w-5 mr-2" />
                  {mode === "mock" ? "Connect Mock Wallet" : "Select Wallet"}
                </Button>
              ) : (
                <div className="p-3 rounded-lg border border-pink-500/30 bg-pink-500/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-pink-400" />
                      <span className="text-cyan-400 font-mono text-sm">
                        {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                      </span>
                    </div>
                    {isCheckingWallet ? (
                      <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                    ) : walletVerified ? (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Permitted</span>
                    ) : (
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Not Permitted</span>
                    )}
                  </div>
                </div>
              )}

              {isWalletConnected && walletVerified === false && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Wallet not in admin whitelist. Check ADMIN_WALLETS env var.
                </p>
              )}
            </div>

            {/* Step 2: Enter Password */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-pink-400 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center text-xs">2</span>
                Enter Admin Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-400/50" />
                <Input
                  type="password"
                  placeholder={walletVerified ? "Admin password" : "Connect permitted wallet first"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isSubmitting && walletVerified && handlePasswordSubmit()}
                  disabled={isSubmitting || !walletVerified}
                  className="pl-10 h-12 border-pink-500/30 bg-black/50 text-cyan-400 placeholder:text-cyan-400/30 focus:border-pink-500 focus:ring-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    boxShadow: walletVerified ? "0 0 10px rgba(236, 72, 153, 0.2)" : "none",
                  }}
                />
              </div>

              {mode === "mock" && (
                <p className="text-xs text-cyan-400/60">Mock mode: Use password &quot;test&quot; for testing</p>
              )}
            </div>

            {/* Error Display */}
            {authError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {authError}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handlePasswordSubmit}
              disabled={isSubmitting || !walletVerified || !password}
              className="w-full h-12 bg-gradient-to-r from-pink-600 via-pink-500 to-amber-700 hover:from-pink-500 hover:via-pink-400 hover:to-amber-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              style={{
                boxShadow:
                  walletVerified && password
                    ? "0 0 30px rgba(236, 72, 153, 0.5), 0 0 60px rgba(139, 69, 19, 0.3)"
                    : "none",
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5 mr-2" />
                  Authenticate
                </>
              )}
            </Button>

            {/* Cancel Link */}
            <button
              onClick={handleCancel}
              className="w-full text-center text-sm text-cyan-400/60 hover:text-cyan-400 transition-colors"
            >
              Cancel and return to home
            </button>
          </div>

          <DialogFooter className="border-t border-pink-500/20 pt-4 mt-2">
            <p className="text-xs text-cyan-400/50 text-center w-full">
              Admin access for authorized personnel only – log activity enabled.
              <a href="/rules" className="text-pink-400 hover:text-pink-300 ml-1 inline-flex items-center gap-1">
                Terms <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return <>{children}</>
}
