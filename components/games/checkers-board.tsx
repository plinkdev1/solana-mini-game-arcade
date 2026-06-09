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

interface CheckersPiece {
  player: number
  isKing: boolean
  promotedAt?: number // track when piece was promoted for timer
}

interface BetState {
  treasury: number
  team: number
}

export default function CheckersBoard({ gameBet = 0, matchId }: { gameBet?: number; matchId?: string }) {
  const [board, setBoard] = useState<(CheckersPiece | null)[]>(() => {
    const newBoard: (CheckersPiece | null)[] = Array(64).fill(null)
    for (let i = 0; i < 24; i++) {
      if (Math.floor(i / 8) < 3 && (Math.floor(i / 8) + (i % 8)) % 2 === 1) {
        newBoard[i] = { player: 1, isKing: false }
      }
    }
    for (let i = 40; i < 64; i++) {
      if (Math.floor(i / 8) >= 5 && (Math.floor(i / 8) + (i % 8)) % 2 === 1) {
        newBoard[i] = { player: 2, isKing: false }
      }
    }
    return newBoard
  })

  const [selectedPiece, setSelectedPiece] = useState<number | null>(null)
  const [validMoves, setValidMoves] = useState<number[]>([])
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<number | null>(null)
  const [kingPromotedTime, setKingPromotedTime] = useState<number | null>(null) // track promotion time
  const [timerActive, setTimerActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [chainJumping, setChainJumping] = useState<number | null>(null) // track if mid-chain jump
  const [bets, setBets] = useState<BetState>({ treasury: 0, team: 0 }) // mock betting system
  const [globalTimeLeft, setGlobalTimeLeft] = useState(600) // 10 minutes in seconds
  const [showCoinFlip, setShowCoinFlip] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameMode, setGameMode] = useState<"pvp" | "ai">("pvp")
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "hard">("easy")
  const [showAiDifficultyModal, setShowAiDifficultyModal] = useState(false)

  const { playerWins, playerLoses, walletAddress, updateLeaderboard } = useBettingStore()
  const { mockMode } = useWalletStore()
  const { toast } = useToast()
  const { isSyncing, sendMove, gameState } = useGameP2P(matchId || "")

  useEffect(() => {
    if (gameState) {
      setBoard(gameState.board)
      setSelectedPiece(gameState.selectedPiece)
      setValidMoves(gameState.validMoves)
      setCurrentPlayer(gameState.currentPlayer)
      setGameOver(gameState.gameOver)
      setWinner(gameState.winner)
      setKingPromotedTime(gameState.kingPromotedTime)
      setTimerActive(gameState.timerActive)
      setTimeLeft(gameState.timeLeft)
      setChainJumping(gameState.chainJumping)
      setBets(gameState.bets)
      setGlobalTimeLeft(gameState.globalTimeLeft)
      setShowCoinFlip(gameState.showCoinFlip)
      setGameStarted(gameState.gameStarted)
    }
  }, [gameState])

  useEffect(() => {
    if (gameOver) return
    const interval = setInterval(() => {
      setGlobalTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true)
          setWinner(currentPlayer === 1 ? 2 : 1)
          toast({
            title: "Game Time Expired",
            description: `${currentPlayer === 1 ? "Player 2" : "Player 1"} wins by timeout!`,
            variant: "destructive",
          })
          handleGameEnd(currentPlayer === 1 ? 2 : 1)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [gameOver, currentPlayer])

  useEffect(() => {
    if (!timerActive || gameOver) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true)
          setWinner(currentPlayer === 1 ? 2 : 1)
          toast({
            title: "King Timer Expired",
            description: `${currentPlayer === 1 ? "Player 2" : "Player 1"} wins - king move timeout!`,
            variant: "destructive",
          })
          handleGameEnd(currentPlayer === 1 ? 2 : 1)
          setTimerActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timerActive, gameOver, currentPlayer])

  useEffect(() => {
    if (gameMode === "ai" && gameStarted && !gameOver && currentPlayer === 2) {
      const timer = setTimeout(() => {
        // AI move calculation - Minimax for hard, random for easy
        const validMovesForAI = getValidMoves()
        if (validMovesForAI.length > 0) {
          const selectedMove =
            aiDifficulty === "hard"
              ? selectBestMove(validMovesForAI) // Minimax algorithm
              : validMovesForAI[Math.floor(Math.random() * validMovesForAI.length)]
          handleMove(selectedMove)
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [gameMode, gameStarted, gameOver, currentPlayer, aiDifficulty])

  const getValidMoves = (index: number, mustJump = false) => {
    const piece = board[index]
    if (!piece || piece.player !== currentPlayer) return []

    const row = Math.floor(index / 8)
    const col = index % 8
    const moves: number[] = []
    let hasJumps = false

    const directions = piece.isKing
      ? [
          [-1, -1],
          [-1, 1],
          [1, -1],
          [1, 1],
        ]
      : piece.player === 1
        ? [
            [1, -1],
            [1, 1],
          ]
        : [
            [-1, -1],
            [-1, 1],
          ]

    for (const [dRow, dCol] of directions) {
      let jumpRow = row
      let jumpCol = col

      while (true) {
        jumpRow += dRow
        jumpCol += dCol

        if (jumpRow < 0 || jumpRow >= 8 || jumpCol < 0 || jumpCol >= 8) break

        const jumpIndex = jumpRow * 8 + jumpCol
        const targetPiece = board[jumpIndex]

        if (!targetPiece) {
          // Empty square - check if we can land here after jumping
          if (jumpRow !== row + dRow || jumpCol !== col + dCol) {
            // We've moved at least one square - check if there's an opponent piece behind
            const prevRow = jumpRow - dRow
            const prevCol = jumpCol - dCol
            const prevIndex = prevRow * 8 + prevCol
            const prevPiece = board[prevIndex]

            if (prevPiece && prevPiece.player !== piece.player) {
              moves.push(jumpIndex)
              hasJumps = true
            }
          }
        } else if (targetPiece.player !== piece.player) {
          // Continue along this direction for king multi-jump
          if (piece.isKing) continue
        } else {
          break
        }
      }
    }

    if (!hasJumps && !mustJump && !chainJumping) {
      for (const [dRow, dCol] of directions) {
        if (piece.isKing) {
          for (let dist = 1; dist < 8; dist++) {
            const newRow = row + dRow * dist
            const newCol = col + dCol * dist
            if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break
            const newIndex = newRow * 8 + newCol
            if (!board[newIndex]) {
              moves.push(newIndex)
            } else {
              break
            }
          }
        } else {
          const newRow = row + dRow
          const newCol = col + dCol
          if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const newIndex = newRow * 8 + newCol
            if (!board[newIndex]) {
              moves.push(newIndex)
            }
          }
        }
      }
    }

    return moves
  }

  const executeMove = (from: number, to: number) => {
    const newBoard = [...board]
    const piece = newBoard[from]!
    newBoard[to] = piece
    newBoard[from] = null

    const fromRow = Math.floor(from / 8)
    const fromCol = from % 8
    const toRow = Math.floor(to / 8)
    const toCol = to % 8
    const dRow = toRow - fromRow
    const dCol = toCol - fromCol

    let capturedPieces = 0

    if (Math.abs(dRow) >= 2) {
      const direction = [dRow > 0 ? 1 : -1, dCol > 0 ? 1 : -1]
      let currentRow = fromRow + direction[0]
      let currentCol = fromCol + direction[1]

      while (currentRow !== toRow || currentCol !== toCol) {
        const captureIndex = currentRow * 8 + currentCol
        if (newBoard[captureIndex]) {
          newBoard[captureIndex] = null
          capturedPieces++
        }
        currentRow += direction[0]
        currentCol += direction[1]
      }
    }

    if ((piece.player === 1 && to >= 56) || (piece.player === 2 && to < 8)) {
      piece.isKing = true
      piece.promotedAt = Date.now()
      setKingPromotedTime(Date.now())
      setTimerActive(true)
      setTimeLeft(30)
    }

    return { newBoard, capturedPieces }
  }

  const handleClick = (index: number) => {
    if (gameOver) return

    if (selectedPiece === index) {
      setSelectedPiece(null)
      setValidMoves([])
      return
    }

    if (validMoves.includes(index)) {
      const { newBoard } = executeMove(selectedPiece!, index)
      setBoard(newBoard)
      setSelectedPiece(null)
      setValidMoves([])
      setChainJumping(null)

      // Check for more jumps available (chain jump)
      const moreMoves = getValidMoves(index)
      if (moreMoves.some((move) => Math.abs(Math.floor(move / 8) - Math.floor(index / 8)) >= 2)) {
        // More jumps available - mandatory chain
        setChainJumping(index)
        setSelectedPiece(index)
        setValidMoves(moreMoves)
        return
      }

      // Check game over
      const player1Pieces = newBoard.filter((p) => p?.player === 1).length
      const player2Pieces = newBoard.filter((p) => p?.player === 2).length

      if (player1Pieces === 0) {
        setGameOver(true)
        setWinner(2)
        handleGameEnd(2)
      } else if (player2Pieces === 0) {
        setGameOver(true)
        setWinner(1)
        handleGameEnd(1)
      } else {
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
        setTimerActive(false)
        setTimeLeft(30)
      }

      if (matchId) {
        sendMove({ from: selectedPiece!, to: index, newBoard, capturedPieces: 0 })
      }
    } else {
      const piece = board[index]
      if (piece?.player === currentPlayer) {
        setSelectedPiece(index)
        setValidMoves(getValidMoves(index))
      }
    }
  }

  const resetGame = () => {
    const newBoard: (CheckersPiece | null)[] = Array(64).fill(null)
    for (let i = 0; i < 24; i++) {
      if (Math.floor(i / 8) < 3 && (Math.floor(i / 8) + (i % 8)) % 2 === 1) {
        newBoard[i] = { player: 1, isKing: false }
      }
    }
    for (let i = 40; i < 64; i++) {
      if (Math.floor(i / 8) >= 5 && (Math.floor(i / 8) + (i % 8)) % 2 === 1) {
        newBoard[i] = { player: 2, isKing: false }
      }
    }
    setBoard(newBoard)
    setSelectedPiece(null)
    setValidMoves([])
    setCurrentPlayer(1)
    setGameOver(false)
    setWinner(null)
    setKingPromotedTime(null)
    setTimerActive(false)
    setTimeLeft(30)
    setChainJumping(null)
    setBets({ treasury: 0, team: 0 })
    setGlobalTimeLeft(600)
    setShowCoinFlip(true)
    setGameStarted(false)
  }

  const handleGameEnd = (winnerPlayer: number) => {
    if (gameBet > 0 && walletAddress) {
      const totalPot = gameBet * 2

      const { calculateRake } = useBettingStore.getState()
      const { winnerAmount, treasuryRake, teamRake } = calculateRake(totalPot)

      if (winnerPlayer === 1) {
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

      const playerStats = useBettingStore.getState().getPlayerStats(walletAddress)
      updateLeaderboard({
        id: walletAddress,
        address: walletAddress,
        wins: (playerStats?.wins || 0) + (winnerPlayer === 1 ? 1 : 0),
        losses: (playerStats?.losses || 0) + (winnerPlayer === 1 ? 0 : 1),
        totalEarnings: (playerStats?.totalEarnings || 0) + (winnerPlayer === 1 ? winnerAmount : 0),
        totalBurned: (playerStats?.totalBurned || 0) + (winnerPlayer === 1 ? 0 : gameBet),
      })
    }
  }

  const handleCoinFlipResult = (player: 1 | 2) => {
    setShowCoinFlip(false)
    setCurrentPlayer(player)
    setGameStarted(true)
  }

  const selectBestMove = (validMoves: number[]) => {
    // Minimax for strategy - prefer king moves and captures
    return validMoves.reduce((best, move) => {
      const capturesCount = selectedPiece && board[selectedPiece]?.isKing ? 1 : 0
      const bestCapturesCount = board[best]?.isKing ? 1 : 0
      return capturesCount > bestCapturesCount ? move : best
    })
  }

  const handleMove = (move: { from: number; to: number }) => {
    const { newBoard } = executeMove(move.from, move.to)
    setBoard(newBoard)
    setSelectedPiece(null)
    setValidMoves([])
    setChainJumping(null)

    // Check for more jumps available (chain jump)
    const moreMoves = getValidMoves(move.to)
    if (moreMoves.some((m) => Math.abs(Math.floor(m / 8) - Math.floor(move.to / 8)) >= 2)) {
      // More jumps available - mandatory chain
      setChainJumping(move.to)
      setSelectedPiece(move.to)
      setValidMoves(moreMoves)
      return
    }

    // Check game over
    const player1Pieces = newBoard.filter((p) => p?.player === 1).length
    const player2Pieces = newBoard.filter((p) => p?.player === 2).length

    if (player1Pieces === 0) {
      setGameOver(true)
      setWinner(2)
      handleGameEnd(2)
    } else if (player2Pieces === 0) {
      setGameOver(true)
      setWinner(1)
      handleGameEnd(1)
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
      setTimerActive(false)
      setTimeLeft(30)
    }

    if (matchId) {
      sendMove({ from: move.from, to: move.to, newBoard, capturedPieces: 0 })
    }
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

      <div className="w-full max-w-4xl mx-auto p-4">
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
        {gameStarted && <LivePlayersBoard gameId="checkers" matchId={matchId || ""} />}
        <div className="w-full flex flex-col items-center justify-center gap-4 px-4">
          <div className="text-center">
            {gameOver && (
              <div className="space-y-2">
                <div className="text-xl font-black text-primary neon-pink">
                  {winner === 1 ? "💩 Player 1 Flushed opponent!" : "🚽 Player 2 Fed the Hole"}
                </div>
                {bets.treasury > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Treasury: {bets.treasury} | Team: {bets.team}
                  </div>
                )}
              </div>
            )}
            {!gameOver && !showCoinFlip && (
              <div className="space-y-1">
                <div className="text-sm font-bold text-muted-foreground">
                  {currentPlayer === 1 ? "💩 Player 1" : "🚽 Player 2"}'s turn
                </div>
                <div className="text-xs text-muted-foreground">
                  Game Time: {Math.floor(globalTimeLeft / 60)}:{String(globalTimeLeft % 60).padStart(2, "0")}
                </div>
                {timerActive && (
                  <div className={`text-xs font-bold ${timeLeft <= 10 ? "text-red-500" : "text-yellow-500"}`}>
                    King Timer: {timeLeft}s
                  </div>
                )}
                {chainJumping !== null && <div className="text-xs text-accent">Mandatory chain jump!</div>}
              </div>
            )}
          </div>

          <div className="w-full max-w-md flex justify-center">
            <div
              className="grid grid-cols-8 gap-0 bg-black/30 p-1 rounded border border-primary/30"
              style={{ width: "fit-content" }}
            >
              {board.map((piece, i) => {
                const isBlack = (Math.floor(i / 8) + (i % 8)) % 2 === 1
                const isSelected = selectedPiece === i
                const isValidMove = validMoves.includes(i)

                return (
                  <button
                    key={i}
                    onClick={() => handleClick(i)}
                    disabled={gameOver || !gameStarted}
                    className={`w-10 h-10 flex items-center justify-center rounded border transition text-sm ${
                      isBlack ? "bg-primary/20" : "bg-black/50"
                    } ${
                      isSelected
                        ? "border-accent border-2 scale-105"
                        : isValidMove
                          ? "border-accent/60 border border-dashed"
                          : "border-primary/20"
                    } ${gameOver ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-primary"}`}
                  >
                    {piece && (
                      <span>
                        {piece.player === 1 ? (
                          <span>💩{piece.isKing && "👑"}</span>
                        ) : (
                          <span className="opacity-70">🚽{piece.isKing && "👑"}</span>
                        )}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {gameOver && (
            <button
              onClick={resetGame}
              className="mt-2 px-6 py-2 bg-primary text-black font-bold text-sm rounded hover:bg-primary/90 transition"
            >
              Play Again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
