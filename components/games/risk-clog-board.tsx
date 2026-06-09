"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { updateGameResult } from "@/lib/supabase/game-service"
import { CoinFlipModal } from "@/components/games/coin-flip-modal"
import { useGameP2P } from "@/hooks/useGameP2P"
import { SyncLoadingSpinner } from "@/components/sync-loading-spinner"
import { useGameStateStore } from "@/lib/stores/game-state-store"
import { useBettingStore } from "@/lib/stores/betting-store"
import { LivePlayersBoard } from "@/components/live-players-board"
import GameModeSelector from "@/components/game-mode-selector"
import AIDifficultyModal from "@/components/ai-difficulty-modal"

const GAME_TYPE = "risk"
const INITIAL_BET = 0.1

// Simplified world map: 6 territories for 2P gameplay
const TERRITORIES = [
  { id: 1, name: "Sewer North", owner: 1, armies: 5, x: 20, y: 20 },
  { id: 2, name: "Sewer East", owner: 2, armies: 5, x: 80, y: 20 },
  { id: 3, name: "Sewer Central", owner: null, armies: 0, x: 50, y: 50 },
  { id: 4, name: "Sewer West", owner: null, armies: 0, x: 20, y: 80 },
  { id: 5, name: "Sewer South", owner: null, armies: 0, x: 80, y: 80 },
  { id: 6, name: "Sewer Depths", owner: null, armies: 0, x: 50, y: 65 },
]

const ADJACENCIES: Record<number, number[]> = {
  1: [3, 6],
  2: [3, 6],
  3: [1, 2, 4, 5, 6],
  4: [3, 6],
  5: [3, 6],
  6: [1, 2, 3, 4, 5],
}

interface Territory {
  id: number
  name: string
  owner: 1 | 2 | null
  armies: number
  x: number
  y: number
}

interface GameState {
  territories: Territory[]
  player1Armies: number
  player2Armies: number
  player1Score: number
  player2Score: number
  currentPlayer: 1 | 2
  gamePhase: "placement" | "attack" | "fortify"
  selectedTerritory: number | null
  gameOver: boolean
  winner: 1 | 2 | null
  moveHistory: string[]
}

function initializeGame(): GameState {
  return {
    territories: TERRITORIES.map((t) => ({ ...t })),
    player1Armies: 20,
    player2Armies: 20,
    player1Score: 0,
    player2Score: 0,
    currentPlayer: 1,
    gamePhase: "placement",
    selectedTerritory: null,
    gameOver: false,
    winner: null,
    moveHistory: [],
  }
}

