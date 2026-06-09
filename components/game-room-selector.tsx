"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Crown, AlertCircle } from "lucide-react"
import { useBettingStore } from "@/lib/stores/betting-store"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"

interface GameRoomSelectorProps {
  onRoomChange?: (room: "normal" | "high_roller") => void
  gameBet?: number
}

export default function GameRoomSelector({ onRoomChange, gameBet = 0 }: GameRoomSelectorProps) {
  const [currentRoom, setCurrentRoom] = useState<"normal" | "high_roller">("normal")
  const [isEligibleForHighRoller, setIsEligibleForHighRoller] = useState(false)
  const { toast } = useToast()
  const { mockBalance } = useBettingStore()

  useEffect(() => {
    // Check eligibility (mock: balance > 100 $DATX)
    const eligible = mockBalance > 100
    setIsEligibleForHighRoller(eligible)
  }, [mockBalance])

  const handleRoomChange = (room: "normal" | "high_roller") => {
    if (room === "high_roller" && !isEligibleForHighRoller) {
      toast({
        title: "Insufficient Balance",
        description: "Need >100 $DATX to flush high – buy more!",
        variant: "destructive",
      })
      return
    }

    setCurrentRoom(room)
    onRoomChange?.(room)
  }

  return (
    <div className="w-full mb-6 px-4">
      <Tabs
        value={currentRoom}
        onValueChange={(v) => handleRoomChange(v as "normal" | "high_roller")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-primary/30">
          <TabsTrigger
            value="normal"
            className="text-white font-bold data-[state=active]:text-green-400 data-[state=active]:border-b-2 data-[state=active]:border-green-400 data-[state=active]:shadow-[0_0_10px_rgba(0,255,65,0.5)]"
          >
            <span className="flex items-center gap-2">
              <span>🚽</span>
              Normal Mode (0.01-0.1 $DATX)
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="high_roller"
            disabled={!isEligibleForHighRoller}
            className={`text-white font-bold ${
              isEligibleForHighRoller
                ? "data-[state=active]:text-red-400 data-[state=active]:border-b-2 data-[state=active]:border-red-400 data-[state=active]:shadow-[0_0_10px_rgba(255,0,0,0.5)]"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            <span className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              High Roller {`>`}0.1 $DATX {!isEligibleForHighRoller && <AlertCircle className="w-4 h-4 text-red-400" />}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="normal" className="text-sm text-muted-foreground mt-2">
          <p>🟢 Normal Play: Friendly matches with micro-bets (0.01–0.1 $DATX)</p>
        </TabsContent>

        <TabsContent value="high_roller" className="text-sm mt-2">
          {isEligibleForHighRoller ? (
            <p className="text-red-400">
              🔴 High Roller Mode: Large bets, big rewards. Requires {`>`}100 $DATX balance (Your balance:{" "}
              {mockBalance.toFixed(2)})
            </p>
          ) : (
            <p className="text-orange-400">
              🔒 Need {`>`}100 $DATX to unlock high roller mode (Your balance: {mockBalance.toFixed(2)})
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
