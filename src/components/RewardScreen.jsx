import { useState } from 'react'
import { canGainPotion } from '../game/rewards'
import { CardButton, RelicButton, RunHeader } from './shared'

const itemLabel = (item) => {
  if (item.type === 'card') return 'Add a card to your deck'
  if (item.type === 'relicChoice') return 'Choose a boss relic'
  if (item.type === 'relic') return `Relic: ${item.relic.name}`
  return `Potion: ${item.potion.name}`
}

const itemDetail = (item) => (item.type === 'relic' ? item.relic.text : item.type === 'potion' ? item.potion.text : '')

export function RewardScreen({ run, onClaim, onProceed, onDiscardPotion }) {
  const [openItemId, setOpenItemId] = useState(null)
  const { rewards } = run
  const openItem = rewards.items.find((item) => item.id === openItemId)
  const potionsFull = !canGainPotion(run)

  return (
    <main className="game-shell reward-shell">
      <section className="reward-panel">
        <div>
          <p className="eyebrow">Rewards</p>
          <h1>{rewards.title}</h1>
          <p className="run-message">{rewards.message}</p>
        </div>

        <RunHeader run={run} onDiscardPotion={onDiscardPotion} />

        {openItem ? (
          <>
            <div className="reward-cards">
              {openItem.choices.map((choice) =>
                openItem.type === 'card' ? (
                  <CardButton card={choice} key={choice.id} onClick={() => onClaim(openItem.id, choice.id)} />
                ) : (
                  <RelicButton key={choice.id} relic={choice} onClick={() => onClaim(openItem.id, choice.id)} />
                ),
              )}
            </div>
            <button className="secondary-action" onClick={() => setOpenItemId(null)} type="button">Back</button>
          </>
        ) : (
          <>
            <ul className="reward-list">
              {rewards.items.map((item) => {
                const blocked = item.type === 'potion' && potionsFull
                return (
                  <li key={item.id}>
                    <button
                      className={`reward-item ${item.type}`}
                      disabled={blocked}
                      onClick={() => (item.choices ? setOpenItemId(item.id) : onClaim(item.id))}
                      type="button"
                    >
                      <strong>{itemLabel(item)}</strong>
                      <span>{blocked ? 'Potion belt is full - discard one above to take this.' : itemDetail(item)}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
            <button className="secondary-action" onClick={onProceed} type="button">Proceed</button>
          </>
        )}
      </section>
    </main>
  )
}
