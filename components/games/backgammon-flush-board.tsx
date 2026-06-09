"use client"

import { useState, useEffect } from "react"
import { useBettingStore } from "@/lib/stores/betting-store"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { createGame, endGame } from "@/lib/supabase/game-service"
import { CoinFlipModal } from "@/components/games/coin-flip-modal"
import { useGameP2P } from "@/hooks/useGameP2P"
import { SyncLoadingSpinner } from "@/components/sync-loading-spinner"
import { LivePlayersBoard } from "@/components/live-players-board"
import GameModeSelector from "@/components/game-mode-selector"
import AIDifficultyModal from "@/components/ai-difficulty-modal"

const GAME_TYPE = "backgammon"
const INITIAL_BET = 0.08
const POINTS_COUNT = 24
const PIECES_PER_PLAYER = 15
const TARGET_SCORE = 15 // Bear off all pieces

interface Piece {
  id: string
  pointIndex: number
  playerId: number
}

interface GameState {
  pieces: Piece[]
  diceRoll: number[]
  currentPlayer: number
  gameOver: boolean
  winner: number | null
  bearOff: { [key: number]: number }
  moveHistory: string[]
}

function initializePieces(): Piece[] {
  const pieces: Piece[] = []
  // Standard backgammon setup
  // Player 1: pieces at points 0, 11, 16, 18
  // Player 2: pieces at points 5, 7, 12, 23
  const setup = [
    { point: 0, player: 1, count: 2 },
    { point: 11, player: 1, count: 5 },
    { point: 16, player: 1, count: 3 },
    { point: 18, player: 1, count: 5 },
    { point: 5, player: 2, count: 3 },
    { point: 7, player: 2, count: 5 },
    { point: 12, player: 2, count: 5 },
    { point: 23, player: 2, count: 2 },
  ]

  let id = 0
  setup.forEach((setup) => {
    for (let i = 0; i < setup.count; i++) {
      pieces.push({
        id: `${setup.player}-${id}`,
        pointIndex: setup.point,
        playerId: setup.player,
      })
      id++
    }
  })
  return pieces
}

