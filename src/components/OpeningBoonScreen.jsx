import { OpeningBoonButton } from './shared'

export function OpeningBoonScreen({ run, onChoose }) {
  return (
    <main className="game-shell reward-shell">
      <section className="reward-panel">
        <div>
          <p className="eyebrow">Opening Choice</p>
          <h1>{run.character.name}'s First Edge</h1>
          <p className="run-message">Each run offers three different openings from a larger pool. Pick one and begin the climb.</p>
        </div>

        <div className="reward-cards">
          {run.openingChoices.map((boon) => (
            <OpeningBoonButton boon={boon} key={boon.id} onClick={() => onChoose(boon)} />
          ))}
        </div>
      </section>
    </main>
  )
}
