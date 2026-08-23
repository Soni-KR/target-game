import { useCallback, useEffect, useRef, useState } from "react";
import "../styles/reaction-game.css";

const GAME_LENGTH = 30;

function SonicIcon() {
  return (
    <svg className="sonic-icon" viewBox="0 0 100 100" aria-hidden="true">
      <path className="sonic-spikes" d="M44 15 15 7l14 23L7 31l22 17-20 9 29 8Z" />
      <path className="sonic-head" d="M69 26c-20-7-39 6-42 25-4 21 11 39 33 39 21 0 34-16 33-36-1-14-10-24-24-28Z" />
      <path className="sonic-muzzle" d="M53 57c4-9 14-15 25-12 9 2 15 10 14 19-1 13-15 23-29 18-11-4-15-15-10-25Z" />
      <path className="sonic-eye" d="M57 34c8-2 13 5 11 16-2 10-9 16-15 12-6-4-4-25 4-28Z" />
      <path className="sonic-eye" d="M72 35c7-1 12 6 10 15-1 8-7 13-12 10-5-4-4-23 2-25Z" />
      <circle className="sonic-pupil" cx="61" cy="52" r="3" />
      <circle className="sonic-pupil" cx="75" cy="51" r="3" />
      <ellipse className="sonic-nose" cx="92" cy="57" rx="7" ry="5" />
      <path className="sonic-smile" d="M69 70c7 4 14 2 18-3" />
    </svg>
  );
}

