import { characters } from '../data/gameData'

export function CharacterSelectScreen({ onChoose }) {
  return (
    <main className="game-shell select-shell">
      <section className="select-panel">
        <div className="select-copy">
          <p className="eyebrow">New Run</p>
          <h1>Choose Your Fighter</h1>
          <p className="run-message">Each character begins with a different deck, passive ability, and approach to the climb.</p>
        </div>

        <div className="character-grid">
          {characters.map((character) => (
            <button className="character-card" key={character.id} onClick={() => onChoose(character)} type="button">
              <div className={`avatar ${character.avatar} large`} aria-hidden="true">
                <span></span>
              </div>
              <div className="character-copy">
                <p className="eyebrow">{character.title}</p>
                <h2>{character.name}</h2>
                <p>{character.summary}</p>
                <strong>{character.maxHp} HP</strong>
                <ul className="trait-list">
                  {character.traits.map((trait) => (
                    <li key={trait}>{trait}</li>
                  ))}
                </ul>
              </div>
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}
