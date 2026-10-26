import { useState } from 'react'
import { Icon } from '../art/icons'
import { canGainPotion } from '../game/rewards'
import { getRemoveCost } from '../game/runState'
import { CardButton, DeckPicker, RelicButton } from './shared'
import { PotionIcon } from './ui/hud'
import { ScreenFrame } from './ui/ScreenFrame'

function PriceTag({ price, sold, affordable }) {
  if (sold) return <span className="price sold">Sold</span>
  return (
    <span className={`price ${affordable ? '' : 'too-expensive'}`}>
      <Icon name="coin" size={14} /> {price}
    </span>
  )
}

export function ShopScreen({ run, onBuy, onRemoveCard, onLeave, onDiscardPotion }) {
  const [removing, setRemoving] = useState(false)
  const { shop } = run
  const removeCost = getRemoveCost(run)
  const canRemove = !shop.removeUsed && run.gold >= removeCost && run.deck.length > 0
  const unavailable = (offer) => offer.sold || run.gold < offer.price

  return (
    <ScreenFrame className="shop-screen" eyebrow="Shop" message={run.message} onDiscardPotion={onDiscardPotion} run={run} title="Merchant" wide>
      <h2 className="shop-heading">Cards</h2>
      <div className="shop-cards">
        {shop.cards.map((offer, index) => (
          <div className={`shop-item ${offer.sold ? 'is-sold' : ''}`} key={offer.item.id}>
            <CardButton card={offer.item} disabled={unavailable(offer)} onClick={() => onBuy('cards', index)} />
            <PriceTag affordable={run.gold >= offer.price} price={offer.price} sold={offer.sold} />
          </div>
        ))}
      </div>

      <div className="shop-columns">
        <div>
          <h2 className="shop-heading">Relics</h2>
          <div className="shop-list">
            {shop.relics.map((offer, index) => (
              <div className={`shop-item row ${offer.sold ? 'is-sold' : ''}`} key={offer.item.id}>
                <RelicButton disabled={unavailable(offer)} onClick={() => onBuy('relics', index)} relic={offer.item} />
                <PriceTag affordable={run.gold >= offer.price} price={offer.price} sold={offer.sold} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="shop-heading">Potions & Services</h2>
          <div className="shop-list">
            {shop.potions.map((offer, index) => (
              <div className={`shop-item row ${offer.sold ? 'is-sold' : ''}`} key={`${offer.item.id}-${index}`}>
                <button className="relic-card potion-offer" disabled={unavailable(offer) || !canGainPotion(run)} onClick={() => onBuy('potions', index)} type="button">
                  <span className="relic-card-icon">
                    <PotionIcon potion={offer.item} size={34} />
                  </span>
                  <span className="relic-card-copy">
                    <span className="relic-card-tag">Potion</span>
                    <strong>{offer.item.name}</strong>
                    <span>{offer.item.text}</span>
                  </span>
                </button>
                <PriceTag affordable={run.gold >= offer.price} price={offer.price} sold={offer.sold} />
              </div>
            ))}
            <div className={`shop-item row ${shop.removeUsed ? 'is-sold' : ''}`}>
              <button className="relic-card service" disabled={!canRemove} onClick={() => setRemoving(true)} type="button">
                <span className="relic-card-icon">
                  <Icon name="cross" size={30} />
                </span>
                <span className="relic-card-copy">
                  <span className="relic-card-tag">Service</span>
                  <strong>Card Removal</strong>
                  <span>Remove one card from your deck. The price rises each time.</span>
                </span>
              </button>
              <PriceTag affordable={run.gold >= removeCost} price={removeCost} sold={shop.removeUsed} />
            </div>
          </div>
        </div>
      </div>

      <button className="center-action" onClick={onLeave} type="button">
        Leave shop
      </button>

      {removing && (
        <DeckPicker
          cards={run.deck}
          onClose={() => setRemoving(false)}
          onPick={(card) => {
            onRemoveCard(card.deckId)
            setRemoving(false)
          }}
          subtitle={`Costs ${removeCost} gold.`}
          title="Remove a Card"
        />
      )}
    </ScreenFrame>
  )
}
