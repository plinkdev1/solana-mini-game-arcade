export const COIN_FLIP_CONFIG: Record<string, { playerCount?: number; forcePlayer1?: boolean }> = {
  "tic-tac-toe": { playerCount: 2 },
  checkers: { playerCount: 2 },
  gomoku: { playerCount: 2 },
  "dots-and-boxes": { playerCount: 2 },
  halma: { playerCount: 2 },
  "nine-mens-morris": { playerCount: 2 },
  "peg-solitaire": { playerCount: 1, forcePlayer1: true }, // Solo game - skip
  backgammon: { playerCount: 2 },
  "bubble-flush": { playerCount: 2 },
  "battle-flush": { playerCount: 2 },
  ludo: { playerCount: 2 },
  go: { playerCount: 2 },
  scrabble: { playerCount: 2 },
  "ticket-to-ride": { playerCount: 3 }, // 3-player game
  poker: { playerCount: 2 },
  rummy: { playerCount: 2 },
  uno: { playerCount: 2 },
  dominoes: { playerCount: 2 },
  chess: { playerCount: 2 },
  risk: { playerCount: 3 }, // 3-player game
}

export const performCoinFlip = (playerCount = 2): number => {
  return Math.floor(Math.random() * playerCount) + 1
}
