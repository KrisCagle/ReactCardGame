// Procedural act maps, modeled on Slay the Spire's generator:
// 1. Walk PATH_COUNT paths up a grid, each step moving at most one column and
//    never crossing an existing edge.
// 2. Keep only the grid cells a path touched, then assign room types with
//    placement rules (no early elites, campfire before the boss, no
//    back-to-back specials).
import { pickOne, randomInt } from './rng'

export const MAP_FLOORS = 15
export const MAP_COLUMNS = 7
export const PATH_COUNT = 6
export const TREASURE_FLOOR = 8
export const EARLIEST_SPECIAL_FLOOR = 5

// Weighted room table for floors without a fixed type.
const ROOM_WEIGHTS = [
  ['fight', 45],
  ['mystery', 22],
  ['rest', 12],
  ['elite', 9],
  ['shop', 6],
]
// These should never appear twice in a row on a path, or as siblings.
const NO_REPEAT_TYPES = ['elite', 'rest', 'shop', 'treasure']

const roomLabels = {
  fight: ['Ambush', 'Lookout', 'Ash Hall', 'Old Bridge', 'Torch Hall', 'Red Steps', 'Broken Gate', 'Low Shrine', 'High Road', 'Fallen Post', 'Watchpoint', 'Stone Bridge', 'Cinder Hall'],
  elite: ['Marked Den', 'Red Banner', 'Skull Gate', 'Crown Den'],
  mystery: ['Unknown'],
  rest: ['Campfire'],
  shop: ['Merchant'],
  treasure: ['Treasure'],
}

const nodeId = (act, floor, column) => `a${act}-f${floor}-c${column}`

const crosses = (edges, floor, from, to) =>
  edges.some((edge) => edge.floor === floor && ((edge.from < from && edge.to > to) || (edge.from > from && edge.to < to)))

const walkPaths = (rng) => {
  const edges = []
  const starts = []

  for (let path = 0; path < PATH_COUNT; path += 1) {
    // Make sure the first two paths start apart so floor 0 always has a choice.
    let column = randomInt(rng, MAP_COLUMNS)
    if (path === 1) {
      while (column === starts[0]) column = randomInt(rng, MAP_COLUMNS)
    }
    starts.push(column)

    for (let floor = 0; floor < MAP_FLOORS - 1; floor += 1) {
      const options = [column - 1, column, column + 1].filter(
        (target) => target >= 0 && target < MAP_COLUMNS && !crosses(edges, floor, column, target),
      )
      // Going straight up can never cross, so options is never empty.
      const target = pickOne(rng, options)
      if (!edges.some((edge) => edge.floor === floor && edge.from === column && edge.to === target)) {
        edges.push({ floor, from: column, to: target })
      }
      column = target
    }
  }

  return { edges, starts }
}

const rollRoomType = (rng, floor) => {
  const weights = ROOM_WEIGHTS.filter(([type]) => floor >= EARLIEST_SPECIAL_FLOOR || (type !== 'elite' && type !== 'rest'))
    // A campfire is guaranteed on the last floor, so don't put one right below it.
    .filter(([type]) => !(type === 'rest' && floor === MAP_FLOORS - 2))
  const total = weights.reduce((sum, [, weight]) => sum + weight, 0)
  let roll = rng.next() * total
  for (const [type, weight] of weights) {
    roll -= weight
    if (roll < 0) return type
  }
  return 'fight'
}

const fixedRoomType = (floor) => {
  if (floor === 0) return 'fight'
  if (floor === TREASURE_FLOOR) return 'treasure'
  if (floor === MAP_FLOORS - 1) return 'rest'
  return null
}

export const generateMap = (rng, act, bossName = 'Boss') => {
  const { edges } = walkPaths(rng)
  const nodes = new Map()

  const ensureNode = (floor, column) => {
    const id = nodeId(act, floor, column)
    if (!nodes.has(id)) {
      // Spread columns across the width with a little jitter so it doesn't look like a grid.
      const x = 8 + column * (84 / (MAP_COLUMNS - 1)) + (rng.next() * 6 - 3)
      nodes.set(id, { id, floor, column, x: Math.round(x * 10) / 10, type: null, label: '', connections: [] })
    }
    return nodes.get(id)
  }

  edges
    .sort((a, b) => a.floor - b.floor || a.from - b.from || a.to - b.to)
    .forEach((edge) => {
      const from = ensureNode(edge.floor, edge.from)
      const to = ensureNode(edge.floor + 1, edge.to)
      if (!from.connections.includes(to.id)) from.connections.push(to.id)
    })

  const rows = Array.from({ length: MAP_FLOORS }, (_, floor) =>
    [...nodes.values()].filter((node) => node.floor === floor).sort((a, b) => a.column - b.column),
  )

  const parentsOf = (node) => (node.floor === 0 ? [] : rows[node.floor - 1].filter((parent) => parent.connections.includes(node.id)))

  rows.forEach((row, floor) => {
    row.forEach((node) => {
      const fixed = fixedRoomType(floor)
      if (fixed) {
        node.type = fixed
        return
      }

      const parents = parentsOf(node)
      const blocked = new Set()
      parents.forEach((parent) => {
        if (NO_REPEAT_TYPES.includes(parent.type)) blocked.add(parent.type)
        // Siblings (other children of the same parent) should offer different specials.
        parent.connections
          .map((id) => nodes.get(id))
          .filter((sibling) => sibling.id !== node.id && NO_REPEAT_TYPES.includes(sibling.type))
          .forEach((sibling) => blocked.add(sibling.type))
      })
      let type = 'fight'
      for (let attempt = 0; attempt < 10; attempt += 1) {
        const candidate = rollRoomType(rng, floor)
        if (!blocked.has(candidate)) {
          type = candidate
          break
        }
      }
      node.type = type
    })
  })

  rows.flat().forEach((node) => {
    node.label = pickOne(rng, roomLabels[node.type])
  })

  const boss = { id: `a${act}-boss`, floor: MAP_FLOORS, column: 3, x: 50, type: 'boss', label: bossName, enemyName: bossName, connections: [] }
  rows[MAP_FLOORS - 1].forEach((node) => node.connections.push(boss.id))

  return { act, rows: [...rows, [boss]] }
}
