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

const GAME_TYPE = "battleship"
const INITIAL_BET = 0.05
const GRID_SIZE = 10

interface Ship {
  id: string
  cells: string[]
  sunk: boolean
  hits: number
}

interface GameState {
  grid: string[][]
  ships: Ship[]
  hits: Set<string>
  misses: Set<string>
  score: number
  gameOver: boolean
}

const SHIPS = [
  { name: "Battleship", size: 4 },
  { name: "Cruiser", size: 3 },
  { name: "Destroyer", size: 2 },
  { name: "Submarine", size: 2 },
  { name: "Patrol Boat", size: 1 },
]

function initializeGrid(): string[][] {
  return Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill("water"))
}

function placeShipsRandomly(): Ship[] {
  const grid = initializeGrid()
  const ships: Ship[] = []
  let shipId = 0

  for (const shipData of SHIPS) {
    let placed = false
    while (!placed) {
      const horizontal = Math.random() > 0.5
      const row = Math.floor(Math.random() * GRID_SIZE)
      const col = Math.floor(Math.random() * (GRID_SIZE - shipData.size))

      let canPlace = true
      const cells = []

      if (horizontal) {
        for (let i = 0; i < shipData.size; i++) {
          if (grid[row][col + i] !== "water") {
            canPlace = false
            break
          }
          cells.push(`${row}-${col + i}`)
        }
      } else {
        for (let i = 0; i < shipData.size; i++) {
          if (grid[row + i][col] !== "water") {
            canPlace = false
            break
          }
          cells.push(`${row + i}-${col}`)
        }
      }

      if (canPlace) {
        cells.forEach((cell) => {
          const [r, c] = cell.split("-").map(Number)
          grid[r][c] = `ship-${shipId}`
        })
        ships.push({
          id: `ship-${shipId}`,
          cells,
          sunk: false,
          hits: 0,
        })
        shipId++
        placed = true
      }
    }
  }

  return ships
}

