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

interface GameState {
  horizontalLines: boolean[][]
  verticalLines: boolean[][]
  boxes: (number | null)[][]
  currentPlayer: number
  scores: { 1: number; 2: number }
  gameOver: boolean
}

export default function DotsAndBoxesBoard({ gameBet = 0, matchId }: { gameBet?: number; matchId?: string }) {
  const GRID_SIZE = 4
  const DOT_SPACING = 100

  const { playerWins, playerLoses, walletAddress, updateLeaderboard, calculateRake } = useBettingStore()
  const { mockMode } = useWalletStore()
  const { toast } = useToast()
  const { isSyncing, sendMove, gameState: receivedGameState } = useGameP2P(matchId || "")

  const [gameState, setGameState] = useState<GameState>({
    horizontalLines: Array(GRID_SIZE + 1)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(false)),
    verticalLines: Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE + 1).fill(false)),
    boxes: Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(null)),
    currentPlayer: 1,
    scores: { 1: 0, 2: 0 },
    gameOver: false,
  })

  const [showCoinFlip, setShowCoinFlip] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)

  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [scores, setScores] = useState({ 1: 0, 2: 0 })
  const [gameOver, setGameOver] = useState(false)

  const [gameMode, setGameMode] = useState<"pvp" | "ai">("pvp")
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "hard">("easy")
  const [showAiDifficultyModal, setShowAiDifficultyModal] = useState(false)

  useEffect(() => {
    if (receivedGameState) {
      setGameState(receivedGameState)
      setCurrentPlayer(receivedGameState.currentPlayer)
      setScores(receivedGameState.scores)
      setGameOver(receivedGameState.gameOver)
    }
  }, [receivedGameState])

  useEffect(() => {
    if (gameMode === "ai" && gameStarted && !gameState.gameOver && gameState.currentPlayer === 2) {
      const timer = setTimeout(() => {
        const availableMoves: Array<{ isHorizontal: boolean; row: number; col: number }> = []

        for (let row = 0; row <= GRID_SIZE; row++) {
          for (let col = 0; col < GRID_SIZE; col++) {
            if (!gameState.horizontalLines[row][col]) {
              availableMoves.push({ isHorizontal: true, row, col })
            }
          }
        }

        for (let row = 0; row < GRID_SIZE; row++) {
          for (let col = 0; col <= GRID_SIZE; col++) {
            if (!gameState.verticalLines[row][col]) {
              availableMoves.push({ isHorizontal: false, row, col })
            }
          }
        }

        if (availableMoves.length > 0) {
          const move = availableMoves[Math.floor(Math.random() * availableMoves.length)]
          handleLineClick(move.isHorizontal, move.row, move.col)
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [gameMode, gameStarted, gameState, aiDifficulty])

  const checkBox = (row: number, col: number): number | null => {
    const state = gameState
    if (
      state.horizontalLines[row][col] &&
      state.horizontalLines[row + 1][col] &&
      state.verticalLines[row][col] &&
      state.verticalLines[row][col + 1]
    ) {
      return gameState.currentPlayer
    }
    return null
  }

  const handleLineClick = (isHorizontal: boolean, row: number, col: number) => {
    if (gameState.gameOver || !gameStarted) return

    const newState = { ...gameState }

    if (isHorizontal) {
      if (newState.horizontalLines[row][col]) return
      newState.horizontalLines[row][col] = true
    } else {
      if (newState.verticalLines[row][col]) return
      newState.verticalLines[row][col] = true
    }

    let boxCompleted = false
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (newState.boxes[r][c] === null) {
          if (
            newState.horizontalLines[r][c] &&
            newState.horizontalLines[r + 1][c] &&
            newState.verticalLines[r][c] &&
            newState.verticalLines[r][c + 1]
          ) {
            newState.boxes[r][c] = gameState.currentPlayer
            boxCompleted = true
          }
        }
      }
    }

    setGameState(newState)

    if (boxCompleted) {
      const newScores = { ...gameState.scores }
      newScores[gameState.currentPlayer as 1 | 2]++
      setGameState({ ...gameState, scores: newScores })

      // Check if game is over
      if (newScores[1] + newScores[2] === GRID_SIZE * GRID_SIZE) {
        setGameState({ ...gameState, gameOver: true })
        handleGameEnd(newScores[1], newScores[2])
      }
    } else {
      setGameState({ ...gameState, currentPlayer: gameState.currentPlayer === 1 ? 2 : 1 })
    }

    if (matchId) {
      sendMove({ type: "line", isHorizontal, row, col, newState, boxCompleted })
    }
  }

  const handleGameEnd = (player1Score: number, player2Score: number) => {
    if (gameBet > 0 && walletAddress) {
      const isPlayer1Win = player1Score > player2Score
      const totalPot = gameBet * 2

      const { winnerAmount, treasuryRake, teamRake } = calculateRake(totalPot)

      if (isPlayer1Win) {
        playerWins(true, totalPot)
        toast({
          title: "Flushed opponent!",
          description: `Won ${winnerAmount.toFixed(4)} $DATX! Raked: ${treasuryRake.toFixed(4)} Treasury, ${teamRake.toFixed(4)} Team`,
        })
      } else if (player2Score > player1Score) {
        playerLoses(walletAddress)
        toast({
          title: "Fed the Hole",
          description: `Lost ${gameBet.toFixed(4)} $DATX. Raked: ${treasuryRake.toFixed(4)} Treasury, ${teamRake.toFixed(4)} Team`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Draw",
          description: `Split draw. Each gets ${(totalPot / 2).toFixed(4)} after rake.`,
        })
      }

      const playerStats = useBettingStore.getState().getPlayerStats(walletAddress)
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
    setGameState({
      horizontalLines: Array(GRID_SIZE + 1)
        .fill(null)
        .map(() => Array(GRID_SIZE).fill(false)),
      verticalLines: Array(GRID_SIZE)
        .fill(null)
        .map(() => Array(GRID_SIZE + 1).fill(false)),
      boxes: Array(GRID_SIZE)
        .fill(null)
        .map(() => Array(GRID_SIZE).fill(null)),
      currentPlayer: 1,
      scores: { 1: 0, 2: 0 },
      gameOver: false,
    })
    setCurrentPlayer(1)
    setScores({ 1: 0, 2: 0 })
    setGameOver(false)
    setShowCoinFlip(true)
    setGameStarted(false)
  }

  const svgSize = DOT_SPACING * (GRID_SIZE + 1)

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
      {gameStarted && <LivePlayersBoard gameId="dots-and-boxes" matchId={matchId || ""} />}
      <div className="text-center">
        {gameState.gameOver && (
          <div className="text-xl font-black text-primary neon-pink mb-2">
            {gameState.scores[1] > gameState.scores[2]
              ? "💩 Player 1 Flushed opponent!"
              : gameState.scores[2] > gameState.scores[1]
                ? "🚽 Player 2 Flushed opponent!"
                : "Draw - Fed the Hole together"}
          </div>
        )}
        <div className="text-sm font-bold text-muted-foreground mb-2">
          💩: {gameState.scores[1]} | 🚽: {gameState.scores[2]}
        </div>
      </div>

      <div className="relative w-full h-full flex items-center justify-center flex-1 overflow-auto">
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="w-auto h-auto bg-black/50 rounded border border-primary/30 max-w-full max-h-full"
          preserveAspectRatio="xMidYMid meet"
          style={{ aspectRatio: "1 / 1" }}
        >
          {/* Dots */}
          {Array(GRID_SIZE + 1)
            .fill(null)
            .map((_, i) =>
              Array(GRID_SIZE + 1)
                .fill(null)
                .map((_, j) => (
                  <circle key={`dot-${i}-${j}`} cx={DOT_SPACING * j} cy={DOT_SPACING * i} r="5" fill="#e91e63" />
                )),
            )}

          {/* Horizontal lines */}
          {gameState.horizontalLines.map((row, i) =>
            row.map((isDrawn, j) => (
              <line
                key={`h-${i}-${j}`}
                x1={DOT_SPACING * j}
                y1={DOT_SPACING * i}
                x2={DOT_SPACING * (j + 1)}
                y2={DOT_SPACING * i}
                stroke={isDrawn ? "#e91e63" : "#e91e63"}
                strokeWidth={isDrawn ? "4" : "2"}
                opacity={isDrawn ? "1" : "0.25"}
                style={{ cursor: "pointer" }}
                onClick={() => handleLineClick(true, i, j)}
              />
            )),
          )}

          {/* Vertical lines */}
          {gameState.verticalLines.map((row, i) =>
            row.map((isDrawn, j) => (
              <line
                key={`v-${i}-${j}`}
                x1={DOT_SPACING * j}
                y1={DOT_SPACING * i}
                x2={DOT_SPACING * j}
                y2={DOT_SPACING * (i + 1)}
                stroke={isDrawn ? "#00ff41" : "#00ff41"}
                strokeWidth={isDrawn ? "4" : "2"}
                opacity={isDrawn ? "1" : "0.25"}
                style={{ cursor: "pointer" }}
                onClick={() => handleLineClick(false, i, j)}
              />
            )),
          )}

          {/* Box fill */}
          {gameState.boxes.map((row, i) =>
            row.map(
              (owner, j) =>
                owner && (
                  <g key={`box-${i}-${j}`}>
                    <rect
                      x={DOT_SPACING * j + 6}
                      y={DOT_SPACING * i + 6}
                      width={DOT_SPACING - 12}
                      height={DOT_SPACING - 12}
                      fill={owner === 1 ? "#e91e6355" : "#00ff4155"}
                      rx="4"
                    />
                    <text
                      x={DOT_SPACING * j + DOT_SPACING / 2}
                      y={DOT_SPACING * i + DOT_SPACING / 2 + 15}
                      textAnchor="middle"
                      fontSize="32"
                      fontFamily="Arial"
                    >
                      {owner === 1 ? "💩" : "🚽"}
                    </text>
                  </g>
                ),
            ),
          )}
        </svg>
      </div>

      {gameState.gameOver && (
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
