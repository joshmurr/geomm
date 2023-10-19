import { Vec2 } from '@geomm/api'
import { EPSILON, add, dot, mag, scale, sqrt, sub, vec2 } from '@geomm/maths'
import { CollisionResult, VerletConnection, VerletPoint } from './api'

export const accelerate = (p: VerletPoint, dt: number) => {
  const { pos, acc } = p
  p.pos = add(pos, scale(acc, dt * dt))
  p.acc = vec2(0, 0)
}

export const inertia = (p: VerletPoint) => {
  const { pos, prevPos } = p
  p.prevPos = pos
  p.pos = sub(scale(pos, 2), prevPos)
}

export const applyForce = (p: VerletPoint, force: Vec2) => {
  const { acc } = p
  p.acc = add(acc, force)
}

export const bound = (p: VerletPoint, bounds: Vec2) => {
  const { pos, mass } = p
  if (pos.x < mass) {
    pos.x = mass
  } else if (pos.x > bounds.x - mass) {
    pos.x = bounds.x - mass
  }
  if (pos.y < mass) {
    pos.y = mass
  } else if (pos.y > bounds.y - mass) {
    pos.y = bounds.y - mass
  }
}

export const springConstrain = (
  { ids, len, strength }: VerletConnection,
  particles: VerletPoint[],
) => {
  const [i, j] = ids
  const p = particles[i]
  const p2 = particles[j]
  const v = sub(p.pos, p2.pos)
  const dist = mag(v) + EPSILON

  const pInvWeight = 1 / p.mass
  const p2InvWeight = 1 / p2.mass

  const normDistStrength =
    ((dist - len) / (dist * (pInvWeight + p2InvWeight))) * strength

  const correction = scale(v, normDistStrength * pInvWeight)
  const correction2 = scale(v, -normDistStrength * p2InvWeight)
  p.pos = sub(p.pos, correction)
  p2.pos = sub(p2.pos, correction2)
}

export const pointCollide = (
  p: VerletPoint,
  p2: VerletPoint,
  preserveImpulse = false,
  damping = 0.8,
) => {
  const { pos, mass } = p
  const { pos: pos2, mass: mass2 } = p2
  const v = sub(pos, pos2)
  const distSq = v.x * v.x + v.y * v.y
  const minDist = mass + mass2

  if (distSq < minDist * minDist) {
    const dist = sqrt(distSq)
    const factor = (dist - minDist) / dist

    /* Resolve the overlapping bodies */
    const displacement = scale(v, factor * 0.5)
    p.pos = sub(p.pos, displacement)
    p2.pos = add(p2.pos, displacement)

    if (preserveImpulse) {
      /* Compute the projected component factors */
      const v1 = sub(pos, p.prevPos)
      const v2 = sub(pos2, p2.prevPos)
      const f1 = (damping * dot(v1, v)) / distSq
      const f2 = (damping * dot(v2, v)) / distSq

      /* Swap the projected components */
      const v1p = add(v1, sub(scale(v, f2), scale(v, f1)))
      const v2p = add(v2, sub(scale(v, f1), scale(v, f2)))

      /* Previous pos is adjusted by the projected component */
      p.prevPos = sub(pos, v1p)
      p2.prevPos = sub(pos2, v2p)
    }
  }
}

export const lineCollide = (
  p: VerletPoint,
  collisionResult: CollisionResult,
  delta: number,
) => {
  const { pos, prevPos } = p
  const { normal } = collisionResult

  const v = sub(pos, prevPos)
  const dist = dot(v, normal)
  const impulse = scale(normal, -dist)
  const newPrevPos = sub(pos, impulse)

  p.prevPos = newPrevPos
  p.pos = add(newPrevPos, scale(impulse, 1 - delta))
  p.acc = vec2(0, 0)
}
