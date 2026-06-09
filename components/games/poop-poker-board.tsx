"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { updateGameResult } from "@/lib/supabase/game-service"
import { useGameP2P } from "@/hooks/useGameP2P"
import { SyncLoadingSpinner } from "@/components/sync-loading-spinner"
import { LivePlayersBoard } from "@/components/live-players-board"
import GameModeSelector from "@/components/game-mode-selector"
import AIDifficultyModal from "@/components/ai-difficulty-modal"

const GAME_TYPE = "poker"
const INITIAL_BET = 0.05

interface Card {
  suit: "♠" | "♥" | "♦" | "♣"
  rank: string
}

interface GameState {
  deck: Card[]
  player1Hand: Card[]
  player2Hand: Card[]
  communityCards: Card[]
  player1Chips: number
  player2Chips: number
  player1Score: number
  player2Score: number
  currentBet: number
  pot: number
  currentPlayer: 1 | 2
  gamePhase: "deal" | "preflop" | "flop" | "turn" | "river" | "showdown"
  gameOver: boolean
  winner: 1 | 2 | null
  moveHistory: string[]
}

const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]
const SUITS: ("♠" | "♥" | "♦" | "♣")[] = ["♠", "♥", "♦", "♣"]

function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank })
    }
  }
  return deck.sort(() => Math.random() - 0.5)
}

function getHandRank(cards: Card[]): number {
  // Simplified hand evaluation: royal flush (1000) to high card (1)
  const sorted = [...cards].sort((a, b) => RANKS.indexOf(b.rank) - RANKS.indexOf(a.rank))
  const suits = sorted.map((c) => c.suit)
  const ranks = sorted.map((c) => RANKS.indexOf(c.rank))

  // Royal flush
  if (
    sorted.every((c) => c.suit === sorted[0].suit) &&
    ranks[0] === 12 &&
    ranks[1] === 11 &&
    ranks[2] === 10 &&
    ranks[3] === 9 &&
    ranks[4] === 8
  ) {
    return 1000
  }

  // Four of a kind
  if (ranks[0] === ranks[3]) return 800
  if (ranks[1] === ranks[4]) return 800

  // Full house
  if ((ranks[0] === ranks[2] && ranks[3] === ranks[4]) || (ranks[0] === ranks[1] && ranks[2] === ranks[4])) {
    return 700
  }

  // Flush
  if (suits.every((s) => s === suits[0])) return 600

  // Three of a kind
  if (ranks[0] === ranks[2] || ranks[1] === ranks[3] || ranks[2] === ranks[4]) return 400

  // Pair
  if (ranks[0] === ranks[1] || ranks[1] === ranks[2] || ranks[2] === ranks[3] || ranks[3] === ranks[4]) {
    return 200
  }

  // High card
  return 1
}

function initializeGame(): GameState {
  const deck = createDeck()
  return {
    deck: deck.slice(4),
    player1Hand: [deck[0], deck[1]],
    player2Hand: [deck[2], deck[3]],
    communityCards: [],
    player1Chips: 100,
    player2Chips: 100,
    player1Score: 0,
    player2Score: 0,
    currentBet: 0,
    pot: 0,
    currentPlayer: 1,
    gamePhase: "deal",
    gameOver: false,
    winner: null,
    moveHistory: ["Game started. Blinds posted."],
  }
}

