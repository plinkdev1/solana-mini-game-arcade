"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FeedbackModal } from "./feedback-modal"

export function FeedbackButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-gradient-to-r from-pink-700 to-amber-900 hover:from-pink-600 hover:to-amber-800 border border-pink-500 shadow-lg relative overflow-hidden group"
        style={{
          boxShadow: "0 0 20px rgba(236, 72, 153, 0.6), inset 0 0 20px rgba(236, 72, 153, 0.2)",
        }}
      >
        {/* Dripping sludge effect on hover */}
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="absolute top-0 left-1/4 w-1 h-3 bg-gradient-to-b from-amber-700 to-transparent animate-pulse" />
          <span
            className="absolute top-0 left-1/2 w-1 h-3 bg-gradient-to-b from-amber-700 to-transparent animate-pulse"
            style={{ animationDelay: "0.2s" }}
          />
          <span
            className="absolute top-0 right-1/4 w-1 h-3 bg-gradient-to-b from-amber-700 to-transparent animate-pulse"
            style={{ animationDelay: "0.4s" }}
          />
        </span>
        <span className="relative flex items-center gap-2">💬 Feedback</span>
      </Button>

      <FeedbackModal open={open} onOpenChange={setOpen} />
    </>
  )
}
