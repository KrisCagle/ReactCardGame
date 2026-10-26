import { useCallback, useEffect, useRef, useState } from 'react'
import { Backdrop } from '../art/Backdrop'
import { CharacterArt } from '../art/CharacterArt'
import { EnemyArt } from '../art/EnemyArt'
import { Icon } from '../art/icons'
import { canPlayCard, describeEnemyPassive, getEnemyIntent, relicAttackBonus } from '../game/combat'
import { describeCard } from '../game/cards'
import { DeckPicker } from './shared'
import { GameCard } from './ui/GameCard'
import { EnergyOrb, HpBar, IntentBadge, StatusIcons } from './ui/hud'
import { Tooltip } from './ui/Tooltip'
import { TopBar } from './ui/TopBar'

const DISCARD_ANIMATION_MS = 260
const DEATH_ANIMATION_MS = 1100

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const floaterText = (event) => {
  if (event.kind === 'damage') return `-${event.amount}`
  if (event.kind === 'heal') return `+${event.amount}`
  if (event.kind === 'block') return `+${event.amount} block`
  if (event.kind === 'blocked') return 'Blocked'
  return `+${event.amount} ${event.status}`
}

function Creature({ side, name, combatant, fx, art, artRef, top, dying, footer }) {
  const events = fx?.events.filter((event) => event.side === side && event.kind !== 'attack') ?? []
  const hit = events.some((event) => event.kind === 'damage')
  const attacking = fx?.events.some((event) => event.side === side && event.kind === 'attack')
  // Changing the key remounts the wrapper, which restarts its CSS animations.
  const fxKey = hit || attacking || events.length ? `fx-${fx.id}` : 'idle'

  return (
    <article className={`creature creature-${side} ${dying ? 'is-dying' : ''}`}>
      <div className="creature-top">{top}</div>
      <div className={`creature-art ${hit ? 'is-hit' : ''} ${attacking ? 'is-attacking' : ''}`} key={fxKey} ref={artRef}>
        {art}
        <div className="floaters" aria-hidden="true">
          {events.map((event, index) => (
            <span className={`floater floater-${event.kind}`} key={index} style={{ '--i': index }}>
              {floaterText(event)}
            </span>
          ))}
        </div>
      </div>
      <div className="creature-plate">
        <h2>{name}</h2>
        <HpBar block={combatant.block} hp={combatant.hp} maxHp={combatant.maxHp} />
        <StatusIcons combatant={combatant} />
        {footer}
      </div>
    </article>
  )
}

function Hand({ combat, discarding, onPlay }) {
  const { hand } = combat
  const n = hand.length
  const context = { player: combat.player, enemy: combat.enemy, attackBonus: relicAttackBonus(combat) }

  return (
    <div className={`hand ${discarding ? 'is-discarding' : ''}`} style={{ '--n': n }}>
      {hand.map((card, index) => {
        const offset = index - (n - 1) / 2
        const style = {
          '--i': index,
          '--rot': `${offset * Math.min(4, 26 / Math.max(n, 1))}deg`,
          '--lift': `${offset * offset * 1.3}px`,
        }
        const playable = canPlayCard(combat, card) && !discarding
        return (
          <GameCard
            card={card}
            className={`hand-card ${playable ? 'is-playable' : ''}`}
            context={context}
            disabled={!playable}
            key={card.instanceId}
            onClick={(event) => onPlay(card, event.currentTarget)}
            style={style}
          />
        )
      })}
    </div>
  )
}

