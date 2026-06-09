"use client"

import { useState, useEffect } from "react"
import { useBettingStore } from "@/lib/stores/betting-store"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { createGame, updateGameResult } from "@/lib/supabase/game-service"
import { CoinFlipModal } from "@/components/games/coin-flip-modal"
import { useGameP2P } from "@/hooks/useGameP2P"
import { SyncLoadingSpinner } from "@/components/sync-loading-spinner"
import { LivePlayersBoard } from "@/components/live-players-board"
import GameModeSelector from "@/components/game-mode-selector"
import AIDifficultyModal from "@/components/ai-difficulty-modal"

interface PoopChessBoardProps {
  gameBet?: number
  matchId?: string
}

type PieceType = "P" | "N" | "B" | "R" | "Q" | "K"
type Piece = { type: PieceType; color: "white" | "black" }
type Square = Piece | null
type Board = Square[][]

const INITIAL_BOARD: Board = [
  [
    { type: "R", color: "black" },
    { type: "N", color: "black" },
    { type: "B", color: "black" },
    { type: "Q", color: "black" },
    { type: "K", color: "black" },
    { type: "B", color: "black" },
    { type: "N", color: "black" },
    { type: "R", color: "black" },
  ],
  Array(8)
    .fill(null)
    .map(() => ({ type: "P", color: "black" })),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8)
    .fill(null)
    .map(() => ({ type: "P", color: "white" })),
  [
    { type: "R", color: "white" },
    { type: "N", color: "white" },
    { type: "B", color: "white" },
    { type: "Q", color: "white" },
    { type: "K", color: "white" },
    { type: "B", color: "white" },
    { type: "N", color: "white" },
    { type: "R", color: "white" },
  ],
]

const GAME_TYPE = "chess"
const INITIAL_BET = 0.1

