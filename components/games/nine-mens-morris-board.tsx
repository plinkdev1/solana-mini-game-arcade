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

interface NMMMPiece {
  player: number
}

const BOARD_POSITIONS: Record<number, [number, number]> = {
  // Outer square
  0: [25, 25],
  1: [100, 25],
  2: [175, 25],
  3: [175, 100],
  4: [175, 175],
  5: [100, 175],
  6: [25, 175],
  7: [25, 100],
  // Middle square
  8: [50, 50],
  9: [100, 50],
  10: [150, 50],
  11: [150, 100],
  12: [150, 150],
  13: [100, 150],
  14: [50, 150],
  15: [50, 100],
  // Inner square
  16: [75, 75],
  17: [100, 75],
  18: [125, 75],
  19: [125, 100],
  20: [125, 125],
  21: [100, 125],
  22: [75, 125],
  23: [75, 100],
}

const ADJACENT_POSITIONS: Record<number, number[]> = {
  0: [1, 7, 8],
  1: [0, 2, 9],
  2: [1, 3, 10],
  3: [2, 4, 11],
  4: [3, 5, 12],
  5: [4, 6, 13],
  6: [5, 7, 14],
  7: [6, 0, 15],
  8: [0, 9, 15, 16],
  9: [1, 8, 10, 17],
  10: [2, 9, 11, 18],
  11: [3, 10, 12, 19],
  12: [4, 11, 13, 20],
  13: [5, 12, 14, 21],
  14: [6, 13, 15, 22],
  15: [7, 14, 8, 23],
  16: [8, 17, 23],
  17: [9, 16, 18],
  18: [10, 17, 19],
  19: [11, 18, 20],
  20: [12, 19, 21],
  21: [13, 20, 22],
  22: [14, 21, 23],
  23: [15, 22, 16],
}

const MILLS: number[][] = [
  [0, 1, 2],
  [2, 3, 4],
  [4, 5, 6],
  [6, 7, 0],
  [8, 9, 10],
  [10, 11, 12],
  [12, 13, 14],
  [14, 15, 8],
  [16, 17, 18],
  [18, 19, 20],
  [20, 21, 22],
  [22, 23, 16],
  [0, 8, 16],
  [2, 10, 18],
  [4, 12, 20],
  [6, 14, 22],
  [1, 9, 17],
  [3, 11, 19],
  [5, 13, 21],
  [7, 15, 23],
]

