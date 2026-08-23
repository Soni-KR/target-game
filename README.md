# Aim Rush

Aim Rush is a fast browser-based aim and reaction trainer. Hit the moving Sonic-inspired target before it relocates, keep your combo alive, and beat your personal best during a 30-second run.

## Features

- Animated `3 → 2 → 1 → GO!` start sequence
- Adaptive target size and lifetime at score milestones
- Hit, miss, countdown, and finish sound effects with a mute control
- Score, combo, misses, accuracy, and reaction-time tracking
- Persistent local high score
- Responsive layout and reduced-motion support

## Run locally

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Scripts

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run preview  # Preview the production build
npm run lint     # Run ESLint
```

## Gameplay

Select **Start Training**, wait for the countdown, and click each target as quickly as possible. Missing the target—or allowing it to expire—breaks the current combo. Difficulty increases automatically at scores 8 and 15.

The game stores the high score in the browser's local storage; no account or backend is required.

## Built with

React 19 and Vite 8. Audio is synthesized with the Web Audio API, and the target artwork is rendered as inline SVG, so the game has no external media dependencies.