export default function PoopPokerBoard({ gameBet = INITIAL_BET, matchId }: { gameBet?: number; matchId?: string }) {
  const [gameState, setGameState] = useState<GameState>(initializeGame())
  const [globalGameOver, setGlobalGameOver] = useState(false)
  const { toast } = useToast()
  const [showCoinFlip, setShowCoinFlip] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const { isSyncing, sendMove, gameState: receivedState } = useGameP2P(matchId || "")
  const [gameMode, setGameMode] = useState<"pvp" | "ai">("pvp")
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "hard">("easy")
  const [showAiDifficultyModal, setShowAiDifficultyModal] = useState(false)

  useEffect(() => {
    if (receivedState?.gamePhase) {
      setGameState(receivedState as GameState)
    }
  }, [receivedState])

  const isPlayer1 = true

  const handleBet = (amount: number) => {
    if (gameState.gamePhase === "deal") return

    const playerChips = gameState.currentPlayer === 1 ? gameState.player1Chips : gameState.player2Chips

    if (amount > playerChips) {
      toast({ description: "Not enough chips!" })
      return
    }

    setGameState((prev) => ({
      ...prev,
      currentBet: amount,
      pot: prev.pot + amount,
      player1Chips: prev.currentPlayer === 1 ? prev.player1Chips - amount : prev.player1Chips,
      player2Chips: prev.currentPlayer === 2 ? prev.player2Chips - amount : prev.player2Chips,
      moveHistory: [...prev.moveHistory, `Player ${prev.currentPlayer} bets ${amount} chips`],
    }))

    sendMove({ type: "bet", amount, currentPlayer: gameState.currentPlayer })
  }

  const handleCall = () => {
    handleBet(gameState.currentBet)
  }

  const handleFold = () => {
    const winner = gameState.currentPlayer === 1 ? 2 : 1
    setGlobalGameOver(true)
    setGameState((prev) => ({
      ...prev,
      gameOver: true,
      winner,
      moveHistory: [...prev.moveHistory, `Player ${prev.currentPlayer} folded!`],
    }))
    handleGameEnd(winner)
  }

  const handleRaise = (amount: number) => {
    const totalRaise = gameState.currentBet + amount
    handleBet(totalRaise)
  }

  const handleNextPhase = () => {
    const newDeck = gameState.deck
    let newCommunity = [...gameState.communityCards]

    if (gameState.gamePhase === "deal") {
      // Deal the flop
      newCommunity = [newDeck[0], newDeck[1], newDeck[2]]
      setGameState((prev) => ({
        ...prev,
        deck: newDeck.slice(3),
        communityCards: newCommunity,
        gamePhase: "preflop",
        moveHistory: [...prev.moveHistory, "Flop dealt"],
      }))
    } else if (gameState.gamePhase === "preflop") {
      // Deal the turn
      newCommunity.push(newDeck[0])
      setGameState((prev) => ({
        ...prev,
        deck: newDeck.slice(1),
        communityCards: newCommunity,
        gamePhase: "flop",
        moveHistory: [...prev.moveHistory, "Turn dealt"],
      }))
    } else if (gameState.gamePhase === "flop") {
      // Deal the river
      newCommunity.push(newDeck[0])
      setGameState((prev) => ({
        ...prev,
        deck: newDeck.slice(1),
        communityCards: newCommunity,
        gamePhase: "turn",
        moveHistory: [...prev.moveHistory, "River dealt"],
      }))
    } else if (gameState.gamePhase === "turn") {
      // Showdown
      const allCards1 = [...gameState.player1Hand, ...gameState.communityCards]
      const allCards2 = [...gameState.player2Hand, ...gameState.communityCards]

      const rank1 = getHandRank(allCards1)
      const rank2 = getHandRank(allCards2)

      const winner = rank1 > rank2 ? 1 : rank2 > rank1 ? 2 : Math.random() > 0.5 ? 1 : 2

      setGlobalGameOver(true)
      setGameState((prev) => ({
        ...prev,
        gamePhase: "showdown",
        gameOver: true,
        winner,
        player1Score: winner === 1 ? prev.player1Score + prev.pot : prev.player1Score,
        player2Score: winner === 2 ? prev.player2Score + prev.pot : prev.player2Score,
        moveHistory: [...prev.moveHistory, `Player ${winner} wins with hand rank ${winner === 1 ? rank1 : rank2}!`],
      }))
      handleGameEnd(winner)
    }

    sendMove({ type: "phase_change", newPhase: gameState.gamePhase })
  }

  const handleGameEnd = async (winnerId: 1 | 2) => {
    try {
      await updateGameResult(
        GAME_TYPE,
        winnerId,
        {
          player1Hand: gameState.player1Hand,
          player2Hand: gameState.player2Hand,
          communityCards: gameState.communityCards,
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

      {isSyncing && <SyncLoadingSpinner />}
      {gameStarted && <LivePlayersBoard gameId={GAME_TYPE} matchId={matchId || ""} />}
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div
            className={`p-4 rounded-lg border-2 ${gameState.currentPlayer === 1 ? "border-pink-500 bg-pink-500/10" : "border-accent/30"}`}
          >
            <h3 className="text-lg font-bold text-pink-500 mb-2">💩 Player 1</h3>
            <p className="text-sm text-muted-foreground">Chips: {gameState.player1Chips}</p>
            <p className="text-sm text-accent">Score: {gameState.player1Score}</p>
          </div>

          <div
            className={`p-4 rounded-lg border-2 ${gameState.currentPlayer === 2 ? "border-green-500 bg-green-500/10" : "border-accent/30"}`}
          >
            <h3 className="text-lg font-bold text-green-500 mb-2">🪠 Player 2</h3>
            <p className="text-sm text-muted-foreground">Chips: {gameState.player2Chips}</p>
            <p className="text-sm text-accent">Score: {gameState.player2Score}</p>
          </div>
        </div>

        <div className="p-6 rounded-lg border-2 border-primary/50 bg-black/40">
          <h4 className="text-sm font-bold text-accent mb-3">
            Phase: {gameState.gamePhase.toUpperCase()} | Pot: {gameState.pot}
          </h4>

          <div className="mb-6">
            <h5 className="text-xs font-bold text-accent mb-2">Community Cards:</h5>
            <div className="flex gap-2">
              {gameState.communityCards.map((card, idx) => (
                <div
                  key={idx}
                  className="w-12 h-16 flex items-center justify-center rounded border-2 border-accent/50 bg-black"
                >
                  <span className="text-xs font-bold text-accent">
                    {card.rank}
                    {card.suit}
                  </span>
                </div>
              ))}
              {gameState.communityCards.length < 5 && (
                <div className="w-12 h-16 flex items-center justify-center rounded border-2 border-accent/30 bg-black/40">
                  <span className="text-xs text-muted-foreground">?</span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h5 className="text-xs font-bold text-accent mb-2">Your Hand (Player {gameState.currentPlayer}):</h5>
            <div className="flex gap-2">
              {(gameState.currentPlayer === 1 ? gameState.player1Hand : gameState.player2Hand).map((card, idx) => (
                <div
                  key={idx}
                  className="w-12 h-16 flex items-center justify-center rounded border-2 border-pink-500 bg-black"
                >
                  <span className="text-xs font-bold text-pink-500">
                    {card.rank}
                    {card.suit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button
              onClick={() => handleBet(10)}
              className="bg-accent/50 text-black hover:bg-accent/70 transition-colors font-bold"
              disabled={gameState.gamePhase === "deal" || gameState.gameOver}
            >
              Bet 10
            </Button>
            <Button
              onClick={() => handleBet(25)}
              className="bg-accent/50 text-black hover:bg-accent/70 transition-colors font-bold"
              disabled={gameState.gamePhase === "deal" || gameState.gameOver}
            >
              Bet 25
            </Button>
            <Button
              onClick={handleCall}
              className="bg-green-500/50 text-black hover:bg-green-500/70 transition-colors font-bold"
              disabled={gameState.gamePhase === "deal" || gameState.gameOver}
            >
              Call
            </Button>
            <Button
              onClick={handleFold}
              className="bg-red-500/50 text-black hover:bg-red-500/70 transition-colors font-bold"
              disabled={gameState.gamePhase === "deal" || gameState.gameOver}
            >
              Fold
            </Button>
          </div>

          <Button
            onClick={handleNextPhase}
            className="w-full bg-primary text-black hover:bg-primary/90 font-bold"
            disabled={gameState.gameOver}
          >
            {gameState.gamePhase === "deal" && "Deal Flop"}
            {gameState.gamePhase === "preflop" && "Deal Turn"}
            {gameState.gamePhase === "flop" && "Deal River"}
            {gameState.gamePhase === "turn" && "Showdown"}
            {gameState.gamePhase === "showdown" && "Game Over"}
          </Button>
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
            <p className="text-sm text-muted-foreground mb-3">All-in in the sewers. No folding now!</p>
            <Button
              onClick={() => setGameState(initializeGame())}
              className="bg-green-500 text-black hover:bg-green-600 font-bold"
            >
              Play Again
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
