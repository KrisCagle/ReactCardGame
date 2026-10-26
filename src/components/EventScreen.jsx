import { canUpgrade } from '../game/cards'
import { getActiveEvent, meetsRequirements } from '../game/events'
import { DeckPicker, RunHeader } from './shared'

const pickCopy = {
  remove: { title: 'Remove a Card', subtitle: 'Choose a card to remove from your deck.' },
  upgrade: { title: 'Upgrade a Card', subtitle: 'Choose a card to upgrade.' },
  transform: { title: 'Transform a Card', subtitle: 'Choose a card. It becomes a random card from your pool.' },
}

export function EventScreen({ run, onChoose, onPickCard, onContinue, onDiscardPotion }) {
  const event = getActiveEvent(run)
  const state = run.event
  const pick = state.pick
  const pickable = pick === 'upgrade' ? run.deck.filter(canUpgrade) : run.deck

  return (
    <main className="game-shell reward-shell">
      <section className="reward-panel event-panel">
        <div>
          <p className="eyebrow">Event</p>
          <h1>{event.title}</h1>
          <p className="run-message">{event.text}</p>
        </div>

        <RunHeader run={run} onDiscardPotion={onDiscardPotion} />

        {state.resolved ? (
          <div className="event-result">
            <p>{state.resultText}</p>
            <button className="primary secondary-action" disabled={Boolean(pick)} onClick={onContinue} type="button">
              {state.fight ? 'Fight!' : 'Continue'}
            </button>
          </div>
        ) : (
          <ul className="event-choices">
            {event.choices.map((choice, index) => (
              <li key={choice.label}>
                <button className="event-choice" disabled={!meetsRequirements(run, choice)} onClick={() => onChoose(index)} type="button">
                  <strong>[{choice.label}]</strong> <span>{choice.text}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Event picks are part of the deal you accepted, so they can't be cancelled. */}
      {pick && pickable.length > 0 && (
        <DeckPicker cards={pickable} title={pickCopy[pick].title} subtitle={pickCopy[pick].subtitle} onPick={(card) => onPickCard(card.deckId)} />
      )}
    </main>
  )
}
