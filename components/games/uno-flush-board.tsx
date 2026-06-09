"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { CoinFlipModal } from "@/components/games/coin-flip-modal"
import { useGameP2P } from "@/hooks/useGameP2P"
import { SyncLoadingSpinner } from "@/components/sync-loading-spinner"
import { useGameStateStore } from "@/lib/stores/game-state-store"
import { useBettingStore } from "@/lib/stores/betting-store"
import { LivePlayersBoard } from "@/components/live-players-board"
import GameModeSelector from "@/components/game-mode-selector"
import AIDifficultyModal from "@/components/ai-difficulty-modal"

const GAME_TYPE = "uno"
const INITIAL_BET = 0.03

type CardColor = "red" | "yellow" | "green" | "blue"
type CardType = "number" | "skip" | "reverse" | "draw-two" | "wild" | "wild-draw-four"

interface Card {
  id: string
  color: CardColor | null
  type: CardType
  value?: number
}

interface GameState {
  deck: Card[]
  discardPile: Card[]
  player1Hand: Card[]
  player2Hand: Card[]
  player1Score: number
  player2Score: number
  currentPlayer: 1 | 2
  gameOver: boolean
  winner: 1 | 2 | null
  moveHistory: string[]
}

const COLORS: CardColor[] = ["red", "yellow", "green", "blue"]

function createDeck(): Card[] {
  const deck: Card[] = []
  let id = 0

  // Number cards (0-9, 2 of each color except 0)
  for (const color of COLORS) {
    for (let i = 0; i < 10; i++) {
      if (i === 0) {
        deck.push({ id: `${id++}`, color, type: "number", value: 0 })
      } else {
        deck.push({ id: `${id++}`, color, type: "number", value: i })
        deck.push({ id: `${id++}`, color, type: "number", value: i })
      }
    }
  }

  // Action cards (skip, reverse, draw-two - 2 of each per color)
  for (const color of COLORS) {
    for (let i = 0; i < 2; i++) {
      deck.push({ id: `${id++}`, color, type: "skip" })
      deck.push({ id: `${id++}`, color, type: "reverse" })
      deck.push({ id: `${id++}`, color, type: "draw-two" })
    }
  }

  // Wild cards (4 of each)
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `${id++}`, color: null, type: "wild" })
    deck.push({ id: `${id++}`, color: null, type: "wild-draw-four" })
  }

  return deck.sort(() => Math.random() - 0.5)
}

function isValidPlay(card: Card, topCard: Card, selectedColor?: CardColor): boolean {
  if (card.type === "wild" || card.type === "wild-draw-four") return true
  if (card.color === topCard.color) return true
  if (card.type === topCard.type) return true
  if (topCard.type === "wild" || topCard.type === "wild-draw-four") {
    return card.color === selectedColor
  }
  return false
}

function initializeGame(): GameState {
  const deck = createDeck()
  const player1Hand = deck.slice(0, 7)
  const player2Hand = deck.slice(7, 14)
  const discardStart = deck[14]

  return {
    deck: deck.slice(15),
    discardPile: [discardStart],
    player1Hand,
    player2Hand,
    player1Score: 0,
    player2Score: 0,
    currentPlayer: 1,
    gameOver: false,
    winner: null,
    moveHistory: ["Game started. Players dealt 7 cards each."],
  }
}

