import { aabb, fixedGrid, query } from '@geomm/algorithm'
import { appendEl, createEl } from '@geomm/dom'
import { add, mag, scale, sub, vec, Vec } from '@geomm/geometry'
import { min, randInt, sqrt } from '@geomm/maths'

type Node = {
  pos: Vec
}

type Particle = Node & {
  id: number
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

const grid = fixedGrid(SIZE.x, SIZE.y, 16)

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

const bounds = aabb(vec(SIZE.x / 2, SIZE.y / 2), SIZE.y / 2)
/* Array.from({ length: settings.N_PARTICLES }).map((_, i) => { */
/*   const angle = randRange(0, Math.PI * 2) */
/*   const initialPos = vec( */
/*     SIZE.x / 2 + cos(angle) * 100, */
/*     SIZE.y / 2 + sin(angle) * 100, */
/*   ) */
/*   return { */
/*     pos: initialPos, */
/*     prevPos: initialPos, */
/*     acc: vec(0, 0), */
/*     mass: 8, */
/*     col: grayscaleColors[i % grayscaleColors.length], */
/*   } */
/* }) */

const addParticle = (parts: Particle[], pos: Vec, counter: number) => {
  parts.push({
    id: counter,
    pos,
    prevPos: pos,
    acc: vec(20, -20.0),
    mass: 8,
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

const drawGrid = (ctx: CanvasRenderingContext2D) => {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'

  const { cellSize } = grid

  for (let x = 0; x < SIZE.x; x += cellSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, SIZE.y)
    ctx.stroke()
  }

  for (let y = 0; y < SIZE.y; y += cellSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(SIZE.x, y)
    ctx.stroke()
  }
}

const drawCell = (ctx: CanvasRenderingContext2D, cell: number) => {
  const { cellSize } = grid
  const { x, y } = grid.cellPos(cell)
  ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'
  ctx.fillRect(SIZE.x - x - cellSize, SIZE.y - y - cellSize, cellSize, cellSize)
}

const checkCollisions = (p: Particle, i: number, particles: Particle[]) => {
  const { pos, mass } = p

  /* const cell = grid.getCell(pos.x, pos.y) */
  const neighbours = grid.neighbours(pos, grid.cellSize)

  if (neighbours.length === 0) return

  /* particles.slice(i + 1).forEach((p2) => { */
  neighbours.forEach((p2idx) => {
    if (i === p2idx) return
    const p2 = particles[p2idx]
    const { pos: pos2, mass: mass2 } = p2

    const dir = sub(pos, pos2)
    const distSq = dir.x * dir.x + dir.y * dir.y
    const minDist = mass + mass2

    if (distSq < minDist * minDist) {
      /* drawCell(ctx, i) */
      const dist = sqrt(distSq)
      const n = scale(dir, 1 / dist)

      const delta = (0.5 * (dist - minDist)) / dist

      p.pos = sub(p.pos, scale(n, delta))
      p2.pos = add(p2.pos, scale(n, delta))
    }
  })
}

const steps = 8
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

    grid.clear()
    particles.forEach((p, idx) => grid.add(p.pos, idx))

    particles.forEach((p, i) => checkCollisions(p, i, particles))
    particles.forEach((p) => bound(p))
    particles.forEach((p) => updateParticle(p, dt / steps))
  }

  // Render
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fillRect(0, 0, SIZE.x, SIZE.y)
  particles.forEach((p) => drawParticle(p, ctx))

  drawGrid(ctx)

  if (frame++ % 17 === 0)
    nParticles = addParticle(
      particles,
      vec(SIZE.x * 0.8, SIZE.y - 8),
      /* vec(randInt(0, SIZE.x), randInt(0, SIZE.y)), */
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
