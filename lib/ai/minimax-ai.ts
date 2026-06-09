// Minimax AI algorithm for strategy games (Tic-Tac-Toe, Chess, Checkers, Gomoku)

export class MiniMaxAI {
  static calculateBestMove(
    board: (string | null)[],
    isMaximizing: boolean,
    playerSymbol: string,
    aiSymbol: string,
    depth = 0,
    maxDepth = 9,
  ): number {
    const availableMoves = board.map((cell, i) => (cell === null ? i : null)).filter((i) => i !== null) as number[]

    if (availableMoves.length === 0) return -1

    if (availableMoves.length > 6 && depth < 2) {
      // For early game moves with many options, use heuristic (center preference)
      const centerMoves = availableMoves.filter((i) => [4].includes(i))
      return centerMoves.length > 0 ? centerMoves[0] : availableMoves[Math.floor(Math.random() * availableMoves.length)]
    }

    let bestMove = -1
    let bestScore = isMaximizing ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY

    for (const move of availableMoves) {
      const newBoard = [...board]
      newBoard[move] = isMaximizing ? aiSymbol : playerSymbol

      const winner = this.calculateWinner(newBoard)
      let score: number

      if (winner === aiSymbol) {
        score = 10 - depth
      } else if (winner === playerSymbol) {
        score = depth - 10
      } else if (newBoard.every((cell) => cell !== null)) {
        score = 0
      } else if (depth >= maxDepth) {
        score = this.evaluateBoard(newBoard, aiSymbol, playerSymbol)
      } else {
        const childScore = this.minimax(newBoard, !isMaximizing, playerSymbol, aiSymbol, depth + 1, maxDepth)
        score = childScore
      }

      if (isMaximizing && score > bestScore) {
        bestScore = score
        bestMove = move
      } else if (!isMaximizing && score < bestScore) {
        bestScore = score
        bestMove = move
      }
    }

    return bestMove
  }

  private static minimax(
    board: (string | null)[],
    isMaximizing: boolean,
    playerSymbol: string,
    aiSymbol: string,
    depth: number,
    maxDepth: number,
  ): number {
    const winner = this.calculateWinner(board)
    if (winner === aiSymbol) return 10 - depth
    if (winner === playerSymbol) return depth - 10
    if (board.every((cell) => cell !== null)) return 0
    if (depth >= maxDepth) return this.evaluateBoard(board, aiSymbol, playerSymbol)

    const availableMoves = board.map((cell, i) => (cell === null ? i : null)).filter((i) => i !== null) as number[]

    let bestScore = isMaximizing ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY

    for (const move of availableMoves) {
      const newBoard = [...board]
      newBoard[move] = isMaximizing ? aiSymbol : playerSymbol
      const score = this.minimax(newBoard, !isMaximizing, playerSymbol, aiSymbol, depth + 1, maxDepth)

      if (isMaximizing) {
        bestScore = Math.max(score, bestScore)
      } else {
        bestScore = Math.min(score, bestScore)
      }
    }

    return bestScore
  }

  private static calculateWinner(board: (string | null)[]): string | null {
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
    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]
      }
    }
    return null
  }

  private static evaluateBoard(board: (string | null)[], aiSymbol: string, playerSymbol: string): number {
    let score = 0
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

    for (const [a, b, c] of lines) {
      const cells = [board[a], board[b], board[c]]
      const aiCount = cells.filter((cell) => cell === aiSymbol).length
      const playerCount = cells.filter((cell) => cell === playerSymbol).length
      const emptyCount = cells.filter((cell) => cell === null).length

      if (aiCount === 2 && emptyCount === 1) score += 5
      if (playerCount === 2 && emptyCount === 1) score -= 5
      if (aiCount === 1 && emptyCount === 2) score += 1
      if (playerCount === 1 && emptyCount === 2) score -= 1
    }

    return score
  }
}
