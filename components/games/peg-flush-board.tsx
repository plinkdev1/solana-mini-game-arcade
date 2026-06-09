"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createGame, endGame } from "@/lib/supabase/game-service"

const GAME_TYPE = "peg_solitaire"
const INITIAL_BET = 0.02
const BOARD_SIZE = 7

interface Position {
  row: number
  col: number
}

interface GameState {
  board: boolean[][]
  selectedPeg: Position | null
  validMoves: Position[]
  score: number
  gameOver: boolean
  winner: number | null
  moveCount: number
  currentPlayer: number // 1 = player (human), 2 = AI
  pegsLeft: number
  message: string
}

function initializeBoard(): boolean[][] {
  const board: boolean[][] = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(false))

  // Fill with pegs, leaving center empty
  for (let r = 1; r < 6; r++) {
    for (let c = 1; c < 6; c++) {
      board[r][c] = true
    }
  }
  board[3][3] = false // Center hole
  return board
}

function getPegsLeft(board: boolean[][]): number {
  let count = 0
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c]) count++
    }
  }
  return count
}

function getValidMoves(board: boolean[][], pos: Position): Position[] {
  const moves: Position[] = []
  const directions = [
    [-2, 0],
    [2, 0],
    [0, -2],
    [0, 2],
  ]

  for (const [dr, dc] of directions) {
    const newRow = pos.row + dr
    const newCol = pos.col + dc
    const midRow = pos.row + dr / 2
    const midCol = pos.col + dc / 2

    if (
      newRow >= 0 &&
      newRow < BOARD_SIZE &&
      newCol >= 0 &&
      newCol < BOARD_SIZE &&
      !board[newRow][newCol] &&
      board[midRow][midCol]
    ) {
      moves.push({ row: newRow, col: newCol })
    }
  }
  return moves
}

function getAllValidMoves(board: boolean[][]): Array<{ from: Position; to: Position }> {
  const moves: Array<{ from: Position; to: Position }> = []
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c]) {
        const validMoves = getValidMoves(board, { row: r, col: c })
        for (const move of validMoves) {
          moves.push({ from: { row: r, col: c }, to: move })
        }
      }
    }
  }
  return moves
}

function makeMove(board: boolean[][], from: Position, to: Position): boolean[][] {
  const newBoard = board.map((row) => [...row])
  const midRow = (from.row + to.row) / 2
  const midCol = (from.col + to.col) / 2

  newBoard[from.row][from.col] = false
  newBoard[midRow][midCol] = false
  newBoard[to.row][to.col] = true
  return newBoard
}

// Simple greedy AI: pick move that removes peg closest to center
function getAIMove(board: boolean[][]): { from: Position; to: Position } | null {
  const moves = getAllValidMoves(board)
  if (moves.length === 0) return null

  let bestMove = moves[0]
  let bestScore = Number.POSITIVE_INFINITY

  for (const move of moves) {
    const midRow = (move.from.row + move.to.row) / 2
    const midCol = (move.from.col + move.to.col) / 2
    const distToCenter = Math.abs(midRow - 3) + Math.abs(midCol - 3)
    if (distToCenter < bestScore) {
      bestScore = distToCenter
      bestMove = move
    }
  }
  return bestMove
}

