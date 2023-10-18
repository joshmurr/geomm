import { appendEl, createEl } from '@geomm/dom'
import {
  add,
  distance,
  mag,
  randInt,
  random,
  scale,
  sub,
  vec2,
} from '@geomm/maths'
import type { Vec2 } from '@geomm/api'

type Particle = {
  pos: Vec2
  prevPos: Vec2
  acc: Vec2
  mass: number
  col: string
}

type Stick = {
  ids: [number, number]
  len: number
  strength: number
}

type Shape = {
  particles: Particle[]
  connections: Stick[]
}

const settings = {
  N_PARTICLES: 500,
  RADIUS: 15,
}

const { innerWidth, innerHeight } = window
const SIZE = vec2(innerWidth, innerHeight)
const GRAVITY = vec2(0, 0.5)

const c = createEl('canvas', {
  width: SIZE.x,
  height: SIZE.y,
}) as HTMLCanvasElement
const ctx = c.getContext('2d') as CanvasRenderingContext2D
appendEl(c)

const particles: Particle[] = []
const shapes: Shape[] = []

const placeSquare = () => {
  const a = vec2(100, 90)
  const b = vec2(220, 100)
  const c = vec2(190, 190)
  const d = vec2(110, 220)

  const v = [a, b, c, d]
  const connections = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [0, 2],
    [1, 3],
  ]

  const square = {
    particles: v.map((pos) => ({
      pos,
      prevPos: pos,
      acc: vec2(0, 0),
      mass: randInt(2, settings.RADIUS),
      col: '#fff',
    })),
    connections: connections.map(([i, j]) => ({
      ids: [i, j] as [number, number],
      len: mag(sub(v[i], v[j])),
      strength: random() * 0.1,
    })),
  }

  shapes.push(square)
}

const placeCircle = () => {
  const center = vec2(SIZE.x / 2, SIZE.y / 2)
  const radius = 100
  const n = 16
  const particles: Particle[] = []
  const connections: Stick[] = []

  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2
    const pos = add(
      center,
      vec2(Math.cos(angle) * radius, Math.sin(angle) * radius),
    )
    particles.push({
      pos,
      prevPos: pos,
      acc: vec2(0, 0),
      mass: 8,
      col: '#fff',
    })
  }

  const distBetween = distance(particles[0].pos, particles[1].pos)

  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n
    const opposite = (i + n / 2) % n

    connections.push({
      ids: [i, next] as [number, number],
      len: distBetween,
      strength: random() * 0.1,
    })
    connections.push({
      ids: [i, opposite] as [number, number],
      len: radius * 2,
      strength: random() * 0.1,
    })
  }

  shapes.push({
    particles,
    connections,
  })
}

const accelerate = (p: Particle, dt: number) => {
  const { pos, acc } = p
  p.pos = add(pos, scale(acc, dt * dt))
  p.acc = vec2(0, 0)
}

const inertia = (p: Particle) => {
  const { pos, prevPos } = p
  p.prevPos = pos
  p.pos = sub(scale(pos, 2), prevPos)
}

const applyForce = (p: Particle, force: Vec2) => {
  const { acc } = p
  p.acc = add(acc, force)
}

const simpleConstrain = (p: Particle) => {
  const { pos, mass } = p
  if (pos.x < mass) {
    pos.x = mass
  } else if (pos.x > SIZE.x - mass) {
    pos.x = SIZE.x - mass
  }
  if (pos.y < mass) {
    pos.y = mass
  } else if (pos.y > SIZE.y - mass) {
    pos.y = SIZE.y - mass
  }
}

const rigidConstrain = (particles: Particle[], connections: Stick[]) => {
  connections.forEach(({ ids, len, strength }) => {
    const [i, j] = ids
    const p = particles[i]
    const p2 = particles[j]
    const v = sub(p.pos, p2.pos)
    const dist = mag(v) + 1e-6

    const pInvWeight = 1 / p.mass
    const p2InvWeight = 1 / p2.mass

    const normDistStrength =
      ((dist - len) / (dist * (pInvWeight + p2InvWeight))) * strength

    const correction = scale(v, normDistStrength * pInvWeight)
    const correction2 = scale(v, -normDistStrength * p2InvWeight)
    p.pos = sub(p.pos, correction)
    p2.pos = sub(p2.pos, correction2)
  })
}

const filterStrength = 20
let lastLoop = performance.now()
let thisLoop = lastLoop
let frameTime = 0

const steps = 8
const dt = 1 / steps
const step = () => {
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, SIZE.x, SIZE.y)

  shapes.forEach(({ particles, connections }) => {
    for (let sub = 0; sub < steps; sub++) {
      particles.forEach((p) => applyForce(p, GRAVITY))
      particles.forEach((p) => accelerate(p, dt))

      rigidConstrain(particles, connections)

      particles.forEach((p) => simpleConstrain(p))
      particles.forEach((p) => inertia(p))
    }

    particles.forEach((p) => {
      const { pos, col, mass } = p
      ctx.fillStyle = col
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, mass, 0, Math.PI * 2)
      ctx.fill()
    })

    connections.forEach(({ ids }) => {
      const [i, j] = ids
      const p = particles[i]
      const p2 = particles[j]
      ctx.strokeStyle = '#fff'
      ctx.beginPath()
      ctx.moveTo(p.pos.x, p.pos.y)
      ctx.lineTo(p2.pos.x, p2.pos.y)
      ctx.stroke()
    })
  })

  thisLoop = performance.now()
  const thisFrameTime = thisLoop - lastLoop
  frameTime += (thisFrameTime - frameTime) / filterStrength
  lastLoop = thisLoop

  requestAnimationFrame(step)
}

const fpsOut = document.getElementById('fps') as HTMLPreElement
setInterval(function () {
  fpsOut.innerHTML = `n particles: ${particles.length}
${(1000 / frameTime).toFixed(1)}fps`
}, 1000)

placeSquare()
placeCircle()

c.addEventListener('click', (e) => {
  requestAnimationFrame(step)
})

window.addEventListener('resize', () => {
  const { innerWidth, innerHeight } = window
  SIZE.x = innerWidth
  SIZE.y = innerHeight
  c.width = SIZE.x
  c.height = SIZE.y
})

requestAnimationFrame(step)
