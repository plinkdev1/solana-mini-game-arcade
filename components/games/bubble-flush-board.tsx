"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useBettingStore } from "@/lib/stores/betting-store"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { createGame, endGame } from "@/lib/supabase/game-service"
import { ElShitoModal } from "@/components/power-ups/el-shito-modal"
import { CoinFlipModal } from "@/components/games/coin-flip-modal"
import { usePowerUps } from "@/hooks/usePowerUps"
import { useGameP2P } from "@/hooks/useGameP2P"
import { SyncLoadingSpinner } from "@/components/sync-loading-spinner"
import { LivePlayersBoard } from "@/components/live-players-board"
import GameModeSelector from "@/components/game-mode-selector"
import AIDifficultyModal from "@/components/ai-difficulty-modal"

const COLORS = ["#e91e63", "#00ff41", "#00ffff", "#ffd700", "#ff6600"]
const GRID_WIDTH = 6
const GRID_HEIGHT = 8
const BUBBLE_SIZE = 32
const TARGET_SCORE = 500
const POWER_UPS = ["flush_burst", "bubble_shield", "score_double"]
const GAME_TYPE = "bubble_flush"
const INITIAL_BET = 0.05

interface Bubble {
  id: string
  color: string
  x: number
  y: number
  row: number
  col: number
  vx?: number
  vy?: number
}

interface GameState {
  bubbles: Bubble[]
  score: number
  gameOver: boolean
  winner: number | null
  shooterAngle: number
  nextBubbleColor: string
  shootingBubble: Bubble | null
  canShoot: boolean
}

