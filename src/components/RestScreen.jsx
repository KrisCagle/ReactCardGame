import { useState } from 'react'
import { canUpgrade, describeCard, upgradeCard } from '../game/cards'
import { getRestHealAmount } from '../game/runState'
import { DeckPicker } from './shared'

export function RestScreen({ run, onRest, onSmith }) {
  const [picking, setPicking] = useState(false)
  const healAmount = getRestHealAmount(run)
  const upgradable = run.deck.filter(canUpgrade)

  return (
    <main className="game-shell reward-shell">
      <section className="reward-panel">
        <div>
          <p className="eyebrow">Campfire</p>
          <h1>Rest Site</h1>
          <p className="run-message">{run.message}</p>
        </div>

        <div className="rest-options">
          <button className="boon-card" disabled={healAmount === 0} onClick={onRest} type="button">
            <span>Rest</span>
            <strong>Heal {healAmount} HP</strong>
            <p>Recover 30% of your max HP. You have {run.player.hp}/{run.player.maxHp}.</p>
          </button>
          <button className="boon-card smith" disabled={upgradable.length === 0} onClick={() => setPicking(true)} type="button">
            <span>Smith</span>
            <strong>Upgrade a Card</strong>
            <p>{upgradable.length > 0 ? 'Permanently improve one card in your deck.' : 'Every card is already upgraded.'}</p>
          </button>
        </div>
      </section>

      {picking && (
        <DeckPicker
          cards={upgradable}
          title="Upgrade a Card"
          subtitle="Pick a card. Its upgraded text is shown underneath."
          onClose={() => setPicking(false)}
          onPick={(card) => onSmith(card.deckId)}
          renderCaption={(card) => `Upgraded: ${describeCard(upgradeCard(card))}`}
        />
      )}
    </main>
  )
}
