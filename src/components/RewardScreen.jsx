import { useState } from 'react'
import { Icon } from '../art/icons'
import { canGainPotion } from '../game/rewards'
import { CardButton, RelicButton } from './shared'
import { relicIcon } from '../art/relicIcons'
import { PotionIcon } from './ui/hud'
import { ScreenFrame } from './ui/ScreenFrame'

const itemLabel = (item) => {
  if (item.type === 'card') return 'Add a card to your deck'
  if (item.type === 'relicChoice') return 'Choose a boss relic'
  if (item.type === 'relic') return item.relic.name
  return item.potion.name
}

const itemDetail = (item) => {
  if (item.type === 'relic') return item.relic.text
  if (item.type === 'potion') return item.potion.text
  return `${item.choices.length} to choose from`
}

const ItemIcon = ({ item }) => {
  if (item.type === 'potion') return <PotionIcon potion={item.potion} size={30} />
  if (item.type === 'relic') return <Icon name={relicIcon(item.relic)} size={30} />
  return <Icon name={item.type === 'card' ? 'cards' : 'crown'} size={30} />
}

export function RewardScreen({ run, onClaim, onProceed, onDiscardPotion }) {
  const [openItemId, setOpenItemId] = useState(null)
  const { rewards } = run
  const openItem = rewards.items.find((item) => item.id === openItemId)
  const potionsFull = !canGainPotion(run)

  return (
    <ScreenFrame eyebrow="Rewards" message={rewards.message} onDiscardPotion={onDiscardPotion} run={run} title={rewards.title} wide={Boolean(openItem)}>
      {openItem ? (
        <>
          <div className={`choice-grid ${openItem.type === 'card' ? 'card-choices' : ''}`}>
            {openItem.choices.map((choice) =>
              openItem.type === 'card' ? (
                <CardButton card={choice} className="reward-card" key={choice.id} onClick={() => onClaim(openItem.id, choice.id)} />
              ) : (
                <RelicButton key={choice.id} relic={choice} onClick={() => onClaim(openItem.id, choice.id)} />
              ),
            )}
          </div>
          <button className="center-action" onClick={() => setOpenItemId(null)} type="button">
            Back
          </button>
        </>
      ) : (
        <>
          <ul className="reward-list">
            {rewards.items.map((item, index) => {
              const blocked = item.type === 'potion' && potionsFull
              return (
                <li key={item.id} style={{ '--i': index }}>
                  <button
                    className={`reward-item ${item.type}`}
                    disabled={blocked}
                    onClick={() => (item.choices ? setOpenItemId(item.id) : onClaim(item.id))}
                    type="button"
                  >
                    <span className="reward-icon">
                      <ItemIcon item={item} />
                    </span>
                    <span className="reward-copy">
                      <strong>{itemLabel(item)}</strong>
                      <span>{blocked ? 'Potion belt is full. Discard one from the top bar to take this.' : itemDetail(item)}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          <button className="center-action" onClick={onProceed} type="button">
            Proceed <Icon name="arrowUp" size={16} />
          </button>
        </>
      )}
    </ScreenFrame>
  )
}