function ReactionGame() {
  const [phase, setPhase] = useState("idle");
  const [countdown, setCountdown] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_LENGTH);
  const [misses, setMisses] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [reactionTime, setReactionTime] = useState(null);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [soundOn, setSoundOn] = useState(true);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem("aimRushHighScore") ?? localStorage.getItem("reactionHighScore");
    return saved ? Number(saved) : 0;
  });
  const [targetPosition, setTargetPosition] = useState({ x: 100, y: 100 });

  const targetSpawnTime = useRef(null);
  const boardRef = useRef(null);
  const audioContextRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const isPlaying = phase === "playing";
  const targetSize = score >= 15 ? 48 : score >= 8 ? 58 : 72;
  const targetLifetime = score >= 15 ? 600 : score >= 8 ? 850 : 1200;
  const difficulty = score >= 15 ? "Hard" : score >= 8 ? "Medium" : "Easy";

  const playTone = useCallback((frequency, duration = 0.08, type = "sine", volume = 0.05) => {
    if (!soundOn) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = audioContextRef.current ?? new AudioContext();
    audioContextRef.current = context;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }, [soundOn]);

  const showFeedback = useCallback((kind) => {
    window.clearTimeout(feedbackTimerRef.current);
    setFeedback(kind);
    feedbackTimerRef.current = window.setTimeout(() => setFeedback(null), 180);
  }, []);

  const moveTarget = useCallback(() => {
    if (!boardRef.current) return;
    const maxX = Math.max(0, boardRef.current.clientWidth - targetSize);
    const maxY = Math.max(0, boardRef.current.clientHeight - targetSize);
    setTargetPosition({ x: Math.random() * maxX, y: Math.random() * maxY });
    targetSpawnTime.current = performance.now();
  }, [targetSize]);

  const registerMiss = useCallback(() => {
    setMisses((value) => value + 1);
    setCombo(0);
    showFeedback("miss");
    playTone(135, 0.1, "sawtooth", 0.035);
  }, [playTone, showFeedback]);

  function handleTargetClick(event) {
    event.stopPropagation();
    const currentReactionTime = performance.now() - targetSpawnTime.current;
    playTone(720 + Math.min(combo, 8) * 35, 0.07, "sine", 0.055);
    showFeedback("hit");
    setReactionTime(currentReactionTime);
    setReactionTimes((times) => [...times, currentReactionTime]);
    setScore((value) => {
      const next = value + 1;
      setHighScore((currentBest) => {
        if (next <= currentBest) return currentBest;
        localStorage.setItem("aimRushHighScore", next);
        return next;
      });
      return next;
    });
    setCombo((value) => {
      const next = value + 1;
      setMaxCombo((currentMax) => Math.max(currentMax, next));
      return next;
    });
    moveTarget();
  }

  function startGame() {
    setScore(0);
    setMisses(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(GAME_LENGTH);
    setReactionTime(null);
    setReactionTimes([]);
    setFeedback(null);
    setCountdown(3);
    setPhase("countdown");
    playTone(440, 0.1, "square", 0.035);
  }

  useEffect(() => {
    if (phase !== "countdown") return undefined;
    const timer = window.setTimeout(() => {
      if (countdown > 1) {
        setCountdown((value) => value - 1);
        playTone(440, 0.1, "square", 0.035);
      } else if (countdown === 1) {
        setCountdown("GO!");
        playTone(880, 0.18, "square", 0.045);
      } else {
        setCountdown(null);
        setPhase("playing");
      }
    }, countdown === "GO!" ? 650 : 800);
    return () => window.clearTimeout(timer);
  }, [countdown, phase, playTone]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    moveTarget();
    const gameTimer = window.setInterval(() => {
      setTimeLeft((time) => {
        if (time <= 1) {
          setPhase("finished");
          playTone(220, 0.35, "triangle", 0.05);
          return 0;
        }
        return time - 1;
      });
    }, 1000);
    return () => window.clearInterval(gameTimer);
  }, [isPlaying, moveTarget, playTone]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const targetTimer = window.setTimeout(() => {
      registerMiss();
      moveTarget();
    }, targetLifetime);
    return () => window.clearTimeout(targetTimer);
  }, [targetPosition, isPlaying, targetLifetime, moveTarget, registerMiss]);

  useEffect(() => () => window.clearTimeout(feedbackTimerRef.current), []);

  const bestReaction = reactionTimes.length ? Math.min(...reactionTimes) : null;
  const averageReaction = reactionTimes.length ? reactionTimes.reduce((total, time) => total + time, 0) / reactionTimes.length : null;
  const accuracy = score + misses ? (score / (score + misses)) * 100 : 0;

  return (
    <main className="game">
      <header className="game-header">
        <div className="eyebrow">PRECISION TRAINER</div>
        <h1>Aim Rush</h1>
        <p>Practice your aim. Build your streak. Beat your best.</p>
      </header>
      <section className="stats" aria-label="Game statistics">
        <div className="stat"><span className="stat-label">Score</span><span className="stat-value">{score}</span></div>
        <div className="stat"><span className="stat-label">Best</span><span className="stat-value">{highScore}</span></div>
        <div className="stat"><span className="stat-label">Time</span><span className={`stat-value ${timeLeft <= 5 && isPlaying ? "danger" : ""}`}>{timeLeft}s</span></div>
        <div className="stat"><span className="stat-label">Combo</span><span className="stat-value">×{combo}</span></div>
        <div className="stat"><span className="stat-label">Misses</span><span className="stat-value">{misses}</span></div>
      </section>
      <div className="game-meta">
        <span className={`difficulty difficulty-${difficulty.toLowerCase()}`}>{difficulty}</span>
        <button className="sound-toggle" onClick={() => setSoundOn((value) => !value)} aria-label={`${soundOn ? "Mute" : "Enable"} sound`}>{soundOn ? "Sound on" : "Sound off"}</button>
      </div>
      <section ref={boardRef} className={`game-board ${feedback ?? ""}`} onClick={() => isPlaying && registerMiss()}>
        <div className="board-glow" />
        {isPlaying ? (
          <button className="target" style={{ left: targetPosition.x, top: targetPosition.y, width: targetSize, height: targetSize }} onClick={handleTargetClick} aria-label="Hit Sonic target">
            <span className="target-ring" /><SonicIcon />
          </button>
        ) : phase === "countdown" ? (
          <div key={countdown} className={`countdown ${countdown === "GO!" ? "go" : ""}`}>{countdown}</div>
        ) : phase === "finished" ? (
          <div className="game-over">
            <span className="results-kicker">RUN COMPLETE</span>
            <h2>{score > 0 && score >= highScore ? "New best!" : "Nice run!"}</h2>
            <div className="result-score">{score}<small> hits</small></div>
            <div className="results-grid">
              <span><strong>{accuracy.toFixed(1)}%</strong>Accuracy</span><span><strong>×{maxCombo}</strong>Best combo</span>
              <span><strong>{bestReaction ? `${Math.round(bestReaction)} ms` : "—"}</strong>Best reaction</span><span><strong>{averageReaction ? `${Math.round(averageReaction)} ms` : "—"}</strong>Average</span>
            </div>
          </div>
        ) : (
          <div className="game-message"><SonicIcon /><strong>Ready to move fast?</strong><span>Hit every Sonic target before it disappears.</span></div>
        )}
      </section>
      {isPlaying && (
        <section className="reaction-stats">
          <span>Reaction <strong>{reactionTime ? `${Math.round(reactionTime)} ms` : "—"}</strong></span><span>Best <strong>{bestReaction ? `${Math.round(bestReaction)} ms` : "—"}</strong></span>
          <span>Average <strong>{averageReaction ? `${Math.round(averageReaction)} ms` : "—"}</strong></span><span>Accuracy <strong>{accuracy.toFixed(1)}%</strong></span>
        </section>
      )}
      {(phase === "idle" || phase === "finished") && <button className="start-button" onClick={startGame}>{phase === "finished" ? "Run It Again" : "Start Training"}<span aria-hidden="true">→</span></button>}
    </main>
  );
}

export default ReactionGame;
