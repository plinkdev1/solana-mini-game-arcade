"use client"

import { useState, useCallback } from "react"
import { shouldTriggerPowerUp, getRandomPowerUp, type PowerUp } from "@/lib/power-ups/el-shito-service"

interface PowerUpState {
  powerUp: PowerUp | null
  isOpen: boolean
  usedPowerUps: string[]
  powerUpTriggered: boolean
}

export function usePowerUps() {
  const [state, setState] = useState<PowerUpState>({
    powerUp: null,
    isOpen: false,
    usedPowerUps: [],
    powerUpTriggered: false,
  })

  const checkPowerUpTrigger = useCallback(() => {
    // Max 1 power-up per game
    if (state.usedPowerUps.length > 0) return null

    // Random 10-20% chance per turn
    if (shouldTriggerPowerUp()) {
      const randomPowerUp = getRandomPowerUp()
      setState((prev) => ({
        ...prev,
        powerUp: randomPowerUp,
        isOpen: true,
        powerUpTriggered: true,
      }))
      return randomPowerUp
    }

    return null
  }, [state.usedPowerUps.length])

  const applyPowerUp = useCallback(async (powerUpId: string) => {
    // Mock delay for visual effect
    await new Promise((resolve) => setTimeout(resolve, 500))

    setState((prev) => ({
      ...prev,
      isOpen: false,
      usedPowerUps: [...prev.usedPowerUps, powerUpId],
      powerUpTriggered: false,
    }))
  }, [])

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
    })
  }, [])

  return {
    powerUp: state.powerUp,
    isOpen: state.isOpen,
    usedPowerUps: state.usedPowerUps,
    powerUpTriggered: state.powerUpTriggered,
    checkPowerUpTrigger,
    applyPowerUp,
    closePowerUpModal,
    resetPowerUps,
  }
}
