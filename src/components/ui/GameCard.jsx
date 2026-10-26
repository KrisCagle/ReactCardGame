import { Icon } from '../../art/icons'
import { keywords } from '../../data/gameData'
import { describeCardSegments, getCardKeywords } from '../../game/cards'
import { calculateAttackDamage, calculateBlock } from '../../game/combat'

// Picks the art-window icon from what the card mainly does.
const artIcon = (card) => {
  if (card.type === 'Curse') return 'eye'
  if (card.strengthPerTurn) return 'flame'
  if (card.poisonPerTurn || card.multiplyPoison) return 'flask'
  if (card.energyPerTurn || (card.energy && !card.damage && !card.block)) return 'bolt'
  if (card.blockPerTurn) return 'shield'
  if (card.type === 'Power') return 'fist'
  if (card.damage) return (card.hits ?? 1) > 1 ? 'swords' : card.poison ? 'drop' : 'sword'
  if (card.poison) return 'flask'
  if (card.block) return 'shield'
  if (card.weak || card.vulnerable) return 'skull'
  if (card.draw) return 'cards'
  return 'star'
}

// Live numbers: in combat, damage and block reflect strength, weak, vulnerable, and frail.
const liveValue = (segment, context) => {
  if (!context) return segment.base
  if (segment.stat === 'damage') return calculateAttackDamage(segment.base, context.player, context.enemy, context.attackBonus ?? 0)
  return calculateBlock(segment.base, context.player)
}

function CardText({ card, context }) {
  return describeCardSegments(card).map((segment, index) => {
    if (typeof segment === 'string') return segment
    const value = liveValue(segment, context)
    const trend = value > segment.base ? 'up' : value < segment.base ? 'down' : ''
    return (
      <b className={`card-num ${trend}`} key={index}>
        {value}
      </b>
    )
  })
}

export function GameCard({ card, context, disabled = false, onClick, className = '', style, showKeywords = true, cardRef }) {
  const cardKeywords = showKeywords ? getCardKeywords(card) : []
  const classes = [
    'game-card',
    `type-${card.type.toLowerCase()}`,
    `rarity-${card.rarity ?? 'common'}`,
    card.upgraded ? 'upgraded' : '',
    className,
  ].join(' ')

  return (
    <button className={classes} disabled={disabled} onClick={onClick} ref={cardRef} style={style} type="button">
      <span className="card-frame">
        <span className="card-cost">{card.unplayable ? '' : card.cost}</span>
        <span className="card-name">{card.name}</span>
        <span className="card-art">
          <Icon name={artIcon(card)} />
        </span>
        <span className="card-type">
          {card.type}
          {(card.rarity === 'uncommon' || card.rarity === 'rare') && <span className="card-gem" title={card.rarity} />}
        </span>
        <span className="card-text">
          <CardText card={card} context={context} />
        </span>
      </span>
      {cardKeywords.length > 0 && (
        <span className="card-keywords" aria-hidden="true">
          {cardKeywords.map((key) => (
            <span className="keyword-tip" key={key}>
              <strong>
                <Icon name={keywords[key].icon} size={14} /> {keywords[key].name}
              </strong>
              {keywords[key].text}
            </span>
          ))}
        </span>
      )}
    </button>
  )
}
