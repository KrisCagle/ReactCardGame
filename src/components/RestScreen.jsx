import { useState } from 'react'
import { canUpgrade, describeCard, upgradeCard } from '../game/cards'
import { canRest, canSmith, getRestHealAmount } from '../game/runState'
import { Icon } from '../art/icons'
import { DeckPicker } from './shared'
import { ScreenFrame } from './ui/ScreenFrame'

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
    <ScreenFrame className="rest-screen" eyebrow="Campfire" message={run.message} onDiscardPotion={onDiscardPotion} run={run} title="Rest Site">
      <div className="campfire-art" aria-hidden="true">
        <Icon name="campfire" size={96} />
      </div>
      <div className="choice-grid two">
        <button className="choice-card rest-choice" disabled={!restAllowed} onClick={onRest} type="button">
          <span className="choice-icon">
            <Icon name="moon" size={30} />
          </span>
          <span className="choice-tag">Rest</span>
          <strong>Heal {canRest(run) ? healAmount : 0} HP</strong>
          <span>{restBlurb(run, healAmount)}</span>
        </button>
        <button className="choice-card smith-choice" disabled={!canSmith(run)} onClick={() => setPicking(true)} type="button">
          <span className="choice-icon">
            <Icon name="arrowUp" size={30} />
          </span>
          <span className="choice-tag">Smith</span>
          <strong>Upgrade a Card</strong>
          <span>{smithBlurb(run)}</span>
        </button>
      </div>

      {!restAllowed && !canSmith(run) && (
        <button className="center-action" onClick={onLeave} type="button">
          Move on
        </button>
      )}

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
    </ScreenFrame>
  )
}
