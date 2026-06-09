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

const GAME_TYPE = "scrabble"
const INITIAL_BET = 0.06
const BOARD_SIZE = 15
const RACK_SIZE = 7

const LETTER_VALUES: Record<string, number> = {
  A: 1,
  B: 3,
  C: 3,
  D: 2,
  E: 1,
  F: 4,
  G: 2,
  H: 4,
  I: 1,
  J: 8,
  K: 5,
  L: 1,
  M: 3,
  N: 1,
  O: 1,
  P: 3,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  V: 4,
  W: 4,
  X: 8,
  Y: 4,
  Z: 10,
}

const LORE_WORDS: Record<string, number> = {
  FLUSH: 50,
  CLOG: 40,
  POOP: 30,
  SEWER: 35,
  LEAK: 25,
  PLUNGE: 45,
}

const ALL_LETTERS = "AAAAAAAABBCCDDDDEEEEEEEEEFFGGGHHIIIIIIIJKLLLLMMNNNNNNOOOOOOPPPQRRRRRRSSSSTTTTUUUUVVWWXYYZ"

interface Tile {
  letter: string
  value: number
}

interface BoardPosition {
  row: number
  col: number
  letter?: string
}

interface GameState {
  board: (string | null)[][]
  player1Rack: Tile[]
  player2Rack: Tile[]
  player1Score: number
  player2Score: number
  currentPlayer: 1 | 2
  gameOver: boolean
  winner: 1 | 2 | null
  moveHistory: string[]
  selectedTiles: Set<string>
  swirlTripleActive: boolean
}

function initializeBoard(): (string | null)[][] {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null))
}

function getRandomLetter(): string {
  return ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)]
}

function initializeRack(): Tile[] {
  const rack: Tile[] = []
  for (let i = 0; i < RACK_SIZE; i++) {
    const letter = getRandomLetter()
    rack.push({ letter, value: LETTER_VALUES[letter] || 0 })
  }
  return rack
}

