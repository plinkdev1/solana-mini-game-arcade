// Game-specific power-up effect implementations
// Maps each power-up to its effect logic for different game types

export const GAME_POWER_UP_EFFECTS = {
  // Tic-Tac-Toe: Flush Strike removes opponent piece
  "tic-tac-toe": {
    flush_strike: (gameState: any) => {
      const opponentPiece = gameState.isXNext ? "O" : "X"
      const opponentIndices = gameState.board
        .map((cell: string | null, i: number) => (cell === opponentPiece ? i : -1))
        .filter((i: number) => i !== -1)
      if (opponentIndices.length > 0) {
        const randomIndex = opponentIndices[Math.floor(Math.random() * opponentIndices.length)]
        gameState.board[randomIndex] = null
      }
      return gameState
    },
    poop_swirl: (gameState: any) => {
      const xIndices = gameState.board
        .map((cell: string | null, i: number) => (cell === "X" ? i : -1))
        .filter((i: number) => i !== -1)
      const oIndices = gameState.board
        .map((cell: string | null, i: number) => (cell === "O" ? i : -1))
        .filter((i: number) => i !== -1)
      let xIdx: number, oIdx: number
      if (xIndices.length > 0 && oIndices.length > 0) {
        xIdx = xIndices[Math.floor(Math.random() * xIndices.length)]
        oIdx = oIndices[Math.floor(Math.random() * oIndices.length)][(gameState.board[xIdx], gameState.board[oIdx])] = [
          gameState.board[oIdx],
          gameState.board[xIdx],
        ]
      }
      return gameState
    },
  },

  // Battleship: Radar Swirl reveals opponent square
  battleship: {
    flush_strike: (gameState: any) => {
      // Remove random opponent ship part
      if (gameState.opponentGrid && gameState.opponentGrid.length > 0) {
        const row = Math.floor(Math.random() * 10)
        const col = Math.floor(Math.random() * 10)
        gameState.opponentGrid[row][col] = null
      }
      return gameState
    },
  },

  // Bubble Flush: Flush Strike removes bubble
  "bubble-flush": {
    flush_strike: (gameState: any) => {
      const opponentBubbles = gameState.bubbles.filter((b: any) => !b.isPlayer1)
      if (opponentBubbles.length > 0) {
        const randomIndex = Math.floor(Math.random() * opponentBubbles.length)
        gameState.bubbles = gameState.bubbles.filter((b: any, i: number) => i !== randomIndex)
      }
      return gameState
    },
    poop_swirl: (gameState: any) => {
      if (gameState.bubbles.length >= 2) {
        const idx1 = Math.floor(Math.random() * gameState.bubbles.length)
        let idx2 = Math.floor(Math.random() * gameState.bubbles.length)
        while (idx2 === idx1)
          idx2 = Math.floor(Math.random() * gameState.bubbles.length)[
            (gameState.bubbles[idx1], gameState.bubbles[idx2])
          ] = [gameState.bubbles[idx2], gameState.bubbles[idx1]]
      }
      return gameState
    },
  },

  // Poker: Bandana Blind hides opponent hand
  poker: {
    bandana_blind: (gameState: any) => {
      gameState.opponentHandHidden = true
      setTimeout(() => {
        gameState.opponentHandHidden = false
      }, 5000)
      return gameState
    },
  },

  // Dominoes: Clog Jam blocks a domino
  dominoes: {
    clog_jam: (gameState: any) => {
      if (gameState.chain && gameState.chain.length > 0) {
        const randomIdx = Math.floor(Math.random() * gameState.chain.length)
        gameState.blockedIndex = randomIdx
        setTimeout(() => {
          gameState.blockedIndex = null
        }, 3000)
      }
      return gameState
    },
  },

  // Go: Flush Strike removes opponent stone
  go: {
    flush_strike: (gameState: any) => {
      const opponentStones = gameState.board.filter((b: any) => b.color === "white")
      if (opponentStones.length > 0) {
        const randomIndex = Math.floor(Math.random() * opponentStones.length)
        gameState.board[randomIndex] = null
      }
      return gameState
    },
  },

  // Default for all other games
  default: {
    flush_strike: (gameState: any) => {
      console.log("[v0] Flush Strike activated!")
      return gameState
    },
    bandana_blind: (gameState: any) => {
      console.log("[v0] Bandana Blind activated!")
      return gameState
    },
    poop_swirl: (gameState: any) => {
      console.log("[v0] Poop Swirl activated!")
      return gameState
    },
    plunger_pull: (gameState: any) => {
      console.log("[v0] Plunger Pull activated!")
      return gameState
    },
    reserve_hole: (gameState: any) => {
      console.log("[v0] Reserve Hole Boost activated!")
      return gameState
    },
    clog_jam: (gameState: any) => {
      console.log("[v0] Clog Jam activated!")
      return gameState
    },
    neon_hallucination: (gameState: any) => {
      console.log("[v0] Neon Drip Hallucination activated!")
      return gameState
    },
  },
}

export function getGamePowerUpHandler(gameType: string) {
  return GAME_POWER_UP_EFFECTS[gameType as keyof typeof GAME_POWER_UP_EFFECTS] || GAME_POWER_UP_EFFECTS.default
}

export function applyPowerUpEffect(gameType: string, powerUpType: string, gameState: any) {
  const handler = getGamePowerUpHandler(gameType)
  const effect = handler[powerUpType as keyof typeof handler]
  if (effect) {
    return effect(gameState)
  }
  return gameState
}
