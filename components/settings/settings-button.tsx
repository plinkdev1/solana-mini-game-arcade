"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SettingsIcon } from "lucide-react"
import { SettingsModal } from "./settings-modal"

export function SettingsButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 border border-amber-400 text-white shadow-lg shadow-amber-500/50 hover:shadow-amber-500/70 transition-all duration-300"
        size="sm"
      >
        <SettingsIcon className="w-4 h-4 mr-2" />
        Settings
      </Button>

      <SettingsModal open={open} onOpenChange={setOpen} />
    </>
  )
}
