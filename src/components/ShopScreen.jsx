import { useState } from 'react'
import { getRemoveCost } from '../game/runState'
import { CardButton, DeckPicker, RelicButton } from './shared'

function PriceTag({ price, sold, affordable }) {
  if (sold) return <p className="price sold">Sold</p>
  return <p className={`price ${affordable ? '' : 'too-expensive'}`}>{price} gold</p>
}

export function ShopScreen({ run, onBuyCard, onBuyRelic, onRemoveCard, onLeave }) {
  const [removing, setRemoving] = useState(false)
  const { shop } = run
  const removeCost = getRemoveCost(run)
  const canRemove = !shop.removeUsed && run.gold >= removeCost && run.deck.length > 0

  return (
    <main className="game-shell reward-shell">
      <section className="reward-panel shop-panel">
        <div className="status-strip">
          <div>
            <p className="eyebrow">Shop</p>
            <h1>Merchant</h1>
            <p className="run-message">{run.message}</p>
          </div>
          <span className="turn-pill gold">Gold {run.gold}</span>
        </div>

        <div className="shop-cards">
          {shop.cards.map((offer, index) => (
            <div className="shop-item" key={offer.item.id}>
              <CardButton card={offer.item} disabled={offer.sold || run.gold < offer.price} onClick={() => onBuyCard(index)} />
              <PriceTag price={offer.price} sold={offer.sold} affordable={run.gold >= offer.price} />
            </div>
          ))}
        </div>

        <div className="shop-row">
          {shop.relics.map((offer, index) => (
            <div className="shop-item" key={offer.item.id}>
              <RelicButton relic={offer.item} disabled={offer.sold || run.gold < offer.price} onClick={() => onBuyRelic(index)} />
              <PriceTag price={offer.price} sold={offer.sold} affordable={run.gold >= offer.price} />
            </div>
          ))}
          <div className="shop-item">
            <button className="relic-card service" disabled={!canRemove} onClick={() => setRemoving(true)} type="button">
              <span>Service</span>
              <strong>Card Removal</strong>
              <p>Remove one card from your deck. The price rises each time.</p>
            </button>
            <PriceTag price={removeCost} sold={shop.removeUsed} affordable={run.gold >= removeCost} />
          </div>
        </div>

        <button className="secondary-action" onClick={onLeave} type="button">Leave</button>
      </section>

      {removing && (
        <DeckPicker
          cards={run.deck}
          title="Remove a Card"
          subtitle={`Costs ${removeCost} gold.`}
          onClose={() => setRemoving(false)}
          onPick={(card) => {
            onRemoveCard(card.deckId)
            setRemoving(false)
          }}
        />
      )}
    </main>
  )
}
