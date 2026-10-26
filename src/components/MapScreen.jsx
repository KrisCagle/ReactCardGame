import { useState } from 'react'
import { nodeIcons } from '../data/gameData'
import { getAvailableNodeIds } from '../game/runState'
import { DeckPicker, LegendItem } from './shared'

const rowY = (rowIndex, rowCount) => 100 - ((rowIndex + 0.5) / rowCount) * 100

function MapConnections({ rows }) {
  const nodesById = new Map(rows.flat().map((node) => [node.id, node]))
  const rowIndexById = new Map(rows.flatMap((row, rowIndex) => row.map((node) => [node.id, rowIndex])))

  const lines = rows.flatMap((row, rowIndex) =>
    row.flatMap((node) =>
      node.connections.map((connectionId) => {
        const target = nodesById.get(connectionId)
        return {
          id: `${node.id}-${connectionId}`,
          x1: node.x,
          y1: rowY(rowIndex, rows.length),
          x2: target.x,
          y2: rowY(rowIndexById.get(connectionId), rows.length),
        }
      }),
    ),
  )

  return (
    <svg className="map-connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {lines.map((line) => (
        <line key={line.id} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />
      ))}
    </svg>
  )
}

export function MapScreen({ run, onPickNode, onRestart }) {
  const [showDeck, setShowDeck] = useState(false)
  const availableNodeIds = getAvailableNodeIds(run)
  const { rows } = run.map

  return (
    <main className="game-shell map-shell">
      <section className="map-panel">
        <div className="status-strip">
          <div>
            <p className="eyebrow">Act {run.act}</p>
            <h1>{run.character.name} on Ember Road</h1>
            <p className="run-message">{run.message}</p>
          </div>
          <div className="run-stats">
            <span className="turn-pill">HP {run.player.hp}/{run.player.maxHp}</span>
            <span className="turn-pill gold">Gold {run.gold}</span>
            <button className="turn-pill" onClick={() => setShowDeck(true)} type="button">Deck {run.deck.length}</button>
          </div>
        </div>

        <div className="spire-map" aria-label="Map">
          <MapConnections rows={rows} />
          {rows.map((row, rowIndex) => (
            <div className="map-row" key={`row-${rowIndex}`} style={{ zIndex: rowIndex + 1 }}>
              {row.map((node) => {
                const isAvailable = availableNodeIds.includes(node.id)
                const isComplete = run.completedNodeIds.includes(node.id)
                const isPath = run.selectedPath.includes(node.id)

                return (
                  <button
                    className={`map-node ${node.type} ${isComplete ? 'complete' : ''} ${isPath ? 'path' : ''} ${isAvailable ? 'available' : ''}`}
                    disabled={!isAvailable}
                    key={node.id}
                    onClick={() => onPickNode(node.id)}
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
            <LegendItem icon="*" label="Treasure" tone="treasure" />
            <LegendItem icon="B" label="Boss" tone="boss" />
          </div>
          <div className="map-meta">
            <span title={run.relics.map((relic) => `${relic.name}: ${relic.text}`).join('\n')}>Relics {run.relics.length}</span>
            <button onClick={onRestart} type="button">Restart run</button>
          </div>
        </div>
      </section>

      {showDeck && <DeckPicker cards={run.deck} title="Your Deck" onClose={() => setShowDeck(false)} />}
    </main>
  )
}
