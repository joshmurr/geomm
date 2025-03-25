import type { Vec2 } from '@geomm/api'
import { appendEl, createEl } from '@geomm/dom'
import { add, dot, scale, sub, vec2 } from '@geomm/maths'
import { randInt, sqrt } from '@geomm/maths'
import { fixedGrid } from '@geomm/algorithm'

type Node = {
  pos: Vec2
}

type Particle = Node & {
  id: number
  prevPos: Vec2
  acc: Vec2
  mass: number
  col: string
}

const settings = {
  N_PARTICLES: 64,
  GRID_SIZE: 32,
}

const SIZE = vec2(window.innerWidth, window.innerHeight)
const GRAVITY = vec2(0, 0.5)

const DAMPING = 0.5

const c = createEl('canvas', {
  width: SIZE.x,
  height: SIZE.y,
}) as HTMLCanvasElement
appendEl(c)
const ctx = c.getContext('2d') as CanvasRenderingContext2D
ctx.fillStyle = 'black'
ctx.fillRect(0, 0, SIZE.x, SIZE.y)

const grayscaleColors = Array.from({ length: 128 }).map((_, i) => {
  const hex = (i + 128).toString(16).padStart(2, '0')
  const col = `#${hex}${hex}${hex}`
  return col
})

const particles: Particle[] = []

const addParticle = (parts: Particle[], pos: Vec2, counter: number) => {
  parts.push({
    id: counter,
    pos,
    prevPos: pos,
    acc: vec2(20, -20.0),
    mass: settings.GRID_SIZE / 2,
    col: grayscaleColors[randInt(0, grayscaleColors.length - 1)],
  })

  return counter + 1
}

const drawParticle = (p: Particle, ctx: CanvasRenderingContext2D) => {
  const { col } = p
  const { x, y } = p.pos

  ctx.fillStyle = col
  ctx.beginPath()
  ctx.arc(x, y, p.mass, 0, 2 * Math.PI)
  ctx.fill()
}

const updateParticle = (p: Particle, dt: number) => {
  const vel = sub(p.pos, p.prevPos)
  p.prevPos = p.pos
  const acceleration = scale(p.acc, dt * dt)
  const newPos = add(p.pos, add(vel, acceleration))
  p.acc = vec2(0, 0)
  p.pos = newPos
}

const applyForce = (p: Particle, force: Vec2) => {
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

const collide = (p: Particle, p2: Particle, preserveImpulse = false) => {
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
      const f1 = (DAMPING * dot(v1, v)) / distSq
      const f2 = (DAMPING * dot(v2, v)) / distSq

      /* Swap the projected components */
      const v1p = add(v1, sub(scale(v, f2), scale(v, f1)))
      const v2p = add(v2, sub(scale(v, f1), scale(v, f2)))

      /* Previous pos is adjusted by the projected component */
      p.prevPos = sub(pos, v1p)
      p2.prevPos = sub(pos2, v2p)
    }
  }
}

const checkCollisions = (p: Particle, i: number, particles: Particle[]) => {
  const { pos, mass } = p

  /* particles.slice(i + 1).forEach((p2) => { */
  particles.forEach((p2, j) => {
    if (i === j) return
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

const steps = 4
const dt = 1
let frame = 0
const filterStrength = 20
let lastLoop = performance.now()
let thisLoop = lastLoop
let frameTime = 0
let nParticles = 0

const step = (particles: Particle[], ctx: CanvasRenderingContext2D) => {
  for (let sub = 0; sub < steps; sub++) {
    particles.forEach((p) => applyForce(p, GRAVITY))

    /* particles.forEach((p, i) => checkCollisions(p, i, particles)) */
    fixedGrid(particles, settings.GRID_SIZE, collide)
    particles.forEach((p) => bound(p))
    particles.forEach((p) => updateParticle(p, dt / steps))
  }

  // Render
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fillRect(0, 0, SIZE.x, SIZE.y)
  particles.forEach((p) => drawParticle(p, ctx))

  if (frame++ % 7 === 0)
    nParticles = addParticle(
      particles,
      vec2(SIZE.x * 0.8, settings.GRID_SIZE),
      nParticles,
    )

  thisLoop = performance.now()
  const thisFrameTime = thisLoop - lastLoop
  frameTime += (thisFrameTime - frameTime) / filterStrength
  lastLoop = thisLoop

  requestAnimationFrame(() => step(particles, ctx))
}

step(particles, ctx)

window.addEventListener('click', () =>
  step(particles, c.getContext('2d') as CanvasRenderingContext2D),
)

const fpsOut = document.getElementById('fps') as HTMLPreElement
setInterval(function () {
  fpsOut.innerHTML = `n particles: ${nParticles}
${(1000 / frameTime).toFixed(1)}fps`
}, 1000)