export default function BubbleFlushBoard({ gameBet = 0, matchId }: { gameBet?: number; matchId?: string }) {
  const [player1State, setPlayer1State] = useState<GameState>({
    bubbles: initializeBubbles(),
    score: 0,
    gameOver: false,
    winner: null,
    shooterAngle: 0,
    nextBubbleColor: COLORS[Math.floor(Math.random() * COLORS.length)],
    shootingBubble: null,
    canShoot: true,
  })

  const [player2State, setPlayer2State] = useState<GameState>({
    bubbles: initializeBubbles(),
    score: 0,
    gameOver: false,
    winner: null,
    shooterAngle: 0,
    nextBubbleColor: COLORS[Math.floor(Math.random() * COLORS.length)],
    shootingBubble: null,
    canShoot: true,
  })

  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [globalGameOver, setGlobalGameOver] = useState(false)
  const [activePowerUp, setActivePowerUp] = useState<{ type: string; player: number } | null>(null)
  const [gameId, setGameId] = useState<string | null>(null)
  const canvas1Ref = useRef<HTMLCanvasElement>(null)
  const canvas2Ref = useRef<HTMLCanvasElement>(null)
  const [showCoinFlip, setShowCoinFlip] = useState(true)
  const [gameInitialized, setGameInitialized] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameMode, setGameMode] = useState<"pvp" | "ai">("pvp")
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "hard">("easy")
  const [showModeSelector, setShowModeSelector] = useState(true)
  const [showDifficultyModal, setShowDifficultyModal] = useState(false)

  const { playerWins, playerLoses, walletAddress, updateLeaderboard, calculateRake } = useBettingStore()
  const { toast } = useToast()
  const { powerUp, isOpen, checkPowerUpTrigger, applyPowerUp, closePowerUpModal, resetPowerUps } = usePowerUps()
  const { isSyncing, sendMove, gameState } = useGameP2P(matchId || "")

  const handleCoinFlipResult = (player: 1 | 2) => {
    setShowCoinFlip(false)
    setCurrentPlayer(player)
    setGameInitialized(true)
    setGameStarted(true)
  }

  const handleModeSelect = (mode: "pvp" | "ai") => {
    setGameMode(mode)
    if (mode === "ai") {
      setShowDifficultyModal(true)
    } else {
      setShowModeSelector(false)
      setShowCoinFlip(true)
    }
  }

  const handleDifficultySelect = (difficulty: "easy" | "hard") => {
    setAiDifficulty(difficulty)
    setShowDifficultyModal(false)
    setShowModeSelector(false)
    setShowCoinFlip(true)
  }

  useEffect(() => {
    const initializeGame = async () => {
      try {
        if (walletAddress && gameInitialized) {
          const game = await createGame(
            GAME_TYPE,
            walletAddress,
            "opponent_placeholder", // Will be replaced with real opponent in multiplayer
            INITIAL_BET,
            false,
          )
          setGameId(game.id)
          resetPowerUps()
        }
      } catch (error) {
        console.error("Game initialization error:", error)
        toast({
          title: "Error",
          description: "Failed to initialize game",
          variant: "destructive",
        })
      }
    }
    initializeGame()
  }, [walletAddress, toast, resetPowerUps, gameInitialized])

  useEffect(() => {
    drawCanvas(canvas1Ref.current, player1State)
    drawCanvas(canvas2Ref.current, player2State)
  }, [player1State, player2State])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (globalGameOver) return

      if (currentPlayer === 1) {
        if (e.key === "ArrowLeft") {
          setPlayer1State((s) => ({ ...s, shooterAngle: s.shooterAngle - 2 }))
        } else if (e.key === "ArrowRight") {
          setPlayer1State((s) => ({ ...s, shooterAngle: s.shooterAngle + 2 }))
        } else if (e.key === " ") {
          e.preventDefault()
          handleShoot(true)
        }
      } else {
        if (e.key === "ArrowLeft") {
          setPlayer2State((s) => ({ ...s, shooterAngle: s.shooterAngle - 2 }))
        } else if (e.key === "ArrowRight") {
          setPlayer2State((s) => ({ ...s, shooterAngle: s.shooterAngle + 2 }))
        } else if (e.key === " ") {
          e.preventDefault()
          handleShoot(false)
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [currentPlayer, globalGameOver])

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentPlayer === 1 && !globalGameOver) {
        setPlayer1State((prevState) => updateShootingBubble(prevState, true))
      } else if (currentPlayer === 2 && !globalGameOver) {
        setPlayer2State((prevState) => updateShootingBubble(prevState, false))
      }
    }, 16) // ~60fps

    return () => clearInterval(interval)
  }, [currentPlayer, globalGameOver])

  useEffect(() => {
    if (gameState) {
      setPlayer2State(gameState)
    }
  }, [gameState])

  function initializeBubbles(): Bubble[] {
    const bubbles: Bubble[] = []
    let id = 0
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < GRID_WIDTH; col++) {
        bubbles.push({
          id: `bubble-${id++}`,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          x: col * BUBBLE_SIZE,
          y: row * BUBBLE_SIZE,
          row,
          col,
        })
      }
    }
    return bubbles
  }

  function findMatches(bubbles: Bubble[]): string[] {
    const matched: Set<string> = new Set()

    bubbles.forEach((bubble) => {
      const color = bubble.color
      const matches: string[] = []

      // Horizontal line: check if this bubble is part of 3+ in a row
      let count = 1
      for (let i = 1; i < GRID_WIDTH; i++) {
        const right = bubbles.find((b) => b.row === bubble.row && b.col === bubble.col + i && b.color === color)
        if (right) count++
        else break
      }
      for (let i = 1; i < GRID_WIDTH; i++) {
        const left = bubbles.find((b) => b.row === bubble.row && b.col === bubble.col - i && b.color === color)
        if (left) count++
        else break
      }
      if (count >= 3) {
        // Found horizontal line - mark all connected in this line
        for (let i = -GRID_WIDTH; i < GRID_WIDTH; i++) {
          const b = bubbles.find((x) => x.row === bubble.row && x.col === bubble.col + i && x.color === color)
          if (b && !matched.has(b.id)) matches.push(b.id)
          else if (!b) break
        }
      }

      // Vertical line: check if this bubble is part of 3+ in a column
      count = 1
      for (let i = 1; i < GRID_HEIGHT; i++) {
        const down = bubbles.find((b) => b.row === bubble.row + i && b.col === bubble.col && b.color === color)
        if (down) count++
        else break
      }
      for (let i = 1; i < GRID_HEIGHT; i++) {
        const up = bubbles.find((b) => b.row === bubble.row - i && b.col === bubble.col && b.color === color)
        if (up) count++
        else break
      }
      if (count >= 3) {
        for (let i = -GRID_HEIGHT; i < GRID_HEIGHT; i++) {
          const b = bubbles.find((x) => x.row === bubble.row + i && x.col === bubble.col && x.color === color)
          if (b && !matched.has(b.id)) matches.push(b.id)
          else if (!b) break
        }
      }

      // Diagonal (top-left to bottom-right)
      count = 1
      for (let i = 1; i < Math.max(GRID_WIDTH, GRID_HEIGHT); i++) {
        const diag = bubbles.find((b) => b.row === bubble.row + i && b.col === bubble.col + i && b.color === color)
        if (diag) count++
        else break
      }
      for (let i = 1; i < Math.max(GRID_WIDTH, GRID_HEIGHT); i++) {
        const diag = bubbles.find((b) => b.row === bubble.row - i && b.col === bubble.col - i && b.color === color)
        if (diag) count++
        else break
      }
      if (count >= 3) {
        for (let i = -Math.max(GRID_WIDTH, GRID_HEIGHT); i < Math.max(GRID_WIDTH, GRID_HEIGHT); i++) {
          const b = bubbles.find((x) => x.row === bubble.row + i && x.col === bubble.col + i && x.color === color)
          if (b && !matched.has(b.id)) matches.push(b.id)
          else if (!b) break
        }
      }

      // Diagonal (top-right to bottom-left)
      count = 1
      for (let i = 1; i < Math.max(GRID_WIDTH, GRID_HEIGHT); i++) {
        const diag = bubbles.find((b) => b.row === bubble.row + i && b.col === bubble.col - i && b.color === color)
        if (diag) count++
        else break
      }
      for (let i = 1; i < Math.max(GRID_WIDTH, GRID_HEIGHT); i++) {
        const diag = bubbles.find((b) => b.row === bubble.row - i && b.col === bubble.col + i && b.color === color)
        if (diag) count++
        else break
      }
      if (count >= 3) {
        for (let i = -Math.max(GRID_WIDTH, GRID_HEIGHT); i < Math.max(GRID_WIDTH, GRID_HEIGHT); i++) {
          const b = bubbles.find((x) => x.row === bubble.row + i && x.col === bubble.col - i && x.color === color)
          if (b && !matched.has(b.id)) matches.push(b.id)
          else if (!b) break
        }
      }

      matches.forEach((id) => matched.add(id))
    })

    return Array.from(matched)
  }

  function shootBubble(state: GameState, isPlayer1: boolean): GameState {
    if (!state.canShoot || state.shootingBubble) {
      return state
    }

    const clampedAngle = Math.max(-90, Math.min(90, state.shooterAngle))
    const radians = clampedAngle * (Math.PI / 180)
    const speed = 6
    const vx = Math.sin(radians) * speed // sin for horizontal: -90°=-1, 0°=0, 90°=1
    const vy = -Math.cos(radians) * speed // -cos for vertical: -90°=0, 0°=-1, 90°=0 (always negative for up)

    const shooterX = (GRID_WIDTH * BUBBLE_SIZE) / 2
    const shooterY = GRID_HEIGHT * BUBBLE_SIZE

    const shootingBubble: Bubble = {
      id: `shooting-${Date.now()}`,
      color: state.nextBubbleColor,
      x: shooterX,
      y: shooterY,
      row: GRID_HEIGHT,
      col: GRID_WIDTH / 2,
      vx,
      vy,
    }

    return { ...state, shootingBubble, canShoot: false }
  }

  function updateShootingBubble(state: GameState, isPlayer1: boolean): GameState {
    if (!state.shootingBubble) return state

    const bubble = state.shootingBubble
    const newX = bubble.x + (bubble.vx || 0)
    const newY = bubble.y + (bubble.vy || 0)

    if (newY < 0 || newX < 0 || newX > GRID_WIDTH * BUBBLE_SIZE) {
      setCurrentPlayer(isPlayer1 ? 2 : 1)
      return { ...state, shootingBubble: null, canShoot: true }
    }

    if (newY > GRID_HEIGHT * BUBBLE_SIZE) {
      setCurrentPlayer(isPlayer1 ? 2 : 1)
      return { ...state, shootingBubble: null, canShoot: true }
    }

    const collision = state.bubbles.find((b) => {
      const dist = Math.sqrt((b.x - newX) ** 2 + (b.y - newY) ** 2)
      return dist < BUBBLE_SIZE - 4
    })

    if (collision) {
      const gridCol = Math.round(newX / BUBBLE_SIZE)
      const gridRow = Math.round(newY / BUBBLE_SIZE)

      const clampedRow = Math.max(0, Math.min(GRID_HEIGHT - 1, gridRow))

      const snapX = gridCol * BUBBLE_SIZE
      const snapY = clampedRow * BUBBLE_SIZE

      const newBubble: Bubble = {
        id: `bubble-${Date.now()}`,
        color: state.nextBubbleColor,
        x: snapX,
        y: snapY,
        row: clampedRow,
        col: gridCol,
      }

      const newBubbles = [...state.bubbles, newBubble]
      const matchedIds = findMatches(newBubbles)

      let newScore = state.score
      let filteredBubbles = newBubbles

      if (matchedIds.length >= 3) {
        filteredBubbles = newBubbles.filter((b) => !matchedIds.includes(b.id))
        newScore += matchedIds.length * 10
      }

      const gravityBubbles = applyGravity(filteredBubbles)

      const topReached = gravityBubbles.some((b) => b.row < 0)

      if (topReached) {
        setGlobalGameOver(true)
        const winner = isPlayer1 ? 2 : 1
        handleGameEnd(winner)
        return {
          ...state,
          bubbles: gravityBubbles,
          gameOver: true,
          winner,
          shootingBubble: null,
          canShoot: true,
        }
      }

      const playerWon = newScore >= TARGET_SCORE
      if (playerWon) {
        setGlobalGameOver(true)
        const winner = isPlayer1 ? 1 : 2
        handleGameEnd(winner)
        return {
          ...state,
          bubbles: gravityBubbles,
          score: newScore,
          shootingBubble: null,
          canShoot: true,
          gameOver: true,
          winner,
          nextBubbleColor: COLORS[Math.floor(Math.random() * COLORS.length)],
        }
      }

      setCurrentPlayer(isPlayer1 ? 2 : 1)

      return {
        ...state,
        bubbles: gravityBubbles,
        score: newScore,
        shootingBubble: null,
        canShoot: true,
        gameOver: false,
        winner: null,
        nextBubbleColor: COLORS[Math.floor(Math.random() * COLORS.length)],
      }
    }

    return {
      ...state,
      shootingBubble: { ...bubble, x: newX, y: newY },
    }
  }

  function applyGravity(bubbles: Bubble[]): Bubble[] {
    const gridMap: { [key: string]: Bubble[] } = {}

    bubbles.forEach((bubble) => {
      const key = `col-${bubble.col}`
      if (!gridMap[key]) gridMap[key] = []
      gridMap[key].push(bubble)
    })

    const newBubbles: Bubble[] = []
    Object.keys(gridMap).forEach((key) => {
      const col = Number.parseInt(key.split("-")[1])
      const columnBubbles = gridMap[key].sort((a, b) => a.row - b.row)
      columnBubbles.forEach((bubble, index) => {
        newBubbles.push({
          ...bubble,
          row: index,
          y: index * BUBBLE_SIZE,
        })
      })
    })

    return newBubbles
  }

  function activatePowerUp(player: number, type: string) {
    setActivePowerUp({ type, player })

    const state = player === 1 ? player1State : player2State
    const setState = player === 1 ? setPlayer1State : setPlayer2State

    if (type === "flush_burst") {
      setState({ ...state, bubbles: [], score: state.score + 50, canShoot: true, shootingBubble: null })
    } else if (type === "score_double") {
      setState({ ...state, score: state.score * 2 })
    }

    setTimeout(() => setActivePowerUp(null), 2000)
  }

  const handleGameEnd = async (winnerId: number) => {
    try {
      setGlobalGameOver(true)

      const loserIds = winnerId === 1 ? ["opponent_placeholder"] : [walletAddress]
      const betAmount = gameBet || INITIAL_BET

      if (gameId && walletAddress) {
        await endGame(gameId, winnerId === 1 ? walletAddress : "opponent_placeholder", loserIds, betAmount)
      }

      // Update local state
      if (winnerId === 1) {
        playerWins(betAmount)
      } else {
        playerLoses(betAmount)
      }

      toast({
        title: winnerId === 1 ? "🎉 You Won!" : "💀 You Lost!",
        description: `Game Over - ${winnerId === 1 ? "Player 1" : "Player 2"} wins!`,
      })
    } catch (error) {
      console.error("Game end error:", error)
      toast({
        title: "Error",
        description: "Failed to save game result",
        variant: "destructive",
      })
    }
  }

  function resetGame() {
    setPlayer1State({
      bubbles: initializeBubbles(),
      score: 0,
      gameOver: false,
      winner: null,
      shooterAngle: 0,
      nextBubbleColor: COLORS[Math.floor(Math.random() * COLORS.length)],
      shootingBubble: null,
      canShoot: true,
    })
    setPlayer2State({
      bubbles: initializeBubbles(),
      score: 0,
      gameOver: false,
      winner: null,
      shooterAngle: 0,
      nextBubbleColor: COLORS[Math.floor(Math.random() * COLORS.length)],
      shootingBubble: null,
      canShoot: true,
    })
    setCurrentPlayer(1)
    setGlobalGameOver(false)
    setGameInitialized(false)
    setGameStarted(false)
    resetPowerUps()
  }

  function drawCanvas(canvas: HTMLCanvasElement | null, state: GameState) {
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#0a0a0a"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = "rgba(233, 30, 99, 0.2)"
    ctx.lineWidth = 1
    for (let i = 0; i <= GRID_WIDTH; i++) {
      ctx.beginPath()
      ctx.moveTo(i * BUBBLE_SIZE, 0)
      ctx.lineTo(i * BUBBLE_SIZE, GRID_HEIGHT * BUBBLE_SIZE)
      ctx.stroke()
    }
    for (let i = 0; i <= GRID_HEIGHT; i++) {
      ctx.beginPath()
      ctx.moveTo(0, i * BUBBLE_SIZE)
      ctx.lineTo(GRID_WIDTH * BUBBLE_SIZE, i * BUBBLE_SIZE)
      ctx.stroke()
    }

    state.bubbles.forEach((bubble) => {
      ctx.fillStyle = bubble.color
      ctx.beginPath()
      ctx.arc(bubble.x + BUBBLE_SIZE / 2, bubble.y + BUBBLE_SIZE / 2, BUBBLE_SIZE / 2 - 2, 0, Math.PI * 2)
      ctx.fill()

      ctx.shadowColor = bubble.color
      ctx.shadowBlur = 10
      ctx.strokeStyle = bubble.color
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.6
      ctx.stroke()
      ctx.globalAlpha = 1
      ctx.shadowColor = "transparent"
    })

    if (state.shootingBubble) {
      ctx.fillStyle = state.shootingBubble.color
      ctx.beginPath()
      ctx.arc(state.shootingBubble.x, state.shootingBubble.y, BUBBLE_SIZE / 2 - 2, 0, Math.PI * 2)
      ctx.fill()

      ctx.shadowColor = state.shootingBubble.color
      ctx.shadowBlur = 15
      ctx.strokeStyle = state.shootingBubble.color
      ctx.lineWidth = 3
      ctx.globalAlpha = 0.8
      ctx.stroke()
      ctx.globalAlpha = 1
      ctx.shadowColor = "transparent"

      const trailLength = 10
      ctx.strokeStyle = `rgba(0, 255, 65, 0.3)`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(state.shootingBubble.x, state.shootingBubble.y)
      ctx.lineTo(
        state.shootingBubble.x - (state.shootingBubble.vx || 0) * trailLength,
        state.shootingBubble.y - (state.shootingBubble.vy || 0) * trailLength,
      )
      ctx.stroke()
    }

    const shooterX = (GRID_WIDTH * BUBBLE_SIZE) / 2
    const shooterY = GRID_HEIGHT * BUBBLE_SIZE - 8
    ctx.fillStyle = "#00ff41"
    ctx.beginPath()
    ctx.arc(shooterX, shooterY, 8, 0, Math.PI * 2)
    ctx.fill()

    const angle = state.shooterAngle * (Math.PI / 180)
    const lineLength = 80
    ctx.strokeStyle = "rgba(0, 255, 65, 0.6)"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(shooterX, shooterY)
    ctx.lineTo(shooterX + Math.cos(angle) * lineLength, shooterY + Math.sin(angle) * lineLength)
    ctx.stroke()

    ctx.fillStyle = state.nextBubbleColor
    ctx.beginPath()
    ctx.arc(shooterX, shooterY - 25, BUBBLE_SIZE / 2 - 2, 0, Math.PI * 2)
    ctx.fill()
  }

  const handleShoot = useCallback(
    async (isPlayer1: boolean) => {
      if (!isPlayer1 ? player2State.canShoot : player1State.canShoot || globalGameOver) return

      checkPowerUpTrigger()

      const setState = isPlayer1 ? setPlayer1State : setPlayer2State
      const state = isPlayer1 ? player1State : player2State

      setState((prevState) => shootBubble(prevState, isPlayer1))

      // Send move to opponent
      sendMove({
        type: "shoot",
        player: isPlayer1 ? 1 : 2,
        angle: state.shooterAngle,
        timestamp: Date.now(),
      })
    },
    [globalGameOver, checkPowerUpTrigger, sendMove],
  )

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col">
      {/* Game Mode Selector Modal */}
      {showModeSelector && <GameModeSelector isOpen={showModeSelector} onSelectMode={handleModeSelect} />}

      {/* Difficulty Modal for AI Mode */}
      {showDifficultyModal && (
        <AIDifficultyModal isOpen={showDifficultyModal} onSelectDifficulty={handleDifficultySelect} />
      )}

      {showCoinFlip && <CoinFlipModal gameType="bubble_flush" onFlipResult={handleCoinFlipResult} />}

      {isSyncing && <SyncLoadingSpinner />}
      {gameStarted && <LivePlayersBoard gameId={GAME_TYPE} matchId={matchId || ""} />}

      {!globalGameOver && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Player 1 Board */}
          <div className="flex flex-col items-center gap-4 p-6 bg-black/40 rounded-lg border border-primary/30">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-primary neon-pink mb-2">💩 Player 1</h2>
              <div className="text-lg font-bold text-accent">
                Score: {player1State.score} / {TARGET_SCORE}
              </div>
              <div className="w-48 h-4 bg-black/50 rounded border border-primary/20 mt-2">
                <div
                  className="h-full bg-primary/60 transition-all rounded"
                  style={{ width: `${Math.min((player1State.score / TARGET_SCORE) * 100, 100)}%` }}
                />
              </div>
            </div>

            <canvas
              ref={canvas1Ref}
              width={GRID_WIDTH * BUBBLE_SIZE}
              height={GRID_HEIGHT * BUBBLE_SIZE}
              className="bg-black/60 rounded border border-primary/20 cursor-pointer"
              onClick={() => handleShoot(true)}
            />

            <div className="flex gap-2">
              <Button
                onClick={() =>
                  setPlayer1State({ ...player1State, shooterAngle: Math.max(player1State.shooterAngle - 2, -90) })
                }
                disabled={currentPlayer !== 1 || globalGameOver}
                className="bg-accent text-black hover:bg-accent/90 text-xs"
              >
                ◄ Angle
              </Button>
              <Button
                onClick={() => handleShoot(true)}
                disabled={currentPlayer !== 1 || globalGameOver || !player1State.canShoot}
                className="bg-primary text-black hover:bg-primary/90 font-bold flex-1"
              >
                🎯 Shoot
              </Button>
              <Button
                onClick={() =>
                  setPlayer1State({ ...player1State, shooterAngle: Math.min(player1State.shooterAngle + 2, 90) })
                }
                disabled={currentPlayer !== 1 || globalGameOver}
                className="bg-accent text-black hover:bg-accent/90 text-xs"
              >
                Angle ►
              </Button>
            </div>

            <Button
              onClick={() => activatePowerUp(1, POWER_UPS[Math.floor(Math.random() * POWER_UPS.length)])}
              disabled={currentPlayer !== 1 || globalGameOver}
              className="bg-accent text-black hover:bg-accent/90 font-bold w-full text-sm"
            >
              ⚡ El Shito Power-Up
            </Button>
          </div>

          {/* Player 2 Board */}
          <div className="flex flex-col items-center gap-4 p-6 bg-black/40 rounded-lg border border-primary/30">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-accent mb-2">🚽 Player 2</h2>
              <div className="text-lg font-bold text-accent">
                Score: {player2State.score} / {TARGET_SCORE}
              </div>
              <div className="w-48 h-4 bg-black/50 rounded border border-primary/20 mt-2">
                <div
                  className="h-full bg-accent/60 transition-all rounded"
                  style={{ width: `${Math.min((player2State.score / TARGET_SCORE) * 100, 100)}%` }}
                />
              </div>
            </div>

            <canvas
              ref={canvas2Ref}
              width={GRID_WIDTH * BUBBLE_SIZE}
              height={GRID_HEIGHT * BUBBLE_SIZE}
              className="bg-black/60 rounded border border-primary/20 cursor-pointer"
              onClick={() => handleShoot(false)}
            />

            <div className="flex gap-2">
              <Button
                onClick={() =>
                  setPlayer2State({ ...player2State, shooterAngle: Math.max(player2State.shooterAngle - 2, -90) })
                }
                disabled={currentPlayer !== 2 || globalGameOver}
                className="bg-accent text-black hover:bg-accent/90 text-xs"
              >
                ◄ Angle
              </Button>
              <Button
                onClick={() => handleShoot(false)}
                disabled={currentPlayer !== 2 || globalGameOver || !player2State.canShoot}
                className="bg-primary text-black hover:bg-primary/90 font-bold flex-1"
              >
                🎯 Shoot
              </Button>
              <Button
                onClick={() =>
                  setPlayer2State({ ...player2State, shooterAngle: Math.min(player2State.shooterAngle + 2, 90) })
                }
                disabled={currentPlayer !== 2 || globalGameOver}
                className="bg-accent text-black hover:bg-accent/90 text-xs"
              >
                Angle ►
              </Button>
            </div>

            <Button
              onClick={() => activatePowerUp(2, POWER_UPS[Math.floor(Math.random() * POWER_UPS.length)])}
              disabled={currentPlayer !== 2 || globalGameOver}
              className="bg-accent text-black hover:bg-accent/90 font-bold w-full text-sm"
            >
              ⚡ El Shito Power-Up
            </Button>
          </div>
        </div>
      )}

      {globalGameOver && (
        <div className="text-center">
          <div className="text-2xl font-black text-primary neon-pink mb-4">
            {player1State.score >= TARGET_SCORE ? "💩 Player 1 Flushed!" : "🚽 Player 2 Flushed!"}
          </div>
          <Button onClick={resetGame} className="bg-primary text-black hover:bg-primary/90 font-bold">
            Play Again
          </Button>
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground">
        {!globalGameOver && (
          <>
            <p>
              {currentPlayer === 1 ? "💩" : "🚽"} Player {currentPlayer}'s Turn - Angle:{" "}
              {currentPlayer === 1 ? player1State.shooterAngle : player2State.shooterAngle}°
            </p>
            <p>Use ← → Arrow Keys to aim. Race to {TARGET_SCORE} points. Match 3+ colors in any line!</p>
          </>
        )}
      </div>

      {/* El Shito Power-Up Modal */}
      <ElShitoModal
        isOpen={isOpen}
        powerUp={powerUp}
        onClose={closePowerUpModal}
        onApply={async () => {
          if (powerUp) {
            await applyPowerUp(powerUp.id)
            toast({
              title: "💩 El Shito Activated!",
              description: `${powerUp.name} has been applied!`,
            })
          }
        }}
      />
    </div>
  )
}
