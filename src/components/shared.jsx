import { Icon } from '../art/icons'
import { relicIcon } from '../art/relicIcons'
import { GameCard } from './ui/GameCard'

export { GameCard as CardButton }

export function LegendItem({ icon, label, tone }) {
  return (
    <div className="legend-item">
      <span className={`map-node-icon ${tone}`}>
        <Icon name={icon} size={16} />
      </span>
      <strong>{label}</strong>
    </div>
  )
}

export function RelicButton({ relic, disabled = false, onClick }) {
  return (
    <button className={`relic-card rarity-${relic.rarity}`} disabled={disabled} onClick={onClick} type="button">
      <span className="relic-card-icon">
        <Icon name={relicIcon(relic)} size={34} />
      </span>
      <span className="relic-card-copy">
        <span className="relic-card-tag">{relic.rarity} relic</span>
        <strong>{relic.name}</strong>
        <span>{relic.text}</span>
      </span>
    </button>
  )
}

export function OpeningBoonButton({ boon, onClick }) {
  const tag = boon.kind === 'blessing' ? 'Blessing' : boon.kind === 'relic' ? 'Relic' : 'Card'
  const icon = boon.kind === 'blessing' ? 'star' : boon.kind === 'relic' ? 'gem' : 'cards'
  return (
    <button className={`choice-card boon-${boon.kind}`} onClick={onClick} type="button">
      <span className="choice-icon">
        <Icon name={icon} size={30} />
      </span>
      <span className="choice-tag">{tag}</span>
      <strong>{boon.title}</strong>
      <span>{boon.text}</span>
    </button>
  )
}

// Modal list of cards. With onPick, cards are clickable (upgrade/remove/...);
// without it, it's a read-only viewer. Without onClose it can't be dismissed
// (used when an event requires a pick).
export function DeckPicker({ cards, title, subtitle, onPick, onClose, renderCaption, sort = false }) {
  const shown = sort ? [...cards].sort((a, b) => a.name.localeCompare(b.name)) : cards
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <section className="modal-panel">
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <p className="muted">{subtitle}</p>}
          </div>
          {onClose && (
            <button onClick={onClose} type="button">
              Close
            </button>
          )}
        </div>
        {shown.length === 0 ? (
          <p className="muted">No cards here.</p>
        ) : (
          <div className={`deck-grid ${onPick ? 'pickable' : 'read-only'}`}>
            {shown.map((card) => (
              <div className="deck-entry" key={card.deckId ?? card.instanceId}>
                <GameCard card={card} disabled={!onPick} onClick={() => onPick?.(card)} showKeywords={false} />
                {renderCaption && <p className="deck-caption">{renderCaption(card)}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
