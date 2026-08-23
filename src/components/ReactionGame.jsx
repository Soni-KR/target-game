import { useState } from "react";
import "../styles/reaction-game.css";

function ReactionGame() {
    const [isPlaying, setIsPlaying] = useState(false);
  return (
    <main className="game">
      <header className="game-header">
        <h1>Reaction Target</h1>
        <p>Test your speed and accuracy.</p>
      </header>

      <section className="stats">
        <div className="stat">
          <span className="stat-label">Score</span>
          <span className="stat-value">0</span>
        </div>

        <div className="stat">
          <span className="stat-label">Time</span>
          <span className="stat-value">30s</span>
        </div>

        <div className="stat">
          <span className="stat-label">Combo</span>
          <span className="stat-value">x0</span>
        </div>

        <div className="stat">
          <span className="stat-label">Misses</span>
          <span className="stat-value">0</span>
        </div>
      </section>
      <section className="game-board">
  <p className="game-message">
  {isPlaying ? "Get ready!" : "Press Start to begin"}
</p>
</section>
<button
  className="start-button"
  onClick={() => setIsPlaying(true)}
>
  Start Game
</button>
    </main>
  );
}

export default ReactionGame;