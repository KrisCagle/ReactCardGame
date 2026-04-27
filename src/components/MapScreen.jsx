import { mapRows, nodeIcons } from '../data/gameData'
import { getAvailableNodeIds } from '../game/runState'
import { LegendItem } from './shared'

function MapConnections() {
  const rowCount = mapRows.length
  const lines = mapRows.flatMap((row, rowIndex) =>
    row.flatMap((node) =>
      node.connections.map((connectionId) => {
        const targetRowIndex = mapRows.findIndex((candidateRow) => candidateRow.some((candidate) => candidate.id === connectionId))
        const target = mapRows[targetRowIndex]?.find((candidate) => candidate.id === connectionId)
        if (!target) return null
        return {
          id: `${node.id}-${target.id}`,
          x1: node.x,
          y1: 100 - ((rowIndex + 0.5) / rowCount) * 100,
          x2: target.x,
          y2: 100 - ((targetRowIndex + 0.5) / rowCount) * 100,
        }
      }),
    ),
  )

  return (
    <svg className="map-connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {lines.filter(Boolean).map((line) => (
        <line key={line.id} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />
      ))}
    </svg>
  )
}

export function MapScreen({ run, onPickNode, onRestart }) {
  const availableNodeIds = getAvailableNodeIds(run)

  return (
    <main className="game-shell map-shell">
      <section className="map-panel">
        <div className="status-strip">
          <div>
            <p className="eyebrow">Act {run.act}</p>
            <h1>{run.character.name} on Ember Road</h1>
            <p className="run-message">{run.message}</p>
          </div>
          <div className="turn-pill">HP {run.player.hp}/{run.player.maxHp} - Deck {run.deck.length}</div>
        </div>

        <div className="spire-map" aria-label="Map">
          <MapConnections />
          {mapRows.map((row, rowIndex) => (
            <div className="map-row" key={`row-${rowIndex}`} style={{ zIndex: rowIndex + 1 }}>
              {row.map((node) => {
                const isAvailable = availableNodeIds.includes(node.id)
                const isComplete = run.completedNodeIds.includes(node.id)
                const isPath = run.selectedPath.includes(node.id)

                return (
                  <button
                    className={`map-node ${node.type} ${isComplete ? 'complete' : ''} ${isPath ? 'path' : ''}`}
                    disabled={!isAvailable}
                    key={node.id}
                    onClick={() => onPickNode(node)}
                    style={{ left: `${node.x}%` }}
                    title={node.label}
                    type="button"
                  >
                    <span>{nodeIcons[node.type]}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div className="map-sidebar">
          <div className="map-legend">
            <LegendItem icon="x" label="Fight" tone="fight" />
            <LegendItem icon="?" label="Random" tone="mystery" />
            <LegendItem icon="!" label="Elite" tone="elite" />
            <LegendItem icon="+" label="Campfire" tone="rest" />
            <LegendItem icon="$" label="Shop" tone="shop" />
            <LegendItem icon="B" label="Boss" tone="boss" />
          </div>
          <div className="map-meta">
            <span>Relics {run.relics.length}</span>
            <button onClick={onRestart} type="button">Restart run</button>
          </div>
        </div>
      </section>
    </main>
  )
}
