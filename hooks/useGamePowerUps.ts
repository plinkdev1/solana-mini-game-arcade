"use client"

import { useState, useCallback } from "react"
import { usePowerUpsStore } from "@/lib/stores/power-ups-store"
import { shouldTriggerPowerUp, getRandomPowerUp, type PowerUp } from "@/lib/power-ups/el-shito-service"
import { useToast } from "@/hooks/use-toast"

interface GamePowerUpState {
  powerUp: PowerUp | null
  isOpen: boolean
  usedPowerUps: string[]
  powerUpTriggered: boolean
  isLoading: boolean
}

export function useGamePowerUps(hasBet: boolean) {
  const { powerUpsEnabled } = usePowerUpsStore()
  const { toast } = useToast()
  const [state, setState] = useState<GamePowerUpState>({
    powerUp: null,
    isOpen: false,
    usedPowerUps: [],
    powerUpTriggered: false,
    isLoading: false,
  })

  const checkPowerUpTrigger = useCallback(() => {
    // Power-ups only active if enabled, bet placed, and max 1 per game
    if (!powerUpsEnabled || !hasBet || state.usedPowerUps.length > 0) {
      return null
    }

    // Random 10-20% chance per turn
    if (shouldTriggerPowerUp()) {
      const randomPowerUp = getRandomPowerUp()
      setState((prev) => ({
        ...prev,
        powerUp: randomPowerUp,
        isOpen: true,
        powerUpTriggered: true,
      }))

      toast({
        title: "✨ El Shito Strikes!",
        description: randomPowerUp.name,
        variant: "default",
      })

      return randomPowerUp
    }

    return null
  }, [powerUpsEnabled, hasBet, state.usedPowerUps.length, toast])

  const applyPowerUp = useCallback(
    async (powerUpId: string) => {
      setState((prev) => ({ ...prev, isLoading: true }))

      // Mock delay for visual effect
      await new Promise((resolve) => setTimeout(resolve, 800))

      setState((prev) => ({
        ...prev,
        isOpen: false,
        usedPowerUps: [...prev.usedPowerUps, powerUpId],
        powerUpTriggered: false,
        isLoading: false,
      }))

      toast({
        title: "Power-Up Activated!",
        description: "El Shito's magic flows through you...",
      })
    },
    [toast],
  )

  const closePowerUpModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
      powerUpTriggered: false,
    }))
  }, [])

  const resetPowerUps = useCallback(() => {
    setState({
      powerUp: null,
      isOpen: false,
      usedPowerUps: [],
      powerUpTriggered: false,
      isLoading: false,
    })
  }, [])

  return {
    powerUp: state.powerUp,
    isOpen: state.isOpen,
    usedPowerUps: state.usedPowerUps,
    powerUpTriggered: state.powerUpTriggered,
    isLoading: state.isLoading,
    checkPowerUpTrigger,
    applyPowerUp,
    closePowerUpModal,
    resetPowerUps,
  }
}
