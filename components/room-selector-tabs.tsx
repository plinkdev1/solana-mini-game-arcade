"use client"

import { Button } from "@/components/ui/button"

interface RoomSelectorProps {
  selectedRoom: "normal" | "high_roller"
  onRoomChange: (room: "normal" | "high_roller") => void
  canAccessHighRoller: boolean
}

export default function RoomSelectorTabs({ selectedRoom, onRoomChange, canAccessHighRoller }: RoomSelectorProps) {
  return (
    <div className="flex gap-2 mb-6">
      <Button
        onClick={() => onRoomChange("normal")}
        className={`flex-1 font-bold transition-all ${
          selectedRoom === "normal"
            ? "bg-cyan-600 text-black shadow-lg shadow-cyan-500/50"
            : "bg-cyan-900/30 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-900/50"
        }`}
      >
        🎮 Normal Bets (0.01-0.1 $DATX)
      </Button>
      <Button
        onClick={() => canAccessHighRoller && onRoomChange("high_roller")}
        disabled={!canAccessHighRoller}
        className={`flex-1 font-bold transition-all ${
          selectedRoom === "high_roller"
            ? "bg-amber-600 text-black shadow-lg shadow-amber-500/50"
            : canAccessHighRoller
              ? "bg-amber-900/30 text-amber-400 border border-amber-500/30 hover:bg-amber-900/50"
              : "bg-gray-900/30 text-gray-500 border border-gray-500/30 cursor-not-allowed"
        }`}
      >
        👑 High Roller (0.1+ $DATX)
      </Button>
    </div>
  )
}