export default function NineMensMorrisBoard({ gameBet = 0, matchId }: { gameBet?: number; matchId?: string }) {
  const [board, setBoard] = useState<(NMMMPiece | null)[]>(() => {
    const newBoard: (NMMMPiece | null)[] = Array(24).fill(null)
    return newBoard
  })

  const [piecesInHand, setPiecesInHand] = useState({ 1: 9, 2: 9 })
  const [gamePhase, setGamePhase] = useState<"placement" | "movement" | "flying">("placement")
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null)
  const [validMoves, setValidMoves] = useState<number[]>([])
  const [winner, setWinner] = useState<number | null>(null)
  const [justFormed, setJustFormed] = useState(false)
  const [formedMills, setFormedMills] = useState<number[]>([])
  const [showCoinFlip, setShowCoinFlip] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameMode, setGameMode] = useState<"pvp" | "ai">("pvp")
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "hard">("easy")
  const [showAiDifficultyModal, setShowAiDifficultyModal] = useState(false)
  const [lastSelectedPosition, setLastSelectedPosition] = useState<number | null>(null)
  const [gameOver, setGameOver] = useState(false)

  const { playerWins, playerLoses, walletAddress, updateLeaderboard, calculateRake, getPlayerStats } = useBettingStore()
  const { mockMode } = useWalletStore()
  const { toast } = useToast()
  const { isSyncing, sendMove, gameState: receivedGameState } = useGameP2P(matchId || "")

  useEffect(() => {
    if (receivedGameState) {
      setBoard(receivedGameState.board)
      setCurrentPlayer(receivedGameState.currentPlayer)
      setGamePhase(receivedGameState.gamePhase)
      setPiecesInHand(receivedGameState.piecesInHand)
      setWinner(receivedGameState.winner)
      setJustFormed(receivedGameState.justFormed)
    }
  }, [receivedGameState])

  useEffect(() => {
    if (gameMode === "ai" && gameStarted && !gameOver && currentPlayer === 2) {
      const timer = setTimeout(() => {
        // Random AI move for NMM
        const availablePositions = ADJACENT_POSITIONS[lastSelectedPosition || 0] || []
        if (availablePositions.length > 0) {
          const aiMove = availablePositions[Math.floor(Math.random() * availablePositions.length)]
          handlePositionClick(aiMove)
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [gameMode, gameStarted, gameOver, currentPlayer, aiDifficulty, lastSelectedPosition])

  const checkMill = (squares: (NMMMPiece | null)[], index: number, player: number): boolean => {
    for (const mill of MILLS) {
      if (mill.includes(index)) {
        if (mill.every((pos) => squares[pos]?.player === player)) {
          return true
        }
      }
    }
    return false
  }

  const getValidMoves = (index: number): number[] => {
    if (gamePhase === "placement" || gamePhase === "movement") {
      return ADJACENT_POSITIONS[index].filter((pos) => !board[pos])
    } else if (gamePhase === "flying") {
      // Flying phase: can move to any empty position
      return Array.from({ length: 24 }, (_, i) => i).filter((pos) => !board[pos])
    }
    return []
  }

  const handlePlacement = (index: number) => {
    if (board[index] || gamePhase !== "placement") return

    const newBoard = [...board]
    newBoard[index] = { player: currentPlayer }
    setBoard(newBoard)

    const newPiecesInHand = { ...piecesInHand }
    newPiecesInHand[currentPlayer as 1 | 2]--
    setPiecesInHand(newPiecesInHand)

    if (checkMill(newBoard, index, currentPlayer)) {
      setJustFormed(true)
      return
    }

    if (newPiecesInHand[1] === 0 && newPiecesInHand[2] === 0) {
      setGamePhase("movement")
    }

    setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
  }

  const handleRemoval = (index: number) => {
    if (!justFormed || board[index]?.player === currentPlayer) return

    const newBoard = [...board]
    newBoard[index] = null
    setBoard(newBoard)
    setJustFormed(false)
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1)

    const player2Pieces = newBoard.filter((p) => p?.player === 2).length
    if (player2Pieces < 3) {
      setWinner(1)
      handleGameEnd(1)
      return
    }

    const player1Pieces = newBoard.filter((p) => p?.player === 1).length
    if (player1Pieces < 3) {
      setWinner(2)
      handleGameEnd(2)
      return
    }

    checkPhaseTransition(newBoard)
  }

  const checkPhaseTransition = (squares: (NMMMPiece | null)[]) => {
    const player1Pieces = squares.filter((p) => p?.player === 1).length
    const player2Pieces = squares.filter((p) => p?.player === 2).length

    if (player1Pieces < 3 || player2Pieces < 3) {
      if (gamePhase === "movement") {
        setGamePhase("flying")
      }
    }
  }

  const handleMovement = (index: number) => {
    if (selectedPiece === index) {
      setSelectedPiece(null)
      setValidMoves([])
      return
    }

    if (validMoves.includes(index) && selectedPiece !== null) {
      const newBoard = [...board]
      const piece = newBoard[selectedPiece]!
      newBoard[index] = piece
      newBoard[selectedPiece] = null

      setBoard(newBoard)

      if (checkMill(newBoard, index, currentPlayer)) {
        setJustFormed(true)
        setSelectedPiece(null)
        setValidMoves([])
        return
      }

      setSelectedPiece(null)
      setValidMoves([])
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
    } else {
      const piece = board[index]
      if (piece?.player === currentPlayer && (gamePhase === "movement" || gamePhase === "flying")) {
        setSelectedPiece(index)
        const moves = getValidMoves(index)
        setValidMoves(moves)
      }
    }
  }

  const handleClick = (index: number) => {
    if (winner) return
    if (justFormed) {
      handleRemoval(index)
    } else if (gamePhase === "placement") {
      handlePlacement(index)
    } else {
      handleMovement(index)
    }

    if (matchId) {
      const action = justFormed ? "removal" : gamePhase === "placement" ? "placement" : "movement"
      sendMove({ type: action, index })
    }
  }

  const handlePositionClick = (index: number) => {
    if (gameMode === "ai" && currentPlayer === 2) {
      // AI move handling
      handleClick(index)
    }
  }

  const resetGame = () => {
    setBoard(Array(24).fill(null))
    setPiecesInHand({ 1: 9, 2: 9 })
    setGamePhase("placement")
    setCurrentPlayer(1)
    setSelectedPiece(null)
    setValidMoves([])
    setWinner(null)
    setJustFormed(false)
    setFormedMills([])
    setShowCoinFlip(true)
    setGameStarted(false)
    setGameOver(false)
  }

  const handleGameEnd = (winnerPlayer: number) => {
    setGameOver(true)
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
      {gameStarted && <LivePlayersBoard gameId="nine-mens-morris" matchId={matchId || ""} />}
      <div className="text-center">
        {winner && (
          <div className="text-xl font-black text-primary neon-pink mb-2">
            {winner === 1 ? "💩 Player 1 Flushed opponent!" : "🚽 Player 2 Flushed opponent!"}
          </div>
        )}
        {!winner && justFormed && <div className="text-sm font-bold text-accent mb-2">Remove opponent's piece</div>}
        {!winner && !justFormed && (
          <div className="text-sm font-bold text-muted-foreground mb-2">
            {currentPlayer === 1 ? "💩 Player 1" : "🚽 Player 2"}'s turn
            {gamePhase === "flying" && " (Flying)"}
          </div>
        )}
        {gamePhase === "placement" && !winner && (
          <div className="text-xs text-muted-foreground mb-1">
            💩: {piecesInHand[1]} | 🚽: {piecesInHand[2]}
          </div>
        )}
      </div>

      <div className="w-full flex flex-1 min-h-0 items-center justify-center overflow-hidden">
        <svg
          width={240}
          height={240}
          viewBox="0 0 200 200"
          className="bg-black/50 rounded border border-primary/30"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Board lines - three squares */}
          <polyline points="25,25 175,25 175,175 25,175 25,25" fill="none" stroke="#e91e63" strokeWidth="1.5" />
          <polyline points="50,50 150,50 150,150 50,150 50,50" fill="none" stroke="#e91e63" strokeWidth="1.5" />
          <polyline points="75,75 125,75 125,125 75,125 75,75" fill="none" stroke="#e91e63" strokeWidth="1.5" />

          {/* Cross lines connecting midpoints */}
          <line x1="100" y1="25" x2="100" y2="175" stroke="#e91e63" strokeWidth="1.5" />
          <line x1="25" y1="100" x2="175" y2="100" stroke="#e91e63" strokeWidth="1.5" />
          <line x1="50" y1="50" x2="150" y2="150" stroke="#e91e63" strokeWidth="1.5" />
          <line x1="150" y1="50" x2="50" y2="150" stroke="#e91e63" strokeWidth="1.5" />

          {/* Pieces */}
          {board.map((piece, i) => {
            const [x, y] = BOARD_POSITIONS[i]
            const isSelected = selectedPiece === i
            const isValidMove = validMoves.includes(i)
            const isMill = formedMills.includes(i)

            return (
              <g key={`piece-${i}`}>
                {isValidMove && (
                  <circle cx={x} cy={y} r="5" fill="none" stroke="#00ff41" strokeWidth="1" strokeDasharray="2,1" />
                )}
                {isMill && <circle cx={x} cy={y} r="9" fill="none" stroke="#ffd700" strokeWidth="1.5" opacity="0.7" />}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? "8" : "6"}
                  fill={piece ? (piece.player === 1 ? "#e91e63" : "#00ff41") : "transparent"}
                  opacity={piece ? 1 : 0}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleClick(i)}
                />
              </g>
            )
          })}

          {/* Position circles for placement */}
          {Object.entries(BOARD_POSITIONS).map(([idx, [x, y]]) => (
            <circle
              key={`click-${idx}`}
              cx={x}
              cy={y}
              r="12"
              fill="transparent"
              style={{ cursor: "pointer" }}
              onClick={() => handleClick(Number.parseInt(idx))}
            />
          ))}
        </svg>
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
  )
}
