// Seeded random numbers. The engine never calls Math.random directly: the
// reducer creates an rng from the seed stored in state and saves the advanced
// seed back. That keeps every state transition pure (safe under StrictMode),
// makes runs reproducible from a seed, and makes tests deterministic.

// Mulberry32 - tiny, fast, and good enough for a card game.
export const createRng = (seed) => {
  let state = seed >>> 0

  return {
    next() {
      state = (state + 0x6d2b79f5) >>> 0
      let t = state
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    },
    get seed() {
      return state
    },
  }
}

export const randomSeed = () => Math.floor(Math.random() * 2 ** 32)

export const randomInt = (rng, maxExclusive) => Math.floor(rng.next() * maxExclusive)

export const pickOne = (rng, items) => items[randomInt(rng, items.length)]

export const shuffle = (rng, items) => {
  const shuffled = [...items]

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = randomInt(rng, i + 1)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

export const takeRandom = (rng, items, amount) => shuffle(rng, items).slice(0, amount)
