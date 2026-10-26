import { CharacterArt } from '../art/CharacterArt'
import { ACT_COUNT } from '../data/gameData'
import { CardButton } from './shared'
import { RelicBar } from './ui/hud'
import { ScreenFrame } from './ui/ScreenFrame'

export function VictoryScreen({ run, onRestart }) {
  return (
    <ScreenFrame className="victory-screen" eyebrow="Victory" message={run.message} run={run} title="The Climb Is Won" wide>
      <div className="victory-hero">
        <CharacterArt characterId={run.character.id} />
        <ul className="overlay-stats">
          <li>
            <b>{ACT_COUNT}</b> acts cleared
          </li>
          <li>
            <b>
              {run.player.hp}/{run.player.maxHp}
            </b>{' '}
            HP left
          </li>
          <li>
            <b>{run.deck.length}</b> cards
          </li>
          <li>
            <b>{run.gold}</b> gold
          </li>
        </ul>
      </div>
      <h2>Relics</h2>
      <RelicBar relics={run.relics} side="top" />
      <h2>Final Deck</h2>
      <div className="deck-grid read-only">
        {run.deck.map((card) => (
          <CardButton card={card} disabled key={card.deckId} showKeywords={false} />
        ))}
      </div>
      <button className="btn-gold center-action" onClick={onRestart} type="button">
        Start a new run
      </button>
    </ScreenFrame>
  )
}
