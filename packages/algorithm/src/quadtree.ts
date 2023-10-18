import type { AABB, Vec2 } from '@geomm/api'
import { vec2 } from '@geomm/maths'

export type Quadtree = {
  bounds: AABB
  nodes: Quadtree[] | Vec2 | undefined
}

export const aabb = (center: Vec2, half: number) => ({ center, half })

const contains = (rect: AABB, p: Vec2) => {
  const { center, half } = rect
  const { x, y } = p
  return (
    x >= center.x - half &&
    x <= center.x + half &&
    y >= center.y - half &&
    y <= center.y + half
  )
}

export const subdivide = (rect: AABB) => {
  const { center, half } = rect
  const { x, y } = center
  const h = half / 2
  return [
    aabb(vec2(x - h, y - h), h),
    aabb(vec2(x + h, y - h), h),
    aabb(vec2(x - h, y + h), h),
    aabb(vec2(x + h, y + h), h),
  ]
}

export const quadtree = (bounds: AABB) => {
  return {
    bounds,
    nodes: undefined,
  }
}

export const insert = (tree: Quadtree, p: Vec2, d = 0) => {
  if (d > 4) {
    // Max depth
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
      return insert(node, p)
    }) as Quadtree[]
    tree.nodes = n.map((node) => {
      return insert(node, current, d + 1)
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

export const query = (tree: Quadtree, bounds: AABB): Vec2[] => {
  const { center, half } = bounds
  const { x, y } = center
  const { bounds: treeBounds, nodes } = tree
  const { center: treeCenter, half: treeHalf } = treeBounds
  const { x: treeX, y: treeY } = treeCenter
  const treeMinX = treeX - treeHalf
  const treeMaxX = treeX + treeHalf
  const treeMinY = treeY - treeHalf
  const treeMaxY = treeY + treeHalf

  if (treeMinX > x + half) return []
  if (treeMaxX < x - half) return []
  if (treeMinY > y + half) return []
  if (treeMaxY < y - half) return []

  if (!nodes) return []
  if (!Array.isArray(nodes)) return [nodes]
  return nodes.flatMap((node) => query(node, bounds))
}
