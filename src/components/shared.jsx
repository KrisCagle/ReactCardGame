import { useState } from 'react'
import { POTION_SLOTS } from '../data/gameData'
import { describeCard } from '../game/cards'

const showRarity = (rarity) => rarity === 'uncommon' || rarity === 'rare'

export function CardButton({ card, disabled = false, onClick }) {
  return (
    <button
      className={`card ${card.type.toLowerCase()} rarity-${card.rarity ?? 'common'} ${card.upgraded ? 'upgraded' : ''}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span className="cost">{card.unplayable ? '-' : card.cost}</span>
      <strong>{card.name}</strong>
      <small>
        {card.type}
        {showRarity(card.rarity) && ` - ${card.rarity}`}
      </small>
      <p>{describeCard(card)}</p>
    </button>
  )
}

// Compact relic chips with the description on hover / long-press.
export function RelicBar({ relics }) {
  return (
    <ul className="relic-bar" aria-label="Relics">
      {relics.map((relic) => (
        <li className={`relic-chip rarity-${relic.rarity}`} key={relic.id} title={`${relic.name}: ${relic.text}`} tabIndex={0}>
          {relic.name}
        </li>
      ))}
    </ul>
  )
}

export function PotionBelt({ potions, onUse, onDiscard }) {
  const slots = Array.from({ length: POTION_SLOTS }, (_, index) => potions[index] ?? null)
  return (
    <div className="potion-belt" aria-label="Potions">
      {slots.map((potion, index) =>
        potion ? (
          <div className="potion-slot filled" key={`${potion.id}-${index}`} title={`${potion.name}: ${potion.text}`}>
            <button className="potion-use" disabled={!onUse} onClick={() => onUse?.(index)} type="button">
              {potion.name}
            </button>
            {onDiscard && (
              <button aria-label={`Discard ${potion.name}`} className="potion-discard" onClick={() => onDiscard(index)} type="button">
                x
              </button>
            )}
          </div>
        ) : (
          <div className="potion-slot empty" key={`empty-${index}`}>Empty</div>
        ),
      )}
    </div>
  )
}

// The StS-style top bar shown outside combat: HP, gold, potions, deck, relics.
export function RunHeader({ run, onDiscardPotion }) {
  const [showDeck, setShowDeck] = useState(false)
  return (
    <div className="run-header">
      <div className="run-stats">
        <span className="turn-pill">HP {run.player.hp}/{run.player.maxHp}</span>
        <span className="turn-pill gold">Gold {run.gold}</span>
        <button className="turn-pill" onClick={() => setShowDeck(true)} type="button">Deck {run.deck.length}</button>
      </div>
      <PotionBelt potions={run.potions} onDiscard={onDiscardPotion} />
      <RelicBar relics={run.relics} />
      {showDeck && <DeckPicker cards={run.deck} title="Your Deck" onClose={() => setShowDeck(false)} />}
    </div>
  )
}

export function HealthBar({ value, max, percent }) {
  return (
    <div className="health">
      <div style={{ width: `${percent}%` }}></div>
      <span>{value}/{max}</span>
    </div>
  )
}

export function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export function LegendItem({ icon, label, tone }) {
  return (
    <div className="legend-item">
      <span className={`legend-icon ${tone}`}>{icon}</span>
      <strong>{label}</strong>
    </div>
  )
}

export function RelicButton({ relic, disabled = false, onClick }) {
  return (
    <button className="relic-card" disabled={disabled} onClick={onClick} type="button">
      <span>Relic</span>
      <strong>{relic.name}</strong>
      <p>{relic.text}</p>
    </button>
  )
}

export function RewardButton({ kind, reward, onClick }) {
  if (kind === 'relic') return <RelicButton relic={reward} onClick={onClick} />
  return <CardButton card={reward} onClick={onClick} />
}

const statusInfo = {
  strength: { label: 'Strength', tone: 'buff', help: 'Adds damage to every attack.' },
  vulnerable: { label: 'Vulnerable', tone: 'debuff', help: 'Takes 50% more attack damage.' },
  weak: { label: 'Weak', tone: 'debuff', help: 'Deals 25% less attack damage.' },
  frail: { label: 'Frail', tone: 'debuff', help: 'Gains 25% less block from cards.' },
  poison: { label: 'Poison', tone: 'poison', help: 'Loses HP at the start of its turn, then poison drops by 1.' },
}

export function StatusList({ combatant }) {
  const active = Object.keys(statusInfo).filter((key) => combatant[key] > 0)
  if (active.length === 0) return null

  return (
    <ul className="status-list" aria-label="Status effects">
      {active.map((key) => (
        <li className={`status-chip ${statusInfo[key].tone}`} key={key} title={statusInfo[key].help}>
          {statusInfo[key].label} {combatant[key]}
        </li>
      ))}
    </ul>
  )
}

// Modal list of deck cards. With onPick, cards are clickable (upgrade/remove);
// without it, it's a read-only deck viewer.
export function DeckPicker({ cards, title, subtitle, onPick, onClose, renderCaption, isPickable = () => true }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <section className="modal-panel">
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <p className="run-message">{subtitle}</p>}
          </div>
          {onClose && <button onClick={onClose} type="button">Close</button>}
        </div>
        {cards.length === 0 ? (
          <p className="run-message">No cards to show.</p>
        ) : (
          <div className="deck-grid">
            {cards.map((card) => (
              <div className="deck-entry" key={card.deckId}>
                <CardButton card={card} disabled={!onPick || !isPickable(card)} onClick={() => onPick?.(card)} />
                {renderCaption && <p className="deck-caption">{renderCaption(card)}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export function OpeningBoonButton({ boon, onClick }) {
  const tag = boon.kind === 'blessing' ? 'Blessing' : boon.kind === 'relic' ? 'Relic' : 'Card'
  return (
    <button className="boon-card" onClick={onClick} type="button">
      <span>{tag}</span>
      <strong>{boon.title}</strong>
      <p>{boon.text}</p>
    </button>
  )
}