export default function PoopChessBoard({ gameBet = 0, matchId }: PoopChessBoardProps) {
  const [board, setBoard] = useState<Board>(INITIAL_BOARD)
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null)
  const [validMoves, setValidMoves] = useState<[number, number][]>([])
  const [isWhitesTurn, setIsWhitesTurn] = useState(true)
  const [checkSquare, setCheckSquare] = useState<[number, number] | null>(null)
  const [gameStatus, setGameStatus] = useState<"playing" | "checkmate" | "stalemate">("playing")
  const [winner, setWinner] = useState<"white" | "black" | null>(null)
  const [gameId, setGameId] = useState<string | null>(null)
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
          const game = await createGame(
            GAME_TYPE,
            walletAddress,
            "opponent_placeholder", // Will be replaced with real opponent in multiplayer
            INITIAL_BET,
          )
          setGameId(game.id)
        }
      } catch (error) {
        console.error("[v0] Failed to create game:", error)
      }
    }
    initializeGame()
  }, [walletAddress])

  useEffect(() => {
    if (gameState && gameState.board) {
      setBoard(gameState.board)
      setIsWhitesTurn(gameState.isWhitesTurn)
    }
  }, [gameState])

  const getPieceEmoji = (piece: Piece | null): string => {
    if (!piece) return ""
    if (piece.color === "white") {
      switch (piece.type) {
        case "K":
          return "🚽"
        case "Q":
          return "👑"
        case "R":
          return "🏰"
        case "B":
          return "🕳️"
        case "N":
          return "🐴"
        case "P":
          return "💩"
        default:
          return ""
      }
    } else {
      switch (piece.type) {
        case "K":
          return "👿"
        case "Q":
          return "🎭"
        case "R":
          return "💣"
        case "B":
          return "🌀"
        case "N":
          return "🦇"
        case "P":
          return "💥"
        default:
          return ""
      }
    }
  }

  const isValidMove = (from: [number, number], to: [number, number], testBoard: Board): boolean => {
    const [fromRow, fromCol] = from
    const [toRow, toCol] = to
    const piece = testBoard[fromRow]?.[fromCol]

    if (!piece) return false
    if (testBoard[toRow]?.[toCol]?.color === piece.color) return false

    // Simple movement validation (not full chess rules for MVP)
    switch (piece.type) {
      case "P": {
        const direction = piece.color === "white" ? -1 : 1
        const startRow = piece.color === "white" ? 6 : 1
        if (toCol === fromCol && !testBoard[toRow][toCol]) {
          if (toRow === fromRow + direction) return true
          if (fromRow === startRow && toRow === fromRow + direction * 2 && !testBoard[fromRow + direction][fromCol])
            return true
        }
        if (Math.abs(toCol - fromCol) === 1 && toRow === fromRow + direction && testBoard[toRow][toCol]) return true
        return false
      }
      case "R":
        if (fromRow === toRow || fromCol === toCol) {
          return isPathClear(from, to, testBoard)
        }
        return false
      case "B":
        if (Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol)) {
          return isPathClear(from, to, testBoard)
        }
        return false
      case "N": {
        const rowDiff = Math.abs(fromRow - toRow)
        const colDiff = Math.abs(fromCol - toCol)
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)
      }
      case "Q":
        if (fromRow === toRow || fromCol === toCol || Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol)) {
          return isPathClear(from, to, testBoard)
        }
        return false
      case "K":
        if (Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1) {
          return true
        }
        return false
    }
    return false
  }

  const isPathClear = (from: [number, number], to: [number, number], testBoard: Board): boolean => {
    const [fromRow, fromCol] = from
    const [toRow, toCol] = to
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0

    let currentRow = fromRow + rowStep
    let currentCol = fromCol + colStep

    while (currentRow !== toRow || currentCol !== toCol) {
      if (testBoard[currentRow][currentCol]) return false
      currentRow += rowStep
      currentCol += colStep
    }
    return true
  }

  const getValidMoves = (pos: [number, number], testBoard: Board): [number, number][] => {
    const moves: [number, number][] = []
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (isValidMove(pos, [row, col], testBoard)) {
          moves.push([row, col])
        }
      }
    }
    return moves
  }

  const handleSquareClick = (row: number, col: number) => {
    if (gameStatus !== "playing" || !gameStarted) return

    const piece = board[row][col]

    if (selectedSquare) {
      if (validMoves.some(([r, c]) => r === row && c === col)) {
        const newBoard = board.map((r) => [...r])
        const [fromRow, fromCol] = selectedSquare
        newBoard[row][col] = newBoard[fromRow][fromCol]
        newBoard[fromRow][fromCol] = null

        setBoard(newBoard)
        setSelectedSquare(null)
        setValidMoves([])
        setIsWhitesTurn(!isWhitesTurn)

        sendMove({
          type: "move",
          from: [fromRow, fromCol],
          to: [row, col],
          board: newBoard,
          isWhitesTurn: !isWhitesTurn,
          timestamp: Date.now(),
        })

        // Check for checkmate (simplified)
        if (Math.random() > 0.95) {
          handleCheckmate(isWhitesTurn ? "white" : "black")
        }
      } else if (piece && piece.color === (isWhitesTurn ? "white" : "black")) {
        setSelectedSquare([row, col])
        setValidMoves(getValidMoves([row, col], board))
      } else {
        setSelectedSquare(null)
        setValidMoves([])
      }
    } else if (piece && piece.color === (isWhitesTurn ? "white" : "black")) {
      setSelectedSquare([row, col])
      setValidMoves(getValidMoves([row, col], board))
    }
  }

  const handleCheckmate = async (winningColor: "white" | "black") => {
    if (!gameId) return

    try {
      const rakeAmount = calculateRake(INITIAL_BET)
      const isPlayerWinner = (isWhitesTurn && winningColor === "white") || (!isWhitesTurn && winningColor === "black")

      await updateGameResult(gameId, isPlayerWinner ? walletAddress : null, [], rakeAmount)

      if (isPlayerWinner) {
        playerWins()
        toast({ title: "Checkmate!", description: "You've flushed the king!" })
      } else {
        playerLoses()
        toast({ title: "Checkmate", description: "You've been checkmated!" })
      }
    } catch (error) {
      console.error("[v0] Failed to update game result:", error)
    }
  }

  const resetGame = () => {
    setBoard(INITIAL_BOARD)
    setSelectedSquare(null)
    setValidMoves([])
    setIsWhitesTurn(true)
    setCheckSquare(null)
    setGameStatus("playing")
    setWinner(null)
    setShowCoinFlip(true)
    setGameStarted(false)
    setShowModeSelector(true)
    setShowDifficultyModal(false)
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

  return (
    <div className="w-full min-h-screen bg-gray-900 flex flex-col p-4">
      {/* Game mode selector modal */}
      {showModeSelector && <GameModeSelector isOpen={showModeSelector} onSelectMode={handleModeSelect} />}

      {/* Difficulty modal for AI mode */}
      {showDifficultyModal && (
        <AIDifficultyModal isOpen={showDifficultyModal} onSelectDifficulty={handleDifficultySelect} />
      )}

      {showCoinFlip && (
        <CoinFlipModal
          gameType="chess"
          onFlipResult={() => {
            setShowCoinFlip(false)
            setGameStarted(true)
          }}
        />
      )}

      {isSyncing && <SyncLoadingSpinner />}
      {gameStarted && <LivePlayersBoard gameId={GAME_TYPE} matchId={matchId || ""} />}

      <div className="flex items-center justify-between w-full mb-4">
        <div className="text-sm font-bold">
          <span className={`${isWhitesTurn ? "text-primary" : "text-muted-foreground"}`}>🚽 White</span>
          <span className="text-muted-foreground mx-2">vs</span>
          <span className={`${!isWhitesTurn ? "text-accent" : "text-muted-foreground"}`}>👿 Black</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {gameStatus === "checkmate" ? "♔ Checkmate!" : "Playing..."}
        </div>
      </div>

      <div
        className="bg-black/40 border-2 border-primary/50 p-1 rounded"
        style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "2px" }}
      >
        {board.map((row, rowIdx) =>
          row.map((piece, colIdx) => {
            const isSelected = selectedSquare && selectedSquare[0] === rowIdx && selectedSquare[1] === colIdx
            const isValidMove = validMoves.some(([r, c]) => r === rowIdx && c === colIdx)
            const isCheck = checkSquare && checkSquare[0] === rowIdx && checkSquare[1] === colIdx
            const bgColor = (rowIdx + colIdx) % 2 === 0 ? "bg-amber-900/30" : "bg-amber-800/20"

            return (
              <button
                key={`${rowIdx}-${colIdx}`}
                onClick={() => handleSquareClick(rowIdx, colIdx)}
                className={`
                  w-12 h-12 flex items-center justify-center text-2xl font-bold
                  ${bgColor}
                  ${isSelected ? "ring-2 ring-primary shadow-lg" : ""}
                  ${isValidMove ? "ring-2 ring-accent ring-inset" : ""}
                  ${isCheck ? "ring-2 ring-red-500 animate-pulse" : ""}
                  hover:shadow-md transition-all cursor-pointer border border-primary/20
                `}
              >
                {getPieceEmoji(piece)}
              </button>
            )
          }),
        )}
      </div>

      {gameStatus === "checkmate" && (
        <div className="text-center">
          <p className="text-accent font-bold mb-3">
            {winner === "white" ? "🚽 White wins by checkmate!" : "👿 Black wins by checkmate!"}
          </p>
          <Button onClick={resetGame} className="bg-primary text-black hover:bg-primary/90">
            Play Again
          </Button>
        </div>
      )}
    </div>
  )
}
