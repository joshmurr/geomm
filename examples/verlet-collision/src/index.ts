import { appendEl, createEl } from '@geomm/dom'
import { add, mag, scale, sub, vec, Vec } from '@geomm/geometry'
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

const grayscaleColors = Array.from({ length: 256 }).map((_, i) => {
  const hex = i.toString(16).padStart(2, '0')
  const col = `#${hex}${hex}${hex}`
  return col
})

const particles = Array.from({ length: settings.N_PARTICLES }).map((_, i) => {
  const initialPos = vec(randRange(0, SIZE.x), randRange(0, SIZE.y))
  return {
    pos: initialPos,
    prevPos: initialPos,
    acc: vec(0, 0),
    mass: 12,
    col: grayscaleColors[i % grayscaleColors.length],
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
}

const applyForce = (p: Particle, force: Vec) => {
  const { acc, mass } = p
  p.acc = add(acc, scale(force, 1 / mass))
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

const checkCollisions = (p: Particle, i: number, particles: Particle[]) => {
  const { pos, mass } = p

  particles.slice(i + 1).forEach((p2) => {
    const { pos: pos2, mass: mass2 } = p2

    const dir = sub(pos, pos2)
    const distSq = dir.x * dir.x + dir.y * dir.y
    const minDist = mass + mass2

    if (distSq < minDist * minDist) {
      const dist = sqrt(distSq)
      const n = scale(dir, 1 / dist)

      const delta = (0.5 * (dist - minDist)) / dist

      p.pos = sub(p.pos, scale(n, delta))
      p2.pos = add(p2.pos, scale(n, delta))
    }
  })
}

const steps = 6
const dt = 1

const step = (particles: Particle[], ctx: CanvasRenderingContext2D) => {
  for (let sub = 0; sub < steps; sub++) {
    particles.forEach((p) => applyForce(p, GRAVITY))
    particles.forEach((p, i) => checkCollisions(p, i, particles))
    particles.forEach((p) => bound(p))
    particles.forEach((p) => updateParticle(p, dt / steps))
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
