"use client"

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TransactionToastProps {
  status: "pending" | "success" | "error"
  message: string
  txSignature?: string
  onDismiss?: () => void
}

export function TransactionToast({ status, message, txSignature, onDismiss }: TransactionToastProps) {
  const solscanUrl = txSignature ? `https://solscan.io/tx/${txSignature}?cluster=devnet` : null

  const bgColor = {
    pending: "bg-yellow-900/50 border-yellow-600",
    success: "bg-green-900/50 border-green-600",
    error: "bg-red-900/50 border-red-600",
  }[status]

  const textColor = {
    pending: "text-yellow-300",
    success: "text-green-300",
    error: "text-red-300",
  }[status]

  const Icon = {
    pending: Loader2,
    success: CheckCircle2,
    error: AlertCircle,
  }[status]

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded border ${bgColor} neon-glow`}
      style={{
        borderColor: status === "success" ? "#00ff41" : status === "error" ? "#ff1744" : "#ffeb3b",
        boxShadow:
          status === "success" ? "0 0 10px #00ff41" : status === "error" ? "0 0 10px #ff1744" : "0 0 10px #ffeb3b",
      }}
    >
      <Icon className={`w-5 h-5 ${status === "pending" ? "animate-spin" : ""} ${textColor}`} />
      <div className="flex-1">
        <p className={`text-sm font-medium ${textColor}`}>{message}</p>
        {solscanUrl && (
          <a
            href={solscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline mt-1 inline-block"
          >
            View on Solscan
          </a>
        )}
      </div>
      {status !== "pending" && onDismiss && (
        <Button variant="ghost" size="sm" onClick={onDismiss} className="text-xs">
          ✕
        </Button>
      )}
    </div>
  )
}