export default function PegFlushBoard({ gameBet = INITIAL_BET }: { gameBet?: number }) {
  const { toast } = useToast()
  const [gameState, setGameState] = useState<GameState>(() => {
    const board = initializeBoard()
    return {
      board,
      selectedPeg: null,
      validMoves: [],
      score: 33,
      gameOver: false,
      winner: null,
      moveCount: 0,
      currentPlayer: 1,
      pegsLeft: 33,
      message: "Your turn. Click a peg to select.",
    }
  })

  const [gameId, setGameId] = useState<string | null>(null)

  // Initialize game in Supabase for AI mode
  useEffect(() => {
    const initializeGame = async () => {
      try {
        const game = await createGame(GAME_TYPE, "player", "ai", INITIAL_BET, true)
        setGameId(game.id)
      } catch (error) {
        console.error("[v0] Failed to initialize game:", error)
        toast({
          title: "Error",
          description: "Failed to initialize game",
          variant: "destructive",
        })
      }
    }
    initializeGame()
  }, [toast])

  // AI turn
  useEffect(() => {
    if (gameState.gameOver || gameState.currentPlayer !== 2) return

    const timer = setTimeout(() => {
      const move = getAIMove(gameState.board)
      if (!move) {
        // AI can't move, player wins
        setGameState((prev) => ({
          ...prev,
          gameOver: true,
          winner: 1,
          message: "AI blocked! You win!",
        }))
        toast({
          title: "You Win!",
          description: "AI opponent has no valid moves!",
        })
        handleGameComplete(1, gameState.score)
        return
      }

      const newBoard = makeMove(gameState.board, move.from, move.to)
      const pegsLeft = getPegsLeft(newBoard)
      const newScore = pegsLeft === 1 ? 100 : pegsLeft

      if (pegsLeft === 1) {
        setGameState((prev) => ({
          ...prev,
          board: newBoard,
          moveCount: prev.moveCount + 1,
          pegsLeft,
          score: newScore,
          gameOver: true,
          winner: 2,
          message: "AI completed puzzle! You lose.",
          currentPlayer: 1,
        }))
        toast({
          title: "AI Wins!",
          description: `AI left only 1 peg. Final score: ${newScore}`,
        })
        handleGameComplete(2, newScore)
      } else {
        setGameState((prev) => ({
          ...prev,
          board: newBoard,
          selectedPeg: null,
          validMoves: [],
          moveCount: prev.moveCount + 1,
          pegsLeft,
          score: newScore,
          currentPlayer: 1,
          message: "Your turn.",
        }))
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [gameState, toast])

  const handlePegClick = (row: number, col: number) => {
    if (gameState.gameOver || gameState.currentPlayer !== 1) return

    // Deselect if clicking same peg
    if (gameState.selectedPeg?.row === row && gameState.selectedPeg?.col === col) {
      setGameState((prev) => ({
        ...prev,
        selectedPeg: null,
        validMoves: [],
      }))
      return
    }

    // If valid move destination, execute move
    if (gameState.validMoves.some((m) => m.row === row && m.col === col)) {
      const newBoard = makeMove(gameState.board, gameState.selectedPeg!, { row, col })
      const pegsLeft = getPegsLeft(newBoard)
      const newScore = pegsLeft === 1 ? 100 : pegsLeft

      if (pegsLeft === 1) {
        setGameState((prev) => ({
          ...prev,
          board: newBoard,
          moveCount: prev.moveCount + 1,
          pegsLeft,
          score: newScore,
          gameOver: true,
          winner: 1,
          message: "You completed the puzzle!",
          selectedPeg: null,
          validMoves: [],
        }))
        toast({
          title: "Victory!",
          description: `Completed with 1 peg! Score: ${newScore}`,
        })
        handleGameComplete(1, newScore)
        return
      }

      // Check if AI has valid moves
      const aiMoves = getAllValidMoves(newBoard)
      if (aiMoves.length === 0) {
        setGameState((prev) => ({
          ...prev,
          board: newBoard,
          moveCount: prev.moveCount + 1,
          pegsLeft,
          score: newScore,
          gameOver: true,
          winner: 1,
          message: "AI blocked! You win!",
          selectedPeg: null,
          validMoves: [],
        }))
        toast({
          title: "You Win!",
          description: `AI has no moves. Pegs left: ${pegsLeft}`,
        })
        handleGameComplete(1, newScore)
        return
      }

      setGameState((prev) => ({
        ...prev,
        board: newBoard,
        selectedPeg: null,
        validMoves: [],
        moveCount: prev.moveCount + 1,
        pegsLeft,
        score: newScore,
        currentPlayer: 2,
        message: "AI thinking...",
      }))
      return
    }

    // Select new peg
    if (gameState.board[row][col]) {
      const moves = getValidMoves(gameState.board, { row, col })
      setGameState((prev) => ({
        ...prev,
        selectedPeg: { row, col },
        validMoves: moves,
        message: moves.length > 0 ? `${moves.length} move(s) available` : "No valid moves for this peg",
      }))
    }
  }

  const handleReset = () => {
    const board = initializeBoard()
    setGameState({
      board,
      selectedPeg: null,
      validMoves: [],
      score: 33,
      gameOver: false,
      winner: null,
      moveCount: 0,
      currentPlayer: 1,
      pegsLeft: 33,
      message: "Your turn. Click a peg to select.",
    })
  }

  const handleUsePowerUp = () => {
    if (gameState.currentPlayer !== 1) return
    const moves = getAllValidMoves(gameState.board)
    if (moves.length > 0) {
      toast({
        title: "Unclog Jump Used",
        description: "Make 2 moves before AI plays",
      })
    }
  }

  const handleGameComplete = async (finalWinner: number, finalScore: number) => {
    try {
      if (gameId) {
        await endGame(gameId, finalWinner === 1 ? "player" : "ai", [], INITIAL_BET)
      }
    } catch (error) {
      console.error("[v0] Failed to end game:", error)
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Board */}
        <div className="flex-1 flex items-center justify-center">
          <div
            className="grid gap-2 p-6 bg-black/40 rounded-lg border-2 border-primary/30"
            style={{
              gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(50px, 1fr))`,
            }}
          >
            {gameState.board.map((row, r) =>
              row.map((hasPeg, c) => {
                const isSelected = gameState.selectedPeg?.row === r && gameState.selectedPeg?.col === c
                const isValidMove = gameState.validMoves.some((m) => m.row === r && m.col === c)
                const isCenter = r === 3 && c === 3

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handlePegClick(r, c)}
                    className={`h-12 w-12 rounded-full transition-all ${
                      !hasPeg && !isCenter
                        ? "bg-gray-800/30 cursor-default"
                        : isCenter
                          ? "bg-gradient-to-b from-green-500 to-green-700 shadow-lg shadow-green-500/50 cursor-default"
                          : isSelected
                            ? "bg-gradient-to-b from-pink-400 to-pink-600 shadow-lg shadow-pink-500/70 scale-110"
                            : isValidMove
                              ? "bg-gradient-to-b from-cyan-400 to-cyan-600 shadow-lg shadow-cyan-500/50 cursor-pointer hover:scale-105"
                              : hasPeg
                                ? "bg-gradient-to-b from-orange-400 to-orange-600 shadow-lg shadow-orange-500/40 cursor-pointer hover:shadow-orange-500/60 hover:scale-105"
                                : "bg-gray-800/30 cursor-default"
                    }`}
                    disabled={!hasPeg && !isCenter}
                  />
                )
              }),
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-4 min-w-[250px]">
          <div className="bg-black/60 border-2 border-primary/30 rounded-lg p-4">
            <h3 className="text-sm font-bold text-primary mb-3">Game Status</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pegs Left:</span>
                <span className="text-accent font-bold">{gameState.pegsLeft}/33</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Moves Made:</span>
                <span className="text-accent font-bold">{gameState.moveCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Score:</span>
                <span className="text-primary font-bold text-lg">{gameState.score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bet:</span>
                <span className="text-primary font-bold">{gameBet} $DATX</span>
              </div>
              <p className="text-accent italic mt-4 pt-4 border-t border-primary/20">{gameState.message}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleReset}
              variant="outline"
              className="w-full border-primary/50 hover:border-primary hover:bg-primary/10 text-primary bg-transparent"
            >
              New Game
            </Button>
            <Button
              onClick={handleUsePowerUp}
              disabled={gameState.gameOver || gameState.currentPlayer !== 1}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              ⚡ Unclog Jump
            </Button>
          </div>

          <div className="bg-black/60 border-2 border-accent/30 rounded-lg p-3 text-xs">
            <p className="text-accent font-bold mb-2">How to Play:</p>
            <ul className="text-muted-foreground space-y-1">
              <li>• Click a peg to select</li>
              <li>• Click an empty space to jump</li>
              <li>• Jumped peg is removed</li>
              <li>• Win with 1 peg left</li>
              <li>• AI plays automatically</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
