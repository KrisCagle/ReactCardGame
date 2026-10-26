// Dev-only page for checking the art: open the app with ?gallery in the URL.
import { CharacterArt } from '../art/CharacterArt'
import { EnemyArt } from '../art/EnemyArt'
import { enemyArtNames } from '../art/enemyLooks'
import { iconNames } from '../art/iconPaths'
import { Icon } from '../art/icons'
import { characters } from '../data/gameData'

export function ArtGallery() {
  return (
    <main className="art-gallery">
      <h1>Art Gallery</h1>
      <section className="gallery-grid">
        {characters.map((character) => (
          <figure key={character.id}>
            <CharacterArt characterId={character.id} />
            <figcaption>{character.name}</figcaption>
          </figure>
        ))}
        {enemyArtNames.map((name) => (
          <figure key={name}>
            <EnemyArt name={name} />
            <figcaption>{name}</figcaption>
          </figure>
        ))}
      </section>
      <section className="gallery-icons">
        {iconNames.map((name) => (
          <span key={name} title={name}>
            <Icon name={name} size={32} />
            <small>{name}</small>
          </span>
        ))}
      </section>
    </main>
  )
}
