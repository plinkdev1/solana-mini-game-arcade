"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { completeCaptchaVerification } from "@/lib/supabase/anti-sybil-service"
import { AlertCircle, CheckCircle } from "lucide-react"

interface CaptchaVerificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  walletAddress: string
  onVerified: () => void
}

export default function CaptchaVerificationModal({
  open,
  onOpenChange,
  walletAddress,
  onVerified,
}: CaptchaVerificationModalProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const { toast } = useToast()

  const handleVerifyCaptcha = async () => {
    setIsVerifying(true)
    try {
      // Mock CAPTCHA verification (ready for real reCAPTCHA integration)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const success = await completeCaptchaVerification(walletAddress)
      if (success) {
        setVerified(true)
        toast({
          title: "Verified! 🎉",
          description: "CAPTCHA completed - ready to play!",
        })
        setTimeout(() => {
          onVerified()
          onOpenChange(false)
        }, 1000)
      } else {
        toast({
          title: "Verification failed",
          description: "Please try again",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] CAPTCHA error:", error)
      toast({
        title: "Error",
        description: "Verification failed - please try again",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-cyan-500/30 bg-black/90 backdrop-blur">
        <DialogHeader>
          <DialogTitle className="text-cyan-400 text-2xl">🛡️ Anti-Sybil Verification</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-4">
            <div className="space-y-4">
              <p>Complete CAPTCHA to verify wallet uniqueness and prevent bot accounts.</p>

              {/* Warning */}
              <div className="border border-cyan-500/30 rounded-lg p-4 bg-cyan-500/5 space-y-2">
                <p className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> One-time verification required
                </p>
                <p className="text-xs text-muted-foreground">
                  Wallet: <span className="font-mono text-cyan-300">{walletAddress?.slice(0, 16)}...</span>
                </p>
              </div>

              {/* CAPTCHA Placeholder */}
              <div className="border-2 border-dashed border-cyan-500/30 rounded-lg p-8 bg-cyan-500/5 text-center">
                {verified ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle className="w-12 h-12 text-green-400" />
                    <p className="text-green-400 font-bold">Verified!</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 border-2 border-cyan-500/30 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">reCAPTCHA v3</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Click "Verify" to complete CAPTCHA</p>
                  </div>
                )}
              </div>

              {/* Compliance */}
              <div className="text-xs text-muted-foreground border-l-2 border-cyan-500/30 pl-3">
                <p>This verification prevents Sybil attacks and ensures fair play for all users.</p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={() => onOpenChange(false)}
            disabled={isVerifying}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-black font-bold"
            onClick={handleVerifyCaptcha}
            disabled={isVerifying || verified}
          >
            {isVerifying ? "Verifying..." : verified ? "Verified ✓" : "Verify"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
