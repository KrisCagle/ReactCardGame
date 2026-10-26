import { describeCard } from '../game/cards'

export function CardButton({ card, disabled = false, onClick }) {
  return (
    <button
      className={`card ${card.type.toLowerCase()} ${card.upgraded ? 'upgraded' : ''}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span className="cost">{card.cost}</span>
      <strong>{card.name}</strong>
      <small>{card.type}</small>
      <p>{describeCard(card)}</p>
    </button>
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
export function DeckPicker({ cards, title, subtitle, onPick, onClose, renderCaption }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <section className="modal-panel">
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <p className="run-message">{subtitle}</p>}
          </div>
          <button onClick={onClose} type="button">Close</button>
        </div>
        {cards.length === 0 ? (
          <p className="run-message">No cards to show.</p>
        ) : (
          <div className="deck-grid">
            {cards.map((card) => (
              <div className="deck-entry" key={card.deckId}>
                <CardButton card={card} disabled={!onPick} onClick={() => onPick?.(card)} />
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
