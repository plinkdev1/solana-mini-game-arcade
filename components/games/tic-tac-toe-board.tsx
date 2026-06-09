"use client"

import React from "react"
import { useState } from "react"
import { useBettingStore } from "@/lib/stores/betting-store"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { endGame, recordGameMove } from "@/lib/supabase/game-service"
import { useGamePowerUps } from "@/hooks/useGamePowerUps"
import { applyPowerUpEffect } from "@/lib/power-ups/game-power-up-handlers"
import { useGameStateStore } from "@/lib/stores/game-state-store"
import GameRoomSelector from "@/components/game-room-selector"
import CoinFlipModal from "@/components/games/coin-flip-modal"
import { useGameP2P } from "@/hooks/useGameP2P"
import { SyncLoadingSpinner } from "@/components/sync-loading-spinner"
import { LivePlayersBoard } from "@/components/live-players-board"
import GameModeSelector from "@/components/game-mode-selector"
import AIDifficultyModal from "@/components/ai-difficulty-modal"
import { MiniMaxAI } from "@/lib/ai/minimax-ai"
import { AIService } from "@/lib/ai/ai-service"

interface TicTacToeBoardProps {
  gameBet?: number
}

export default function TicTacToeBoard({ gameBet = 0 }: TicTacToeBoardProps) {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [winner, setWinner] = useState<string | null>(null)
  const [isDraw, setIsDraw] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<"normal" | "high_roller">("normal")
  const [showCoinFlip, setShowCoinFlip] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameMode, setGameMode] = useState<"p2p" | "ai">("p2p")
  const [aiDifficulty, setAIDifficulty] = useState<"easy" | "hard">("easy")
  const [showAIDifficultyModal, setShowAIDifficultyModal] = useState(false)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [gameStartTime, setGameStartTime] = useState<number | null>(null)

  const { coinFlipResult, currentGameId } = useGameStateStore()
  const { walletAddress, playerWins, playerLoses, updateLeaderboard, calculateRake, getPlayerStats } = useBettingStore()
  const { powerUp, isOpen, checkPowerUpTrigger, applyPowerUp, closePowerUpModal } = useGamePowerUps(gameBet > 0)
  const { toast } = useToast()
  const { syncing, opponentMove, sendMove } = useGameP2P(currentGameId || "", walletAddress || "")

  React.useEffect(() => {
    if (opponentMove) {
      const newBoard = [...board]
      newBoard[opponentMove.index] = opponentMove.player
      setBoard(newBoard)

      const gameWinner = calculateWinner(newBoard)
      if (gameWinner) {
        setWinner(gameWinner)
        setTimeout(() => handleGameEnd(gameWinner), 500)
      } else if (newBoard.every((cell) => cell !== null)) {
        setIsDraw(true)
        setTimeout(handleGameDraw, 500)
      }

      setIsXNext(!isXNext)
    }
  }, [opponentMove])

  React.useEffect(() => {
    if (!isXNext && gameMode === "ai" && gameStarted && !winner && !isDraw) {
      handleAIMove()
    }
  }, [isXNext, gameMode, gameStarted, winner, isDraw])

  const handleCoinFlipResult = (player: 1 | 2) => {
    setShowCoinFlip(false)
    setIsXNext(player === 1)
    setGameStarted(true)
  }

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i]
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }
    return null
  }

  const handleClick = async (index: number) => {
    if (board[index] || winner || isDraw) return

    const newBoard = [...board]
    newBoard[index] = isXNext ? "X" : "O"
    setBoard(newBoard)

    if (gameMode === "p2p" && currentGameId && walletAddress) {
      await recordGameMove(currentGameId, isXNext ? 1 : 2, {
        action: "place",
        data: index,
      })
      await sendMove(index, isXNext ? "X" : "O")
    }

    if (isXNext && gameBet > 0) {
      const triggeredPowerUp = checkPowerUpTrigger()
      if (triggeredPowerUp) {
        let boardAfterPowerUp = [...newBoard]
        boardAfterPowerUp = applyPowerUpEffect("tic-tac-toe", triggeredPowerUp.type, {
          board: boardAfterPowerUp,
          isXNext,
        }).board
        setBoard(boardAfterPowerUp)

        toast({
          title: "✨ Flushed the foe!",
          description: triggeredPowerUp.description,
        })

        applyPowerUp(triggeredPowerUp.id)
      }
    }

    const gameWinner = calculateWinner(newBoard)
    if (gameWinner) {
      setWinner(gameWinner)

      if (gameMode === "ai" && gameStartTime) {
        const duration = Math.round((Date.now() - gameStartTime) / 1000)
        await AIService.recordAIGameResult(walletAddress, "tic-tac-toe", aiDifficulty, {
          playerWon: gameWinner === "X",
          moveCount: newBoard.filter((c) => c !== null).length,
          duration,
        })
      }

      setTimeout(() => handleGameEnd(gameWinner), 500)
    } else if (newBoard.every((cell) => cell !== null)) {
      setIsDraw(true)
    }

    setIsXNext(!isXNext)
  }

  const handleAIMove = async () => {
    if (!gameMode.includes("ai") || !gameStarted || isXNext || isAIThinking) return

    setIsAIThinking(true)

    // Simulate AI thinking delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    let aiMoveIndex: number

    if (aiDifficulty === "easy") {
      // Random move
      const availableMoves = board.map((cell, i) => (cell === null ? i : null)).filter((i) => i !== null) as number[]
      aiMoveIndex = availableMoves[Math.floor(Math.random() * availableMoves.length)]
    } else {
      // Hard - Minimax AI
      aiMoveIndex = MiniMaxAI.calculateBestMove(board, true, "X", "O")
    }

    if (aiMoveIndex === -1) {
      setIsDraw(true)
      setIsAIThinking(false)
      return
    }

    const newBoard = [...board]
    newBoard[aiMoveIndex] = "O"
    setBoard(newBoard)

    const gameWinner = calculateWinner(newBoard)
    if (gameWinner) {
      setWinner(gameWinner)

      if (gameStartTime) {
        const duration = Math.round((Date.now() - gameStartTime) / 1000)
        await AIService.recordAIGameResult(walletAddress, "tic-tac-toe", aiDifficulty, {
          playerWon: gameWinner === "X",
          moveCount: newBoard.filter((c) => c !== null).length,
          duration,
        })
      }

      setTimeout(() => handleGameEnd(gameWinner), 500)
    } else if (newBoard.every((cell) => cell !== null)) {
      setIsDraw(true)
    }

    setIsXNext(true)
    setIsAIThinking(false)
  }

  const handleGameModeChange = (mode: "p2p" | "ai") => {
    setGameMode(mode)
    if (mode === "ai") {
      setShowAIDifficultyModal(true)
      setGameStartTime(Date.now())
    }
  }

  const handleAIDifficultySelect = (difficulty: "easy" | "hard") => {
    setAIDifficulty(difficulty)
    setShowAIDifficultyModal(false)
    setShowCoinFlip(false)
    setGameStarted(true)
    setIsXNext(true) // Player always goes first vs AI
  }

  const handleGameEnd = async (winner: string) => {
    if (gameBet > 0 && walletAddress) {
      const isPlayer1Win = winner === "X"
      const totalPot = gameBet * 2
      const { winnerAmount, treasuryRake, teamRake } = calculateRake(totalPot)

      try {
        const winnerId = isPlayer1Win ? walletAddress : null
        await endGame("tic-tac-toe-game", winnerId, [walletAddress], gameBet)
      } catch (error) {
        console.error("[v0] Failed to end game:", error)
        toast({
          title: "Error",
          description: "Failed to save game result",
          variant: "destructive",
        })
      }

      if (isPlayer1Win) {
        playerWins(true, totalPot)
        toast({
          title: "Flushed opponent!",
          description: `Won ${winnerAmount.toFixed(4)} $DATX! Raked: ${treasuryRake.toFixed(4)} Treasury (7%), ${teamRake.toFixed(4)} Team (3%)`,
        })
      } else {
        playerLoses(walletAddress)
        toast({
          title: "Fed the Hole",
          description: `Lost ${gameBet.toFixed(4)} $DATX. Raked: ${treasuryRake.toFixed(4)} Treasury (7%), ${teamRake.toFixed(4)} Team (3%)`,
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

  const handleGameDraw = () => {
    if (gameBet > 0) {
      toast({
        title: "Draw",
        description: `Draw match. Splits sent to Treasury/Team.`,
      })
    }
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setIsXNext(true)
    setWinner(null)
    setIsDraw(false)
    setShowCoinFlip(gameMode === "p2p")
    setGameStarted(gameMode === "ai")
    setGameStartTime(gameMode === "ai" ? Date.now() : null)
    setIsAIThinking(false)
  }

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <SyncLoadingSpinner visible={syncing} />
      <LivePlayersBoard gameId={currentGameId || ""} playerWallet={walletAddress || ""} />
      <GameRoomSelector onRoomChange={setCurrentRoom} gameBet={gameBet} />
      <CoinFlipModal isOpen={showCoinFlip && !gameStarted} onResult={handleCoinFlipResult} />
      <GameModeSelector onModeChange={handleGameModeChange} />
      <AIDifficultyModal isOpen={showAIDifficultyModal} onSelectDifficulty={handleAIDifficultySelect} />

      {gameStarted && (
        <>
          <div className="text-center">
            {winner && (
              <div className="text-2xl font-black text-primary mb-4">
                {winner === "X" ? "💩 Player 1 Flushed opponent!" : "🚽 Player 2 Flushed opponent!"}
              </div>
            )}
            {isDraw && <div className="text-2xl font-black text-accent mb-4">Draw - Fed the Hole together</div>}
            {!winner && !isDraw && gameMode === "ai" && (
              <div className="text-lg font-bold text-muted-foreground mb-4">
                {isXNext ? "💩 Your turn" : "🤖 El Shito's turn"}
              </div>
            )}
            {!winner && !isDraw && gameMode === "p2p" && (
              <div className="text-lg font-bold text-muted-foreground mb-4">
                {isXNext ? "💩 Player 1" : "🚽 Player 2"}'s turn
              </div>
            )}
            {isAIThinking && gameMode === "ai" && (
              <div className="text-lg font-bold text-purple-400 mb-4 animate-pulse">🤖 El Shito is thinking...</div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 p-4 bg-black/30 rounded border border-primary/30">
            {board.map((cell, i) => (
              <button
                key={i}
                onClick={() => handleClick(i)}
                disabled={!!winner || isDraw || syncing}
                className="w-20 h-20 bg-black/50 border-2 border-primary/50 rounded hover:border-primary hover:bg-primary/10 transition-all flex items-center justify-center text-4xl font-bold cursor-pointer disabled:opacity-75"
              >
                {cell === "X" && <span>💩</span>}
                {cell === "O" && <span>🚽</span>}
              </button>
            ))}
          </div>

          {(winner || isDraw) && (
            <Button
              onClick={resetGame}
              className="mt-4 px-8 py-3 bg-primary text-black font-bold rounded hover:bg-primary/90 transition"
            >
              Play Again
            </Button>
          )}
        </>
      )}
    </div>
  )
}
