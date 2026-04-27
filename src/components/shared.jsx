export function CardButton({ card, disabled = false, onClick }) {
  return (
    <button className={`card ${card.type.toLowerCase()}`} disabled={disabled} onClick={onClick} type="button">
      <span className="cost">{card.cost}</span>
      <strong>{card.name}</strong>
      <small>{card.type}</small>
      <p>{card.text}</p>
    </button>
  )
}

export function HealthBar({ value, max, percent }) {
  return (
    <div className="health">
      <div style={{ width: `${percent}%` }}></div>
      <span>{value}/{max}</span>
    </div>
  )
}

export function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export function LegendItem({ icon, label, tone }) {
  return (
    <div className="legend-item">
      <span className={`legend-icon ${tone}`}>{icon}</span>
      <strong>{label}</strong>
    </div>
  )
}

export function RewardButton({ kind, reward, onClick }) {
  if (kind === 'relic') {
    return (
      <button className="relic-card" onClick={onClick} type="button">
        <span>Relic</span>
        <strong>{reward.name}</strong>
        <p>{reward.text}</p>
      </button>
    )
  }

  return <CardButton card={reward} onClick={onClick} />
}

export function OpeningBoonButton({ boon, onClick }) {
  const tag = boon.kind === 'blessing' ? 'Blessing' : boon.kind === 'relic' ? 'Relic' : 'Card'
  return (
    <button className="boon-card" onClick={onClick} type="button">
      <span>{tag}</span>
      <strong>{boon.title}</strong>
      <p>{boon.text}</p>
    </button>
  )
}
