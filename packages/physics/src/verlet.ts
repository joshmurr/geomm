import { Vec2 } from '@geomm/api'
import { EPSILON, add, mag, scale, sub, vec2 } from '@geomm/maths'
import { VerletConnection, VerletPoint } from './api'

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
