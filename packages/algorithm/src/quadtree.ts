import type { AABB, Vec2 } from '@geomm/api'
import { vec2 } from '@geomm/maths'

const MAX_DEPTH = 4

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Node = {
  pos: Vec2
  [key: string]: any
}

export type Quadtree = {
  bounds: AABB
  nodes?: Quadtree[] | Node | undefined
}

export const aabb = (center: Vec2, halfWidth: number, halfHeight: number) => ({
  center,
  halfWidth,
  halfHeight,
})

export const quad = (origin: Vec2, size: Vec2) => ({ origin, size })

export const contains = (rect: AABB, { pos }: Node) => {
  const { center, halfWidth, halfHeight } = rect
  const { x, y } = pos
  return (
    x >= center.x - halfWidth &&
    x < center.x + halfWidth + 1 &&
    y >= center.y - halfHeight &&
    y < center.y + halfHeight + 1
  )
}

export const subdivide = (rect: AABB): AABB[] => {
  const { center, halfWidth, halfHeight } = rect
  const { x, y } = center
  const hw = halfWidth / 2
  const hh = halfHeight / 2
  return [
    aabb(vec2(x - hw, y - hh), hw, hh),
    aabb(vec2(x + hw + 1, y - hh), hw, hh),
    aabb(vec2(x - hw, y + hh + 1), hw, hh),
    aabb(vec2(x + hw + 1, y + hh + 1), hw, hh),
  ]
}

export const quadtree = (bounds: AABB) => {
  return {
    bounds,
    nodes: undefined,
  }
}

export const insert = (tree: Quadtree, p: Node, d = 0) => {
  if (d > MAX_DEPTH) {
    return tree
  }
  const { bounds, nodes } = tree
  if (!contains(bounds, p)) {
    return tree
  }
  // Is root and empty
  if (!nodes) {
    tree.nodes = p
    return tree
  }

  // If leaf (single node)
  if (!Array.isArray(nodes)) {
    const current = nodes
    const n = subdivide(bounds).map(quadtree)
    tree.nodes = n.map((node) => {
      return insert(node, current, d + 1)
    }) as Quadtree[]
    tree.nodes = n.map((node) => {
      return insert(node, p, d + 1)
    }) as Quadtree[]

    return tree
  }

  // If leaf (array of 4 nodes)
  if (nodes.length === 4) {
    tree.nodes = nodes.map((leaf) => insert(leaf, p, d)) as Quadtree[]
    return tree
  }

  return undefined
}

export const count = (tree: Quadtree): number => {
  const { nodes } = tree
  if (!nodes) return 0
  if (!Array.isArray(nodes)) return 1
  return nodes.reduce((acc, node) => acc + count(node), 0)
}

export const query = (tree: Quadtree, bounds: AABB): Node[] => {
  const results = [] as Node[]
  const { center, halfWidth, halfHeight } = bounds
  const { x, y } = center
  const { bounds: treeBounds, nodes } = tree
  const {
    center: treeCenter,
    halfWidth: treeHW,
    halfHeight: treeHH,
  } = treeBounds
  const { x: treeX, y: treeY } = treeCenter
  const treeMinX = treeX - treeHW
  const treeMaxX = treeX + treeHW
  const treeMinY = treeY - treeHH
  const treeMaxY = treeY + treeHH

  if (treeMinX > x + halfWidth) return results
  if (treeMaxX < x - halfWidth) return results
  if (treeMinY > y + halfHeight) return results
  if (treeMaxY < y - halfHeight) return results

  if (!nodes) {
    return results
  }
  if (!Array.isArray(nodes)) {
    if (contains(bounds, nodes)) results.push(nodes)
    return results
  }
  for (const node of nodes) {
    results.push(...query(node, bounds))
  }

  return results
}
