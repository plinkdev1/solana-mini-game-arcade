"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { createGame, updateGameResult } from "@/lib/supabase/game-service"
import { useGameP2P } from "@/hooks/useGameP2P"
import { SyncLoadingSpinner } from "@/components/sync-loading-spinner"
import { LivePlayersBoard } from "@/components/live-players-board"
import GameModeSelector from "@/components/game-mode-selector"
import AIDifficultyModal from "@/components/ai-difficulty-modal"

const GAME_TYPE = "ludo"
const INITIAL_BET = 0.04
const PIECES_PER_PLAYER = 4

interface Piece {
  id: string
  position: number
  home: boolean
}

interface GameState {
  player1Pieces: Piece[]
  player2Pieces: Piece[]
  currentPlayer: number
  diceValue: number
  gameOver: boolean
  winner: number | null
}

function initializePieces(): Piece[] {
  return Array(PIECES_PER_PLAYER)
    .fill(null)
    .map((_, i) => ({
      id: `piece-${i}`,
      position: -1,
      home: false,
    }))
}

export default function LudoFlushBoard({ gameBet = INITIAL_BET, matchId }: { gameBet?: number; matchId?: string }) {
  const [gameState, setGameState] = useState<GameState>({
    player1Pieces: initializePieces(),
    player2Pieces: initializePieces(),
    currentPlayer: 1,
    diceValue: 0,
    gameOver: false,
    winner: null,
  })
  const [gameId, setGameId] = useState<string>("")
  const [isRolling, setIsRolling] = useState(false)
  const [showCoinFlip, setShowCoinFlip] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameMode, setGameMode] = useState<"pvp" | "ai">("pvp")
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "hard">("easy")
  const [showAiDifficultyModal, setShowAiDifficultyModal] = useState(false)
  const { toast } = useToast()
  const { isSyncing, sendMove, gameState: receivedState } = useGameP2P(matchId || "")

  useEffect(() => {
    if (receivedState?.board) {
      setGameState(receivedState as GameState)
    }
  }, [receivedState])

  useEffect(() => {
    const initGame = async () => {
      const id = await createGame(GAME_TYPE, "player1", "player2", gameBet)
      setGameId(id)
    }
    initGame()
  }, [gameBet])

  const rollDice = () => {
    if (gameState.gameOver || isRolling) return

    setIsRolling(true)
    const roll = Math.floor(Math.random() * 6) + 1

    setTimeout(() => {
      setGameState((prev) => ({
        ...prev,
        diceValue: roll,
      }))
      setIsRolling(false)

      sendMove({ type: "dice_roll", value: roll, currentPlayer: gameState.currentPlayer })

      if (roll === 6) {
        toast({
          title: "Flush Double!",
          description: `Player ${gameState.currentPlayer} rolled a 6! Take another turn.`,
        })
      } else {
        switchTurn()
      }
    }, 800)
  }

  const switchTurn = () => {
    setGameState((prev) => ({
      ...prev,
      currentPlayer: prev.currentPlayer === 1 ? 2 : 1,
    }))
  }

  const movePiece = (pieceIndex: number) => {
    if (gameState.currentPlayer === 1) {
      const newPieces = [...gameState.player1Pieces]
      const piece = newPieces[pieceIndex]

      if (piece.position === -1 && gameState.diceValue === 6) {
        piece.position = 0
      } else if (piece.position >= 0) {
        piece.position = Math.min(piece.position + gameState.diceValue, 57)
        if (piece.position === 57) {
          piece.home = true
        }
      }

      const allHome = newPieces.every((p) => p.home)
      if (allHome) {
        endGame(1)
      } else {
        setGameState((prev) => ({
          ...prev,
          player1Pieces: newPieces,
          diceValue: 0,
        }))
        if (gameState.diceValue !== 6) switchTurn()
      }
    }
  }

  const endGame = async (winnerId: number) => {
    setGameState((prev) => ({
      ...prev,
      gameOver: true,
      winner: winnerId,
    }))

    const score =
      100 -
      (winnerId === 1
        ? gameState.player2Pieces.filter((p) => p.home).length
        : gameState.player1Pieces.filter((p) => p.home).length) *
        10
    await updateGameResult(gameId, winnerId.toString(), JSON.stringify(gameState), score * 0.1)

    toast({
      title: "Game Over",
      description: `Player ${winnerId} flushed home all pieces! Victory!`,
    })
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

  const currentPlayerPieces = gameState.currentPlayer === 1 ? gameState.player1Pieces : gameState.player2Pieces

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
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
      <div className="flex flex-col items-center justify-center gap-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-2">
            {gameState.gameOver ? `Player ${gameState.winner} Wins!` : `Player ${gameState.currentPlayer}'s Turn`}
          </h2>
          <div className="flex gap-4 justify-center items-center">
            <div className="text-3xl font-black text-accent">🎲</div>
            <div className="text-5xl font-black text-primary">{gameState.diceValue || "-"}</div>
            <Button
              onClick={rollDice}
              disabled={isRolling || gameState.gameOver}
              className="bg-primary text-black hover:bg-primary/90 font-bold px-6"
            >
              {isRolling ? "Rolling..." : "Roll Dice"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 w-full max-w-2xl">
          {[1, 2].map((player) => {
            const pieces = player === 1 ? gameState.player1Pieces : gameState.player2Pieces
            return (
              <div key={player} className="p-4 border-2 border-primary/50 rounded-lg bg-black/40">
                <h3
                  className={`text-lg font-bold mb-3 ${player === gameState.currentPlayer ? "text-primary" : "text-muted-foreground"}`}
                >
                  {player === 1 ? "💩" : "🚽"} Player {player}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {pieces.map((piece, idx) => (
                    <button
                      key={piece.id}
                      onClick={() => gameState.currentPlayer === player && movePiece(idx)}
                      disabled={gameState.currentPlayer !== player || gameState.gameOver || gameState.diceValue === 0}
                      className={`p-3 rounded text-center font-bold transition ${
                        piece.home
                          ? "bg-green-500/50 border-2 border-green-500 text-green-100"
                          : piece.position === -1
                            ? "bg-accent/30 border-2 border-accent text-accent hover:bg-accent/50"
                            : "bg-primary/30 border-2 border-primary text-primary hover:bg-primary/50"
                      }`}
                    >
                      {piece.home ? "🏠" : piece.position === -1 ? "Start" : `Pos ${piece.position}`}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>🎯 First player to move all pieces home wins!</p>
          <p>🎲 Roll a 6 to start, doubles grant extra roll</p>
        </div>
      </div>
    </div>
  )
}
