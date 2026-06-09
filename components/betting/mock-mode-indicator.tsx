"use client"

export function MockModeIndicator() {
  const isMockMode = true // Hardcoded for testing - will be real escrow later

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-yellow-900/80 border border-yellow-500/50 px-4 py-2 rounded text-xs text-yellow-300 backdrop-blur">
      Mock Mode: ON (No real transactions)
    </div>
  )
}
