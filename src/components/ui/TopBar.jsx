import { useState } from 'react'
import { Icon } from '../../art/icons'
import { actNames } from '../../data/gameData'
import { DeckPicker } from '../shared'
import { PotionBelt, RelicBar } from './hud'
import { Tooltip } from './Tooltip'

// The StS-style bar across the top of every screen once a run has started.
export function TopBar({ run, hp, onUsePotion, onDiscardPotion, floor }) {
  const [showDeck, setShowDeck] = useState(false)
  const currentHp = hp ?? run.player.hp

  return (
    <header className="top-bar">
      <div className="top-bar-row">
        <div className="top-bar-group">
          <strong className="top-bar-name">{run.character.name}</strong>
          <Tooltip className="top-stat hp" side="bottom" title="Health" text="Reach 0 and the run is over.">
            <Icon name="heart" size={20} />
            {currentHp}/{run.player.maxHp}
          </Tooltip>
          <Tooltip className="top-stat gold" side="bottom" title="Gold" text="Spend it at shops and events.">
            <Icon name="coin" size={20} />
            {run.gold}
          </Tooltip>
          <PotionBelt potions={run.potions} onUse={onUsePotion} onDiscard={onDiscardPotion} />
        </div>
        <div className="top-bar-group">
          <span className="top-stat act">
            Act {run.act}
            {floor != null && ` - Floor ${floor + 1}`}
            <span className="act-name">{actNames[run.act]}</span>
          </span>
          <button className="top-stat deck-button" onClick={() => setShowDeck(true)} type="button">
            <Icon name="cards" size={20} />
            {run.deck.length}
          </button>
        </div>
      </div>
      <RelicBar relics={run.relics} />
      {showDeck && <DeckPicker cards={run.deck} title="Your Deck" onClose={() => setShowDeck(false)} />}
    </header>
  )
}