// A copy of the played card that flies from the hand to its target.
function CardGhost({ ghost, onDone }) {
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current
    if (!element?.animate) return onDone(ghost.id)
    const dx = ghost.to.x - (ghost.from.left + ghost.from.width / 2)
    const dy = ghost.to.y - (ghost.from.top + ghost.from.height / 2)
    const animation = element.animate(
      [
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 60}px) scale(1.05)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.3) rotate(8deg)`, opacity: 0 },
      ],
      { duration: 420, easing: 'cubic-bezier(0.3, 0.7, 0.2, 1)' },
    )
    animation.onfinish = () => onDone(ghost.id)
    return () => animation.cancel()
  }, [ghost, onDone])

  return (
    <div className="card-ghost" ref={ref} style={{ left: ghost.from.left, top: ghost.from.top, '--card-w': `${ghost.from.width}px` }}>
      <GameCard card={ghost.card} showKeywords={false} />
    </div>
  )
}

function PileButton({ label, icon, count, onClick, className = '' }) {
  return (
    <Tooltip as="span" className={`pile ${className}`} focusable={false} side="top" title={label} text="Click to view.">
      <button aria-label={`${label}: ${count} cards`} onClick={onClick} type="button">
        <Icon name={icon} size={26} />
        <b>{count}</b>
      </button>
    </Tooltip>
  )
}

function GameOver({ run, combat, onRestart }) {
  return (
    <div className="combat-overlay defeat">
      <section className="overlay-panel">
        <p className="eyebrow">Defeat</p>
        <h1>The climb ends here</h1>
        <p className="muted">
          {combat.enemy.name} struck you down in Act {run.act}, floor {(combat.node.floor ?? 0) + 1}.
        </p>
        <ul className="overlay-stats">
          <li>
            <b>{run.deck.length}</b> cards
          </li>
          <li>
            <b>{run.relics.length}</b> relics
          </li>
          <li>
            <b>{run.gold}</b> gold
          </li>
        </ul>
        <button className="btn-primary" onClick={onRestart} type="button">
          Try again
        </button>
      </section>
    </div>
  )
}

export function CombatScreen({ combat, run, onEndTurn, onPlayCard, onUsePotion, onFinish, onRestart }) {
  const [discarding, setDiscarding] = useState(false)
  const [ghosts, setGhosts] = useState([])
  const [viewing, setViewing] = useState(null)
  const playerArtRef = useRef(null)
  const enemyArtRef = useRef(null)
  const discardTimer = useRef(null)
  const ghostCounter = useRef(0)
  const playing = combat.outcome === 'playing'
  const intent = getEnemyIntent(combat)
  // Stable so a ghost's animation effect doesn't restart on every re-render.
  const removeGhost = useCallback((id) => setGhosts((current) => current.filter((ghost) => ghost.id !== id)), [])

  // Give the enemy's death a moment on screen before showing rewards.
  useEffect(() => {
    if (combat.outcome !== 'won') return undefined
    const timer = setTimeout(onFinish, reducedMotion() ? 250 : DEATH_ANIMATION_MS)
    return () => clearTimeout(timer)
  }, [combat.outcome, onFinish])

  useEffect(() => () => clearTimeout(discardTimer.current), [])

  const playCard = (card, element) => {
    if (!playing || discarding || !canPlayCard(combat, card)) return
    const target = card.type === 'Attack' ? enemyArtRef.current : playerArtRef.current
    if (element && target && !reducedMotion()) {
      const targetRect = target.getBoundingClientRect()
      // A counter, not the card id: a reshuffled card can be played again mid-flight.
      ghostCounter.current += 1
      const ghost = {
        id: ghostCounter.current,
        card,
        from: element.getBoundingClientRect(),
        to: { x: targetRect.left + targetRect.width / 2, y: targetRect.top + targetRect.height / 2 },
      }
      setGhosts((current) => [...current, ghost])
    }
    onPlayCard(card)
  }

  const endTurn = () => {
    if (!playing || discarding) return
    if (reducedMotion() || combat.hand.length === 0) return onEndTurn()
    setDiscarding(true)
    discardTimer.current = setTimeout(() => {
      setDiscarding(false)
      onEndTurn()
    }, DISCARD_ANIMATION_MS)
  }

  // Keyboard: 1-9 play the matching card in hand, E ends the turn.
  useEffect(() => {
    const onKey = (event) => {
      if (event.target.closest?.('input, textarea') || viewing) return
      if (event.key === 'e' || event.key === 'E') endTurn()
      const index = Number(event.key) - 1
      if (index >= 0 && index < 9 && combat.hand[index]) playCard(combat.hand[index], document.querySelectorAll('.hand-card')[index])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const piles = {
    draw: { title: 'Draw Pile', cards: combat.drawPile, subtitle: 'Shown in alphabetical order, not draw order.' },
    discard: { title: 'Discard Pile', cards: combat.discardPile },
    exhaust: { title: 'Exhausted', cards: combat.exhaustPile },
  }

  return (
    <main className={`screen combat-screen act-${run.act}`}>
      <Backdrop act={run.act} />
      <TopBar floor={combat.node.floor} hp={combat.player.hp} onUsePotion={playing ? onUsePotion : undefined} run={run} />

      <section className="arena" aria-label="Battle">
        <div className="combat-log" aria-live="polite">
          {combat.log.slice(0, 3).map((entry, index) => (
            <p key={`${combat.turn}-${index}-${entry}`} style={{ '--age': index }}>
              {entry}
            </p>
          ))}
        </div>

        <Creature
          art={<CharacterArt characterId={run.character.id} />}
          artRef={playerArtRef}
          combatant={combat.player}
          footer={
            combat.powerPile.length > 0 && (
              <div className="power-row">
                {combat.powerPile.map((card) => (
                  <Tooltip className="power-chip" key={card.instanceId} side="top" title={card.name} text={describeCard(card)}>
                    <Icon name="flame" size={14} /> {card.name}
                  </Tooltip>
                ))}
              </div>
            )
          }
          fx={combat.fx}
          name={run.character.name}
          side="player"
        />

        <Creature
          art={<EnemyArt name={combat.enemy.name} />}
          artRef={enemyArtRef}
          combatant={combat.enemy}
          dying={combat.outcome === 'won'}
          fx={combat.fx}
          name={combat.enemy.name}
          side="enemy"
          top={playing && <IntentBadge enemy={combat.enemy} move={intent} player={combat.player} />}
        />
        {describeEnemyPassive(combat.enemy).length > 0 && <span className="sr-only">{describeEnemyPassive(combat.enemy).join(' ')}</span>}
      </section>

      <section className="combat-hud">
        <div className="hud-side hud-left">
          <EnergyOrb energy={combat.player.energy} maxEnergy={combat.player.maxEnergy} />
          <PileButton className="pile-draw" count={combat.drawPile.length} icon="cards" label="Draw Pile" onClick={() => setViewing('draw')} />
        </div>
        <Hand combat={combat} discarding={discarding} onPlay={playCard} />
        <div className="hud-side hud-right">
          <button className="end-turn btn-primary" disabled={!playing || discarding} onClick={endTurn} type="button">
            End Turn <kbd>E</kbd>
          </button>
          <div className="pile-row">
            <PileButton className="pile-discard" count={combat.discardPile.length} icon="scroll" label="Discard Pile" onClick={() => setViewing('discard')} />
            {combat.exhaustPile.length > 0 && (
              <PileButton className="pile-exhaust" count={combat.exhaustPile.length} icon="flame" label="Exhausted" onClick={() => setViewing('exhaust')} />
            )}
          </div>
        </div>
      </section>

      {playing && (
        <div className="turn-banner" key={`turn-${combat.turn}`} aria-hidden="true">
          {combat.turn === 1 ? 'Battle!' : `Turn ${combat.turn}`}
        </div>
      )}

      {ghosts.map((ghost) => (
        <CardGhost ghost={ghost} key={ghost.id} onDone={removeGhost} />
      ))}

      {combat.outcome === 'won' && (
        <div className="combat-overlay victory">
          <div className="victory-banner">Victory</div>
          <button className="btn-gold" onClick={onFinish} type="button">
            Claim rewards
          </button>
        </div>
      )}
      {combat.outcome === 'lost' && <GameOver combat={combat} onRestart={onRestart} run={run} />}

      {viewing && <DeckPicker cards={piles[viewing].cards} onClose={() => setViewing(null)} sort={viewing === 'draw'} subtitle={piles[viewing].subtitle} title={piles[viewing].title} />}
    </main>
  )
}
