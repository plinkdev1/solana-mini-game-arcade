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

const GAME_TYPE = "rummy"
const INITIAL_BET = 0.04

interface Card {
  suit: "♠" | "♥" | "♦" | "♣"
  rank: string
}

interface Meld {
  cards: Card[]
  type: "set" | "run"
}

interface GameState {
  deck: Card[]
  player1Hand: Card[]
  player2Hand: Card[]
  player1Melds: Meld[]
  player2Melds: Meld[]
  discardPile: Card[]
  player1Score: number
  player2Score: number
  currentPlayer: 1 | 2
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

function isValidSet(cards: Card[]): boolean {
  if (cards.length < 3) return false
  const ranks = cards.map((c) => c.rank)
  return ranks.every((r) => r === ranks[0])
}

function isValidRun(cards: Card[]): boolean {
  if (cards.length < 3) return false
  const suits = cards.map((c) => c.suit)
  if (!suits.every((s) => s === suits[0])) return false

  const ranks = [...cards].sort((a, b) => RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank))
  for (let i = 1; i < ranks.length; i++) {
    if (RANKS.indexOf(ranks[i].rank) - RANKS.indexOf(ranks[i - 1].rank) !== 1) {
      return false
    }
  }
  return true
}

function calculateHandValue(hand: Card[]): number {
  return hand.reduce((sum, card) => {
    if (card.rank === "J" || card.rank === "Q" || card.rank === "K") return sum + 10
    if (card.rank === "A") return sum + 11
    return sum + Number.parseInt(card.rank)
  }, 0)
}

function initializeGame(): GameState {
  const deck = createDeck()
  return {
    deck: deck.slice(20),
    player1Hand: deck.slice(0, 10),
    player2Hand: deck.slice(10, 20),
    player1Melds: [],
    player2Melds: [],
    discardPile: [],
    player1Score: 0,
    player2Score: 0,
    currentPlayer: 1,
    gameOver: false,
    winner: null,
    moveHistory: ["Game started. Players dealt 10 cards each."],
  }
}

