import { Backdrop } from '../art/Backdrop'
import { CharacterArt } from '../art/CharacterArt'
import { Icon } from '../art/icons'
import { characters } from '../data/gameData'

export function CharacterSelectScreen({ onChoose }) {
  return (
    <main className="screen select-screen">
      <Backdrop act="menu" />
      <header className="select-header">
        <p className="eyebrow">New Run</p>
        <h1>Choose Your Fighter</h1>
        <p className="muted">Each character has their own deck, passive, and card pool. Three acts stand between you and the top.</p>
      </header>

      <div className="character-grid">
        {characters.map((character) => (
          <button className={`character-card char-${character.id}`} key={character.id} onClick={() => onChoose(character)} type="button">
            <span className="character-portrait">
              <CharacterArt characterId={character.id} />
            </span>
            <span className="character-copy">
              <span className="eyebrow">{character.title}</span>
              <strong className="character-name">{character.name}</strong>
              <span className="character-hp">
                <Icon name="heart" size={16} /> {character.maxHp} HP
              </span>
              <span className="muted">{character.summary}</span>
              <span className="trait-list">
                {character.traits.map((trait) => (
                  <span key={trait}>
                    <Icon name="star" size={12} /> {trait}
                  </span>
                ))}
              </span>
            </span>
          </button>
        ))}
      </div>
    </main>
  )
}
