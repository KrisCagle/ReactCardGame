# React Card Game

A browser-based roguelike deckbuilder prototype inspired by games like Slay the Spire. The project is built with React and Vite, with the current focus on getting a playable combat and map loop working before expanding into deeper card, relic, enemy, and event systems.

## Current Features

- Branching act map with enemy, mystery, shop, elite, rest, and boss nodes
- Turn-based combat with energy, block, enemy intent, draw pile, hand, and discard pile
- Starter deck with attack, skill, and power cards
- Card rewards after regular fights
- Relic rewards from elites, bosses, and some mystery events
- Mystery nodes that can become a fight, card cache, or relic event
- Rest nodes that heal the player
- Simple shop nodes that offer card choices while gold is still being built

## Tech Stack

- React
- Vite
- JavaScript
- CSS

## Getting Started

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run lint checks:

```bash
npm run lint
```

Run the tests (Vitest):

```bash
npm test
```

## Architecture

Game rules live in `src/game/` as pure functions with no React in them, so they can be unit tested and simulated:

- `combat.js` - drawing, playing cards, damage, enemy turns
- `runState.js` - building a run, rewards, map progress, acts
- `gameReducer.js` - the single `useReducer` entry point the UI dispatches actions to
- `rng.js` - seeded random numbers; the seed lives in game state, so every transition is pure and runs are reproducible
- `cards.js` - card text generated from card effects

Components in `src/components/` only render state and dispatch actions.

## Gameplay Loop

1. Pick a starting node on the map.
2. Fight enemies using cards from your hand.
3. Spend energy to attack, block, draw cards, or apply effects.
4. Win combat to choose a reward.
5. Return to the map and choose the next connected room.
6. Climb toward the boss at the top of the act.
7. Beat the boss of all three acts to win the run.

## Roadmap

- Generate a fresh map for each run
- Add gold, priced shop purchases, and card removal
- Add more enemy types and better enemy move patterns
- Expand card effects and card rarity
- Add more relics with persistent run modifiers
- Add treasure, event, and choice-based mystery rooms
- Add animations, hit feedback, and improved card movement

## Project Status

This is an early playable prototype. The priority is to build the core systems in small, testable pieces and keep the game fun to click through while the design takes shape.
