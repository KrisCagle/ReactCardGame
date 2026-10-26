import { canPlayCard, describeEnemyPassive, describeIntent, getEnemyIntent } from '../game/combat'
import { CardButton, HealthBar, PotionBelt, RelicBar, Stat, StatusList } from './shared'

export function CombatScreen({ combat, onEndTurn, onPlayCard, onUsePotion, onRestart, run }) {
  const enemyMove = getEnemyIntent(combat)
  const passives = describeEnemyPassive(combat.enemy)
  const playing = combat.outcome === 'playing'
  const healthPercent = Math.round((combat.player.hp / combat.player.maxHp) * 100)
  const enemyPercent = Math.round((combat.enemy.hp / combat.enemy.maxHp) * 100)

  return (
    <main className="game-shell">
      <section className="battlefield" aria-label="Combat area">
        <div className="status-strip">
          <div>
            <p className="eyebrow">{combat.node.type}</p>
            <h1>{combat.node.label}</h1>
          </div>
          <div className="turn-pill">Turn {combat.turn}</div>
        </div>

        <div className="combat-tray">
          <PotionBelt potions={run.potions} onUse={playing ? onUsePotion : undefined} />
          <RelicBar relics={run.relics} />
        </div>

        <div className="combatants">
          <article className="combatant player">
            <div className={`avatar ${run.character.avatar}`} aria-hidden="true">
              <span></span>
            </div>
            <div className="combatant-copy">
              <h2>{run.character.name}</h2>
              <HealthBar value={combat.player.hp} max={combat.player.maxHp} percent={healthPercent} />
              <p>Block {combat.player.block} - Energy {combat.player.energy}/{combat.player.maxEnergy}</p>
              <StatusList combatant={combat.player} />
              {combat.powerPile.length > 0 && (
                <p className="powers">Powers: {combat.powerPile.map((card) => card.name).join(', ')}</p>
              )}
            </div>
          </article>

          <div className="versus">VS</div>

          <article className="combatant enemy">
            <div className="avatar beast" aria-hidden="true">
              <span></span>
            </div>
            <div className="combatant-copy">
              <h2>{combat.enemy.name}</h2>
              <HealthBar value={combat.enemy.hp} max={combat.enemy.maxHp} percent={enemyPercent} />
              <p>Block {combat.enemy.block}</p>
              <StatusList combatant={combat.enemy} />
              {passives.length > 0 && (
                <ul className="status-list" aria-label="Enemy passives">
                  {passives.map((text) => (
                    <li className="status-chip passive" key={text} title={text}>{text.split(':')[0]}</li>
                  ))}
                </ul>
              )}
              <div className="intent">{enemyMove.intent}: {describeIntent(enemyMove, combat.enemy, combat.player)}</div>
            </div>
          </article>
        </div>

        {combat.outcome !== 'playing' && (
          <div className="outcome">
            <strong>{combat.outcome === 'won' ? 'Victory' : 'Defeat'}</strong>
            {combat.outcome === 'lost' && <button onClick={onRestart} type="button">Restart run</button>}
          </div>
        )}
      </section>

      <section className="table">
        <aside className="pile-stats" aria-label="Deck piles">
          <Stat label="Draw" value={combat.drawPile.length} />
          <Stat label="Discard" value={combat.discardPile.length} />
          <Stat label="Exhaust" value={combat.exhaustPile.length} />
        </aside>

        <div className="hand" aria-label="Cards in hand">
          {combat.hand.map((card) => (
            <CardButton
              card={card}
              disabled={!canPlayCard(combat, card)}
              key={card.instanceId}
              onClick={() => onPlayCard(card)}
            />
          ))}
        </div>

        <div className="controls">
          <button className="primary" onClick={onEndTurn} disabled={combat.outcome !== 'playing'} type="button">End Turn</button>
        </div>
      </section>

      <section className="combat-log" aria-label="Combat log">
        {combat.log.map((entry, index) => (
          <p key={`${entry}-${index}`}>{entry}</p>
        ))}
      </section>
    </main>
  )
}
