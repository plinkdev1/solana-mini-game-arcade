"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { createGame, endGame } from "@/lib/supabase/game-service"
import { CoinFlipModal } from "@/components/games/coin-flip-modal"
import { LivePlayersBoard } from "@/components/live-players-board"
import { useGameP2P } from "@/hooks/useGameP2P"
import { SyncLoadingSpinner } from "@/components/sync-loading-spinner"
import GameModeSelector from "@/components/game-mode-selector"
import AIDifficultyModal from "@/components/ai-difficulty-modal"

const GAME_TYPE = "dominoes"
const INITIAL_BET = 0.03

interface Domino {
  id: string
  left: number
  right: number
  rotated?: boolean
}

interface GameState {
  hand: Domino[]
  boneyard: Domino[]
  chain: Domino[]
  score: number
  gameOver: boolean
  winner: number | null
  canPlay: boolean
}

// Initialize double-six set
function initializeDominoes(): Domino[] {
  const dominoes: Domino[] = []
  let id = 0
  for (let i = 0; i <= 6; i++) {
    for (let j = i; j <= 6; j++) {
      dominoes.push({
        id: `domino-${id}`,
        left: i,
        right: j,
      })
      id++
    }
  }
  return dominoes.sort(() => Math.random() - 0.5)
}

function canPlayDomino(domino: Domino, chain: Domino[]): boolean {
  if (chain.length === 0) return true
  const leftEnd = chain[0].left
  const rightEnd = chain[chain.length - 1].right
  return domino.left === leftEnd || domino.left === rightEnd || domino.right === leftEnd || domino.right === rightEnd
}

function calculateScore(hand: Domino[]): number {
  return hand.reduce((sum, d) => sum + d.left + d.right, 0)
}

