"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Zap, Brain } from "lucide-react"

interface AIDifficultyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectDifficulty: (difficulty: "easy" | "hard") => void
}

function AIDifficultyModal({ open, onOpenChange, onSelectDifficulty }: AIDifficultyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black/95 border-2 border-purple-500/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-purple-400 text-2xl">Choose El Shito's Brain Power</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            Select difficulty. Easy = random moves, Hard = strategic AI. No real money – pure fun!
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <Button
            onClick={() => {
              onSelectDifficulty("easy")
              onOpenChange(false)
            }}
            className="h-24 flex flex-col items-center justify-center gap-2 bg-green-900/40 hover:bg-green-900/60 border-2 border-green-500/50 text-green-400"
          >
            <Zap className="w-6 h-6" />
            <span className="font-bold">Easy</span>
            <span className="text-xs">Random Moves</span>
          </Button>

          <Button
            onClick={() => {
              onSelectDifficulty("hard")
              onOpenChange(false)
            }}
            className="h-24 flex flex-col items-center justify-center gap-2 bg-red-900/40 hover:bg-red-900/60 border-2 border-red-500/50 text-red-400"
          >
            <Brain className="w-6 h-6" />
            <span className="font-bold">Hard</span>
            <span className="text-xs">Full Minimax</span>
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-4">💩 El Shito awaits. Can you flush the AI?</p>
      </DialogContent>
    </Dialog>
  )
}

export { AIDifficultyModal }
export default AIDifficultyModal
