import { Loader2 } from "lucide-react"

export function SyncLoadingSpinner({ visible }: { visible: boolean }) {
  if (!visible) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin" style={{ color: "#e91e63" }} />
        <p className="text-lg font-bold" style={{ color: "#00ff41" }}>
          Syncing with opponent...
        </p>
      </div>
    </div>
  )
}
