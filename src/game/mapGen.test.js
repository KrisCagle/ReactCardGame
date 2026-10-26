import { describe, expect, it } from 'vitest'
import { EARLIEST_SPECIAL_FLOOR, MAP_FLOORS, TREASURE_FLOOR, generateMap } from './mapGen'
import { createRng } from './rng'

const SEEDS = Array.from({ length: 200 }, (_, seed) => seed)
const maps = SEEDS.map((seed) => generateMap(createRng(seed), 1, 'Hexaghost'))
const nodesOf = (map) => new Map(map.rows.flat().map((node) => [node.id, node]))

describe('generateMap', () => {
  it('is deterministic for a seed', () => {
    expect(generateMap(createRng(5), 1)).toEqual(generateMap(createRng(5), 1))
    expect(generateMap(createRng(5), 1)).not.toEqual(generateMap(createRng(6), 1))
  })

  it('has 15 floors plus a single boss row', () => {
    maps.forEach((map) => {
      expect(map.rows).toHaveLength(MAP_FLOORS + 1)
      expect(map.rows.at(-1)).toHaveLength(1)
      expect(map.rows.at(-1)[0]).toMatchObject({ type: 'boss', enemyName: 'Hexaghost' })
      expect(map.rows[0].length).toBeGreaterThanOrEqual(2)
    })
  })

  it('connects every node only to the next floor, and every node leads somewhere', () => {
    maps.forEach((map) => {
      const nodes = nodesOf(map)
      map.rows.slice(0, -1).forEach((row) => {
        row.forEach((node) => {
          expect(node.connections.length, node.id).toBeGreaterThan(0)
          node.connections.forEach((id) => expect(nodes.get(id).floor).toBe(node.floor + 1))
        })
      })
    })
  })

  it('makes every node reachable from the first floor', () => {
    maps.forEach((map) => {
      const nodes = nodesOf(map)
      const reached = new Set(map.rows[0].map((node) => node.id))
      map.rows.forEach((row) => row.forEach((node) => {
        if (reached.has(node.id)) node.connections.forEach((id) => reached.add(id))
      }))
      expect(reached.size).toBe(nodes.size)
    })
  })

  it('never draws crossing paths', () => {
    maps.forEach((map) => {
      const nodes = nodesOf(map)
      map.rows.slice(0, -2).forEach((row) => {
        const edges = row.flatMap((node) => node.connections.map((id) => [node.column, nodes.get(id).column]))
        edges.forEach(([a, b]) => edges.forEach(([c, d]) => {
          expect((a < c && b > d) || (a > c && b < d)).toBe(false)
        }))
      })
    })
  })

  it('follows the room placement rules', () => {
    maps.forEach((map) => {
      const nodes = nodesOf(map)
      map.rows[0].forEach((node) => expect(node.type).toBe('fight'))
      map.rows[TREASURE_FLOOR].forEach((node) => expect(node.type).toBe('treasure'))
      map.rows[MAP_FLOORS - 1].forEach((node) => expect(node.type).toBe('rest'))
      map.rows.slice(0, EARLIEST_SPECIAL_FLOOR).flat().forEach((node) => {
        expect(['elite', 'rest']).not.toContain(node.type)
      })
      // No elite->elite, rest->rest, or shop->shop along any path.
      map.rows.slice(0, -2).flat().forEach((node) => {
        node.connections.forEach((id) => {
          const child = nodes.get(id)
          if (['elite', 'shop'].includes(node.type) || (node.type === 'rest' && child.floor !== MAP_FLOORS - 1)) {
            expect(child.type, `${node.id} -> ${id}`).not.toBe(node.type)
          }
        })
      })
    })
  })

  it('produces a healthy mix of rooms across many maps', () => {
    const counts = {}
    maps.flatMap((map) => map.rows.flat()).forEach((node) => {
      counts[node.type] = (counts[node.type] ?? 0) + 1
    })
    ;['fight', 'mystery', 'rest', 'elite', 'shop', 'treasure', 'boss'].forEach((type) => expect(counts[type], type).toBeGreaterThan(0))
    expect(counts.fight).toBeGreaterThan(counts.elite)
  })
})
