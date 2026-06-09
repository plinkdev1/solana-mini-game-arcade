"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface PasswordGateProps {
  onSubmit: (password: string) => void
}

export default function PasswordGate({ onSubmit }: PasswordGateProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) {
      setError("Password required")
      return
    }
    onSubmit(password)
    setPassword("")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      {/* Neon Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse at 50% 50%, rgba(233, 30, 99, 0.25) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(255, 0, 255, 0.15) 0%, transparent 40%),
            linear-gradient(135deg, #1a0f1a 0%, #0a0a0a 50%)
          `,
        }}
      />

      <Card className="w-full max-w-md p-8 border-primary/50 bg-card/80 backdrop-blur shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-pink-400 to-pink-300 bg-clip-text text-transparent drop-shadow-lg">
            Admin Access
          </h1>
          <p className="text-muted-foreground mt-2">El Shito Analytics Control Room</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Master Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError("")
              }}
              placeholder="Enter admin password"
              className="mt-2 bg-input border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-600 text-primary-foreground font-semibold"
          >
            Unlock Dashboard
          </Button>
        </form>

        <div className="mt-6 p-4 bg-secondary/20 border border-secondary/50 rounded text-sm text-muted-foreground text-center">
          🚨 Admin-only access. Unauthorized use prohibited.
        </div>
      </Card>
    </div>
  )
}