export default function RiskClogBoard({ gameBet = INITIAL_BET, matchId }: { gameBet?: number; matchId?: string }) {
  const [gameState, setGameState] = useState<GameState>(initializeGame())
  const [globalGameOver, setGlobalGameOver] = useState(false)
  const { toast } = useToast()
  const [showCoinFlip, setShowCoinFlip] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameMode, setGameMode] = useState<"p2p" | "ai" | null>(null)
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "hard" | null>(null)
  const [showDifficultyModal, setShowDifficultyModal] = useState(false)
  const { currentGameId } = useGameStateStore()
  const { walletAddress } = useBettingStore()
  const { syncing, opponentMove, sendMove } = useGameP2P(matchId || currentGameId || "", walletAddress || "")

  useEffect(() => {
    if (opponentMove) {
      if (opponentMove.type === "place") {
        setGameState((prev) => ({
          ...prev,
          moveHistory: [...prev.moveHistory, `Opponent placed army in ${opponentMove.data.territoryName}`],
        }))
      } else if (opponentMove.type === "attack") {
        setGameState((prev) => ({
          ...prev,
          moveHistory: [...prev.moveHistory, `Opponent attacked ${opponentMove.data.toTerritory}`],
        }))
      }
    }
  }, [opponentMove])

  const handleCoinFlipResult = (player: 1 | 2) => {
    setShowCoinFlip(false)
    setGameState((prev) => ({ ...prev, currentPlayer: player }))
    setGameStarted(true)
  }

  const isPlayer1 = true

  const handlePlaceArmies = (territoryId: number) => {
    if (gameState.gameOver) return
    if (gameState.gamePhase !== "placement") return

    const currentArmies = gameState.currentPlayer === 1 ? gameState.player1Armies : gameState.player2Armies

    if (currentArmies <= 0) {
      setGameState((prev) => ({
        ...prev,
        gamePhase: "attack",
      }))
      return
    }

    setGameState((prev) => {
      const newTerritories = prev.territories.map((t) => {
        if (t.id === territoryId) {
          return {
            ...t,
            owner: prev.currentPlayer,
            armies: t.armies + 1,
          }
        }
        return t
      })

      const newState = {
        ...prev,
        territories: newTerritories,
        player1Armies: prev.currentPlayer === 1 ? prev.player1Armies - 1 : prev.player1Armies,
        player2Armies: prev.currentPlayer === 2 ? prev.player2Armies - 1 : prev.player2Armies,
        moveHistory: [
          ...prev.moveHistory,
          `Player ${prev.currentPlayer} placed army in ${prev.territories.find((t) => t.id === territoryId)?.name}`,
        ],
      }

      sendMove({
        type: "place",
        data: { territoryId, territoryName: TERRITORIES.find((t) => t.id === territoryId)?.name },
      })

      return newState
    })
  }

  const handleAttack = (fromId: number, toId: number) => {
    if (gameState.gameOver) return
    if (gameState.gamePhase !== "attack") return

    const fromTerritory = gameState.territories.find((t) => t.id === fromId)
    const toTerritory = gameState.territories.find((t) => t.id === toId)

    if (!fromTerritory || !toTerritory) return
    if (fromTerritory.owner !== gameState.currentPlayer) return
    if (toTerritory.owner === gameState.currentPlayer) return
    if (!ADJACENCIES[fromId].includes(toId)) return

    const attackDice = Math.floor(Math.random() * 6) + 1
    const defenseDice = Math.floor(Math.random() * 6) + 1

    if (attackDice > defenseDice) {
      setGameState((prev) => {
        const newTerritories = prev.territories.map((t) => {
          if (t.id === fromId) {
            return { ...t, armies: t.armies - 1 }
          }
          if (t.id === toId) {
            return {
              ...t,
              owner: prev.currentPlayer,
              armies: 1,
            }
          }
          return t
        })

        const player1Controlled = newTerritories.filter((t) => t.owner === 1).length
        const player2Controlled = newTerritories.filter((t) => t.owner === 2).length

        sendMove({
          type: "attack",
          data: { fromId, toId, toTerritory: gameState.territories.find((t) => t.id === toId)?.name },
        })

        return {
          ...prev,
          territories: newTerritories,
          player1Score: prev.currentPlayer === 1 ? prev.player1Score + 10 : prev.player1Score,
          player2Score: prev.currentPlayer === 2 ? prev.player2Score + 10 : prev.player2Score,
          moveHistory: [...prev.moveHistory, `Player ${prev.currentPlayer} conquered ${toTerritory.name}!`],
        }
      })
    } else {
      setGameState((prev) => ({
        ...prev,
        territories: prev.territories.map((t) => {
          if (t.id === fromId) {
            return { ...t, armies: Math.max(0, t.armies - 1) }
          }
          return t
        }),
        moveHistory: [...prev.moveHistory, `Player ${prev.currentPlayer} lost attack on ${toTerritory.name}`],
      }))
    }
  }

  const handleEndTurn = () => {
    const player1Controlled = gameState.territories.filter((t) => t.owner === 1).length
    const player2Controlled = gameState.territories.filter((t) => t.owner === 2).length

    if (player1Controlled === TERRITORIES.length) {
      setGlobalGameOver(true)
      setGameState((prev) => ({
        ...prev,
        gameOver: true,
        winner: 1,
      }))
      handleGameEnd(1)
      return
    }

    if (player2Controlled === TERRITORIES.length) {
      setGlobalGameOver(true)
      setGameState((prev) => ({
        ...prev,
        gameOver: true,
        winner: 2,
      }))
      handleGameEnd(2)
      return
    }

    setGameState((prev) => ({
      ...prev,
      currentPlayer: prev.currentPlayer === 1 ? 2 : 1,
      gamePhase: "placement",
      selectedTerritory: null,
    }))
  }

  const handleGameEnd = async (winnerId: 1 | 2) => {
    try {
      await updateGameResult(
        GAME_TYPE,
        winnerId,
        {
          territories: gameState.territories,
          player1Score: gameState.player1Score,
          player2Score: gameState.player2Score,
        },
        gameBet * 0.1,
        gameBet * 0.03,
      )
    } catch (error) {
      console.error("Error updating game result:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black p-4 md:p-8">
      {!gameStarted && !gameMode && (
        <GameModeSelector
          onSelectMode={(mode) => {
            if (mode === "ai") {
              setShowDifficultyModal(true)
            } else {
              setGameMode(mode)
            }
          }}
        />
      )}

      {showDifficultyModal && (
        <AIDifficultyModal
          open={showDifficultyModal}
          onOpenChange={setShowDifficultyModal}
          onSelectDifficulty={(difficulty) => {
            setAiDifficulty(difficulty)
            setGameMode("ai")
            setShowDifficultyModal(false)
          }}
        />
      )}

      {showCoinFlip && gameMode && <CoinFlipModal onFlipComplete={() => setShowCoinFlip(false)} playerCount={2} />}

      {gameStarted && (
        <>
          {syncing && <SyncLoadingSpinner />}
          <LivePlayersBoard gameId={GAME_TYPE} matchId={matchId || currentGameId || ""} />

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-lg border-2 ${gameState.currentPlayer === 1 ? "border-pink-500 bg-pink-500/10" : "border-accent/30"}`}
              >
                <h3 className="text-lg font-bold text-pink-500 mb-2">💩 Player 1 (Poop Troops)</h3>
                <p className="text-sm text-muted-foreground">Score: {gameState.player1Score} / 1000</p>
                <p className="text-sm text-accent">Armies: {gameState.player1Armies}</p>
                <p className="text-sm text-accent">
                  Territories: {gameState.territories.filter((t) => t.owner === 1).length}/6
                </p>
              </div>

              <div
                className={`p-4 rounded-lg border-2 ${gameState.currentPlayer === 2 ? "border-green-500 bg-green-500/10" : "border-accent/30"}`}
              >
                <h3 className="text-lg font-bold text-green-500 mb-2">🪠 Player 2 (Plunger Forces)</h3>
                <p className="text-sm text-muted-foreground">Score: {gameState.player2Score} / 1000</p>
                <p className="text-sm text-accent">Armies: {gameState.player2Armies}</p>
                <p className="text-sm text-accent">
                  Territories: {gameState.territories.filter((t) => t.owner === 2).length}/6
                </p>
              </div>
            </div>

            <div className="p-6 rounded-lg border-2 border-primary/50 bg-black/40">
              <h4 className="text-sm font-bold text-accent mb-3">Phase: {gameState.gamePhase.toUpperCase()}</h4>

              <svg
                viewBox="0 0 100 100"
                className="w-full border border-accent/30 rounded bg-black/60 mb-4"
                style={{ aspectRatio: "1" }}
              >
                {gameState.territories.map((territory) => (
                  <g key={territory.id}>
                    <circle
                      cx={territory.x}
                      cy={territory.y}
                      r="8"
                      fill={territory.owner === 1 ? "#ec4899" : territory.owner === 2 ? "#22c55e" : "#6b7280"}
                      stroke={gameState.selectedTerritory === territory.id ? "#fbbf24" : "#4b5563"}
                      strokeWidth="0.5"
                      opacity="0.8"
                      onClick={() => setGameState((prev) => ({ ...prev, selectedTerritory: territory.id }))}
                      className="cursor-pointer hover:opacity-100 transition-opacity"
                    />
                    <text
                      x={territory.x}
                      y={territory.y}
                      textAnchor="middle"
                      dy="0.3em"
                      className="text-xs fill-white pointer-events-none"
                      fontSize="2"
                    >
                      {territory.armies}
                    </text>
                  </g>
                ))}
              </svg>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {gameState.territories.map((territory) => (
                  <button
                    key={territory.id}
                    onClick={() => {
                      if (
                        gameState.gamePhase === "placement" &&
                        (territory.owner === null || territory.owner === gameState.currentPlayer)
                      ) {
                        handlePlaceArmies(territory.id)
                      }
                    }}
                    className={`p-2 text-xs rounded border transition ${
                      gameState.selectedTerritory === territory.id
                        ? "border-yellow-500 bg-yellow-500/20"
                        : "border-accent/50 hover:border-accent"
                    } ${territory.owner === 1 ? "bg-pink-500/10" : territory.owner === 2 ? "bg-green-500/10" : "bg-gray-500/10"}`}
                  >
                    <div className="font-bold">{territory.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {territory.owner ? `P${territory.owner}` : "Neutral"} - {territory.armies} armies
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                {gameState.gamePhase === "placement" && (
                  <Button
                    onClick={() =>
                      gameState.currentPlayer === 1
                        ? gameState.player1Armies <= 0
                          ? handleEndTurn()
                          : toast({ description: "Place all your armies first!" })
                        : gameState.player2Armies <= 0
                          ? handleEndTurn()
                          : toast({ description: "Place all your armies first!" })
                    }
                    className="flex-1 bg-accent text-black hover:bg-accent/90 font-bold"
                  >
                    Armies Placed ({gameState.currentPlayer === 1 ? gameState.player1Armies : gameState.player2Armies}{" "}
                    left)
                  </Button>
                )}

                {gameState.gamePhase === "attack" && (
                  <Button onClick={handleEndTurn} className="flex-1 bg-accent text-black hover:bg-accent/90 font-bold">
                    End Attack Phase
                  </Button>
                )}
              </div>
            </div>

            <div className="p-4 rounded-lg border border-accent/30 bg-black/40 max-h-32 overflow-y-auto">
              <h4 className="text-xs font-bold text-accent mb-2">Move History:</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                {gameState.moveHistory.slice(-5).map((move, idx) => (
                  <div key={idx}>{move}</div>
                ))}
              </div>
            </div>

            {gameState.gameOver && (
              <div className="p-4 rounded-lg border-2 border-green-500 bg-green-500/10 text-center">
                <p className="text-lg font-bold text-green-500 mb-2">🎉 Player {gameState.winner} Wins!</p>
                <p className="text-sm text-muted-foreground mb-3">First to control all territories wins the sewer!</p>
                <Button
                  onClick={() => setGameState(initializeGame())}
                  className="bg-green-500 text-black hover:bg-green-600 font-bold"
                >
                  Play Again
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
