"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { updateGameResult } from "@/lib/supabase/game-service"
import { CoinFlipModal } from "@/components/games/coin-flip-modal"
import { useGameP2P } from "@/hooks/useGameP2P"
import { SyncLoadingSpinner } from "@/components/sync-loading-spinner"
import { LivePlayersBoard } from "@/components/live-players-board"
import GameModeSelector from "@/components/game-mode-selector"
import AIDifficultyModal from "@/components/ai-difficulty-modal"

const GAME_TYPE = "ticket-to-ride"
const INITIAL_BET = 0.08

// Simplified city graph with 10 cities for 2P gameplay
const CITIES = ["Downtown", "Harbor", "Factory", "Garden", "Tunnel", "Bridge", "Plaza", "Station", "Docks", "Peak"]
const ROUTES = [
  { from: "Downtown", to: "Harbor", distance: 2, trains: 0, claimedBy: null },
  { from: "Downtown", to: "Factory", distance: 3, trains: 0, claimedBy: null },
  { from: "Harbor", to: "Docks", distance: 2, trains: 0, claimedBy: null },
  { from: "Harbor", to: "Plaza", distance: 3, trains: 0, claimedBy: null },
  { from: "Factory", to: "Tunnel", distance: 4, trains: 0, claimedBy: null },
  { from: "Factory", to: "Garden", distance: 2, trains: 0, claimedBy: null },
  { from: "Garden", to: "Station", distance: 3, trains: 0, claimedBy: null },
  { from: "Tunnel", to: "Bridge", distance: 3, trains: 0, claimedBy: null },
  { from: "Bridge", to: "Peak", distance: 2, trains: 0, claimedBy: null },
  { from: "Plaza", to: "Docks", distance: 2, trains: 0, claimedBy: null },
  { from: "Station", to: "Peak", distance: 3, trains: 0, claimedBy: null },
  { from: "Docks", to: "Peak", distance: 4, trains: 0, claimedBy: null },
]

interface Card {
  color: string
  id: string
}

interface Route {
  from: string
  to: string
  distance: number
  trains: number
  claimedBy: 1 | 2 | null
}

interface GameState {
  routes: Route[]
  player1Hand: Card[]
  player2Hand: Card[]
  player1Trains: number
  player2Trains: number
  player1Score: number
  player2Score: number
  currentPlayer: 1 | 2
  gameOver: boolean
  winner: 1 | 2 | null
  moveHistory: string[]
  drawDeck: Card[]
  discardPile: Card[]
}

const COLORS = ["red", "blue", "yellow", "green", "purple", "orange", "pink", "white"]

function generateCard(): Card {
  return {
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    id: `${Date.now()}-${Math.random()}`,
  }
}

function generateDeck(count: number): Card[] {
  return Array(count)
    .fill(null)
    .map(() => generateCard())
}

function initializeGame(): GameState {
  return {
    routes: ROUTES.map((r) => ({ ...r })),
    player1Hand: generateDeck(4),
    player2Hand: generateDeck(4),
    player1Trains: 45,
    player2Trains: 45,
    player1Score: 0,
    player2Score: 0,
    currentPlayer: 1,
    gameOver: false,
    winner: null,
    moveHistory: [],
    drawDeck: generateDeck(80),
    discardPile: [],
  }
}

