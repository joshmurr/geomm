/* Axis-aligned bounding box (AABB) */

import { AABB, Vec2 } from '@geomm/api'

export const aabb = (center: Vec2, halfWidth: number, halfHeight: number) => ({
  center,
  halfWidth,
  halfHeight,
})

export const contains = (rect: AABB, p: Vec2) => {
  const { center, halfWidth, halfHeight } = rect
  const { x, y } = p
  return (
    x >= center.x - halfWidth &&
    x <= center.x + halfWidth &&
    y >= center.y - halfHeight &&
    y <= center.y + halfHeight
  )
}

export const boundingBox = (points: Vec2[]) => {
  const x = points.map((p) => p.x)
  const y = points.map((p) => p.y)
  const minX = Math.min(...x)
  const maxX = Math.max(...x)
  const minY = Math.min(...y)
  const maxY = Math.max(...y)
  const halfWidth = (maxX - minX) / 2
  const halfHeight = (maxY - minY) / 2
  const center = { x: minX + halfWidth, y: minY + halfHeight }
  return aabb(center, halfWidth, halfHeight)
}

export const intersects = (a: AABB, b: AABB) => {
  const { center: aCenter, halfWidth: aHalfWidth, halfHeight: aHalfHeight } = a
  const { center: bCenter, halfWidth: bHalfWidth, halfHeight: bHalfHeight } = b
  const dx = Math.abs(aCenter.x - bCenter.x)
  const dy = Math.abs(aCenter.y - bCenter.y)
  const halfWidth = aHalfWidth + bHalfWidth
  const halfHeight = aHalfHeight + bHalfHeight
  return dx <= halfWidth && dy <= halfHeight
}
