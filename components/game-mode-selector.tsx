"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot } from "lucide-react"
import { useState } from "react"

interface GameModeSelectorProps {
  onModeChange?: (mode: "pvp" | "ai") => void
}

function GameModeSelector({ onModeChange }: GameModeSelectorProps) {
  const [gameMode, setGameMode] = useState<"pvp" | "ai">("pvp")

  const handleModeChange = (mode: "pvp" | "ai") => {
    setGameMode(mode)
    onModeChange?.(mode)
  }

  return (
    <div className="w-full mb-6 px-4">
      <Tabs value={gameMode} onValueChange={(v) => handleModeChange(v as "pvp" | "ai")} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-primary/30">
          <TabsTrigger
            value="pvp"
            className="text-white font-bold data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-400 data-[state=active]:shadow-[0_0_10px_rgba(0,150,255,0.5)]"
          >
            <span className="flex items-center gap-2">
              <span>⚔️</span>
              Play vs Player (Bets)
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="ai"
            className="text-white font-bold data-[state=active]:text-purple-400 data-[state=active]:border-b-2 data-[state=active]:border-purple-400 data-[state=active]:shadow-[0_0_10px_rgba(168,85,247,0.5)]"
          >
            <span className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Play vs El Shito (Free)
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pvp" className="text-sm text-muted-foreground mt-2">
          <p>🎮 Compete against real players with real stakes. Test your skill in the sewer!</p>
        </TabsContent>

        <TabsContent value="ai" className="text-sm text-purple-400 mt-2">
          <p>🤖 Challenge El Shito (Free AI). No bets – pure fun & practice. Build your skills!</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { GameModeSelector }
export default GameModeSelector
