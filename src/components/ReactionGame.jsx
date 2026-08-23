import { useEffect, useRef, useState } from "react";
import "../styles/reaction-game.css";

function ReactionGame() {
  const [isPlaying, setIsPlaying] = useState(false);

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [misses, setMisses] = useState(0);
  const [combo, setCombo] = useState(0);

  const [reactionTime, setReactionTime] = useState(null);
  const [reactionTimes, setReactionTimes] = useState([]);

  const targetSpawnTime = useRef(null);

  const [targetPosition, setTargetPosition] = useState({
    x: 100,
    y: 100,
  });

  function moveTarget() {
    const maxX = 830;
    const maxY = 380;

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
    setCombo((previousCombo) => previousCombo + 1);

    moveTarget();
  }

  function handleBoardClick() {
    if (!isPlaying) {
      return;
    }

    setMisses((previousMisses) => previousMisses + 1);
    setCombo(0);
  }

  function startGame() {
    setScore(0);
    setMisses(0);
    setCombo(0);
    setTimeLeft(30);

    setReactionTime(null);
    setReactionTimes([]);

    setIsPlaying(true);

    moveTarget();
  }

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const gameTimer = setInterval(() => {
      setTimeLeft((previousTime) => {
        if (previousTime <= 1) {
          setIsPlaying(false);
          return 0;
        }

        return previousTime - 1;
      });
    }, 1000);

    return () => {
      clearInterval(gameTimer);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const targetTimer = setTimeout(() => {
      setMisses((previousMisses) => previousMisses + 1);
      setCombo(0);

      moveTarget();
    }, 1200);

    return () => {
      clearTimeout(targetTimer);
    };
  }, [targetPosition, isPlaying]);

  const bestReaction =
    reactionTimes.length > 0
      ? Math.min(...reactionTimes)
      : null;

  const averageReaction =
    reactionTimes.length > 0
      ? reactionTimes.reduce((total, time) => total + time, 0) /
        reactionTimes.length
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
            }}
            onClick={handleTargetClick}
          >
            🎯
          </button>
        ) : (
          <p className="game-message">
            {timeLeft === 0
              ? "Game Over!"
              : "Press Start to begin"}
          </p>
        )}
      </section>

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