export default function DominoClogBoard({ gameBet = INITIAL_BET, matchId }: { gameBet?: number; matchId?: string }) {
  const [player1State, setPlayer1State] = useState<GameState>(() => {
    const dominoes = initializeDominoes()
    const hand = dominoes.slice(0, 7)
    const boneyard = dominoes.slice(7)
    return {
      hand,
      boneyard,
      chain: [],
      score: 0,
      gameOver: false,
      winner: null,
      canPlay: true,
    }
  })

  const [player2State, setPlayer2State] = useState<GameState>(() => {
    const dominoes = initializeDominoes()
    const hand = dominoes.slice(0, 7)
    const boneyard = dominoes.slice(7)
    return {
      hand,
      boneyard,
      chain: [],
      score: 0,
      gameOver: false,
      winner: null,
      canPlay: false,
    }
  })

  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [gameId, setGameId] = useState<string | null>(null)
  const [showCoinFlip, setShowCoinFlip] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameMode, setGameMode] = useState<"pvp" | "ai">("pvp")
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "hard">("easy")
  const [showModeSelector, setShowModeSelector] = useState(true)
  const [showDifficultyModal, setShowDifficultyModal] = useState(false)
  const { toast } = useToast()
  const { isSyncing, sendMove, gameState } = useGameP2P(matchId || "")

  useEffect(() => {
    const initGame = async () => {
      try {
        const game = await createGame(GAME_TYPE, "player1", "player2", gameBet, false)
        setGameId(game.id)
      } catch (error) {
        console.error("[v0] Failed to create game:", error)
        toast({
          title: "Error",
          description: "Failed to initialize game",
          variant: "destructive",
        })
      }
    }
    if (!gameStarted && !showModeSelector && !showDifficultyModal) {
      initGame()
    }
  }, [gameBet, toast, gameStarted, showModeSelector, showDifficultyModal])

  useEffect(() => {
    if (gameState) {
      const opponentState = currentPlayer === 1 ? gameState.player2 : gameState.player1
      setPlayer2State(opponentState)
    }
  }, [gameState, currentPlayer])

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

  const handleCoinFlipResult = (player: 1 | 2) => {
    setShowCoinFlip(false)
    setCurrentPlayer(player)
    setGameStarted(true)
  }

  const handlePlayDomino = (domino: Domino, position: "left" | "right") => {
    const state = currentPlayer === 1 ? player1State : player2State
    const otherState = currentPlayer === 1 ? player2State : player1State
    const setState = currentPlayer === 1 ? setPlayer1State : setPlayer2State

    if (!canPlayDomino(domino, state.chain)) {
      toast({ title: "Invalid Move", description: "This domino doesn't match the chain ends" })
      return
    }

    const newHand = state.hand.filter((d) => d.id !== domino.id)
    const newChain = position === "left" ? [domino, ...state.chain] : [...state.chain, domino]

    setState({
      ...state,
      hand: newHand,
      chain: newChain,
    })

    sendMove({
      type: "playDomino",
      domino,
      position,
      newChain,
      player: currentPlayer,
      timestamp: Date.now(),
    })

    if (newHand.length === 0) {
      handleGameEnd(currentPlayer)
      return
    }

    setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
  }

  const handleDraw = () => {
    const state = currentPlayer === 1 ? player1State : player2State
    const setState = currentPlayer === 1 ? setPlayer1State : setPlayer2State

    if (state.boneyard.length === 0) {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
      return
    }

    const drawnTile = state.boneyard[0]
    const newBoneyard = state.boneyard.slice(1)
    const newHand = [...state.hand, drawnTile]

    setState({
      ...state,
      hand: newHand,
      boneyard: newBoneyard,
    })

    setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
  }

  const handleGameEnd = async (winner: number) => {
    const p1Score = calculateScore(player1State.hand)
    const p2Score = calculateScore(player2State.hand)

    if (player1State.gameOver || player2State.gameOver) return

    const actualWinner = winner === 1 ? 1 : 2

    try {
      if (gameId) {
        await endGame(gameId, `player${actualWinner}`, [], gameBet)
      }

      setPlayer1State((s) => ({ ...s, gameOver: true, winner: actualWinner }))
      setPlayer2State((s) => ({ ...s, gameOver: true, winner: actualWinner }))

      toast({
        title: "Game Over!",
        description: `Player ${actualWinner} wins!`,
      })
    } catch (error) {
      console.error("[v0] Failed to end game:", error)
      toast({
        title: "Error",
        description: "Failed to save game result",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col">
      {showModeSelector && <GameModeSelector isOpen={showModeSelector} onSelectMode={handleModeSelect} />}

      {showDifficultyModal && (
        <AIDifficultyModal isOpen={showDifficultyModal} onSelectDifficulty={handleDifficultySelect} />
      )}

      {showCoinFlip && (
        <CoinFlipModal
          gameType="dominoes"
          onFlipResult={() => {
            setShowCoinFlip(false)
            setGameStarted(true)
          }}
        />
      )}
      {isSyncing && <SyncLoadingSpinner />}
      {gameStarted && <LivePlayersBoard gameId={GAME_TYPE} matchId={matchId || ""} />}

      {/* Player 1 Board */}
      <div className="bg-gradient-to-b from-pink-900/20 to-black/40 border-2 border-pink/50 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-pink">💩 Player 1</h3>
          <div className="text-right">
            <p className="text-sm text-accent font-bold">Chain Length: {player1State.chain.length}</p>
            <p className="text-sm text-accent">Hand: {player1State.hand.length} tiles</p>
          </div>
        </div>

        {/* Chain Display */}
        <div className="bg-black/40 rounded p-4 mb-4 min-h-24 flex items-center justify-center overflow-x-auto">
          {player1State.chain.length === 0 ? (
            <p className="text-muted-foreground text-sm">Chain starts here...</p>
          ) : (
            <div className="flex gap-2">
              {player1State.chain.map((domino, idx) => (
                <div
                  key={domino.id}
                  className="bg-gradient-to-br from-green-500 to-green-700 px-4 py-2 rounded font-bold text-center text-black text-sm border-2 border-green-300"
                >
                  <div>{domino.left}</div>
                  <div className="border-t border-green-300 my-1"></div>
                  <div>{domino.right}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hand Display */}
        <div className="flex gap-2 flex-wrap mb-4">
          {player1State.hand.map((domino) => (
            <button
              key={domino.id}
              onClick={() => currentPlayer === 1 && handlePlayDomino(domino, "right")}
              disabled={currentPlayer !== 1}
              className={`px-3 py-2 rounded font-bold text-center text-black text-sm border-2 transition ${
                currentPlayer === 1
                  ? "bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300 hover:shadow-lg hover:shadow-yellow-500/50 cursor-pointer"
                  : "bg-gray-500 border-gray-400 opacity-50"
              }`}
            >
              <div>{domino.left}</div>
              <div className="border-t border-current my-1"></div>
              <div>{domino.right}</div>
            </button>
          ))}
        </div>

        {currentPlayer === 1 && (
          <div className="flex gap-2">
            <Button onClick={handleDraw} className="bg-green-600 hover:bg-green-700 text-black font-bold flex-1">
              Draw Tile
            </Button>
          </div>
        )}
      </div>

      {/* Player 2 Board */}
      <div className="bg-gradient-to-b from-cyan-900/20 to-black/40 border-2 border-cyan-500/50 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-cyan-400">🚽 Player 2</h3>
          <div className="text-right">
            <p className="text-sm text-accent font-bold">Chain Length: {player2State.chain.length}</p>
            <p className="text-sm text-accent">Hand: {player2State.hand.length} tiles</p>
          </div>
        </div>

        {/* Chain Display */}
        <div className="bg-black/40 rounded p-4 mb-4 min-h-24 flex items-center justify-center overflow-x-auto">
          {player2State.chain.length === 0 ? (
            <p className="text-muted-foreground text-sm">Chain starts here...</p>
          ) : (
            <div className="flex gap-2">
              {player2State.chain.map((domino) => (
                <div
                  key={domino.id}
                  className="bg-gradient-to-br from-cyan-500 to-cyan-700 px-4 py-2 rounded font-bold text-center text-black text-sm border-2 border-cyan-300"
                >
                  <div>{domino.left}</div>
                  <div className="border-t border-cyan-300 my-1"></div>
                  <div>{domino.right}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hand Display (Hidden for Player 2 for now) */}
        <div className="text-center text-sm text-muted-foreground mb-4">
          {currentPlayer === 2 ? "Your turn - choose a tile" : "Waiting for your turn..."}
        </div>

        {currentPlayer === 2 && (
          <div className="flex gap-2">
            <Button onClick={handleDraw} className="bg-green-600 hover:bg-green-700 text-black font-bold flex-1">
              Draw Tile
            </Button>
          </div>
        )}
      </div>

      {/* Game Status */}
      <div className="text-center text-sm text-accent">
        <p>Current Turn: Player {currentPlayer}</p>
        <p>Boneyard: {player1State.boneyard.length} tiles remaining</p>
      </div>
    </div>
  )
}
