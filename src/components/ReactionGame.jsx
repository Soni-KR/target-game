import { useEffect, useRef, useState } from "react";
import "../styles/reaction-game.css";

function ReactionGame() {
  const [isPlaying, setIsPlaying] = useState(false);

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [misses, setMisses] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);

  const [reactionTime, setReactionTime] = useState(null);
  const [reactionTimes, setReactionTimes] = useState([]);

  const targetSpawnTime = useRef(null);
const [highScore, setHighScore] = useState(() => {
  const savedScore = localStorage.getItem("reactionHighScore");
  return savedScore ? Number(savedScore) : 0;
});
  const [targetPosition, setTargetPosition] = useState({
    x: 100,
    y: 100,
  });

  // Difficulty depends on score
  const targetSize =
    score >= 15 ? 45 :
    score >= 8 ? 55 :
    70;

  const targetLifetime =
    score >= 15 ? 600 :
    score >= 8 ? 850 :
    1200;
const difficulty =
  score >= 15
    ? "Hard"
    : score >= 8
    ? "Medium"
    : "Easy";
  function moveTarget() {
    const boardWidth = 900;
    const boardHeight = 450;

    const maxX = boardWidth - targetSize;
    const maxY = boardHeight - targetSize;

    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;

    setTargetPosition({
      x: randomX,
      y: randomY,
    });

    targetSpawnTime.current = performance.now();
  }

  function handleTargetClick(event) {
    event.stopPropagation();

    const currentReactionTime =
      performance.now() - targetSpawnTime.current;

    setReactionTime(currentReactionTime);

    setReactionTimes((previousTimes) => [
      ...previousTimes,
      currentReactionTime,
    ]);

    setScore((previousScore) => previousScore + 1);

    setCombo((previousCombo) => {
      const newCombo = previousCombo + 1;

      setMaxCombo((previousMax) =>
        Math.max(previousMax, newCombo)
      );

      return newCombo;
    });

    moveTarget();
  }

  function handleBoardClick() {
    if (!isPlaying) return;

    setMisses((previousMisses) => previousMisses + 1);
    setCombo(0);
  }

  function startGame() {
    setScore(0);
    setMisses(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(30);

    setReactionTime(null);
    setReactionTimes([]);

    setIsPlaying(true);
  }
useEffect(() => {
  if (score > highScore) {
    setHighScore(score);
    localStorage.setItem("reactionHighScore", score);
  }
}, [score, highScore]);
  useEffect(() => {
    if (!isPlaying) return;

    moveTarget();
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;

    const gameTimer = setInterval(() => {
      setTimeLeft((previousTime) => {
        if (previousTime <= 1) {
          setIsPlaying(false);
          return 0;
        }

        return previousTime - 1;
      });
    }, 1000);

    return () => clearInterval(gameTimer);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;

    const targetTimer = setTimeout(() => {
      setMisses((previousMisses) => previousMisses + 1);
      setCombo(0);

      moveTarget();
    }, targetLifetime);

    return () => clearTimeout(targetTimer);
  }, [targetPosition, isPlaying, targetLifetime]);

  const bestReaction =
    reactionTimes.length > 0
      ? Math.min(...reactionTimes)
      : null;

  const averageReaction =
    reactionTimes.length > 0
      ? reactionTimes.reduce(
          (total, time) => total + time,
          0
        ) / reactionTimes.length
      : null;

  const totalAttempts = score + misses;

  const accuracy =
    totalAttempts > 0
      ? (score / totalAttempts) * 100
      : 0;

  return (
    <main className="game">
      <header className="game-header">
        <h1>Reaction Target</h1>
        <p>Test your speed and accuracy.</p>
      </header>

      <section className="stats">
<div className="stat">
  <span className="stat-label">Score</span>
  <span className="stat-value">{score}</span>
</div>

<div className="stat">
  <span className="stat-label">High Score</span>
  <span className="stat-value">{highScore}</span>
</div>
        <div className="stat">
          <span className="stat-label">Time</span>
          <span className="stat-value">{timeLeft}s</span>
        </div>

        <div className="stat">
          <span className="stat-label">Combo</span>
          <span className="stat-value">x{combo}</span>
        </div>

        <div className="stat">
          <span className="stat-label">Misses</span>
          <span className="stat-value">{misses}</span>
        </div>
      </section>
        <p className="difficulty">
  Difficulty: {difficulty}
</p>
      <section
        className="game-board"
        onClick={handleBoardClick}
      >
        {isPlaying ? (
          <button
            className="target"
            style={{
              left: `${targetPosition.x}px`,
              top: `${targetPosition.y}px`,
              width: `${targetSize}px`,
              height: `${targetSize}px`,
            }}
            onClick={handleTargetClick}
          >
            🎯
          </button>
        ) : timeLeft === 0 ? (
          <div className="game-over">
            <p>High Score: {highScore}</p>
            <h2>Game Over</h2>

            <p>Score: {score}</p>
            <p>Misses: {misses}</p>
            <p>Accuracy: {accuracy.toFixed(1)}%</p>
            <p>Best Combo: x{maxCombo}</p>

            <p>
              Best Reaction:{" "}
              {bestReaction
                ? `${Math.round(bestReaction)} ms`
                : "--"}
            </p>

            <p>
              Average Reaction:{" "}
              {averageReaction
                ? `${Math.round(averageReaction)} ms`
                : "--"}
            </p>
          </div>
        ) : (
          <p className="game-message">
            Press Start to begin
          </p>
        )}
      </section>

      {isPlaying && (
        <section className="reaction-stats">
          <span>
            Reaction:{" "}
            {reactionTime
              ? `${Math.round(reactionTime)} ms`
              : "--"}
          </span>

          <span>
            Best:{" "}
            {bestReaction
              ? `${Math.round(bestReaction)} ms`
              : "--"}
          </span>

          <span>
            Average:{" "}
            {averageReaction
              ? `${Math.round(averageReaction)} ms`
              : "--"}
          </span>

          <span>
            Accuracy: {accuracy.toFixed(1)}%
          </span>
        </section>
      )}

      {!isPlaying && (
        <button
          className="start-button"
          onClick={startGame}
        >
          {timeLeft === 0 ? "Play Again" : "Start Game"}
        </button>
      )}
    </main>
  );
}

export default ReactionGame;