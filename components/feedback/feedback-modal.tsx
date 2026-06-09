"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useFeedbackStore } from "@/lib/stores/feedback-store"
import { useWalletStore } from "@/lib/stores/wallet-store"
import { submitFeedback } from "@/lib/utils/feedback"
import { X } from "lucide-react"

interface FeedbackModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const [message, setMessage] = useState("")
  const [rating, setRating] = useState<number | null>(null)
  const [wallet, setWallet] = useState("")
  const { toast } = useToast()

  const { submitting, error, success, setSubmitting, setError, setSuccess, reset } = useFeedbackStore()
  const connectedWallet = useWalletStore((state) => state.publicKey)

  const messageLength = message.trim().length
  const isValidMessage = messageLength >= 10

  useEffect(() => {
    if (connectedWallet && !wallet) {
      const shortened = `${connectedWallet.slice(0, 6)}...${connectedWallet.slice(-4)}`
      setWallet(shortened)
    }
  }, [connectedWallet, wallet, open])

  useEffect(() => {
    if (submitting) {
      toast({
        title: "Flushing Feedback...",
        description: "Sending your thoughts to the sewers...",
      })
    }
  }, [submitting, toast])

  useEffect(() => {
    if (success) {
      toast({
        title: "Flushed! Thanks for the shit.",
        description: "Your feedback has been received.",
      })
      setTimeout(() => {
        onOpenChange(false)
        reset()
      }, 1500)
    }
  }, [success, toast, onOpenChange, reset])

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
      setError(null)
    }
  }, [error, toast, setError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValidMessage) {
      setError("Message must be at least 10 characters")
      return
    }

    setSubmitting(true)

    try {
      const result = await submitFeedback({
        message: message.trim(),
        rating: rating || undefined,
        wallet: wallet || undefined,
      })

      if (result.success) {
        setSuccess(true)
        setMessage("")
        setRating(null)
        setWallet(connectedWallet ? `${connectedWallet.slice(0, 6)}...${connectedWallet.slice(-4)}` : "")
      } else {
        setError(result.error || "Failed to submit feedback")
      }
    } catch (err) {
      setError("An error occurred while submitting feedback")
      console.error("[v0] Feedback error:", err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-pink-500/50 shadow-2xl"
        style={{
          boxShadow: "0 0 40px rgba(236, 72, 153, 0.4), inset 0 0 30px rgba(236, 72, 153, 0.1)",
        }}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 p-1 hover:bg-pink-500/20 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-pink-400" />
        </button>

        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold pr-6">
            <span className="bg-gradient-to-r from-pink-500 to-amber-700 bg-clip-text text-transparent">
              Flush Feedback
            </span>
            <br />
            <span className="text-sm text-pink-400 font-normal">Tell El Shito!</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
          {/* Message textarea */}
          <div>
            <label className="text-sm font-medium text-pink-300 mb-2 block">
              Your Message <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what's on your mind... (min 10 chars)"
              disabled={submitting}
              className="min-h-[100px] bg-slate-800/50 border-pink-500/30 text-white placeholder:text-slate-500 focus:border-pink-500 focus:ring-pink-500/30 disabled:opacity-50"
            />
            <p className={`text-xs mt-1 ${messageLength >= 10 ? "text-green-400" : "text-slate-400"}`}>
              {messageLength}/10 characters
            </p>
          </div>

          {/* Star rating */}
          <div>
            <label className="text-sm font-medium text-pink-300 mb-2 block">
              Rating <span className="text-slate-500">(optional)</span>
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(rating === star ? null : star)}
                  disabled={submitting}
                  className="text-2xl transition-all disabled:opacity-50"
                  style={{
                    textShadow: rating && star <= rating ? "0 0 10px #ff00ff" : "none",
                    filter: rating && star <= rating ? "brightness(1.5)" : "brightness(0.7)",
                  }}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>

          {/* Wallet/Email input */}
          <div>
            <label className="text-sm font-medium text-pink-300 mb-2 block">
              Wallet/Email <span className="text-slate-500">(optional)</span>
            </label>
            <Input
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="For replies (Anonymous OK – no PII stored)"
              disabled={submitting}
              className="bg-slate-800/50 border-pink-500/30 text-white placeholder:text-slate-500 focus:border-pink-500 focus:ring-pink-500/30 disabled:opacity-50"
            />
            <p className="text-xs text-slate-400 mt-1">
              💡 Anonymous feedback encouraged. We don't store personal data.
            </p>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            disabled={submitting || !isValidMessage}
            className="w-full bg-gradient-to-r from-pink-600 to-amber-900 hover:from-pink-500 hover:to-amber-800 border border-pink-400 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              boxShadow: submitting ? "0 0 20px rgba(236, 72, 153, 0.3)" : "0 0 15px rgba(236, 72, 153, 0.5)",
            }}
          >
            {submitting ? "🚽 Flushing..." : "🚽 Flush Send"}
          </Button>

          <div className="border-t border-pink-500/30 pt-3 mt-2">
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              Feedback anonymous – for improvements only, no PII stored. Play responsibly.
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
