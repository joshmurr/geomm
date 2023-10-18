import { Vec2 } from '@geomm/api'
import {
  EPSILON,
  add,
  cross,
  dot,
  scale,
  solveQuadratic2d,
  sub,
} from '@geomm/maths'
import { CollisionResult, PhysicsObject2D } from './api'
import { updateObject } from './physicsObject2d'

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

/**
 * Extrapolate testPointLine() to find the earliest collision point (if any) between
 * two polygons, polyA (moving from polyA0 to polyA1) and polyB (moving from polyB0 to
 * polyB1).
 */
export const testPolyPoly = (
  polyA0: Vec2[],
  polyA1: Vec2[],
  polyB0: Vec2[],
  polyB1: Vec2[],
) => {
  let collisionResult: CollisionResult | null = null
  for (let i = 0; i < polyA0.length; i++) {
    const p0 = polyA0[i]
    const p1 = polyA1[i]
    for (let j = 0; j < polyB0.length; j++) {
      const l0 = polyB0[j]
      const l1 = polyB0[(j + 1) % polyB0.length]
      const l2 = polyB1[j]
      const l3 = polyB1[(j + 1) % polyB1.length]
      const candidate = testPointLine(p0, p1, l0, l1, l2, l3)
      if (candidate === null) {
        continue
      }
      if (collisionResult === null || candidate.t1 < collisionResult.t1) {
        collisionResult = candidate
      }
    }
  }
  return collisionResult
}

/**
 * Test collision with other Poly, return null if no collision or
 * return a PhysicsResult containing the delta linear/angular velocities
 * to apply to the objects following the collision. The delta parameter
 * is the time that passed this frame.
 *
 * This updated version uses my own formula for conserving kinetic energy
 * to calculate an impulse.
 */
export const impulseResolution = (
  objA: PhysicsObject2D,
  objB: PhysicsObject2D,
  coefficientOfRestitution = 0.5,
) => {
  const collisionResult = testPolyPoly(
    objA.prevVerts,
    objA.currVerts,
    objB.prevVerts,
    objB.currVerts,
  )
  if (collisionResult === null) {
    return { J: null, collisionResult: null }
  }

  const nB = collisionResult.normal
  const IA = objA.momentOfInertia
  const IB = objB.momentOfInertia
  const mA = objA.mass
  const mB = objB.mass
  const rA = sub(collisionResult.pos, objA.pos)
  const rB = sub(collisionResult.pos, objB.pos)
  const vA = objA.vel
  const vB = objB.vel
  const omegaA = objA.rotationSpeed
  const omegaB = objB.rotationSpeed

  const C = coefficientOfRestitution
  const j =
    ((-1 - C) *
      (dot(vA, nB) -
        dot(vB, nB) +
        omegaA * cross(rA, nB) -
        omegaB * cross(rB, nB))) /
    (1 / mA +
      1 / mB +
      Math.pow(cross(rA, nB), 2) / IA +
      Math.pow(cross(rB, nB), 2) / IB)
  if (j < 0) {
    return { J: null, collisionResult }
  }
  const J = scale(nB, j)

  return { J, collisionResult }
}

export const applyImpulse = (
  objA: PhysicsObject2D,
  objB: PhysicsObject2D,
  J: Vec2,
  collisionResult: CollisionResult,
  delta: number,
) => {
  const mA = objA.mass
  const mB = objB.mass
  const IA = objA.momentOfInertia
  const IB = objB.momentOfInertia
  const rA = sub(collisionResult.pos, objA.pos)
  const rB = sub(collisionResult.pos, objB.pos)

  updateObject(objA, -delta * collisionResult.t1)
  updateObject(objB, -delta * collisionResult.t1)

  objA.vel = add(objA.vel, scale(J, 1 / mA))
  objA.rotationSpeed += cross(rA, J) / IA

  objB.vel = sub(objB.vel, scale(J, 1 / mB))
  objB.rotationSpeed -= cross(rB, J) / IB
}

export const collideWithImpulse = (
  objA: PhysicsObject2D,
  objB: PhysicsObject2D,
  delta: number,
) => {
  const { J: J1, collisionResult: cr1 } = impulseResolution(objA, objB, 1)
  if (J1) {
    applyImpulse(objA, objB, J1, cr1, delta)
  }
  const { J: J2, collisionResult: cr2 } = impulseResolution(objB, objA, 1)
  if (J2) {
    applyImpulse(objB, objA, J2, cr2, delta)
  }
}
