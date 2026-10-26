// Mystery-room events. Each choice lists `effects` applied by game/events.js:
//   gold, loseHp, loseHpPercent, heal, healPercent, maxHp, curse,
//   relic ('random' or a rarity), potion, cardReward ({ rarity?, count }),
//   upgradeRandom (n), pick ('remove' | 'upgrade' | 'transform'),
//   fight ('elite' | 'strong'), chance ({ odds, success, failure, successText, failureText }).
// `requires` disables a choice the player can't pay for.
export const eventLibrary = [
  {
    id: 'golden-idol',
    title: 'Golden Idol',
    text: 'A golden idol rests on a pedestal, wired to a boulder hanging over the doorway.',
    choices: [
      { label: 'Take it', text: 'Gain 150 gold. Become cursed.', effects: { gold: 150, curse: true }, result: 'The boulder misses you by a hair. The idol feels heavier than it should.' },
      { label: 'Leave', text: 'Nothing happens.', effects: {}, result: 'Some treasures are traps.' },
    ],
  },
  {
    id: 'big-fish',
    title: 'Big Fish',
    text: 'A fishmonger with a cart blocks the road. "One per customer!"',
    choices: [
      { label: 'Banana', text: 'Heal 33% of your max HP.', effects: { healPercent: 0.33 }, result: 'Surprisingly filling.' },
      { label: 'Donut', text: 'Gain 5 max HP.', effects: { maxHp: 5 }, result: 'You feel sturdier.' },
      { label: 'Box', text: 'Gain a random relic. Become cursed.', effects: { relic: 'random', curse: true }, result: 'Something inside the box whispers.' },
    ],
  },
  {
    id: 'cleric',
    title: 'The Cleric',
    text: 'A cheerful cleric offers their services, for a price.',
    choices: [
      { label: 'Heal', text: 'Pay 35 gold. Heal 25% of your max HP.', requires: { gold: 35 }, effects: { gold: -35, healPercent: 0.25 }, result: 'Warm light knits your wounds.' },
      { label: 'Purify', text: 'Pay 50 gold. Remove a card from your deck.', requires: { gold: 50 }, effects: { gold: -50, pick: 'remove' }, result: 'You feel lighter.' },
      { label: 'Leave', text: 'Nothing happens.', effects: {}, result: 'The cleric waves you off.' },
    ],
  },
  {
    id: 'shrine-of-blades',
    title: 'Shrine of Blades',
    text: 'Blades orbit a shrine. Reaching through them would hurt, but something waits at the center.',
    choices: [
      { label: 'Reach in', text: 'Lose 7 HP. Remove a card from your deck.', effects: { loseHp: 7, pick: 'remove' }, result: 'Bleeding, you leave a burden behind.' },
      { label: 'Leave', text: 'Nothing happens.', effects: {}, result: 'You walk around the blades.' },
    ],
  },
  {
    id: 'scrap-ooze',
    title: 'Scrap Ooze',
    text: 'Something shiny glints inside a bubbling ooze.',
    choices: [
      {
        label: 'Reach in',
        text: 'Lose 5 HP. 50% chance to find a relic.',
        effects: { loseHp: 5, chance: { odds: 0.5, success: { relic: 'random' }, failure: {}, successText: 'Your hand closes on a relic!', failureText: 'Only acid and bones.' } },
      },
      { label: 'Leave', text: 'Nothing happens.', effects: {}, result: 'You keep your hands to yourself.' },
    ],
  },
  {
    id: 'mysterious-sphere',
    title: 'Mysterious Sphere',
    text: 'A sealed sphere hums with power. Its guardian stirs as you approach.',
    choices: [
      { label: 'Open it', text: 'Fight an elite. Win a rare relic.', effects: { fight: 'elite', relic: 'rare' }, result: 'The guardian awakens!' },
      { label: 'Leave', text: 'Nothing happens.', effects: {}, result: 'You back away slowly.' },
    ],
  },
  {
    id: 'library',
    title: 'The Library',
    text: 'Dusty shelves stretch out of sight. A comfortable chair sits by a window.',
    choices: [
      { label: 'Read', text: 'Choose 1 of 3 rare cards.', effects: { cardReward: { rarity: 'rare', count: 3 } }, result: 'One tome stands out.' },
      { label: 'Sleep', text: 'Heal 33% of your max HP.', effects: { healPercent: 0.33 }, result: 'You wake up refreshed.' },
    ],
  },
  {
    id: 'forge-spirit',
    title: 'Forge Spirit',
    text: 'An ember spirit tends an anvil that never cools.',
    choices: [
      { label: 'Temper', text: 'Upgrade a card.', effects: { pick: 'upgrade' }, result: 'The spirit hammers it into something better.' },
      { label: 'Ask for luck', text: 'Upgrade 2 random cards. Lose 6 HP.', effects: { upgradeRandom: 2, loseHp: 6 }, result: 'Sparks fly; you are burned, but two cards gleam.' },
    ],
  },
  {
    id: 'gambler',
    title: 'The Gambler',
    text: 'A grinning figure shuffles a deck of bones. "Double or nothing?"',
    choices: [
      {
        label: 'Bet 50 gold',
        text: '50% chance to win 150 gold.',
        requires: { gold: 50 },
        effects: { gold: -50, chance: { odds: 0.5, success: { gold: 150 }, failure: {}, successText: 'You win big!', failureText: 'The house always wins.' } },
      },
      { label: 'Walk away', text: 'Nothing happens.', effects: {}, result: 'Wise.' },
    ],
  },
  {
    id: 'dead-adventurer',
    title: 'Dead Adventurer',
    text: 'A fallen adventurer still clutches their pack. Something large made those claw marks.',
    choices: [
      {
        label: 'Search',
        text: '60% chance of gold and a potion. 40% chance an elite returns.',
        effects: {
          chance: {
            odds: 0.6,
            success: { gold: 60, potion: true },
            failure: { fight: 'elite' },
            successText: 'You find coins and a potion before slipping away.',
            failureText: 'The beast returns for its meal!',
          },
        },
      },
      { label: 'Leave', text: 'Nothing happens.', effects: {}, result: 'Rest in peace.' },
    ],
  },
  {
    id: 'transmogrifier',
    title: 'Transmogrifier',
    text: 'A pool of shifting light promises to change whatever you drop into it.',
    choices: [
      { label: 'Transform', text: 'Transform a card into a random card.', effects: { pick: 'transform' }, result: 'It surfaces as something new.' },
      { label: 'Leave', text: 'Nothing happens.', effects: {}, result: 'You keep what you have.' },
    ],
  },
  {
    id: 'blood-pact',
    title: 'Blood Pact',
    text: 'A voice offers power in exchange for vitality.',
    choices: [
      { label: 'Accept', text: 'Lose 15% of your max HP. Gain a random rare relic.', effects: { loseHpPercent: 0.15, relic: 'rare' }, result: 'The pact is sealed in red.' },
      { label: 'Refuse', text: 'Nothing happens.', effects: {}, result: 'The voice fades.' },
    ],
  },
  {
    id: 'wandering-merchant',
    title: 'Wandering Merchant',
    text: 'A merchant with an overloaded pack offers a quick trade.',
    choices: [
      { label: 'Buy a potion', text: 'Pay 40 gold. Gain a random potion.', requires: { gold: 40 }, effects: { gold: -40, potion: true }, result: '"Pleasure doing business."' },
      { label: 'Sell a card', text: 'Remove a card. Gain 60 gold.', effects: { gold: 60, pick: 'remove' }, result: 'The merchant tucks it away.' },
      { label: 'Leave', text: 'Nothing happens.', effects: {}, result: 'The merchant shrugs.' },
    ],
  },
]
