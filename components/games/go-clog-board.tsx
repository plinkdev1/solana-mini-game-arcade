"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { createGame, updateGameResult } from "@/lib/supabase/game-service"
import { CoinFlipModal } from "@/components/games/coin-flip-modal"
import { useGameP2P } from "@/hooks/useGameP2P"
import { SyncLoadingSpinner } from "@/components/sync-loading-spinner"
import { LivePlayersBoard } from "@/components/live-players-board"
import GameModeSelector from "@/components/game-mode-selector"
import AIDifficultyModal from "@/components/ai-difficulty-modal"

const GAME_TYPE = "go"
const INITIAL_BET = 0.1
const BOARD_SIZE = 19
const KOMI = 6.5 // Standard handicap for white

interface Stone {
  x: number
  y: number
  color: "black" | "white"
}

interface GameState {
  board: (Stone | null)[][]
  currentPlayer: "black" | "white"
  capturedBlack: number
  capturedWhite: number
  gameOver: boolean
  winner: "black" | "white" | null
  moveHistory: string[]
  plungerDoubleActive: boolean
}

function initializeBoard(): (Stone | null)[][] {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null))
}

export default function GoClogBoard({ gameBet = INITIAL_BET, matchId }: { gameBet?: number; matchId?: string }) {
  const [gameState, setGameState] = useState<GameState>({
    board: initializeBoard(),
    currentPlayer: "black",
    capturedBlack: 0,
    capturedWhite: 0,
    gameOver: false,
    winner: null,
    moveHistory: [],
    plungerDoubleActive: false,
  })
  const [gameId, setGameId] = useState<string>("")
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
    if (!gameStarted) {
      initGame()
    }
  }, [gameBet, gameStarted])

  const handleCoinFlipResult = (player: 1 | 2) => {
    setShowCoinFlip(false)
    setGameState((prev) => ({ ...prev, currentPlayer: player === 1 ? "black" : "white" }))
    setGameStarted(true)
  }

  const handleGameModeSelect = (mode: "pvp" | "ai") => {
    setGameMode(mode)
    if (mode === "ai") {
      setShowAiDifficultyModal(true)
    }
  }

  const isValidMove = (x: number, y: number): boolean => {
    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) return false
    return gameState.board[y][x] === null
  }

  const getAdjacentPoints = (x: number, y: number): [number, number][] => {
    const adjacent: [number, number][] = []
    if (x > 0) adjacent.push([x - 1, y])
    if (x < BOARD_SIZE - 1) adjacent.push([x + 1, y])
    if (y > 0) adjacent.push([x, y - 1])
    if (y < BOARD_SIZE - 1) adjacent.push([x, y + 1])
    return adjacent
  }

  const captureStones = (board: (Stone | null)[][], x: number, y: number, color: "black" | "white") => {
    const opponent = color === "black" ? "white" : "black"
    const captured: [number, number][] = []

    for (const [adjX, adjY] of getAdjacentPoints(x, y)) {
      if (board[adjY][adjX]?.color === opponent) {
        if (hasNoLiberties(board, adjX, adjY)) {
          removeGroup(board, adjX, adjY, opponent)
          captured.push([adjX, adjY])
        }
      }
    }

    return captured.length
  }

  const hasNoLiberties = (board: (Stone | null)[][], x: number, y: number): boolean => {
    for (const [adjX, adjY] of getAdjacentPoints(x, y)) {
      if (board[adjY][adjX] === null) return false
    }
    return true
  }

  const removeGroup = (board: (Stone | null)[][], x: number, y: number, color: "black" | "white") => {
    if (board[y][x]?.color !== color) return

    board[y][x] = null

    for (const [adjX, adjY] of getAdjacentPoints(x, y)) {
      removeGroup(board, adjX, adjY, color)
    }
  }

  const placeStone = (x: number, y: number) => {
    if (gameState.gameOver || !isValidMove(x, y)) return

    const newBoard = gameState.board.map((row) => [...row])
    const color = gameState.currentPlayer

    newBoard[y][x] = { x, y, color }

    const captured = captureStones(newBoard, x, y, color)

    const updatedCapturedBlack = gameState.capturedBlack + (color === "white" ? captured : 0)
    const updatedCapturedWhite = gameState.capturedWhite + (color === "black" ? captured : 0)

    const moveKey = `${color[0]}${String.fromCharCode(97 + x)}${y + 1}`

    setGameState((prev) => ({
      ...prev,
      board: newBoard,
      currentPlayer: prev.currentPlayer === "black" ? "white" : "black",
      capturedBlack: updatedCapturedBlack,
      capturedWhite: updatedCapturedWhite,
      moveHistory: [...prev.moveHistory, moveKey],
    }))

    sendMove({ type: "stone_placed", x, y, color, captured })

    toast({
      title: `${color === "black" ? "🫐" : "⚪"} Stone Placed`,
      description: `Player ${gameState.currentPlayer} clogged territory.`,
    })
  }

  const calculateTerritory = (): { blackTerritory: number; whiteTerritory: number } => {
    let blackTerritory = gameState.capturedBlack
    let whiteTerritory = gameState.capturedWhite + Math.floor(KOMI * 2)

    const visited = new Set<string>()

    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const key = `${x},${y}`
        if (gameState.board[y][x] === null && !visited.has(key)) {
          const territory = floodFill(x, y, visited)
          if (territory.owner === "black") blackTerritory += territory.size
          if (territory.owner === "white") whiteTerritory += territory.size
        }
      }
    }

    return { blackTerritory, whiteTerritory }
  }

  const floodFill = (
    startX: number,
    startY: number,
    visited: Set<string>,
  ): { size: number; owner: "black" | "white" | "neutral" } => {
    const queue: [number, number][] = [[startX, startY]]
    const territory: [number, number][] = []
    const borderColors = new Set<"black" | "white">()

    while (queue.length > 0) {
      const [x, y] = queue.shift()!
      const key = `${x},${y}`

      if (visited.has(key) || x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) continue

      visited.add(key)

      if (gameState.board[y][x] !== null) {
        borderColors.add(gameState.board[y][x]!.color)
        continue
      }

      territory.push([x, y])

      for (const [adjX, adjY] of getAdjacentPoints(x, y)) {
        const adjKey = `${adjX},${adjY}`
        if (!visited.has(adjKey)) {
          queue.push([adjX, adjY])
        }
      }
    }

    const owner = borderColors.size === 1 ? Array.from(borderColors)[0] : "neutral"

    return { size: territory.length, owner }
  }

  const endGame = async () => {
    const { blackTerritory, whiteTerritory } = calculateTerritory()
    const winner: "black" | "white" = blackTerritory > whiteTerritory ? "black" : "white"

    setGameState((prev) => ({
      ...prev,
      gameOver: true,
      winner,
    }))

    const rakeAmount = gameBet * 0.1
    const treasuryAmount = rakeAmount * 0.7
    const teamAmount = rakeAmount * 0.3

    await updateGameResult(
      gameId,
      winner === "black" ? 1 : 2,
      {
        blackTerritory,
        whiteTerritory,
        moves: gameState.moveHistory,
        capturedBlack: gameState.capturedBlack,
        capturedWhite: gameState.capturedWhite,
      },
      treasuryAmount,
    )

    toast({
      title: `🫐 ${winner === "black" ? "Black" : "White"} Wins!`,
      description: `Final: Black ${blackTerritory} vs White ${whiteTerritory}. Rake: $${rakeAmount.toFixed(2)} DATX`,
    })
  }

  const passMove = () => {
    setGameState((prev) => ({
      ...prev,
      currentPlayer: prev.currentPlayer === "black" ? "white" : "black",
      moveHistory: [...prev.moveHistory, `${gameState.currentPlayer[0]}pass`],
    }))
    sendMove({ type: "pass" })
  }

  const activatePlungerDouble = () => {
    setGameState((prev) => ({
      ...prev,
      plungerDoubleActive: true,
    }))
    toast({
      title: "🪠 Clog Territory Activated!",
      description: "Block an area and capture more stones!",
    })
  }

  const { blackTerritory, whiteTerritory } = calculateTerritory()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {showCoinFlip && (
        <div className="mb-4">
          <GameModeSelector onSelectMode={handleGameModeSelect} selectedMode={gameMode} />
        </div>
      )}

      {showCoinFlip && <CoinFlipModal onResult={handleCoinFlipResult} playerCount={2} />}
      {isSyncing && <SyncLoadingSpinner />}
      {gameStarted && <LivePlayersBoard gameId={GAME_TYPE} matchId={matchId || ""} />}
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="mb-6 flex justify-between items-center">
          <div className="text-center flex-1">
            <div className="text-sm font-bold text-muted-foreground mb-1">Black Player</div>
            <div className="text-2xl font-black text-primary">🫐 {blackTerritory}</div>
            <div className="text-xs text-accent">Captured: {gameState.capturedBlack}</div>
          </div>

          <div className="text-center px-4">
            <div className="text-sm font-bold text-accent mb-2">
              {gameState.gameOver ? "⚔️ Game Over" : `${gameState.currentPlayer === "black" ? "🫐" : "⚪"}'s Turn`}
            </div>
            {gameState.winner && (
              <div className="text-lg font-black text-primary">{gameState.winner === "black" ? "🫐" : "⚪"} Wins!</div>
            )}
          </div>

          <div className="text-center flex-1">
            <div className="text-sm font-bold text-muted-foreground mb-1">White Player</div>
            <div className="text-2xl font-black text-accent">⚪ {whiteTerritory}</div>
            <div className="text-xs text-accent">Captured: {gameState.capturedWhite}</div>
          </div>
        </div>

        <div className="bg-black/80 border-2 border-primary/30 rounded-lg p-4 mb-6 overflow-x-auto">
          <div
            className="inline-block"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
              gap: "0px",
            }}
          >
            {gameState.board.map((row, y) =>
              row.map((stone, x) => (
                <div
                  key={`${x}-${y}`}
                  onClick={() => placeStone(x, y)}
                  className={`
                    w-8 h-8 border border-primary/20 flex items-center justify-center cursor-pointer
                    transition-all duration-200 hover:bg-primary/20 relative
                    ${x === 0 ? "border-l-2" : ""} ${x === BOARD_SIZE - 1 ? "border-r-2" : ""}
                    ${y === 0 ? "border-t-2" : ""} ${y === BOARD_SIZE - 1 ? "border-b-2" : ""}
                  `}
                >
                  {stone ? (
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg ${
                        stone.color === "black"
                          ? "bg-black border-2 border-primary text-primary"
                          : "bg-white border-2 border-accent text-accent"
                      }`}
                    >
                      {stone.color === "black" ? "●" : "○"}
                    </div>
                  ) : (
                    <div className="w-1 h-1 bg-primary/30 rounded-full" />
                  )}
                </div>
              )),
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          <Button
            onClick={passMove}
            disabled={gameState.gameOver}
            className="bg-accent/50 text-black hover:bg-accent/70 font-bold"
          >
            Pass Turn
          </Button>
          <Button
            onClick={activatePlungerDouble}
            disabled={gameState.gameOver || gameState.plungerDoubleActive}
            className="bg-primary/50 text-black hover:bg-primary/70 font-bold"
          >
            🪠 Clog Territory (Block Area)
          </Button>
          <Button
            onClick={endGame}
            disabled={gameState.gameOver}
            className="bg-primary text-black hover:bg-primary/90 font-bold ml-auto"
          >
            End Game & Score
          </Button>
        </div>

        <div className="text-xs text-muted-foreground bg-black/40 p-3 rounded border border-primary/20">
          <div className="font-bold text-accent mb-2">Moves: {gameState.moveHistory.length}</div>
          <div className="break-words">{gameState.moveHistory.join(" → ") || "Game just started..."}</div>
        </div>
      </div>
      <AIDifficultyModal
        open={showAiDifficultyModal}
        onOpenChange={setShowAiDifficultyModal}
        onSelectDifficulty={(difficulty) => {
          setAiDifficulty(difficulty)
          setShowAiDifficultyModal(false)
        }}
      />
    </div>
  )
}
