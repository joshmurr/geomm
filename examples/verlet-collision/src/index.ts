import { appendEl, createEl } from '@geomm/dom'
import { add, dot, mag, scale, sub, vec, Vec } from '@geomm/geometry'
import { min, randRange, sqrt } from '@geomm/maths'

type Particle = {
  pos: Vec
  prevPos: Vec
  acc: Vec
  mass: number
  col: string
}

const settings = {
  N_PARTICLES: 512,
}

const SIZE = vec(window.innerWidth, window.innerHeight)
const GRAVITY = vec(0, 0.5)

const DAMPING = 0.5

const c = createEl('canvas', {
  width: SIZE.x,
  height: SIZE.y,
}) as HTMLCanvasElement
appendEl(c)

const particles = Array.from({ length: settings.N_PARTICLES }).map(() => {
  const initialPos = vec(randRange(0, SIZE.x), randRange(0, SIZE.y))
  return {
    pos: initialPos,
    prevPos: initialPos,
    acc: vec(0, 0),
    mass: 12,
    col: '#aaa',
  }
})

const drawParticle = (p: Particle, ctx: CanvasRenderingContext2D) => {
  const { col } = p
  const { x, y } = p.pos

  ctx.fillStyle = col
  ctx.beginPath()
  ctx.arc(x, y, p.mass, 0, 2 * Math.PI)
  ctx.fill()
}

const verlet = (p: Particle, dt: number) => {
  const { pos, prevPos, acc } = p
  const FRICTION = 1
  const vel = scale(sub(pos, prevPos), FRICTION)
  p.prevPos = pos
  const acceleration = scale(acc, dt * dt)
  const newPos = add(pos, add(vel, acceleration))
  p.acc = vec(0, 0)
  p.pos = newPos
  /* p.col = `hsl(${mag(pos) * 0.1 + 210}, 100%, ${Math.floor( mag(displacement) * 5,)}%)` */
}

const applyForce = (p: Particle, force: Vec) => {
  const { acc, mass } = p
  p.acc = add(acc, scale(force, 1 / mass))
}

const accelerate = (p: Particle, dt: number) => {
  const { acc } = p
  p.pos = add(p.pos, scale(acc, dt * dt))
  p.acc = vec(0, 0)
}

const inertia = (p: Particle) => {
  const { pos, prevPos } = p
  const tPos = sub(scale(pos, 2), prevPos)
  p.prevPos = pos
  p.pos = tPos
}

const bound = (p: Particle) => {
  const { pos, prevPos, mass } = p
  const { x, y } = pos

  const vel = sub(pos, prevPos)

  const radius = mass

  if (x < radius) {
    p.pos.x = radius
    p.prevPos.x = p.pos.x + vel.x * DAMPING
  }
  if (x > SIZE.x - radius) {
    p.pos.x = SIZE.x - radius
    p.prevPos.x = p.pos.x + vel.x * DAMPING
  }
  if (y < radius) {
    p.pos.y = radius
    p.prevPos.y = p.pos.y + vel.y * DAMPING
  }
  if (y > SIZE.y - radius) {
    p.pos.y = SIZE.y - radius
    p.prevPos.y = p.pos.y + vel.y * DAMPING
  }
}

const simpleBound = (p: Particle) => {
  const { pos, mass } = p
  const { x, y } = pos

  const radius = mass

  if (x < radius) {
    p.pos.x = radius
  }
  if (x > SIZE.x - radius) {
    p.pos.x = SIZE.x - radius
  }
  if (y < radius) {
    p.pos.y = radius
  }
  if (y > SIZE.y - radius) {
    p.pos.y = SIZE.y - radius
  }
}

const circularBound = (p: Particle) => {
  const { pos, mass } = p
  const centre = vec(SIZE.x / 2, SIZE.y / 2)
  const v = sub(centre, pos)
  const dist = mag(v)

  const smallerSide = min(...Object.values(centre))

  if (dist > smallerSide - mass) {
    const n = scale(v, 1 / dist)
    p.pos = sub(centre, scale(n, smallerSide - mass))
  }
}

const updateParticle = (p: Particle, dt: number) => {
  verlet(p, dt)
}

const checkCollisions = (
  p: Particle,
  i: number,
  particles: Particle[],
  preserveImpule: boolean,
) => {
  const { pos, prevPos, mass } = p

  particles.slice(i + 1).forEach((p2) => {
    const { pos: pos2, prevPos: prevPos2, mass: mass2 } = p2

    const dir = sub(pos, pos2)
    const distSq = dir.x * dir.x + dir.y * dir.y
    const minDist = mass + mass2

    if (distSq < minDist * minDist) {
      const dist = sqrt(distSq)
      const n = scale(dir, 1 / dist)
      /* const massRatio1 = mass / minDist */
      /* const massRatio2 = mass2 / minDist */
      const delta = (0.5 * (dist - minDist)) / dist

      const v1 = sub(pos, prevPos)
      const v2 = sub(pos2, prevPos2)

      p.pos = sub(pos, scale(n, delta))
      p2.pos = add(pos2, scale(n, delta))

      if (preserveImpule) {
        const f1 = (dot(v1, dir) * DAMPING) / distSq
        const f2 = (dot(v2, dir) * DAMPING) / distSq

        v1.x += f2 * dir.x - f1 * dir.x
        v1.y += f2 * dir.y - f1 * dir.y
        v2.x += f1 * dir.x - f2 * dir.x
        v2.y += f1 * dir.y - f2 * dir.y

        p.prevPos = sub(pos, v1)
        p2.prevPos = sub(pos2, v2)
      }
    }
  })
}

const steps = 2
const dt = 1 / steps
const step = (particles: Particle[], ctx: CanvasRenderingContext2D) => {
  for (let i = 0; i < steps; i++) {
    particles.forEach((p) => applyForce(p, GRAVITY))
    particles.forEach((p) => accelerate(p, dt))

    particles.forEach((p, i) => checkCollisions(p, i, particles, false))
    particles.forEach((p) => simpleBound(p))
    particles.forEach((p) => inertia(p))

    particles.forEach((p, i) => checkCollisions(p, i, particles, true))
    particles.forEach((p) => bound(p))
    /* particles.forEach((p) => updateParticle(p, dt)) */
  }

  // Render
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fillRect(0, 0, SIZE.x, SIZE.y)
  particles.forEach((p) => drawParticle(p, ctx))

  requestAnimationFrame(() => step(particles, ctx))
}

const ctx = c.getContext('2d') as CanvasRenderingContext2D
ctx.fillStyle = 'black'
ctx.fillRect(0, 0, SIZE.x, SIZE.y)
step(particles, ctx)

window.addEventListener('click', () =>
  step(particles, c.getContext('2d') as CanvasRenderingContext2D),
)