export default function UnoFlushBoard({ gameBet = INITIAL_BET, matchId }: { gameBet?: number; matchId?: string }) {
  const [gameState, setGameState] = useState<GameState>(initializeGame())
  const [selectedColor, setSelectedColor] = useState<CardColor | null>(null)
  const [globalGameOver, setGlobalGameOver] = useState(false)
  const [showCoinFlip, setShowCoinFlip] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameMode, setGameMode] = useState<"p2p" | "ai" | null>(null)
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "hard" | null>(null)
  const [showDifficultyModal, setShowDifficultyModal] = useState(false)
  const { toast } = useToast()
  const { currentGameId } = useGameStateStore()
  const { walletAddress } = useBettingStore()
  const { syncing, opponentMove, sendMove } = useGameP2P(matchId || currentGameId || "", walletAddress || "")

  useEffect(() => {
    if (opponentMove) {
      if (opponentMove.type === "play") {
        setGameState((prev) => ({
          ...prev,
          moveHistory: [...prev.moveHistory, `Opponent played ${opponentMove.data.card.type}`],
        }))
      } else if (opponentMove.type === "draw") {
        setGameState((prev) => ({
          ...prev,
          moveHistory: [...prev.moveHistory, `Opponent drew a card`],
        }))
      }
    }
  }, [opponentMove])

  const currentHand = gameState.currentPlayer === 1 ? gameState.player1Hand : gameState.player2Hand
  const topCard = gameState.discardPile[gameState.discardPile.length - 1]

  const handlePlayCard = (cardIndex: number) => {
    const card = currentHand[cardIndex]
    if (!isValidPlay(card, topCard, selectedColor)) {
      toast({ description: "Invalid play! Color or number must match." })
      return
    }

    setGameState((prev) => {
      const newState = { ...prev }
      const newDiscardPile = [...prev.discardPile, card]

      if (prev.currentPlayer === 1) {
        newState.player1Hand = prev.player1Hand.filter((_, i) => i !== cardIndex)
      } else {
        newState.player2Hand = prev.player2Hand.filter((_, i) => i !== cardIndex)
      }

      // Check for UNO (1 card left)
      const currentHandSize = prev.currentPlayer === 1 ? newState.player1Hand.length : newState.player2Hand.length
      if (currentHandSize === 0) {
        newState.gameOver = true
        newState.winner = prev.currentPlayer
        newState.player1Score = prev.currentPlayer === 1 ? 500 : 0
        newState.player2Score = prev.currentPlayer === 2 ? 500 : 0
        setGlobalGameOver(true)
        toast({ description: `Player ${prev.currentPlayer} wins! One flush!` })
      }

      newState.discardPile = newDiscardPile
      newState.moveHistory = [
        ...prev.moveHistory,
        `Player ${prev.currentPlayer} played ${card.color || "wild"} ${card.type}`,
      ]

      // Switch turns (skip and reverse would advance further but simplified here)
      newState.currentPlayer = prev.currentPlayer === 1 ? 2 : 1

      return newState
    })
    setSelectedColor(null)
    sendMove({ type: "play", data: { card: currentHand[cardIndex] } })
  }

  const handleDrawCard = () => {
    if (gameState.deck.length === 0) {
      toast({ description: "No cards left in deck!" })
      return
    }

    const newCard = gameState.deck[0]
    setGameState((prev) => {
      const newState = { ...prev, deck: prev.deck.slice(1) }
      if (prev.currentPlayer === 1) {
        newState.player1Hand = [...prev.player1Hand, newCard]
      } else {
        newState.player2Hand = [...prev.player2Hand, newCard]
      }
      newState.moveHistory = [...prev.moveHistory, `Player ${prev.currentPlayer} drew a card`]
      newState.currentPlayer = prev.currentPlayer === 1 ? 2 : 1
      return newState
    })
    sendMove({ type: "draw", data: {} })
  }

  const handleUsePlungerWild = () => {
    // Plunger Wild power-up: adds a wild card to hand
    setGameState((prev) => {
      const wildCard: Card = { id: `wild-${Date.now()}`, color: null, type: "wild" }
      const newState = { ...prev }
      if (prev.currentPlayer === 1) {
        newState.player1Hand = [...prev.player1Hand, wildCard]
      } else {
        newState.player2Hand = [...prev.player2Hand, wildCard]
      }
      newState.moveHistory = [...prev.moveHistory, `Player ${prev.currentPlayer} used Plunger Wild!`]
      return newState
    })
    toast({ description: "Plunger Wild activated! Extra wild card added." })
  }

  const handleCoinFlipResult = (player: 1 | 2) => {
    setShowCoinFlip(false)
    setGameState((prev) => ({ ...prev, currentPlayer: player }))
    setGameStarted(true)
  }

  const getCardColor = (color: CardColor | null) => {
    const colorMap = {
      red: "bg-red-600",
      yellow: "bg-yellow-400",
      green: "bg-green-600",
      blue: "bg-blue-600",
    }
    return color ? colorMap[color] : "bg-gray-800"
  }

  const formatCardDisplay = (card: Card) => {
    if (card.type === "number") return card.value
    if (card.type === "skip") return "SKIP"
    if (card.type === "reverse") return "REV"
    if (card.type === "draw-two") return "+2"
    if (card.type === "wild") return "WILD"
    if (card.type === "wild-draw-four") return "+4"
    return "?"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black p-4 md:p-8">
      <div className="w-full max-w-5xl mx-auto p-6 text-white">
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

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-black/60 border-2 border-red-500 rounded-lg p-4">
                <div className="text-xl font-bold text-red-400 mb-2">💩 Player 1</div>
                <div className="text-2xl font-bold text-green-400">Score: {gameState.player1Score}</div>
                <div className="text-sm text-muted-foreground mt-2">Cards: {gameState.player1Hand.length}</div>
                {gameState.currentPlayer === 1 && <div className="text-xs text-yellow-300 mt-2">🎯 Your Turn</div>}
              </div>

              <div className="bg-black/60 border-2 border-green-500 rounded-lg p-4">
                <div className="text-xl font-bold text-green-400 mb-2">🚽 Player 2</div>
                <div className="text-2xl font-bold text-green-400">Score: {gameState.player2Score}</div>
                <div className="text-sm text-muted-foreground mt-2">Cards: {gameState.player2Hand.length}</div>
                {gameState.currentPlayer === 2 && <div className="text-xs text-yellow-300 mt-2">🎯 Your Turn</div>}
              </div>
            </div>

            <div className="bg-black/60 border-2 border-accent rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Top Card:</p>
                  <div
                    className={`w-20 h-28 ${getCardColor(topCard.color)} rounded flex items-center justify-center text-white font-bold text-2xl border-2 border-white/50`}
                  >
                    {formatCardDisplay(topCard)}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Deck:</p>
                  <div className="w-20 h-28 bg-blue-900 rounded flex items-center justify-center text-white font-bold text-xl border-2 border-blue-500">
                    {gameState.deck.length}
                  </div>
                </div>
              </div>
            </div>

            {gameState.currentPlayer && (
              <div className="bg-black/60 border-2 border-primary rounded-lg p-6 mb-8">
                <p className="text-sm text-muted-foreground mb-4">Your Hand ({currentHand.length} cards):</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {currentHand.map((card, idx) => (
                    <button
                      key={card.id}
                      onClick={() => handlePlayCard(idx)}
                      className={`${getCardColor(card.color)} hover:brightness-110 transition px-3 py-2 rounded font-bold text-white border-2 border-white/30`}
                    >
                      {formatCardDisplay(card)}
                    </button>
                  ))}
                </div>

                {(topCard.type === "wild" || topCard.type === "wild-draw-four") && (
                  <div className="mb-4 flex gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`${getCardColor(color)} ${selectedColor === color ? "ring-2 ring-white" : ""} px-3 py-1 rounded text-sm font-bold`}
                      >
                        {color.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleDrawCard}
                    className="bg-yellow-500 text-black hover:bg-yellow-600 font-bold flex-1"
                  >
                    Draw Card
                  </Button>
                  <Button
                    onClick={handleUsePlungerWild}
                    className="bg-green-500 text-black hover:bg-green-600 font-bold flex-1"
                  >
                    💨 Plunger Wild
                  </Button>
                </div>
              </div>
            )}

            {gameState.gameOver && (
              <div className="bg-black/60 border-2 border-primary rounded-lg p-6 text-center">
                <p className="text-2xl font-bold text-primary mb-2">🎉 Player {gameState.winner} Wins!</p>
                <p className="text-accent mb-4">One card flush! Victory in the underground!</p>
                <Button
                  onClick={() => location.reload()}
                  className="bg-primary text-black hover:bg-primary/90 font-bold"
                >
                  Play Again
                </Button>
              </div>
            )}

            <div className="bg-black/40 border border-accent/30 rounded p-4 mt-8 max-h-32 overflow-y-auto">
              <p className="text-xs text-accent font-bold mb-2">Move History:</p>
              {gameState.moveHistory.slice(-5).map((move, idx) => (
                <p key={idx} className="text-xs text-muted-foreground">
                  {move}
                </p>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
