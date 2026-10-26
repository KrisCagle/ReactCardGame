# React Card Game

A browser-based roguelike deckbuilder inspired by Slay the Spire, built with React and Vite. Pick a character, climb three procedurally generated acts, build a deck, collect relics, and beat the final boss.

## Current Features

- Three characters with their own starter decks, passives, and card pools (common / uncommon / rare)
- A freshly generated branching map every act, with fights, elites, mystery rooms, shops, campfires, treasure, and a boss
- Act-specific enemy pools (easier fights first), elites, and two possible bosses per act
- Enemies with multi-hit attacks, random or scripted move patterns, and passives (thorns, enrage, metallicize, ritual)
- Turn-based combat with energy, block, enemy intents, and draw / discard / exhaust piles
- Status effects: strength, vulnerable, weak, frail, and poison
- 34 relics: stat relics, triggered relics (every 3 attacks, start of turn, end of turn...), and boss relics with drawbacks
- Potions (3 slots) from fights, shops, and events
- Choice-based mystery events with costs, gambles, card removal, upgrades, and transforms
- Card upgrades at campfires (or rest to heal 30% HP)
- Gold from fights and treasure, spent at shops on cards, relics, potions, and card removal

## Tech Stack

- React
- Vite
- JavaScript
- CSS
- Vitest
- GitHub Actions (lint, test, build on every PR)

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

Run the balance simulator (bot-played runs per character; add `--cards` for card/relic impact):

```bash
npm run sim -- 500
```

## Architecture

Game rules live in `src/game/` as pure functions with no React in them, so they can be unit tested and simulated:

- `combat.js` - drawing, playing cards, damage, statuses, enemy turns, potions
- `relics.js` - triggered relic logic, keyed by relic id (relics themselves are plain data)
- `runState.js` - building a run, gold, relics, rewards, shops, campfires, map progress, acts
- `rewards.js` - card / relic rarity rolls and potion drops
- `events.js` - mystery rooms and choice-based events
- `mapGen.js` - procedural act maps (non-crossing paths plus room placement rules)
- `gameReducer.js` - the single `useReducer` entry point the UI dispatches actions to
- `rng.js` - seeded random numbers; the seed lives in game state, so every transition is pure and runs are reproducible
- `cards.js` - card text generated from card effects (with live damage/block numbers in combat), and upgrades
- `fx.js` - diffs two combat states into "what happened" events (damage, block, heals, debuffs) that the UI animates
- `bot.js` - a heuristic auto-player used by the fuzz tests and the simulator

Static content lives in `src/data/` (cards, characters, enemies, relics, potions, events, keywords). Components in `src/components/` only render state and dispatch actions.

### Art and styles

- `src/art/` - all art is hand-drawn inline SVG: character portraits, 16 enemy archetypes recolored into 32 enemies, act backdrops, and an icon set. Nothing is downloaded at runtime.
- `src/styles/` - CSS split by area (tokens, base, HUD, cards, combat, effects, map, screens). Animations respect `prefers-reduced-motion`.
- In dev, open `http://localhost:5173/?gallery` to see every piece of art on one page.

### Controls

- Click a card to play it, or press `1`-`9` for the card in that position.
- `E` ends your turn.
- Hover cards, statuses, intents, relics, and potions for tooltips. Click the draw / discard / exhaust piles to look inside.

## Gameplay Loop

1. Choose a character and an opening boon.
2. Pick a room on the map and fight, shop, rest, or face an event.
3. Spend energy to attack, block, draw cards, or apply effects.
4. Win combat to collect gold, a card, and sometimes a relic or potion.
5. Climb toward the boss at the top of the act.
6. Beat the boss of all three acts to win the run.

## Roadmap

- Fights against multiple enemies at once (with targeting)
- Sound effects and music
- Save and resume runs
- More balance passes using the simulator
