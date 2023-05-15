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
  N_PARTICLES: 1024,
}

const SIZE = vec(window.innerWidth, window.innerHeight)
const GRAVITY = vec(0, 10)

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
    mass: randRange(5, 25),
    col: '#000',
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
  const displacement = sub(pos, prevPos)
  p.prevPos = pos
  const acceleration = scale(acc, dt * dt)
  const newPos = add(pos, add(displacement, acceleration))
  p.acc = vec(0, 0)
  p.pos = newPos
  p.col = `hsl(${mag(pos) * 0.1 + 210}, 100%, ${Math.floor(
    mag(displacement) * 5,
  )}%)`
}

const applyForce = (p: Particle, force: Vec) => {
  const { acc, mass } = p
  p.acc = add(acc, scale(force, mass))
}

const bound = (p: Particle) => {
  const { pos, mass } = p
  const { x, y } = pos

  if (x - mass < 0) {
    const dir = vec(-1, 0)
    p.pos = sub(pos, dir)
  }
  if (x + mass > SIZE.x) {
    const dir = vec(1, 0)
    p.pos = sub(pos, dir)
  }
  if (y - mass < 0) {
    const dir = vec(0, -1)
    p.pos = sub(pos, dir)
  }
  if (y + mass > SIZE.y) {
    const dir = vec(0, 1)
    p.pos = sub(pos, dir)
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
      const massRatio1 = mass / minDist
      const massRatio2 = mass2 / minDist
      const delta = 0.5 * (dist - minDist)

      p.pos = sub(pos, scale(n, massRatio2 * delta))
      p2.pos = add(pos2, scale(n, massRatio1 * delta))
    }
  })
}

let prevTime = Date.now()
const draw = (particles: Particle[], ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fillRect(0, 0, SIZE.x, SIZE.y)
  ctx.fillStyle = 'white'
  const now = Date.now()
  const dt = (prevTime - now) / 1000

  for (let i = 0; i < 1; i++) {
    particles.forEach((p) => applyForce(p, GRAVITY))
    particles.forEach((p, i) => checkCollisions(p, i, particles))
    particles.forEach((p) => bound(p))
    particles.forEach((p) => updateParticle(p, dt / 5))
    particles.forEach((p) => drawParticle(p, ctx))
  }

  prevTime = now

  requestAnimationFrame(() => draw(particles, ctx))
}

const ctx = c.getContext('2d') as CanvasRenderingContext2D
ctx.fillStyle = 'black'
ctx.fillRect(0, 0, SIZE.x, SIZE.y)
draw(particles, ctx)

window.addEventListener('click', () =>
  draw(particles, c.getContext('2d') as CanvasRenderingContext2D),
)
