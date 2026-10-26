import { Icon } from '../art/icons'
import { canUpgrade } from '../game/cards'
import { getActiveEvent, meetsRequirements } from '../game/events'
import { DeckPicker } from './shared'
import { ScreenFrame } from './ui/ScreenFrame'

const pickCopy = {
  remove: { title: 'Remove a Card', subtitle: 'Choose a card to remove from your deck.' },
  upgrade: { title: 'Upgrade a Card', subtitle: 'Choose a card to upgrade.' },
  transform: { title: 'Transform a Card', subtitle: 'Choose a card. It becomes a random card from your pool.' },
}

const eventIcons = {
  'golden-idol': 'crown',
  'big-fish': 'drop',
  cleric: 'cross',
  'shrine-of-blades': 'swords',
  'scrap-ooze': 'flask',
  'mysterious-sphere': 'gem',
  library: 'scroll',
  'forge-spirit': 'flame',
  gambler: 'coin',
  'dead-adventurer': 'skull',
  transmogrifier: 'spiral',
  'blood-pact': 'heart',
  'wandering-merchant': 'bag',
}

export function EventScreen({ run, onChoose, onPickCard, onContinue, onDiscardPotion }) {
  const event = getActiveEvent(run)
  const state = run.event
  const pick = state.pick
  const pickable = pick === 'upgrade' ? run.deck.filter(canUpgrade) : run.deck

  return (
    <ScreenFrame className="event-screen" eyebrow="Event" message={event.text} onDiscardPotion={onDiscardPotion} run={run} title={event.title}>
      <div className="event-art" aria-hidden="true">
        <Icon name={eventIcons[event.id] ?? 'question'} size={84} />
      </div>

      {state.resolved ? (
        <div className="event-result">
          <p>{state.resultText}</p>
          <button className={state.fight ? 'btn-primary center-action' : 'btn-gold center-action'} disabled={Boolean(pick)} onClick={onContinue} type="button">
            {state.fight ? 'Fight!' : 'Continue'}
          </button>
        </div>
      ) : (
        <ul className="event-choices">
          {event.choices.map((choice, index) => {
            const affordable = meetsRequirements(run, choice)
            return (
              <li key={choice.label} style={{ '--i': index }}>
                <button className="event-choice" disabled={!affordable} onClick={() => onChoose(index)} type="button">
                  <strong>[{choice.label}]</strong>
                  <span>{affordable ? choice.text : `${choice.text} (Requires ${choice.requires.gold} gold.)`}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {/* Event picks are part of the deal you accepted, so they can't be cancelled. */}
      {pick && pickable.length > 0 && (
        <DeckPicker cards={pickable} onPick={(card) => onPickCard(card.deckId)} subtitle={pickCopy[pick].subtitle} title={pickCopy[pick].title} />
      )}
    </ScreenFrame>
  )
}
