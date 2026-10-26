import { useState } from 'react'
import { canGainPotion } from '../game/rewards'
import { getRemoveCost } from '../game/runState'
import { CardButton, DeckPicker, RelicButton, RunHeader } from './shared'

function PriceTag({ price, sold, affordable }) {
  if (sold) return <p className="price sold">Sold</p>
  return <p className={`price ${affordable ? '' : 'too-expensive'}`}>{price} gold</p>
}

export function ShopScreen({ run, onBuy, onRemoveCard, onLeave, onDiscardPotion }) {
  const [removing, setRemoving] = useState(false)
  const { shop } = run
  const removeCost = getRemoveCost(run)
  const canRemove = !shop.removeUsed && run.gold >= removeCost && run.deck.length > 0
  const unavailable = (offer) => offer.sold || run.gold < offer.price

  return (
    <main className="game-shell reward-shell">
      <section className="reward-panel shop-panel">
        <div>
          <p className="eyebrow">Shop</p>
          <h1>Merchant</h1>
          <p className="run-message">{run.message}</p>
        </div>

        <RunHeader run={run} onDiscardPotion={onDiscardPotion} />

        <div className="shop-cards">
          {shop.cards.map((offer, index) => (
            <div className="shop-item" key={offer.item.id}>
              <CardButton card={offer.item} disabled={unavailable(offer)} onClick={() => onBuy('cards', index)} />
              <PriceTag price={offer.price} sold={offer.sold} affordable={run.gold >= offer.price} />
            </div>
          ))}
        </div>

        <div className="shop-row">
          {shop.relics.map((offer, index) => (
            <div className="shop-item" key={offer.item.id}>
              <RelicButton relic={offer.item} disabled={unavailable(offer)} onClick={() => onBuy('relics', index)} />
              <PriceTag price={offer.price} sold={offer.sold} affordable={run.gold >= offer.price} />
            </div>
          ))}
        </div>

        <div className="shop-row">
          {shop.potions.map((offer, index) => (
            <div className="shop-item" key={`${offer.item.id}-${index}`}>
              <button
                className="relic-card potion-offer"
                disabled={unavailable(offer) || !canGainPotion(run)}
                onClick={() => onBuy('potions', index)}
                type="button"
              >
                <span>Potion</span>
                <strong>{offer.item.name}</strong>
                <p>{offer.item.text}</p>
              </button>
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