export default function ScrabbleShitBoard({ gameBet = INITIAL_BET, matchId }: { gameBet?: number; matchId?: string }) {
  const [gameState, setGameState] = useState<GameState>({
    board: initializeBoard(),
    player1Rack: initializeRack(),
    player2Rack: initializeRack(),
    player1Score: 0,
    player2Score: 0,
    currentPlayer: 1,
    gameOver: false,
    winner: null,
    moveHistory: [],
    selectedTiles: new Set(),
    swirlTripleActive: false,
  })
  const [gameId, setGameId] = useState<string>("")
  const [draggedTile, setDraggedTile] = useState<{ index: number; letter: string } | null>(null)
  const [showCoinFlip, setShowCoinFlip] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameMode, setGameMode] = useState<"pvp" | "ai">("pvp")
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "hard">("easy")
  const [showAiDifficultyModal, setShowAiDifficultyModal] = useState(false)
  const { toast } = useToast()
  const { isSyncing, sendMove, gameState: receivedState } = useGameP2P(matchId || "")

  useEffect(() => {
    const initGame = async () => {
      const id = await createGame(GAME_TYPE, "player1", "player2", gameBet)
      setGameId(id)
    }
    initGame()
  }, [gameBet])

  useEffect(() => {
    if (receivedState?.board) {
      setGameState(receivedState as GameState)
    }
  }, [receivedState])

  const calculateWordScore = (word: string): number => {
    let score = 0
    for (const letter of word) {
      score += LETTER_VALUES[letter] || 0
    }

    // Check for lore words
    if (LORE_WORDS[word]) {
      score += LORE_WORDS[word]
    }

    // Apply Swirl Triple if active
    if (gameState.swirlTripleActive) {
      score *= 3
    }

    return score
  }

  const isValidWord = (word: string): boolean => {
    return word.length >= 2 && /^[A-Z]+$/.test(word)
  }

  const placeTile = (row: number, col: number, letter: string) => {
    if (gameState.gameOver || gameState.board[row][col] !== null) {
      toast({ title: "Invalid placement", description: "Space already occupied" })
      return
    }

    const newBoard = gameState.board.map((r) => [...r])
    newBoard[row][col] = letter

    const currentRack = gameState.currentPlayer === 1 ? gameState.player1Rack : gameState.player2Rack
    const rackIndex = currentRack.findIndex((t) => t.letter === letter)

    if (rackIndex === -1) {
      toast({ title: "Invalid move", description: "Tile not in rack" })
      return
    }

    const newRack = [...currentRack]
    newRack.splice(rackIndex, 1)
    newRack.push({ letter: getRandomLetter(), value: LETTER_VALUES[getRandomLetter()] || 0 })

    setGameState((prev) => ({
      ...prev,
      board: newBoard,
      [gameState.currentPlayer === 1 ? "player1Rack" : "player2Rack"]: newRack,
    }))
  }

  const submitWord = () => {
    let word = ""
    let score = 0

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (gameState.board[row][col]) {
          word += gameState.board[row][col]
        }
      }
    }

    if (word.length === 0) {
      toast({ title: "No word placed", description: "Place tiles to form a word" })
      return
    }

    score = calculateWordScore(word)

    const newState = { ...gameState }
    if (gameState.currentPlayer === 1) {
      newState.player1Score += score
    } else {
      newState.player2Score += score
    }

    newState.moveHistory.push(`Player ${gameState.currentPlayer}: ${word} (+${score})`)

    if (newState.player1Score >= 500 || newState.player2Score >= 500) {
      newState.gameOver = true
      newState.winner = newState.player1Score > newState.player2Score ? 1 : 2
      handleGameEnd(newState.winner)
    } else {
      newState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1
    }

    setGameState(newState)
    sendMove({ type: "word_submitted", word, score })
    toast({ title: "Word placed", description: `${word} +${score} points!` })
  }

  const handleGameEnd = async (winner: 1 | 2) => {
    if (!gameId) return
    await updateGameResult(gameId, winner, gameState.moveHistory.join("\n"), gameBet * 0.1)
  }

  const toggleSwirlTriple = () => {
    if (gameState.swirlTripleActive) {
      toast({ title: "Swirl Triple", description: "Already active!" })
      return
    }
    setGameState((prev) => ({
      ...prev,
      swirlTripleActive: true,
    }))
  }

  const handleDragStart = (index: number, letter: string) => {
    setDraggedTile({ index, letter })
  }

  const handleDrop = (row: number, col: number) => {
    if (draggedTile) {
      placeTile(row, col, draggedTile.letter)
      setDraggedTile(null)
    }
  }

  const handleCoinFlipResult = (player: 1 | 2) => {
    setShowCoinFlip(false)
    setGameState((prev) => ({ ...prev, currentPlayer: player }))
    setGameStarted(true)
  }

  const handleGameModeSelect = (mode: "pvp" | "ai") => {
    setGameMode(mode)
    if (mode === "ai") {
      setShowAiDifficultyModal(true)
    }
  }

  const currentRack = gameState.currentPlayer === 1 ? gameState.player1Rack : gameState.player2Rack
  const currentScore = gameState.currentPlayer === 1 ? gameState.player1Score : gameState.player2Score

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {showCoinFlip && (
        <div className="mb-4">
          <GameModeSelector onSelectMode={handleGameModeSelect} selectedMode={gameMode} />
        </div>
      )}

      <AIDifficultyModal
        open={showAiDifficultyModal}
        onOpenChange={setShowAiDifficultyModal}
        onSelectDifficulty={(difficulty) => {
          setAiDifficulty(difficulty)
          setShowAiDifficultyModal(false)
        }}
      />

      {showCoinFlip && <CoinFlipModal onResult={handleCoinFlipResult} playerCount={2} />}
      {isSyncing && <SyncLoadingSpinner />}

      {gameStarted && <LivePlayersBoard gameId={GAME_TYPE} matchId={matchId || ""} />}

      <div className="grid grid-cols-2 gap-4">
        <div
          className={`p-4 rounded border-2 ${
            gameState.currentPlayer === 1 ? "border-primary/80 bg-primary/10" : "border-primary/30 bg-black/40"
          }`}
        >
          <p className="text-sm text-muted-foreground">Player 1</p>
          <p className="text-2xl font-black text-primary">{gameState.player1Score}</p>
        </div>
        <div
          className={`p-4 rounded border-2 ${
            gameState.currentPlayer === 2 ? "border-accent/80 bg-accent/10" : "border-accent/30 bg-black/40"
          }`}
        >
          <p className="text-sm text-muted-foreground">Player 2</p>
          <p className="text-2xl font-black text-accent">{gameState.player2Score}</p>
        </div>
      </div>

      <div
        className="grid gap-0 p-4 rounded border-2 border-primary/50 bg-black/40 mx-auto"
        style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}
      >
        {gameState.board.map((row, rowIdx) =>
          row.map((cell, colIdx) => (
            <div
              key={`${rowIdx}-${colIdx}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(rowIdx, colIdx)}
              className="w-8 h-8 bg-black border border-primary/30 flex items-center justify-center cursor-pointer hover:bg-primary/10 transition"
            >
              {cell && <span className="font-black text-primary text-sm">{cell}</span>}
            </div>
          )),
        )}
      </div>

      <div className="p-4 bg-black/40 border-2 border-accent/50 rounded">
        <p className="text-xs text-muted-foreground mb-2">Your Rack (Value)</p>
        <div className="flex gap-2 flex-wrap">
          {currentRack.map((tile, idx) => (
            <div
              key={idx}
              draggable
              onDragStart={() => handleDragStart(idx, tile.letter)}
              className="w-10 h-10 bg-accent/80 border-2 border-accent rounded flex items-center justify-center font-black cursor-move hover:bg-accent transition text-black"
            >
              <div className="flex flex-col items-center">
                <span className="text-sm">{tile.letter}</span>
                <span className="text-xs">{tile.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={submitWord} className="flex-1 bg-primary text-black hover:bg-primary/90 font-bold">
          Submit Word
        </Button>
        <Button
          onClick={toggleSwirlTriple}
          variant="outline"
          className="border-accent text-accent hover:bg-accent/10 bg-transparent"
        >
          Swirl Triple (3x)
        </Button>
      </div>

      {gameState.gameOver && (
        <div className="p-4 bg-primary/20 border-2 border-primary rounded text-center">
          <p className="text-lg font-black text-primary">
            Player {gameState.winner} Wins! Final Score: {gameState.player1Score} - {gameState.player2Score}
          </p>
        </div>
      )}
    </div>
  )
}
