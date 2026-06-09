"use client"

import type React from "react"
import { CoinFlipModal } from "@/components/games/coin-flip-modal"
import { SyncLoadingSpinner } from "@/components/sync-loading-spinner"
import { LivePlayersBoard } from "@/components/live-players-board"
import { GameModeSelector } from "@/components/game-mode-selector"
import { AIDifficultyModal } from "@/components/ai-difficulty-modal"

import { useState, useRef, useEffect } from "react"
import { useBettingStore } from "@/lib/stores/betting-store"
import { useWalletStore } from "@/lib/stores/wallet-store"
import { useToast } from "@/hooks/use-toast"
import { useGameP2P } from "@/hooks/useGameP2P"

export default function GomokuBoard({ gameBet = 0, matchId }: { gameBet?: number; matchId?: string }) {
  const BOARD_SIZE = 15
  const CELL_SIZE = 40 // Fixed pixel size per cell
  const WINNING_LENGTH = 5

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [board, setBoard] = useState<(string | null)[]>(Array(BOARD_SIZE * BOARD_SIZE).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [winner, setWinner] = useState<string | null>(null)
  const [showCoinFlip, setShowCoinFlip] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameMode, setGameMode] = useState<"pvp" | "ai">("pvp")
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "hard">("easy")
  const [showAiDifficultyModal, setShowAiDifficultyModal] = useState(false)

  const { playerWins, playerLoses, walletAddress, updateLeaderboard, calculateRake, getPlayerStats } = useBettingStore()
  const { mockMode } = useWalletStore()
  const { toast } = useToast()
  const { isSyncing, sendMove, gameState } = useGameP2P(matchId || "")

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const size = BOARD_SIZE * CELL_SIZE
    canvas.width = size
    canvas.height = size

    // Draw background
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.fillRect(0, 0, size, size)

    // Draw grid lines
    ctx.strokeStyle = "rgba(233, 30, 99, 0.3)"
    ctx.lineWidth = 1

    for (let i = 0; i <= BOARD_SIZE; i++) {
      const pos = i * CELL_SIZE
      ctx.beginPath()
      ctx.moveTo(pos, 0)
      ctx.lineTo(pos, size)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, pos)
      ctx.lineTo(size, pos)
      ctx.stroke()
    }

    // Draw pieces as emojis for iconic poop/plunger theme
    const font = new FontFace("Arial", "url(data:application/x-font-ttf;base64,AAAAAAA=)")
    ctx.font = "24px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    board.forEach((cell, index) => {
      if (!cell) return

      const row = Math.floor(index / BOARD_SIZE)
      const col = index % BOARD_SIZE
      const x = col * CELL_SIZE + CELL_SIZE / 2
      const y = row * CELL_SIZE + CELL_SIZE / 2

      // Draw emoji piece (poop for Player 1, plunger for Player 2)
      const emoji = cell === "X" ? "💩" : "🚽"
      ctx.fillText(emoji, x, y)
    })
  }, [board])

  useEffect(() => {
    if (gameState) {
      setBoard(gameState.board)
      setIsXNext(gameState.isXNext)
      setWinner(gameState.winner)
    }
  }, [gameState])

  useEffect(() => {
    if (gameMode === "ai" && gameStarted && !winner && !isXNext) {
      const timer = setTimeout(() => {
        const emptySpaces: number[] = []
        board.forEach((cell, idx) => {
          if (!cell) emptySpaces.push(idx)
        })
        if (emptySpaces.length > 0) {
          const selectedMove =
            aiDifficulty === "hard"
              ? selectBestMoveGomoku(emptySpaces) // Minimax for Gomoku
              : emptySpaces[Math.floor(Math.random() * emptySpaces.length)]
          handleCanvasClick({
            offsetX: (selectedMove % BOARD_SIZE) * CELL_SIZE,
            offsetY: Math.floor(selectedMove / BOARD_SIZE) * CELL_SIZE,
          } as any)
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [gameMode, gameStarted, winner, isXNext, aiDifficulty])

  const checkWin = (squares: (string | null)[], index: number, player: string) => {
    const row = Math.floor(index / BOARD_SIZE)
    const col = index % BOARD_SIZE

    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // diagonal
      [1, -1], // anti-diagonal
    ]

    for (const [dRow, dCol] of directions) {
      let count = 1

      // Check forward
      for (let i = 1; i < WINNING_LENGTH; i++) {
        const newRow = row + dRow * i
        const newCol = col + dCol * i
        if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
          const idx = newRow * BOARD_SIZE + newCol
          if (squares[idx] === player) count++
          else break
        } else break
      }

      // Check backward
      for (let i = 1; i < WINNING_LENGTH; i++) {
        const newRow = row - dRow * i
        const newCol = col - dCol * i
        if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
          const idx = newRow * BOARD_SIZE + newCol
          if (squares[idx] === player) count++
          else break
        } else break
      }

      if (count >= WINNING_LENGTH) {
        return true
      }
    }

    return false
  }

  const handleGameEnd = (player: string) => {
    if (gameBet > 0 && walletAddress) {
      const isPlayer1Win = player === "X"
      const totalPot = gameBet * 2

      const { winnerAmount, treasuryRake, teamRake } = calculateRake(totalPot)

      if (isPlayer1Win) {
        playerWins(true, totalPot)
        toast({
          title: "Flushed opponent!",
          description: `Won ${winnerAmount.toFixed(4)} $DATX! Raked: ${treasuryRake.toFixed(4)} Treasury, ${teamRake.toFixed(4)} Team`,
        })
      } else {
        playerLoses(walletAddress)
        toast({
          title: "Fed the Hole",
          description: `Lost ${gameBet.toFixed(4)} $DATX. Raked: ${treasuryRake.toFixed(4)} Treasury, ${teamRake.toFixed(4)} Team`,
          variant: "destructive",
        })
      }

      const playerStats = getPlayerStats(walletAddress)
      updateLeaderboard({
        id: walletAddress,
        address: walletAddress,
        wins: (playerStats?.wins || 0) + (isPlayer1Win ? 1 : 0),
        losses: (playerStats?.losses || 0) + (isPlayer1Win ? 0 : 1),
        totalEarnings: (playerStats?.totalEarnings || 0) + (isPlayer1Win ? winnerAmount : 0),
        totalBurned: (playerStats?.totalBurned || 0) + (isPlayer1Win ? 0 : gameBet),
      })
    }
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (winner || !gameStarted) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const col = Math.floor(x / CELL_SIZE)
    const row = Math.floor(y / CELL_SIZE)

    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return

    const index = row * BOARD_SIZE + col
    if (board[index]) return

    const newBoard = [...board]
    const player = isXNext ? "X" : "O"
    newBoard[index] = player
    setBoard(newBoard)

    if (checkWin(newBoard, index, player)) {
      setWinner(player)
      handleGameEnd(player)
    }

    setIsXNext(!isXNext)
    sendMove(index, player)
  }

  const resetGame = () => {
    setBoard(Array(BOARD_SIZE * BOARD_SIZE).fill(null))
    setIsXNext(true)
    setWinner(null)
    setShowCoinFlip(true)
    setGameStarted(false)
    setShowAiDifficultyModal(false)
  }

  const selectBestMoveGomoku = (emptySpaces: number[]) => {
    // Minimax for Gomoku - prefer center positions
    return emptySpaces.reduce((best, space) => {
      const spaceDist =
        Math.abs((space % BOARD_SIZE) - BOARD_SIZE / 2) + Math.abs(Math.floor(space / BOARD_SIZE) - BOARD_SIZE / 2)
      const bestDist =
        Math.abs((best % BOARD_SIZE) - BOARD_SIZE / 2) + Math.abs(Math.floor(best / BOARD_SIZE) - BOARD_SIZE / 2)
      return spaceDist < bestDist ? space : best
    })
  }

  return (
    <div className="w-full">
      {!gameStarted && (
        <GameModeSelector
          onModeChange={(mode) => {
            setGameMode(mode as "pvp" | "ai")
            if (mode === "ai") setShowAiDifficultyModal(true)
          }}
        />
      )}

      <AIDifficultyModal
        open={showAiDifficultyModal}
        onOpenChange={setShowAiDifficultyModal}
        onSelectDifficulty={(difficulty) => {
          setAiDifficulty(difficulty as "easy" | "hard")
          setShowAiDifficultyModal(false)
        }}
      />

      {showCoinFlip && (
        <CoinFlipModal
          onComplete={() => {
            setShowCoinFlip(false)
            setGameStarted(true)
          }}
          playerCount={2}
        />
      )}
      {isSyncing && <SyncLoadingSpinner />}
      {gameStarted && <LivePlayersBoard gameId="gomoku" matchId={matchId || ""} />}
      <div className="w-full flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-center">
          {winner && (
            <div className="text-xl font-black text-primary neon-pink mb-2">
              {winner === "X" ? "💩 Player 1 Flushed opponent!" : "🚽 Player 2 Flushed opponent!"}
            </div>
          )}
          {!winner && gameStarted && (
            <div className="text-sm font-bold text-muted-foreground mb-2">
              {isXNext ? "💩 Player 1" : "🚽 Player 2"}'s turn
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="border-2 border-primary/50 rounded cursor-pointer hover:border-primary transition"
            style={{ display: "block" }}
          />
        </div>

        {winner && (
          <button
            onClick={resetGame}
            className="mt-2 px-6 py-2 bg-primary text-black font-bold text-sm rounded hover:bg-primary/90 transition"
          >
            Play Again
          </button>
        )}
      </div>
    </div>
  )
}