export default function BackgammonFlushBoard({ gameBet = 0, matchId }: { gameBet?: number; matchId?: string }) {
  const [localGameState, setLocalGameState] = useState<GameState>({
    pieces: initializePieces(),
    diceRoll: [0, 0],
    currentPlayer: 1,
    gameOver: false,
    winner: null,
    bearOff: { 1: 0, 2: 0 },
    moveHistory: [],
  })

  const [gameId, setGameId] = useState<string | null>(null)
  const [isRolling, setIsRolling] = useState(false)
  const [showCoinFlip, setShowCoinFlip] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameMode, setGameMode] = useState<"pvp" | "ai">("pvp")
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "hard">("easy")
  const [showModeSelector, setShowModeSelector] = useState(true)
  const [showDifficultyModal, setShowDifficultyModal] = useState(false)
  const { playerWins, playerLoses, walletAddress, calculateRake } = useBettingStore()
  const { toast } = useToast()
  const { isSyncing, sendMove, gameState } = useGameP2P(matchId || "")

  useEffect(() => {
    const initializeGame = async () => {
      try {
        if (walletAddress) {
          const game = await createGame(GAME_TYPE, walletAddress, "opponent_placeholder", INITIAL_BET, false)
          setGameId(game.id)
        }
      } catch (error) {
        console.error("Failed to initialize game:", error)
        toast({
          title: "Error",
          description: "Failed to initialize game",
          variant: "destructive",
        })
      }
    }
    initializeGame()
  }, [walletAddress, toast])

  useEffect(() => {
    if (gameState) {
      setLocalGameState(gameState)
    }
  }, [gameState])

  const rollDice = () => {
    if (isRolling || localGameState.gameOver) return
    setIsRolling(true)

    let rollCount = 0
    const rollInterval = setInterval(() => {
      const die1 = Math.floor(Math.random() * 6) + 1
      const die2 = Math.floor(Math.random() * 6) + 1
      const newRoll = [die1, die2]

      setLocalGameState((prev) => ({
        ...prev,
        diceRoll: newRoll,
      }))
      rollCount++

      if (rollCount > 8) {
        clearInterval(rollInterval)
        setIsRolling(false)

        sendMove({
          type: "diceRoll",
          roll: newRoll,
          player: localGameState.currentPlayer,
          timestamp: Date.now(),
        })

        if (die1 === die2) {
          toast({
            title: "Flush Double!",
            description: "You rolled doubles! Extra roll granted by Plunger Power-Up!",
          })
        }
      }
    }, 100)
  }

  const handleGameEnd = async () => {
    if (!gameId) return

    try {
      const winner = localGameState.winner === 1 ? walletAddress : "opponent_placeholder"
      await endGame(gameId, winner, [], INITIAL_BET)

      if (localGameState.winner === 1) {
        playerWins()
      } else {
        playerLoses()
      }
    } catch (error) {
      console.error("Failed to update game result:", error)
      toast({
        title: "Error",
        description: "Failed to save game result",
        variant: "destructive",
      })
    }
  }

  const handleCoinFlipResult = (player: 1 | 2) => {
    setShowCoinFlip(false)
    setLocalGameState((prev) => ({ ...prev, currentPlayer: player }))
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
    if (localGameState.bearOff[1] === PIECES_PER_PLAYER || localGameState.bearOff[2] === PIECES_PER_PLAYER) {
      const winner = localGameState.bearOff[1] === PIECES_PER_PLAYER ? 1 : 2
      setLocalGameState((prev) => ({
        ...prev,
        gameOver: true,
        winner: winner,
      }))
      handleGameEnd()

      toast({
        title: `Player ${winner} Wins!`,
        description: `All pieces safely borne off! Rake: ${calculateRake(INITIAL_BET)} $DATX to treasury.`,
      })
    }
  }, [localGameState.bearOff])

  const getPiecesOnPoint = (pointIndex: number) => {
    return localGameState.pieces.filter((p) => p.pointIndex === pointIndex)
  }

  const renderBoard = () => {
    const points = []
    for (let i = 0; i < POINTS_COUNT; i++) {
      const piecesHere = getPiecesOnPoint(i)
      const isPlayer1 = piecesHere.length > 0 && piecesHere[0].playerId === 1
      const isPlayer2 = piecesHere.length > 0 && piecesHere[0].playerId === 2

      points.push(
        <div
          key={i}
          className={`flex flex-col items-center justify-end w-12 h-32 border-2 transition-all ${
            isPlayer1
              ? "border-pink-500 bg-pink-500/10"
              : isPlayer2
                ? "border-green-500 bg-green-500/10"
                : "border-gray-600"
          }`}
        >
          {piecesHere.slice(0, 3).map((piece, idx) => (
            <div
              key={piece.id}
              className={`w-8 h-8 rounded-full mb-1 flex items-center justify-center text-xs font-bold ${
                piece.playerId === 1 ? "bg-pink-500 text-black" : "bg-green-500 text-black"
              }`}
            >
              {piece.playerId === 1 ? "💩" : "🚽"}
            </div>
          ))}
          {piecesHere.length > 3 && <div className="text-xs text-accent font-bold">+{piecesHere.length - 3}</div>}
          <div className="text-xs text-muted-foreground mt-2">{i}</div>
        </div>,
      )
    }
    return points
  }

  if (localGameState.gameOver) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-6">
        <h2 className="text-3xl font-black text-primary">Player {localGameState.winner} Wins!</h2>
        <p className="text-muted-foreground">All pieces safely borne off!</p>
        <p className="text-accent font-bold">Rake: {calculateRake(INITIAL_BET)} $DATX to treasury</p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-primary text-black hover:bg-primary/90 font-bold"
        >
          Play Again
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col">
      {showModeSelector && <GameModeSelector isOpen={showModeSelector} onSelectMode={handleModeSelect} />}

      {showDifficultyModal && (
        <AIDifficultyModal isOpen={showDifficultyModal} onSelectDifficulty={handleDifficultySelect} />
      )}

      {showCoinFlip && (
        <CoinFlipModal
          gameType="backgammon"
          onFlipResult={() => {
            setShowCoinFlip(false)
            setGameStarted(true)
          }}
        />
      )}

      {isSyncing && <SyncLoadingSpinner />}
      {gameStarted && <LivePlayersBoard gameId={GAME_TYPE} matchId={matchId || ""} />}

      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black/40 rounded border border-accent/30">
        <div>
          <p className="text-accent font-bold">Current Player: {localGameState.currentPlayer}</p>
          <p className="text-sm text-muted-foreground">💰 Bet: {INITIAL_BET} $DATX</p>
        </div>
        <div>
          <p className="text-accent font-bold">
            Dice: {localGameState.diceRoll[0]} + {localGameState.diceRoll[1]}
          </p>
          <p className="text-sm text-muted-foreground">
            P1 Borne: {localGameState.bearOff[1]}/{PIECES_PER_PLAYER} | P2 Borne: {localGameState.bearOff[2]}/
            {PIECES_PER_PLAYER}
          </p>
        </div>
      </div>

      {/* Dice Roll */}
      <div className="flex justify-center gap-4">
        <div
          className={`w-16 h-16 flex items-center justify-center bg-primary/20 border-2 border-primary rounded font-black text-2xl ${isRolling ? "animate-bounce" : ""}`}
        >
          {localGameState.diceRoll[0]}
        </div>
        <div
          className={`w-16 h-16 flex items-center justify-center bg-primary/20 border-2 border-primary rounded font-black text-2xl ${isRolling ? "animate-bounce" : ""}`}
        >
          {localGameState.diceRoll[1]}
        </div>
      </div>

      {/* Roll Button */}
      <Button
        onClick={rollDice}
        disabled={isRolling || localGameState.gameOver || !gameStarted}
        className="bg-primary text-black hover:bg-primary/90 font-bold text-lg h-12"
      >
        {isRolling ? "Rolling..." : "Roll Dice"}
      </Button>

      {/* Board */}
      <div className="flex flex-wrap gap-2 justify-center p-4 bg-black/40 rounded border border-accent/30 min-h-48">
        {renderBoard()}
      </div>

      {/* Power-Up Info */}
      <div className="p-4 bg-green-500/10 border border-green-500 rounded text-sm text-green-500">
        <strong>Plunger Double:</strong> Roll doubles to get an extra turn! (Doubles currently unlocked by Plunger
        Power-Up)
      </div>
    </div>
  )
}
