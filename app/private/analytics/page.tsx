"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import PasswordGate from "@/components/admin/password-gate"
import AnalyticsDashboard from "@/components/admin/analytics-dashboard"

const ADMIN_PASSWORD = "SewerMaster2024!" // Hardcoded admin password

export default function AnalyticsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  const handlePasswordSubmit = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
    } else {
      alert("Invalid password. Access denied.")
    }
  }

  if (!isAuthenticated) {
    return <PasswordGate onSubmit={handlePasswordSubmit} />
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Neon Admin Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(233, 30, 99, 0.2) 0%, transparent 40%),
            radial-gradient(ellipse at 80% 80%, rgba(0, 255, 65, 0.15) 0%, transparent 50%),
            linear-gradient(135deg, #1a0f1a 0%, #0a0a0a 50%, #0f1a0a 100%)
          `,
        }}
      />
      <div className="fixed inset-0 -z-10 bg-red-950/60 backdrop-blur-sm" />

      <AnalyticsDashboard />
    </main>
  )
}