export default function TicketFlushBoard({ gameBet = INITIAL_BET, matchId }: { gameBet?: number; matchId?: string }) {
  const [gameState, setGameState] = useState<GameState>(initializeGame())
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null)
  const [globalGameOver, setGlobalGameOver] = useState(false)
  const [showCoinFlip, setShowCoinFlip] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameMode, setGameMode] = useState<"pvp" | "ai">("pvp")
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "hard">("easy")
  const [showAiDifficultyModal, setShowAiDifficultyModal] = useState(false)
  const { toast } = useToast()
  const { isSyncing, sendMove, gameState: receivedState } = useGameP2P(matchId || "")

  useEffect(() => {
    if (receivedState?.routes) {
      setGameState(receivedState as GameState)
    }
  }, [receivedState])

  const isPlayer1 = true

  const handleCoinFlipResult = (player: 1 | 2) => {
    setShowCoinFlip(false)
    setGameState((prev) => ({ ...prev, currentPlayer: player }))
    setGameStarted(true)
  }

  const handleGameModeSelect = (mode: "pvp" | "ai") => {
    setGameMode(mode)
    if (mode === "ai") {
      setShowAiDifficultyModal(true)
    }
  }

  const handleClaimRoute = (routeIndex: number) => {
    if (gameState.gameOver) return
    if (gameState.routes[routeIndex].claimedBy !== null) {
      toast({
        title: "Route Already Claimed",
        description: "This route has been claimed by another player.",
        variant: "destructive",
      })
      return
    }

    const route = gameState.routes[routeIndex]
    const hand = gameState.currentPlayer === 1 ? gameState.player1Hand : gameState.player2Hand
    const hasRequiredCards =
      hand.filter((c) => c.color === "locomotive" || c.color === route.distance.toString()).length >= route.distance

    if (!hasRequiredCards) {
      toast({
        title: "Insufficient Cards",
        description: `Need ${route.distance} cards of the same color to claim this route.`,
        variant: "destructive",
      })
      return
    }

    const newRoutes = [...gameState.routes]
    newRoutes[routeIndex] = {
      ...route,
      claimedBy: gameState.currentPlayer,
      trains: route.distance,
    }

    const pointsGained = route.distance * 2 + 10
    const newState = { ...gameState, routes: newRoutes }

    if (gameState.currentPlayer === 1) {
      newState.player1Trains -= route.distance
      newState.player1Score += pointsGained
      newState.player1Hand = hand.filter((_, i) => i >= route.distance)
    } else {
      newState.player2Trains -= route.distance
      newState.player2Score += pointsGained
      newState.player2Hand = hand.filter((_, i) => i >= route.distance)
    }

    const player1Routes = newRoutes.filter((r) => r.claimedBy === 1).length
    const player2Routes = newRoutes.filter((r) => r.claimedBy === 2).length

    if (player1Routes >= 5 || player2Routes >= 5) {
      const winner = player1Routes >= 5 ? 1 : 2
      newState.gameOver = true
      newState.winner = winner
      setGlobalGameOver(true)
      toast({
        title: "Game Over!",
        description: `Player ${winner} claimed 5 routes and won!`,
      })
    }

    newState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1
    newState.moveHistory = [
      ...gameState.moveHistory,
      `Player ${gameState.currentPlayer} claimed ${route.from}-${route.to}`,
    ]
    setGameState(newState)

    sendMove({ type: "route_claimed", routeIndex, claimedBy: gameState.currentPlayer })
  }

  const handleDrawCards = () => {
    if (gameState.gameOver) return

    const newState = { ...gameState }
    const newDrawDeck = [...gameState.drawDeck]

    if (newDrawDeck.length < 2) {
      newDrawDeck.push(...generateDeck(50))
    }

    const drawnCards = [newDrawDeck.pop(), newDrawDeck.pop()].filter(Boolean) as Card[]

    if (gameState.currentPlayer === 1) {
      newState.player1Hand = [...gameState.player1Hand, ...drawnCards]
    } else {
      newState.player2Hand = [...gameState.player2Hand, ...drawnCards]
    }

    newState.drawDeck = newDrawDeck
    newState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1
    newState.moveHistory = [...gameState.moveHistory, `Player ${gameState.currentPlayer} drew 2 cards`]
    setGameState(newState)

    sendMove({ type: "cards_drawn", cards: drawnCards })
  }

  const handlePlungerRoute = () => {
    if (gameState.gameOver) return

    const newState = { ...gameState }
    const newDrawDeck = [...gameState.drawDeck]

    if (newDrawDeck.length < 1) {
      newDrawDeck.push(...generateDeck(50))
    }

    const extraCard = newDrawDeck.pop() as Card

    if (gameState.currentPlayer === 1) {
      newState.player1Hand = [...gameState.player1Hand, extraCard]
    } else {
      newState.player2Hand = [...gameState.player2Hand, extraCard]
    }

    newState.drawDeck = newDrawDeck
    newState.moveHistory = [...gameState.moveHistory, `Player ${gameState.currentPlayer} used Plunger Route`]
    setGameState(newState)

    toast({
      title: "Plunger Route Activated",
      description: "Drew an extra card!",
    })

    sendMove({ type: "plunger_route_used", card: extraCard })
  }

  const handleEndGame = async () => {
    const winner = gameState.player1Score > gameState.player2Score ? 1 : 2
    const loser = winner === 1 ? 2 : 1

    try {
      await updateGameResult(
        {}, // gameId would come from Supabase
        winner,
        { routes: gameState.routes, moves: gameState.moveHistory },
        Math.floor(gameBet * 0.1 * 1000) / 1000,
      )
    } catch (error) {
      console.error("Error updating game result:", error)
    }

    toast({
      title: "Game Ended",
      description: `Player ${winner} wins with ${gameState.winner === 1 ? gameState.player1Score : gameState.player2Score} points!`,
    })
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {showCoinFlip && (
        <div className="mb-4">
          <GameModeSelector onSelectMode={handleGameModeSelect} selectedMode={gameMode} />
        </div>
      )}

      <AIDifficultyModal
        open={showAiDifficultyModal}
        onOpenChange={setShowAiDifficultyModal}
        onSelectDifficulty={(difficulty) => {
          setAiDifficulty(difficulty)
          setShowAiDifficultyModal(false)
        }}
      />

      {showCoinFlip && <CoinFlipModal onResult={handleCoinFlipResult} playerCount={3} />}
      {isSyncing && <SyncLoadingSpinner />}
      {gameStarted && <LivePlayersBoard gameId={GAME_TYPE} matchId={matchId || ""} />}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Map/Routes */}
        <div className="lg:col-span-2">
          <div className="bg-black/60 border-2 border-accent/50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">🗺️ Sewer Transit Network</h2>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {gameState.routes.map((route, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (gameState.currentPlayer === 1) handleClaimRoute(idx)
                  }}
                  className={`p-4 rounded border-2 cursor-pointer transition ${
                    route.claimedBy === 1
                      ? "border-primary bg-primary/20"
                      : route.claimedBy === 2
                        ? "border-accent bg-accent/20"
                        : "border-accent/50 hover:border-accent hover:bg-accent/10"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-primary">
                      {route.from} ↔ {route.to}
                    </span>
                    <span className="text-sm text-accent">
                      {route.trains} trains
                      {route.claimedBy && ` (Player ${route.claimedBy})`}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Distance: {route.distance} | Points: {route.distance * 2 + 10}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Game Status & Controls */}
        <div className="space-y-4">
          {/* Player Info */}
          <div className="bg-black/60 border-2 border-primary/50 rounded-lg p-4">
            <h3 className="text-lg font-bold text-primary mb-3">👤 Player 1 (You)</h3>
            <div className="space-y-2 text-sm">
              <p className="text-accent">🚂 Trains Left: {gameState.player1Trains}</p>
              <p className="text-accent">📊 Score: {gameState.player1Score}</p>
              <p className="text-accent">🎫 Cards: {gameState.player1Hand.length}</p>
              <p className="text-accent">✅ Routes: {gameState.routes.filter((r) => r.claimedBy === 1).length}</p>
            </div>
          </div>

          <div className="bg-black/60 border-2 border-accent/50 rounded-lg p-4">
            <h3 className="text-lg font-bold text-accent mb-3">👤 Player 2</h3>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">🚂 Trains Left: {gameState.player2Trains}</p>
              <p className="text-muted-foreground">📊 Score: {gameState.player2Score}</p>
              <p className="text-muted-foreground">🎫 Cards: {gameState.player2Hand.length}</p>
              <p className="text-muted-foreground">
                ✅ Routes: {gameState.routes.filter((r) => r.claimedBy === 2).length}
              </p>
            </div>
          </div>

          {/* Current Player */}
          <div className="bg-black/60 border-2 border-neon-pink rounded-lg p-4">
            <p className="text-sm font-bold text-accent mb-2">
              {gameState.currentPlayer === 1 ? "🟢 Your Turn" : "🔴 Opponent's Turn"}
            </p>
            <div className="text-xs text-muted-foreground">
              {gameState.currentPlayer === 1 ? "Claim a route or draw cards" : "Waiting for opponent..."}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              onClick={() => handleDrawCards()}
              disabled={gameState.currentPlayer !== 1 || gameState.gameOver}
              className="w-full bg-primary text-black hover:bg-primary/90 font-bold"
            >
              Draw 2 Cards
            </Button>
            <Button
              onClick={handlePlungerRoute}
              disabled={gameState.currentPlayer !== 1 || gameState.gameOver}
              className="w-full bg-accent/50 text-black hover:bg-accent/70 font-bold"
            >
              🫧 Plunger Route
            </Button>
            <Button
              onClick={handleEndGame}
              disabled={!gameState.gameOver}
              className="w-full bg-destructive/50 text-white hover:bg-destructive/70 font-bold"
            >
              End Game
            </Button>
          </div>

          {/* Game Over Message */}
          {gameState.gameOver && (
            <div className="bg-primary/20 border-2 border-primary rounded-lg p-4">
              <p className="font-bold text-primary">🎉 Game Over!</p>
              <p className="text-sm text-accent mt-2">
                Player {gameState.winner} wins with{" "}
                {gameState.winner === 1 ? gameState.player1Score : gameState.player2Score} points!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
