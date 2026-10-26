// Combat and run HUD pieces: HP bars, statuses, intents, energy, relics, potions.
import { Icon } from '../../art/icons'
import { relicIcon } from '../../art/relicIcons'
import { POTION_SLOTS, keywords } from '../../data/gameData'
import { DURATION_DEBUFFS, calculateAttackDamage, describeEnemyPassive } from '../../game/combat'
import { Tooltip } from './Tooltip'

export function HpBar({ hp, maxHp, block = 0 }) {
  const percent = Math.max(0, Math.min(100, (hp / maxHp) * 100))
  return (
    <div className={`hp-bar ${block > 0 ? 'has-block' : ''}`}>
      {block > 0 && (
        <Tooltip className="block-badge" title="Block" text={keywords.block.text}>
          <Icon name="shield" size={30} />
          <span>{block}</span>
        </Tooltip>
      )}
      <div className="hp-track">
        {/* The trail lags behind the fill so damage reads as a chunk being lost. */}
        <div className="hp-trail" style={{ width: `${percent}%` }} />
        <div className="hp-fill" style={{ width: `${percent}%` }} />
        <span className="hp-text">
          {hp}/{maxHp}
        </span>
      </div>
    </div>
  )
}

const STATUS_ORDER = ['strength', ...DURATION_DEBUFFS, 'poison']

export function StatusIcons({ combatant, side = 'top' }) {
  const active = STATUS_ORDER.filter((key) => combatant[key] > 0)
  const passives = describeEnemyPassive(combatant)
  if (!active.length && !passives.length) return null

  return (
    <div className="status-icons">
      {active.map((key) => (
        <Tooltip className={`status-icon status-${key}`} key={key} side={side} text={keywords[key].text} title={`${keywords[key].name} ${combatant[key]}`}>
          <Icon name={keywords[key].icon} size={18} />
          <span>{combatant[key]}</span>
        </Tooltip>
      ))}
      {passives.map((text) => {
        const [label, description] = text.split(': ')
        const key = label.split(' ')[0].toLowerCase()
        return (
          <Tooltip className="status-icon status-passive" key={label} side={side} text={keywords[key]?.text ?? description} title={label}>
            <Icon name={keywords[key]?.icon ?? 'star'} size={18} />
            <span>{label.split(' ')[1]}</span>
          </Tooltip>
        )
      })}
    </div>
  )
}

// What the enemy will do next turn, as icons with the real numbers.
export function IntentBadge({ move, enemy, player }) {
  const parts = []
  const lines = []
  if (move.damage) {
    const damage = calculateAttackDamage(move.damage, enemy, player)
    const hits = move.hits ?? 1
    parts.push({ icon: hits > 1 ? 'swords' : 'sword', label: hits > 1 ? `${damage}x${hits}` : `${damage}`, tone: 'attack' })
    lines.push(`Attack for ${hits > 1 ? `${damage} x${hits}` : damage}.`)
  }
  if (move.block) {
    parts.push({ icon: 'shield', tone: 'defend' })
    lines.push(`Gain ${move.block} block.`)
  }
  if (move.strength || move.ritualGain) {
    parts.push({ icon: 'arrowUp', tone: 'buff' })
    lines.push(move.strength ? `Gain ${move.strength} strength.` : `Gain ritual ${move.ritualGain}.`)
  }
  const debuffs = DURATION_DEBUFFS.filter((status) => move[status])
  if (debuffs.length) {
    parts.push({ icon: 'skull', tone: 'debuff' })
    lines.push(`Apply ${debuffs.map((status) => `${move[status]} ${status}`).join(', ')}.`)
  }

  return (
    <Tooltip className="intent-badge" side="bottom" text={lines.join(' ')} title={`Intent: ${move.intent}`}>
      {parts.map((part) => (
        <span className={`intent-part intent-${part.tone}`} key={part.icon}>
          <Icon name={part.icon} size={26} />
          {part.label && <b>{part.label}</b>}
        </span>
      ))}
    </Tooltip>
  )
}

export function EnergyOrb({ energy, maxEnergy }) {
  return (
    <Tooltip className={`energy-orb ${energy === 0 ? 'empty' : ''}`} side="top" title="Energy" text="Spend energy to play cards. Refills each turn.">
      <span className="energy-value">
        {energy}/{maxEnergy}
      </span>
    </Tooltip>
  )
}

export function RelicIcon({ relic, side = 'bottom', size = 22 }) {
  return (
    <Tooltip className={`relic-icon rarity-${relic.rarity}`} side={side} title={relic.name} text={relic.text}>
      <Icon name={relicIcon(relic)} size={size} />
      <span className="sr-only">{relic.name}</span>
    </Tooltip>
  )
}

export function RelicBar({ relics, side = 'bottom' }) {
  return (
    <div className="relic-bar" aria-label="Relics">
      {relics.map((relic) => (
        <RelicIcon key={relic.id} relic={relic} side={side} />
      ))}
    </div>
  )
}

const potionColors = {
  'fire-potion': '#ff6a3a',
  'block-potion': '#5aa8e8',
  'strength-potion': '#d8473a',
  'energy-potion': '#ffb43a',
  'swift-potion': '#8ae8ff',
  'poison-potion': '#93d65a',
  'weak-potion': '#a08ad8',
  'fear-potion': '#ff9ab8',
  'blood-potion': '#c2183a',
}

export function PotionIcon({ potion, size = 26 }) {
  return (
    <span className="potion-icon" style={{ color: potionColors[potion.id] ?? '#f2c45a' }}>
      <Icon name="flask" size={size} />
    </span>
  )
}

// In combat potions can be drunk; elsewhere they can only be discarded.
export function PotionBelt({ potions, onUse, onDiscard }) {
  const slots = Array.from({ length: POTION_SLOTS }, (_, index) => potions[index] ?? null)
  return (
    <div className="potion-belt" aria-label="Potions">
      {slots.map((potion, index) =>
        potion ? (
          <span className="potion-slot" key={`${potion.id}-${index}`}>
            <Tooltip
              as="span"
              className="potion-tip"
              focusable={false}
              side="bottom"
              title={potion.name}
              text={`${potion.text}${onUse ? ' Click to drink.' : ''}`}
            >
              <button aria-label={`${onUse ? 'Drink' : ''} ${potion.name}`} className="potion-button" disabled={!onUse} onClick={() => onUse?.(index)} type="button">
                <PotionIcon potion={potion} />
              </button>
            </Tooltip>
            {onDiscard && (
              <button aria-label={`Discard ${potion.name}`} className="potion-discard" onClick={() => onDiscard(index)} type="button">
                x
              </button>
            )}
          </span>
        ) : (
          <span aria-label="Empty potion slot" className="potion-slot empty" key={`empty-${index}`} />
        ),
      )}
    </div>
  )
}
