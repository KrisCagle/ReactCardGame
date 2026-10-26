import { ACT_COUNT } from '../data/gameData'

export function VictoryScreen({ run, onRestart }) {
  return (
    <main className="game-shell reward-shell">
      <section className="reward-panel victory-panel">
        <div>
          <p className="eyebrow">Victory</p>
          <h1>The Climb Is Won</h1>
          <p className="run-message">{run.message}</p>
        </div>

        <div className="victory-stats">
          <p><strong>{ACT_COUNT}</strong> acts cleared</p>
          <p><strong>{run.player.hp}/{run.player.maxHp}</strong> HP remaining</p>
          <p><strong>{run.deck.length}</strong> cards in deck</p>
          <p><strong>{run.relics.length}</strong> relics: {run.relics.map((relic) => relic.name).join(', ')}</p>
        </div>

        <button className="primary secondary-action" onClick={onRestart} type="button">Start a new run</button>
      </section>
    </main>
  )
}
