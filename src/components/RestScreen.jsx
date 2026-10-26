import { useState } from 'react'
import { canUpgrade, describeCard, upgradeCard } from '../game/cards'
import { canRest, canSmith, getRestHealAmount } from '../game/runState'
import { DeckPicker, RunHeader } from './shared'

const restBlurb = (run, healAmount) => {
  if (!canRest(run)) return 'Your Coffee Dripper keeps you wide awake.'
  return `Recover ${healAmount} HP. You have ${run.player.hp}/${run.player.maxHp}.`
}

const smithBlurb = (run) => {
  if (!canSmith(run) && run.deck.some(canUpgrade)) return 'Your Fusion Hammer refuses to work this forge.'
  if (!canSmith(run)) return 'Every card is already upgraded.'
  return 'Permanently improve one card in your deck.'
}

export function RestScreen({ run, onRest, onSmith, onLeave, onDiscardPotion }) {
  const [picking, setPicking] = useState(false)
  const healAmount = getRestHealAmount(run)
  const upgradable = run.deck.filter(canUpgrade)
  const restAllowed = canRest(run) && healAmount > 0

  return (
    <main className="game-shell reward-shell">
      <section className="reward-panel">
        <div>
          <p className="eyebrow">Campfire</p>
          <h1>Rest Site</h1>
          <p className="run-message">{run.message}</p>
        </div>

        <RunHeader run={run} onDiscardPotion={onDiscardPotion} />

        <div className="rest-options">
          <button className="boon-card" disabled={!restAllowed} onClick={onRest} type="button">
            <span>Rest</span>
            <strong>Heal {canRest(run) ? healAmount : 0} HP</strong>
            <p>{restBlurb(run, healAmount)}</p>
          </button>
          <button className="boon-card smith" disabled={!canSmith(run)} onClick={() => setPicking(true)} type="button">
            <span>Smith</span>
            <strong>Upgrade a Card</strong>
            <p>{smithBlurb(run)}</p>
          </button>
        </div>

        {!restAllowed && !canSmith(run) && (
          <button className="secondary-action" onClick={onLeave} type="button">Move on</button>
        )}
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
