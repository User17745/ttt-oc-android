import { useState, useCallback, useEffect } from 'react'
import './App.css'

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

function calculateWinner(board) {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a], line: [a, b, c] }
    }
  }
  return null
}

function isDraw(board) {
  return board.every(cell => cell !== null)
}

function getAIMove(board) {
  const empty = board.map((v, i) => v === null ? i : -1).filter(i => i >= 1)
  if (empty.length === 0) return -1

  const tryMove = (mark) => {
    for (const i of empty) {
      const test = [...board]
      test[i] = mark
      if (calculateWinner(test)) return i
    }
    return -1
  }

  let move = tryMove('O')
  if (move >= 0) return move
  move = tryMove('X')
  if (move >= 0) return move
  if (board[4] === null) return 4

  const corners = [0, 2, 6, 8].filter(i => board[i] === null)
  if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)]

  return empty[Math.floor(Math.random() * empty.length)]
}

export default function App() {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 })
  const [vsAI, setVsAI] = useState(false)
  const [lastMove, setLastMove] = useState(-1)
  const [showResult, setShowResult] = useState(false)

  const result = calculateWinner(board)
  const draw = !result && isDraw(board)
  const gameOver = !!result || draw
  const winner = result?.player

  useEffect(() => {
    if (gameOver && !showResult) {
      const timer = setTimeout(() => {
        setShowResult(true)
        if (winner) {
          setScores(s => ({ ...s, [winner]: s[winner] + 1 }))
        } else {
          setScores(s => ({ ...s, draws: s.draws + 1 }))
        }
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [gameOver, showResult, winner])

  useEffect(() => {
    if (vsAI && !isXNext && !gameOver) {
      const timer = setTimeout(() => {
        const move = getAIMove(board)
        if (move >= 0) {
          handleMove(move)
        }
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [isXNext, vsAI, gameOver])

  const handleMove = useCallback((index) => {
    if (board[index] || gameOver) return
    const newBoard = [...board]
    newBoard[index] = isXNext ? 'X' : 'O'
    setBoard(newBoard)
    setLastMove(index)
    setIsXNext(!isXNext)
  }, [board, isXNext, gameOver])

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null))
    setIsXNext(true)
    setLastMove(-1)
    setShowResult(false)
  }, [])

  const resetAll = useCallback(() => {
    resetGame()
    setScores({ X: 0, O: 0, draws: 0 })
  }, [resetGame])

  const getStatusText = () => {
    if (showResult) {
      if (winner) return `${winner} wins`
      return 'draw'
    }
    if (gameOver) return ''
    return `${isXNext ? 'X' : 'O'}'s turn`
  }

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">TIC TAC TOE</h1>
        <div className="mode-toggle">
          <button
            className={`mode-btn ${!vsAI ? 'active' : ''}`}
            onClick={() => { setVsAI(false); resetAll() }}
          >
            2P
          </button>
          <button
            className={`mode-btn ${vsAI ? 'active' : ''}`}
            onClick={() => { setVsAI(true); resetAll() }}
          >
            AI
          </button>
        </div>
      </header>

      <div className="scoreboard">
        <div className={`score ${winner === 'X' ? 'winner-glow-x' : ''}`}>
          <span className="score-label">X</span>
          <span className="score-value">{scores.X}</span>
        </div>
        <div className={`score ${draw ? 'winner-glow-draw' : ''}`}>
          <span className="score-label">D</span>
          <span className="score-value">{scores.draws}</span>
        </div>
        <div className={`score ${winner === 'O' ? 'winner-glow-o' : ''}`}>
          <span className="score-label">O</span>
          <span className="score-value">{scores.O}</span>
        </div>
      </div>

      <div className="status" data-testid="status">
        <span className={`status-text ${gameOver ? 'result' : ''} ${winner === 'X' ? 'text-x' : winner === 'O' ? 'text-o' : ''}`}>
          {getStatusText()}
        </span>
      </div>

      <div className="board-wrapper">
        <div className="board">
          {board.map((cell, i) => {
            const isWinCell = result?.line.includes(i)
            const isLastMove = lastMove === i
            return (
              <button
                key={i}
                className={`cell ${cell ? 'filled' : ''} ${isWinCell ? 'win-cell' : ''} ${isLastMove ? 'last-move' : ''} ${cell === 'X' ? 'cell-x' : cell === 'O' ? 'cell-o' : ''}`}
                onClick={() => handleMove(i)}
                disabled={!!cell || gameOver || (vsAI && !isXNext)}
                aria-label={`Cell ${i + 1}${cell ? `, ${cell}` : ''}`}
                data-testid={`cell-${i}`}
              >
                {cell && (
                  <span className={`mark ${cell === 'X' ? 'mark-x' : 'mark-o'}`}>
                    {cell}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="actions">
        <button className="btn btn-reset" onClick={resetGame} data-testid="new-game">
          {gameOver ? 'PLAY AGAIN' : 'RESTART'}
        </button>
        <button className="btn btn-clear" onClick={resetAll}>
          CLEAR SCORES
        </button>
      </div>
    </div>
  )
}
