import { useEffect, useRef } from 'react'
import { Backdrop } from '../art/Backdrop'
import { EnemyArt } from '../art/EnemyArt'
import { Icon } from '../art/icons'
import { actNames, roomTypes } from '../data/gameData'
import { getAvailableNodeIds } from '../game/runState'
import { LegendItem } from './shared'
import { TopBar } from './ui/TopBar'

// Each floor gets a fixed height so the SVG lines (in % units) line up with the nodes.
const ROW_HEIGHT = 74

const rowY = (rowIndex, rowCount) => 100 - ((rowIndex + 0.5) / rowCount) * 100

function MapConnections({ rows, selectedPath, availableIds, currentNodeId }) {
  const nodesById = new Map(rows.flat().map((node) => [node.id, node]))
  const rowIndexById = new Map(rows.flatMap((row, rowIndex) => row.map((node) => [node.id, rowIndex])))
  const traveled = new Set(selectedPath.slice(1).map((id, index) => `${selectedPath[index]}-${id}`))

  const lines = rows.flatMap((row, rowIndex) =>
    row.flatMap((node) =>
      node.connections.map((connectionId) => {
        const id = `${node.id}-${connectionId}`
        const state = traveled.has(id) ? 'traveled' : node.id === currentNodeId && availableIds.includes(connectionId) ? 'next' : 'idle'
        return {
          id,
          state,
          x1: node.x,
          y1: rowY(rowIndex, rows.length),
          x2: nodesById.get(connectionId).x,
          y2: rowY(rowIndexById.get(connectionId), rows.length),
        }
      }),
    ),
  )

  return (
    <svg aria-hidden="true" className="map-connections" preserveAspectRatio="none" viewBox="0 0 100 100">
      {lines.map((line) => (
        <line className={`map-line ${line.state}`} key={line.id} x1={line.x1} x2={line.x2} y1={line.y1} y2={line.y2} />
      ))}
    </svg>
  )
}

export function MapScreen({ run, onPickNode, onRestart, onDiscardPotion }) {
  const scrollRef = useRef(null)
  const availableIds = getAvailableNodeIds(run)
  const { rows } = run.map
  const boss = rows.at(-1)[0]

  // Bring the next choices into view (the map is taller than the screen).
  useEffect(() => {
    scrollRef.current?.querySelector('.map-node.available')?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [run.currentNodeId, run.act])

  return (
    <main className={`screen map-screen act-${run.act}`}>
      <Backdrop act={run.act} />
      <TopBar onDiscardPotion={onDiscardPotion} run={run} />

      <div className="map-layout">
        <aside className="map-side panel">
          <p className="eyebrow">Act {run.act}</p>
          <h1>{actNames[run.act]}</h1>
          <p className="muted">{run.message}</p>
          <div className="map-legend">
            {Object.entries(roomTypes).map(([type, room]) => (
              <LegendItem icon={room.icon} key={type} label={room.label} tone={type} />
            ))}
          </div>
          <button className="restart-button" onClick={onRestart} type="button">
            Abandon run
          </button>
        </aside>

        <section aria-label="Map" className="map-scroll panel" ref={scrollRef}>
          <div className="map-boss">
            <EnemyArt name={boss.enemyName} />
            <span>{boss.enemyName}</span>
          </div>
          <div className="spire-map" style={{ height: rows.length * ROW_HEIGHT }}>
            <MapConnections availableIds={availableIds} currentNodeId={run.currentNodeId} rows={rows} selectedPath={run.selectedPath} />
            {rows.map((row, rowIndex) =>
              row.map((node) => {
                const available = availableIds.includes(node.id)
                const visited = run.selectedPath.includes(node.id)
                const current = node.id === run.currentNodeId
                return (
                  <button
                    aria-label={`${roomTypes[node.type].label}${available ? ' (available)' : ''}`}
                    className={`map-node ${node.type} ${available ? 'available' : ''} ${visited ? 'visited' : ''} ${current ? 'current' : ''}`}
                    disabled={!available}
                    key={node.id}
                    onClick={() => onPickNode(node.id)}
                    style={{ left: `${node.x}%`, top: `${rowY(rowIndex, rows.length)}%` }}
                    title={roomTypes[node.type].label}
                    type="button"
                  >
                    <span className={`map-node-icon ${node.type}`}>
                      <Icon name={roomTypes[node.type].icon} size={node.type === 'boss' ? 30 : 20} />
                    </span>
                  </button>
                )
              }),
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
