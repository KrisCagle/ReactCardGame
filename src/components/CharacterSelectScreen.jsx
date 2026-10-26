import { Backdrop } from '../art/Backdrop'
import { CharacterArt } from '../art/CharacterArt'
import { Icon } from '../art/icons'
import { characters } from '../data/gameData'
import { describeSave } from '../game/save'
import { SoundControls } from './ui/SoundControls'

export function CharacterSelectScreen({ onChoose, savedGame, onContinue, onDiscardSave }) {
  return (
    <main className="screen select-screen">
      <Backdrop act="menu" />
      <div className="select-corner">
        <SoundControls />
      </div>
      <header className="select-header">
        <p className="eyebrow">New Run</p>
        <h1>Choose Your Fighter</h1>
        <p className="muted">Each character has their own deck, passive, and card pool. Three acts stand between you and the top.</p>
      </header>

      {savedGame && (
        <section aria-label="Saved run" className="continue-panel panel">
          <Icon name="save" size={26} />
          <span className="continue-copy">
            <strong>Run in progress</strong>
            <span className="muted">{describeSave(savedGame)}</span>
          </span>
          <button className="btn-gold" onClick={onContinue} type="button">
            Continue
          </button>
          <button onClick={onDiscardSave} type="button">
            Abandon
          </button>
        </section>
      )}

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
