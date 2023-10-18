/* Bounding Circle */

import { Vec2 } from '@geomm/api'
import { add, distance, scale, vec2 } from '@geomm/maths'
import { PhysicsObject2D } from '@geomm/physics'

export const boundingCircle = (verts: Vec2[]) => {
  const sum = verts.reduce((acc, v) => add(acc, v), vec2(0, 0))
  const center = scale(sum, 1 / verts.length)
  const radius = verts.reduce((acc, v) => Math.max(acc, distance(center, v)), 0)
  return { center, radius }
}

export const intersectsBC = (objA: PhysicsObject2D, objB: PhysicsObject2D) => {
  const { pos: posA, bc: bcA } = objA
  const { pos: posB, bc: bcB } = objB
  const dist = distance(posA, posB)
  return dist < bcA.radius + bcB.radius
}
