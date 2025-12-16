import React, { useState, useEffect } from "react";
import "./App.css";

// Theme Colors (Ocean Professional)
const COLORS = {
  primary: "#2563EB",
  secondary: "#F59E0B",
  error: "#EF4444",
  background: "#f9fafb",
  surface: "#ffffff",
  text: "#111827",
};

// -- UTILS --
const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // cols
  [0, 4, 8],
  [2, 4, 6], // diagonals
];

// PUBLIC_INTERFACE
function calculateWinner(squares) {
  for (let i = 0; i < LINES.length; i++) {
    const [a, b, c] = LINES[i];
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[b] === squares[c]
    ) {
      return squares[a];
    }
  }
  return null;
}

// PUBLIC_INTERFACE
function calculateDraw(squares) {
  return squares.every((sq) => sq) && !calculateWinner(squares);
}

// PUBLIC_INTERFACE
function Square({ value, onClick, highlight, disabled }) {
  return (
    <button
      className="ttt-square"
      onClick={onClick}
      disabled={disabled || value}
      style={{
        background: highlight ? COLORS.primary + "22" : COLORS.surface,
        color: value === "X" ? COLORS.primary : value === "O" ? COLORS.secondary : COLORS.text,
        borderColor: highlight
          ? COLORS.primary
          : "rgba(0,0,0,0.06)",
      }}
      aria-label={value ? `Cell ${value}` : `Empty cell`}
    >
      {value}
    </button>
  );
}

// PUBLIC_INTERFACE
function Board({ squares, onSquareClick, isGameOver, winningLine }) {
  return (
    <div className="ttt-board">
      {[0, 1, 2].map((i) => (
        <div key={i} className="ttt-row">
          {[0, 1, 2].map((j) => {
            const idx = i * 3 + j;
            const isWin =
              winningLine && winningLine.includes(idx);
            return (
              <Square
                key={idx}
                value={squares[idx]}
                onClick={() => onSquareClick(idx)}
                disabled={isGameOver}
                highlight={isWin}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function StatusBar({
  current,
  winner,
  draw,
  score,
  next,
}) {
  let status = "";
  let color = COLORS.text;
  if (winner) {
    status = `${winner} wins!`;
    color = winner === "X" ? COLORS.primary : COLORS.secondary;
  } else if (draw) {
    status = "It's a draw!";
    color = COLORS.error;
  } else {
    status = `Turn: ${next}`;
    color = next === "X" ? COLORS.primary : COLORS.secondary;
  }
  return (
    <div className="ttt-status-bar" style={{ color }}>
      <div className="ttt-status-main">{status}</div>
      <div className="ttt-score-bar">
        <span style={{ color: COLORS.primary }}>X: {score.X}</span>
        <span style={{ margin: "0 8px" }}>|</span>
        <span style={{ color: COLORS.secondary }}>O: {score.O}</span>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function RestartButton({ onClick }) {
  return (
    <button
      className="ttt-restart-btn"
      onClick={onClick}
      aria-label="Restart game"
    >
      Restart Game
    </button>
  );
}

// PUBLIC_INTERFACE
export default function App() {
  // Using scores as persistent state per session
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true); // X always starts
  const [score, setScore] = useState({ X: 0, O: 0 });
  const [winner, setWinner] = useState(null);
  const [draw, setDraw] = useState(false);
  const [winningLine, setWinningLine] = useState([]);
  const [theme, setTheme] = useState("light");

  // PUBLIC_INTERFACE
  function handleSquareClick(idx) {
    if (squares[idx] || winner) return; // don't overwrite
    const nextSquares = squares.slice();
    nextSquares[idx] = xIsNext ? "X" : "O";
    setSquares(nextSquares);
    setXIsNext((x) => !x);
  }

  // PUBLIC_INTERFACE
  function handleRestart() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
    setDraw(false);
    setWinningLine([]);
  }

  // Theme logic (kept from existing workflow)
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Detect winner/draw and highlight
  useEffect(() => {
    const result = calculateWinner(squares);
    if (result) {
      setWinner(result);
      // Find winning line
      for (const line of LINES) {
        const [a, b, c] = line;
        if (
          squares[a] &&
          squares[a] === squares[b] &&
          squares[b] === squares[c]
        ) {
          setWinningLine(line);
          break;
        }
      }
      setScore((prev) => ({
        ...prev,
        [result]: prev[result] + 1,
      }));
      return;
    }
    if (calculateDraw(squares)) {
      setDraw(true);
    }
  }, [squares]);

  // Optionally: Persist scores in session storage
  useEffect(() => {
    // Load from session
    const stored = window.sessionStorage.getItem("ttt-score");
    if (stored) setScore(JSON.parse(stored));
  }, []);
  useEffect(() => {
    window.sessionStorage.setItem("ttt-score", JSON.stringify(score));
  }, [score]);

  // PUBLIC_INTERFACE
  function toggleTheme() {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }

  const isGameOver = Boolean(winner || draw);

  return (
    <div className="App" style={{ background: COLORS.background, color: COLORS.text, minHeight: "100vh" }}>
      <header className="App-header" style={{ background: "none", minHeight: "inherit", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>

        <main className="ttt-panel">
          <StatusBar
            current={xIsNext ? "X" : "O"}
            winner={winner}
            draw={draw}
            score={score}
            next={xIsNext ? "X" : "O"}
          />
          <Board
            squares={squares}
            onSquareClick={handleSquareClick}
            isGameOver={isGameOver}
            winningLine={winningLine}
          />
          <RestartButton onClick={handleRestart} />
        </main>
        <footer className="ttt-footer">
          <small style={{ color: COLORS.text, opacity: 0.7, marginTop: "2rem" }}>
            Ocean Professional Theme – Tic Tac Toe
          </small>
        </footer>
      </header>
    </div>
  );
}