export default function RummyClogBoard({ gameBet = INITIAL_BET, matchId }: { gameBet?: number; matchId?: string }) {
  const [gameState, setGameState] = useState<GameState>(initializeGame())
  const [selectedCards, setSelectedCards] = useState<number[]>([])
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
      if (opponentMove.type === "meld") {
        setGameState((prev) => ({
          ...prev,
          moveHistory: [...prev.moveHistory, `Opponent melded ${opponentMove.data.meldType}`],
        }))
      } else if (opponentMove.type === "discard") {
        setGameState((prev) => ({
          ...prev,
          discardPile: [...prev.discardPile, opponentMove.data.card],
          moveHistory: [
            ...prev.moveHistory,
            `Opponent discarded ${opponentMove.data.card.rank}${opponentMove.data.card.suit}`,
          ],
        }))
      }
    }
  }, [opponentMove])

  const currentHand = gameState.currentPlayer === 1 ? gameState.player1Hand : gameState.player2Hand

  const handleDraw = () => {
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
      return newState
    })
  }

  const handleDiscard = (cardIdx: number) => {
    const card = currentHand[cardIdx]
    setGameState((prev) => {
      const newState = { ...prev }
      if (prev.currentPlayer === 1) {
        newState.player1Hand = prev.player1Hand.filter((_, idx) => idx !== cardIdx)
      } else {
        newState.player2Hand = prev.player2Hand.filter((_, idx) => idx !== cardIdx)
      }
      newState.discardPile = [...prev.discardPile, card]
      newState.moveHistory = [...prev.moveHistory, `Player ${prev.currentPlayer} discarded ${card.rank}${card.suit}`]
      return newState
    })

    const newHand = currentHand.filter((_, idx) => idx !== cardIdx)
    if (newHand.length === 0) {
      handleGameEnd(gameState.currentPlayer)
    }

    setGameState((prev) => ({
      ...prev,
      currentPlayer: prev.currentPlayer === 1 ? 2 : 1,
    }))

    sendMove({ type: "discard", data: { card: currentHand[cardIdx] } })
  }

  const handleMeld = () => {
    if (selectedCards.length < 3) {
      toast({ description: "Select at least 3 cards to meld" })
      return
    }

    const meldsCards = selectedCards.map((idx) => currentHand[idx])
    const isSet = isValidSet(meldsCards)
    const isRun = isValidRun(meldsCards)

    if (!isSet && !isRun) {
      toast({ description: "Invalid meld! Must be a set or run." })
      return
    }

    const meldType = isSet ? "set" : "run"
    setGameState((prev) => {
      const newState = { ...prev }
      if (prev.currentPlayer === 1) {
        newState.player1Hand = prev.player1Hand.filter((_, idx) => !selectedCards.includes(idx))
        newState.player1Melds = [...prev.player1Melds, { cards: meldsCards, type: meldType }]
      } else {
        newState.player2Hand = prev.player2Hand.filter((_, idx) => !selectedCards.includes(idx))
        newState.player2Melds = [...prev.player2Melds, { cards: meldsCards, type: meldType }]
      }
      newState.moveHistory = [...prev.moveHistory, `Player ${prev.currentPlayer} melded ${meldType}`]
      return newState
    })

    setSelectedCards([])
    toast({ description: `Meld successful! (${meldType})` })

    sendMove({ type: "meld", data: { meldType } })
  }

  const handleGameEnd = async (winnerId: 1 | 2) => {
    const player1HandValue = calculateHandValue(gameState.player1Hand)
    const player2HandValue = calculateHandValue(gameState.player2Hand)

    setGlobalGameOver(true)
    setGameState((prev) => ({
      ...prev,
      gameOver: true,
      winner: winnerId,
      player1Score: winnerId === 1 ? prev.player1Score + 100 : prev.player1Score - player1HandValue,
      player2Score: winnerId === 2 ? prev.player2Score + 100 : prev.player2Score - player2HandValue,
      moveHistory: [...prev.moveHistory, `Player ${winnerId} won!`],
    }))

    try {
      await updateGameResult(
        GAME_TYPE,
        winnerId,
        {
          player1Melds: gameState.player1Melds,
          player2Melds: gameState.player2Melds,
          player1Hand: gameState.player1Hand,
          player2Hand: gameState.player2Hand,
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black p-4 md:p-8">
      <div className="space-y-6">
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
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-lg border-2 ${gameState.currentPlayer === 1 ? "border-pink-500 bg-pink-500/10" : "border-accent/30"}`}
              >
                <h3 className="text-lg font-bold text-pink-500 mb-2">💩 Player 1</h3>
                <p className="text-sm text-muted-foreground">Hand: {gameState.player1Hand.length}</p>
                <p className="text-sm text-accent">Score: {gameState.player1Score}</p>
              </div>

              <div
                className={`p-4 rounded-lg border-2 ${gameState.currentPlayer === 2 ? "border-green-500 bg-green-500/10" : "border-accent/30"}`}
              >
                <h3 className="text-lg font-bold text-green-500 mb-2">🪠 Player 2</h3>
                <p className="text-sm text-muted-foreground">Hand: {gameState.player2Hand.length}</p>
                <p className="text-sm text-accent">Score: {gameState.player2Score}</p>
              </div>
            </div>

            <div className="p-6 rounded-lg border-2 border-primary/50 bg-black/40">
              <h4 className="text-sm font-bold text-accent mb-3">
                Player {gameState.currentPlayer}'s Turn | Deck: {gameState.deck.length}
              </h4>

              <div className="mb-6">
                <h5 className="text-xs font-bold text-accent mb-2">Your Hand:</h5>
                <div className="flex gap-2 flex-wrap">
                  {currentHand.map((card, idx) => (
                    <div
                      key={idx}
                      onClick={() =>
                        setSelectedCards((prev) =>
                          prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
                        )
                      }
                      className={`w-14 h-20 flex items-center justify-center rounded border-2 cursor-pointer transition ${
                        selectedCards.includes(idx) ? "border-pink-500 bg-pink-500/20" : "border-accent/50 bg-black"
                      }`}
                    >
                      <span className="text-xs font-bold text-accent">
                        {card.rank}
                        {card.suit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {gameState.discardPile.length > 0 && (
                <div className="mb-6">
                  <h5 className="text-xs font-bold text-accent mb-2">Discard Pile (Top):</h5>
                  <div className="flex gap-2">
                    <div className="w-14 h-20 flex items-center justify-center rounded border-2 border-green-500 bg-black">
                      <span className="text-xs font-bold text-green-500">
                        {gameState.discardPile[gameState.discardPile.length - 1].rank}
                        {gameState.discardPile[gameState.discardPile.length - 1].suit}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button
                  onClick={handleDraw}
                  className="bg-accent/50 text-black hover:bg-accent/70 transition-colors font-bold"
                  disabled={gameState.gameOver}
                >
                  Draw Card
                </Button>
                <Button
                  onClick={handleMeld}
                  className="bg-green-500/50 text-black hover:bg-green-500/70 transition-colors font-bold"
                  disabled={gameState.gameOver || selectedCards.length < 3}
                >
                  Meld ({selectedCards.length})
                </Button>
                <Button
                  onClick={() => handleDiscard(currentHand.length - 1)}
                  className="bg-red-500/50 text-black hover:bg-red-500/70 transition-colors font-bold"
                  disabled={gameState.gameOver || currentHand.length === 0}
                >
                  Discard
                </Button>
              </div>

              {gameState.currentPlayer === 1 && gameState.player1Melds.length > 0 && (
                <div className="mb-4 p-3 bg-black/40 rounded border border-green-500/50">
                  <h5 className="text-xs font-bold text-green-500 mb-2">Your Melds: {gameState.player1Melds.length}</h5>
                  <div className="text-xs text-muted-foreground">
                    {gameState.player1Melds.map((m, idx) => (
                      <div key={idx}>
                        {idx + 1}. {m.type.toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {gameState.currentPlayer === 2 && gameState.player2Melds.length > 0 && (
                <div className="mb-4 p-3 bg-black/40 rounded border border-green-500/50">
                  <h5 className="text-xs font-bold text-green-500 mb-2">Your Melds: {gameState.player2Melds.length}</h5>
                  <div className="text-xs text-muted-foreground">
                    {gameState.player2Melds.map((m, idx) => (
                      <div key={idx}>
                        {idx + 1}. {m.type.toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                <p className="text-sm text-muted-foreground mb-3">Melded all cards faster than your opponent!</p>
                <Button
                  onClick={() => setGameState(initializeGame())}
                  className="bg-green-500 text-black hover:bg-green-600 font-bold"
                >
                  Play Again
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