export default function BattleFlushBoard({ gameBet = INITIAL_BET, matchId }: { gameBet?: number; matchId?: string }) {
  const [player1Grid, setPlayer1Grid] = useState<string[][]>(initializeGrid())
  const [player2Grid, setPlayer2Grid] = useState<string[][]>(initializeGrid())
  const [player1Ships, setPlayer1Ships] = useState<Ship[]>(placeShipsRandomly())
  const [player2Ships, setPlayer2Ships] = useState<Ship[]>(placeShipsRandomly())
  const [player1Hits, setPlayer1Hits] = useState<Set<string>>(new Set())
  const [player1Misses, setPlayer1Misses] = useState<Set<string>>(new Set())
  const [player2Hits, setPlayer2Hits] = useState<Set<string>>(new Set())
  const [player2Misses, setPlayer2Misses] = useState<Set<string>>(new Set())
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<number | null>(null)
  const [gameId, setGameId] = useState<string>("")
  const [radarUsed, setRadarUsed] = useState({ player1: false, player2: false })
  const { toast } = useToast()

  const [showCoinFlip, setShowCoinFlip] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameMode, setGameMode] = useState<"pvp" | "ai">("pvp")
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "hard">("easy")
  const [showModeSelector, setShowModeSelector] = useState(true)
  const [showDifficultyModal, setShowDifficultyModal] = useState(false)

  const { isSyncing, sendMove, gameState } = useGameP2P(matchId || "")

  useEffect(() => {
    const initGame = async () => {
      const id = await createGame(GAME_TYPE, "player1", "player2", gameBet)
      setGameId(id)
    }
    if (gameStarted) {
      initGame()
    }
  }, [gameBet, gameStarted])

  useEffect(() => {
    if (gameState) {
      setPlayer2Hits(gameState.hits || new Set())
      setPlayer2Misses(gameState.misses || new Set())
    }
  }, [gameState])

  const handleCoinFlipResult = (player: 1 | 2) => {
    setShowCoinFlip(false)
    setCurrentPlayer(player)
    setGameStarted(true)
  }

  const handleGuess = (row: number, col: number) => {
    if (gameOver) return

    const cellKey = `${row}-${col}`
    const targetGrid = currentPlayer === 1 ? player2Grid : player1Grid
    const targetShips = currentPlayer === 1 ? player2Ships : player1Ships
    const playerHits = currentPlayer === 1 ? player1Hits : player2Hits
    const playerMisses = currentPlayer === 1 ? player1Misses : player2Misses
    const setPlayerHits = currentPlayer === 1 ? setPlayer1Hits : setPlayer2Hits
    const setPlayerMisses = currentPlayer === 1 ? setPlayer1Misses : setPlayer2Misses

    if (playerHits.has(cellKey) || playerMisses.has(cellKey)) {
      toast({ title: "Already Guessed", description: "You already targeted this cell" })
      return
    }

    const cellContent = targetGrid[row][col]
    let isHit = false

    if (cellContent !== "water") {
      isHit = true
      const newHits = new Set(playerHits)
      newHits.add(cellKey)
      setPlayerHits(newHits)

      const shipId = cellContent
      const updatedShips = targetShips.map((ship) => {
        if (ship.id === shipId) {
          const newHits = ship.hits + 1
          return { ...ship, hits: newHits, sunk: newHits === ship.cells.length }
        }
        return ship
      })
      currentPlayer === 1 ? setPlayer2Ships(updatedShips) : setPlayer1Ships(updatedShips)

      sendMove({
        type: "guess",
        row,
        col,
        cellKey,
        isHit: true,
        player: currentPlayer,
        timestamp: Date.now(),
      })

      const allSunk = updatedShips.every((ship) => ship.sunk)
      if (allSunk) {
        setGameOver(true)
        setWinner(currentPlayer)
        handleGameEnd(currentPlayer)
      }

      toast({ title: "🎯 Hit!", description: "You hit an enemy ship!" })
    } else {
      isHit = false
      const newMisses = new Set(playerMisses)
      newMisses.add(cellKey)
      setPlayerMisses(newMisses)

      sendMove({
        type: "guess",
        row,
        col,
        cellKey,
        isHit: false,
        player: currentPlayer,
        timestamp: Date.now(),
      })

      toast({ title: "💧 Miss!", description: "No ship here..." })
    }

    setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
  }

  const handleUseRadar = () => {
    if (currentPlayer === 1 && radarUsed.player1) return
    if (currentPlayer === 2 && radarUsed.player2) return

    const targetGrid = currentPlayer === 1 ? player2Grid : player1Grid
    let revealedCell = null

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const cellKey = `${r}-${c}`
        if (targetGrid[r][c] !== "water") {
          const playerHits = currentPlayer === 1 ? player1Hits : player2Hits
          if (!playerHits.has(cellKey)) {
            revealedCell = cellKey
            break
          }
        }
      }
      if (revealedCell) break
    }

    if (revealedCell) {
      toast({ title: "📡 Radar Active", description: `Ship detected at ${revealedCell}!` })
      currentPlayer === 1
        ? setRadarUsed({ ...radarUsed, player1: true })
        : setRadarUsed({ ...radarUsed, player2: true })
    } else {
      toast({ title: "No Ships Found", description: "All remaining ships are hidden" })
    }
  }

  const handleGameEnd = async (winnerPlayer: number) => {
    if (gameId) {
      await updateGameResult(gameId, winnerPlayer, [], gameBet * 0.1)
    }
  }

  const renderGrid = (grid: string[][], isOpponent: boolean) => {
    const hits = isOpponent && currentPlayer === 1 ? player1Hits : isOpponent ? player2Hits : new Set()
    const misses = isOpponent && currentPlayer === 1 ? player1Misses : isOpponent ? player2Misses : new Set()

    return (
      <div
        className="grid gap-1 p-4 bg-black/40 rounded border border-primary/30"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const cellKey = `${r}-${c}`
            const isHit = hits.has(cellKey)
            const isMiss = misses.has(cellKey)
            let bgColor = "bg-slate-800 hover:bg-slate-700"
            let content = ""

            if (isHit) {
              bgColor = "bg-red-600 hover:bg-red-500"
              content = "💥"
            } else if (isMiss) {
              bgColor = "bg-blue-600 hover:bg-blue-500"
              content = "💧"
            } else if (!isOpponent && cell !== "water") {
              bgColor = "bg-green-700 hover:bg-green-600"
              content = "🚽"
            }

            return (
              <button
                key={cellKey}
                onClick={() => isOpponent && handleGuess(r, c)}
                disabled={!isOpponent || gameOver || currentPlayer !== 1}
                className={`w-8 h-8 text-xs font-bold rounded transition ${bgColor} ${isOpponent ? "cursor-pointer" : "cursor-default"}`}
              >
                {content}
              </button>
            )
          }),
        )}
      </div>
    )
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
    <div className="w-full h-screen bg-gray-900 flex flex-col">
      {showModeSelector && <GameModeSelector isOpen={showModeSelector} onSelectMode={handleModeSelect} />}

      {showDifficultyModal && (
        <AIDifficultyModal isOpen={showDifficultyModal} onSelectDifficulty={handleDifficultySelect} />
      )}

      {showCoinFlip && (
        <CoinFlipModal
          gameType="battleship"
          onFlipResult={() => {
            setShowCoinFlip(false)
            setGameStarted(true)
          }}
        />
      )}

      {isSyncing && <SyncLoadingSpinner />}
      <LivePlayersBoard gameId={GAME_TYPE} matchId={matchId || ""} />

      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-primary mb-2">Flush the Fleet</h2>
        <p className="text-accent text-sm">
          Current Player: <span className="font-bold">{currentPlayer === 1 ? "💩 Player 1" : "🚽 Player 2"}</span>
        </p>
        {gameOver && <p className="text-primary font-bold mt-2">Player {winner} wins! 🎉</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-bold text-accent mb-2">Your Fleet (💩)</h3>
          {renderGrid(player1Grid, false)}
        </div>
        <div>
          <h3 className="text-lg font-bold text-primary mb-2">Enemy Fleet (🚽)</h3>
          {renderGrid(player2Grid, true)}
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Button
          onClick={handleUseRadar}
          disabled={gameOver || (currentPlayer === 1 ? radarUsed.player1 : radarUsed.player2)}
          className="bg-accent text-black hover:bg-accent/90 font-bold"
        >
          📡 Radar Swirl (1x)
        </Button>
        <Button
          onClick={() => {
            setGameOver(true)
            setWinner(currentPlayer === 1 ? 2 : 1)
          }}
          disabled={gameOver}
          className="bg-destructive text-white hover:bg-destructive/90 font-bold"
        >
          Surrender
        </Button>
      </div>
    </div>
  )
}
