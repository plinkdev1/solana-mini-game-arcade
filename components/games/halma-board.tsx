"use client"

import { useState, useEffect } from "react"
import { useBettingStore } from "@/lib/stores/betting-store"
import { useWalletStore } from "@/lib/stores/wallet-store"
import { useToast } from "@/hooks/use-toast"
import { CoinFlipModal } from "@/components/games/coin-flip-modal"
import { useGameP2P } from "@/hooks/useGameP2P"
import { SyncLoadingSpinner } from "@/components/sync-loading-spinner"
import { LivePlayersBoard } from "@/components/live-players-board"
import { GameModeSelector } from "@/components/game-mode-selector"
import { AIDifficultyModal } from "@/components/ai-difficulty-modal"

interface HalmaPiece {
  player: number
}

export default function HalmaBoard({ gameBet = 0, matchId }: { gameBet?: number; matchId?: string }) {
  const [board, setBoard] = useState<(HalmaPiece | null)[]>(() => {
    const newBoard: (HalmaPiece | null)[] = Array(64).fill(null)
    // Player 1 pieces (bottom-left corner)
    const player1Positions = [56, 57, 48, 49, 40, 41, 58, 50, 42]
    player1Positions.forEach((pos) => {
      newBoard[pos] = { player: 1 }
    })
    // Player 2 pieces (top-right corner)
    const player2Positions = [7, 6, 15, 14, 23, 22, 5, 13, 21]
    player2Positions.forEach((pos) => {
      newBoard[pos] = { player: 2 }
    })
    return newBoard
  })

  const [selectedPiece, setSelectedPiece] = useState<number | null>(null)
  const [validMoves, setValidMoves] = useState<number[]>([])
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [winner, setWinner] = useState<number | null>(null)
  const [showCoinFlip, setShowCoinFlip] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameMode, setGameMode] = useState<"pvp" | "ai">("pvp")
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "hard">("easy")
  const [showAiDifficultyModal, setShowAiDifficultyModal] = useState(false)

  const { playerWins, playerLoses, walletAddress, updateLeaderboard, calculateRake, getPlayerStats } = useBettingStore()
  const { mockMode } = useWalletStore()
  const { toast } = useToast()
  const { isSyncing, sendMove, gameState: receivedGameState } = useGameP2P(matchId || "")

  useEffect(() => {
    if (receivedGameState) {
      setBoard(receivedGameState.board)
      setCurrentPlayer(receivedGameState.currentPlayer)
      setWinner(receivedGameState.winner)
      setSelectedPiece(receivedGameState.selectedPiece)
      setValidMoves(receivedGameState.validMoves)
    }
  }, [receivedGameState])

  useEffect(() => {
    if (gameMode === "ai" && gameStarted && !winner && currentPlayer === 2) {
      const timer = setTimeout(() => {
        const validMovesForAI = getValidMoves(selectedPiece!)
        if (validMovesForAI.length > 0) {
          const selectedMove =
            aiDifficulty === "hard"
              ? selectBestMoveHalma(validMovesForAI)
              : validMovesForAI[Math.floor(Math.random() * validMovesForAI.length)]
          handleSquareClick(selectedPiece!, selectedMove)
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [gameMode, gameStarted, winner, currentPlayer, aiDifficulty, selectedPiece])

  const getValidMoves = (index: number) => {
    const piece = board[index]
    if (!piece || piece.player !== currentPlayer) return []

    const row = Math.floor(index / 8)
    const col = index % 8
    const moves: number[] = []
    const visited = new Set<number>()

    const queue: number[] = [index]
    visited.add(index)

    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ]

    while (queue.length > 0) {
      const current = queue.shift()!
      const curRow = Math.floor(current / 8)
      const curCol = current % 8

      // Regular moves (1 space in any direction)
      for (const [dRow, dCol] of directions) {
        const newRow = curRow + dRow
        const newCol = curCol + dCol
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          const newIndex = newRow * 8 + newCol
          if (!board[newIndex] && !visited.has(newIndex)) {
            moves.push(newIndex)
            visited.add(newIndex)
            queue.push(newIndex)
          }
        }
      }

      for (const [dRow, dCol] of directions) {
        const jumpRow = curRow + dRow * 2
        const jumpCol = curCol + dCol * 2
        if (jumpRow >= 0 && jumpRow < 8 && jumpCol >= 0 && jumpCol < 8) {
          const middleIndex = (curRow + dRow) * 8 + (curCol + dCol)
          const jumpIndex = jumpRow * 8 + jumpCol
          if (board[middleIndex] && !board[jumpIndex] && !visited.has(jumpIndex)) {
            moves.push(jumpIndex)
            visited.add(jumpIndex)
            queue.push(jumpIndex)
          }
        }
      }
    }

    return moves
  }

  const selectBestMoveHalma = (validMoves: number[]) => {
    // Halma AI - prefer moves toward opponent's corner
    return validMoves.reduce((best, move) => {
      const moveDist = Math.abs((move % 8) - 7) + Math.abs(Math.floor(move / 8) - 7)
      const bestDist = Math.abs((best % 8) - 7) + Math.abs(Math.floor(best / 8) - 7)
      return moveDist < bestDist ? move : best
    })
  }

  const handleClick = (index: number) => {
    if (winner || !gameStarted) return

    if (selectedPiece === index) {
      setSelectedPiece(null)
      setValidMoves([])
      return
    }

    if (validMoves.includes(index)) {
      const newBoard = [...board]
      const piece = newBoard[selectedPiece!]!
      newBoard[index] = piece
      newBoard[selectedPiece!] = null

      setBoard(newBoard)
      setSelectedPiece(null)
      setValidMoves([])

      const targetCorner =
        currentPlayer === 1 ? [7, 6, 15, 14, 23, 22, 5, 13, 21] : [56, 57, 48, 49, 40, 41, 58, 50, 42]

      const piecesInTarget = targetCorner.filter((pos) => newBoard[pos]?.player === currentPlayer).length

      if (piecesInTarget === 9) {
        setWinner(currentPlayer)
        handleGameEnd(currentPlayer)
      } else {
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
      }

      if (matchId) {
        sendMove({ type: "move", from: selectedPiece!, to: index, newBoard })
      }
    } else {
      const piece = board[index]
      if (piece?.player === currentPlayer) {
        setSelectedPiece(index)
        setValidMoves(getValidMoves(index))
      }
    }
  }

  const handleSquareClick = (from: number, to: number) => {
    const newBoard = [...board]
    const piece = newBoard[from]!
    newBoard[to] = piece
    newBoard[from] = null

    setBoard(newBoard)
    setSelectedPiece(null)
    setValidMoves([])

    const targetCorner = currentPlayer === 1 ? [7, 6, 15, 14, 23, 22, 5, 13, 21] : [56, 57, 48, 49, 40, 41, 58, 50, 42]

    const piecesInTarget = targetCorner.filter((pos) => newBoard[pos]?.player === currentPlayer).length

    if (piecesInTarget === 9) {
      setWinner(currentPlayer)
      handleGameEnd(currentPlayer)
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
    }

    if (matchId) {
      sendMove({ type: "move", from: from, to: to, newBoard })
    }
  }

  const handleGameEnd = (winnerPlayer: number) => {
    if (gameBet > 0 && walletAddress) {
      const isPlayer1Win = winnerPlayer === 1
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

  const resetGame = () => {
    const newBoard: (HalmaPiece | null)[] = Array(64).fill(null)
    const player1Positions = [56, 57, 48, 49, 40, 41, 58, 50, 42]
    player1Positions.forEach((pos) => {
      newBoard[pos] = { player: 1 }
    })
    const player2Positions = [7, 6, 15, 14, 23, 22, 5, 13, 21]
    player2Positions.forEach((pos) => {
      newBoard[pos] = { player: 2 }
    })
    setBoard(newBoard)
    setSelectedPiece(null)
    setValidMoves([])
    setCurrentPlayer(1)
    setWinner(null)
    setShowCoinFlip(true)
    setGameStarted(false)
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
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
      {gameStarted && <LivePlayersBoard gameId="halma" matchId={matchId || ""} />}
      <div className="text-center">
        {winner && (
          <div className="text-xl font-black text-primary neon-pink mb-2">
            {winner === 1 ? "💩 Player 1 Flushed opponent!" : "🚽 Player 2 Flushed opponent!"}
          </div>
        )}
        {!winner && (
          <div className="text-sm font-bold text-muted-foreground mb-2">
            {currentPlayer === 1 ? "💩 Player 1" : "🚽 Player 2"}'s turn
          </div>
        )}
      </div>

      <div className="flex items-center justify-center flex-1 min-h-0 w-full">
        <div
          className="grid grid-cols-8 gap-0 bg-black/30 p-2 rounded border-2 border-primary/50"
          style={{ width: "fit-content" }}
        >
          {board.map((piece, i) => {
            const isLight = (Math.floor(i / 8) + (i % 8)) % 2 === 0
            const isSelected = selectedPiece === i
            const isValidMove = validMoves.includes(i)

            return (
              <button
                key={i}
                onClick={() => handleClick(i)}
                disabled={!!winner || !gameStarted}
                className={`w-12 h-12 flex items-center justify-center rounded transition text-lg font-bold ${
                  isLight ? "bg-primary/20" : "bg-black/60"
                } ${
                  isSelected
                    ? "border-2 border-accent scale-105 shadow-lg shadow-accent/50"
                    : isValidMove
                      ? "border-2 border-dashed border-accent/70 bg-accent/10"
                      : "border border-primary/30"
                } ${winner ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary hover:border-2"}`}
              >
                {piece && <span>{piece.player === 1 ? "💩" : "🚽"}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {winner && (
        <button
          onClick={resetGame}
          className="mt-4 px-6 py-2 bg-primary text-black font-bold text-sm rounded hover:bg-primary/90 transition"
        >
          Play Again
        </button>
      )}
    </div>
  )
}
