import { Vec2 } from '@geomm/api'
import { EPSILON, solveQuadratic2d } from '@geomm/maths'

export type CollisionResult = {
  pos: Vec2
  t1: number
  normal: Vec2
}

/**
 * Test if point P moving from p1 to p2 collides with segment (l1, l2) moving
 * to (l3, l4). Returns the point and time of collision or null if there was
 * no collision.
 */
export const testPointLine = (
  p1: Vec2,
  p2: Vec2,
  l1: Vec2,
  l2: Vec2,
  l3: Vec2,
  l4: Vec2,
) => {
  // Find 0, 1, or 2 candidates for the collision time t1
  const aQuad =
    (l3.y + l2.y - l1.y - l4.y) * (p2.x + l2.x - p1.x - l4.x) -
    (p2.y + l2.y - p1.y - l4.y) * (l3.x + l2.x - l1.x - l4.x)
  const bQuad =
    (l1.y - l2.y) * (p2.x + l2.x - p1.x - l4.x) +
    (p1.x - l2.x) * (l3.y + l2.y - l1.y - l4.y) -
    (p1.y - l2.y) * (l3.x + l2.x - l1.x - l4.x) -
    (l1.x - l2.x) * (p2.y + l2.y - p1.y - l4.y)
  const cQuad = (l1.y - l2.y) * (p1.x - l2.x) - (p1.y - l2.y) * (l1.x - l2.x)
  const t1Candidates = solveQuadratic2d(aQuad, bQuad, cQuad) // [0, 1]

  // Test each candidate for being in [0, 1] and if so test t2 for the same.
  // Keep track of minimal t1 that fits the requirements to return
  let result: CollisionResult | null = null
  for (const t1 of t1Candidates) {
    if (t1 < 0 || t1 > 1) {
      continue
    }
    // Calculate a and b, intermediate points of the line segment. Then calculate
    // t2 to test if it's in [0, 1]
    const intersection = {
      x: p1.x + (p2.x - p1.x) * t1,
      y: p1.y + (p2.y - p1.y) * t1,
    }
    const a = {
      x: l1.x + (l3.x - l1.x) * t1,
      y: l1.y + (l3.y - l1.y) * t1,
    }
    const b = {
      x: l2.x + (l4.x - l2.x) * t1,
      y: l2.y + (l4.y - l2.y) * t1,
    }
    // Make sure we're not dividing by zero
    let t2: number | null = null
    if (Math.abs(b.x - a.x) >= EPSILON) {
      t2 = (intersection.x - a.x) / (b.x - a.x)
    } else if (Math.abs(b.y - a.y) >= EPSILON) {
      t2 = (intersection.y - a.y) / (b.y - a.y)
    } else {
      // a and b are too close together, cannot calculate t2 so assume it's not
      // in [0, 1]
    }
    if (t2 !== null && t2 >= 0 && t2 <= 1) {
      if (result === null || t1 < result.t1) {
        const normal = {
          x: b.y - a.y,
          y: a.x - b.x,
        }
        const dist = Math.sqrt(normal.x * normal.x + normal.y * normal.y)
        normal.x /= dist
        normal.y /= dist
        result = {
          pos: intersection,
          t1: t1,
          normal: normal,
        }
      }
    }
  }
  return result
}
