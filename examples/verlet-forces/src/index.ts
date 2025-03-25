/* 'Verlet Only' method by Florian Boesch:
 * https://web.archive.org/web/20191117195626/http://codeflow.org/entries/2010/nov/29/verlet-collision-with-impulse-preservation/
 */
import { appendEl, createEl } from '@geomm/dom'
import {
  add,
  distanceSq,
  dot,
  mag,
  normalize,
  randInt,
  randRange,
  scale,
  sqrt,
  sub,
  vec2,
} from '@geomm/maths'
import { getCellPos } from './grid'
import type { AABB, Vec2 } from '@geomm/api'
import {
  aabb,
  count,
  insert,
  quadtree,
  query,
  type Quadtree,
} from '@geomm/algorithm'

type Particle = {
  index: number
  pos: Vec2
  prevPos: Vec2
  acc: Vec2
  mass: number
  col: string
}

type Behaviour = {
  index?: number
  attractor: Vec2
  radius: number
  strength: number
  query: AABB
}

const settings = {
  N_PARTICLES: 3000,
  RADIUS: 4,
}

const { innerWidth, innerHeight } = window
const SIZE = vec2(innerWidth, innerHeight)
const BOUNDS = aabb(vec2(SIZE.x / 2, SIZE.y / 2), SIZE.x / 2, SIZE.y / 2)
const GRAVITY = vec2(0, 0.01)
const DAMPING = 0.0000001
const CELL_SIZE = settings.RADIUS

const mouse = vec2(0, 0)

const c = createEl('canvas', {
  width: SIZE.x,
  height: SIZE.y,
}) as HTMLCanvasElement
const ctx = c.getContext('2d') as CanvasRenderingContext2D
appendEl(c)

const particles: Particle[] = []
let tree: Quadtree

const colors = [
  '#d6d95d',
  '#f9f7f2',
  '#252120',
  '#c6c944',
  '#ca5241',
  '#e5ca5c',
  '#e6ddd2',
  '#4a4a4a',
  '#857e85',
]

const placeParticles = () => {
  while (particles.length < settings.N_PARTICLES) {
    const mass = settings.RADIUS
    const initialPos = vec2(
      randRange(mass, SIZE.x - mass),
      randRange(mass, SIZE.y - mass),
    )
    const col = colors[randInt(0, colors.length - 1)]
    const p = {
      index: particles.length,
      pos: initialPos,
      prevPos: sub(
        initialPos,
        vec2(randRange(-0.1, 0.1), randRange(-0.1, 0.1)),
      ),
      acc: vec2(0, 0),
      mass: randInt(settings.RADIUS, settings.RADIUS),
      col,
    }

    /* BEHAVIOURS.push({ */
    /*   attractor: initialPos, */
    /*   radius: 20, */
    /*   strength: -2.2, */
    /* }) */

    let collides = false
    for (let i = 0; i < particles.length; i++) {
      const p2 = particles[i]
      const { pos: pos2, mass: mass2 } = p2
      const v = sub(p.pos, pos2)
      const dist = mag(v)
      const minDist = mass + mass2

      if (dist < minDist) {
        collides = true
        break
      }
    }
    if (!collides) particles.push(p)
  }
}
const interpolateToSelf = (p: Particle, t: number) => {
  const { pos, prevPos } = p
  return add(scale(pos, t), scale(prevPos, 1 - t))
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

const applyBehaviorNaive = (p: Particle, behaviour: Behaviour) => {
  const { attractor, radius, strength } = behaviour
  const delta = sub(attractor, p.pos)
  const dist = distanceSq(attractor, p.pos)
  if (dist < radius * radius) {
    const d = normalize(delta)
    const f = scale(scale(d, 1.0 - dist / (radius * radius)), strength)
    applyForce(p, f)
  }
}

const applyBehaviorQuad = (p: Particle, behaviour: Behaviour) => {
  const { attractor, radius, strength } = behaviour
  const delta = sub(attractor, p.pos)
  const dist = distanceSq(attractor, p.pos)
  const d = normalize(delta)
  const f = scale(scale(d, 1.0 - dist / (radius * radius)), strength)
  applyForce(p, f)
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

const preserveImpulseConstrain = (p: Particle) => {
  const { pos, prevPos, mass } = p
  if (pos.x < mass) {
    const vx = (pos.x - prevPos.x) * DAMPING
    pos.x = mass
    prevPos.x = pos.x + vx
  } else if (pos.x > SIZE.x - mass) {
    const vx = (pos.x - prevPos.x) * DAMPING
    pos.x = SIZE.x - mass
    prevPos.x = pos.x + vx
  }
  if (pos.y < mass) {
    const vy = (pos.y - prevPos.y) * DAMPING
    pos.y = mass
    prevPos.y = pos.y - vy
  } else if (pos.y > SIZE.y - mass) {
    const vy = (pos.y - prevPos.y) * DAMPING
    pos.y = SIZE.y - mass
    prevPos.y = pos.y - vy
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

const checkCollisions = (particles: Particle[], preserveImpulse = false) => {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]
    for (let j = i + 1; j < particles.length; j++) {
      const p2 = particles[j]
      collide(p, p2, preserveImpulse)
    }
  }
}

const vec2Id = (v: Vec2) => `${v.x},${v.y}`

const checkCollisionsGrid = (
  particles: Particle[],
  preserveImpulse: boolean,
) => {
  const grid = new Map()
  particles.forEach((p) => {
    const { pos } = p
    const cellPosTopLeft = getCellPos(
      add(pos, vec2(-settings.RADIUS, -settings.RADIUS)),
      CELL_SIZE,
    )
    const cellPosBottomRight = getCellPos(
      add(pos, vec2(settings.RADIUS, settings.RADIUS)),
      CELL_SIZE,
    )

    for (let i = 0; i <= cellPosBottomRight.x - cellPosTopLeft.x; i++) {
      for (let j = 0; j <= cellPosBottomRight.y - cellPosTopLeft.y; j++) {
        const cellPos = vec2(cellPosTopLeft.x + i, cellPosTopLeft.y + j)
        const idx = vec2Id(cellPos)
        if (!grid.has(idx)) grid.set(idx, [])
        const cell = grid.get(idx)
        cell.push(p)
      }
    }
  })

  for (const bucket of grid.values()) {
    for (let i = 0; i < bucket.length; i++) {
      const p = bucket[i]
      for (let j = i + 1; j < bucket.length; j++) {
        const p2 = bucket[j]
        collide(p, p2, preserveImpulse)
      }
    }
  }
}

const filterStrength = 20
let lastTime = performance.now()
let now = lastTime
let deltaTime = 0
let frameTime = 0

const steps = 2
const dt = 1 / steps
let behaviours: Behaviour[] = []
const step = () => {
  now = performance.now()
  deltaTime = (now - lastTime) / filterStrength
  lastTime = now
  /* const thisFrameTime = thisLoop - lastLoop */
  /* deltaTime = (thisFrameTime - deltaTime) / filterStrength */
  /* frameTime += deltaTime */
  /* lastLoop = thisLoop */

  tree = quadtree(BOUNDS)
  particles.forEach((p) => insert(tree, p))

  ctx.clearRect(0, 0, SIZE.x, SIZE.y)

  behaviours = particles.map((p) => ({
    index: p.index,
    attractor: p.pos,
    radius: settings.RADIUS * 3,
    query: aabb(p.pos, settings.RADIUS * 3, settings.RADIUS * 3),
    strength: -2.2,
  }))

  for (let sub = 0; sub < steps; sub++) {
    particles.forEach((p) => applyForce(p, GRAVITY))
    /* behaviours.forEach((b) => {
      particles.forEach((p) => {
        if (p.index !== b.index) applyBehaviorNaive(p, b)
      })
    }) */
    behaviours.forEach((b) => {
      const results = query(tree, b.query)
      results.forEach((p) => {
        if (p.index !== b.index) applyBehaviorQuad(p, b)
      })
    })
    particles.forEach((p) => accelerate(p, dt))
    /* particles.forEach((p) => accelerate(p, deltaTime / steps)) */
    /* particles.forEach((p, i) => checkCollisions(p, i)) */
    /* checkCollisionsGrid(particles, false) */
    /* particles.forEach((p) => simpleConstrain(p)) */
    particles.forEach((p) => inertia(p))
    /* checkCollisionsGrid(particles, false) */
    particles.forEach((p) => preserveImpulseConstrain(p))
  }

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, SIZE.x, SIZE.y)

  particles.forEach((p) => {
    const { pos, col, mass } = p
    ctx.fillStyle = col
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, mass, 0, Math.PI * 2)
    ctx.fill()
  })

  /* drawGridNumbered(ctx, CELL_SIZE, SIZE.x, SIZE.y) */

  requestAnimationFrame(step)
}

const fpsOut = document.getElementById('fps') as HTMLPreElement
setInterval(function () {
  fpsOut.innerHTML = `n particles: ${particles.length}
${(1000 / frameTime).toFixed(1)}fps`
}, 1000)

const init = () => {
  placeParticles()
  tree = quadtree(BOUNDS)
  particles.forEach((p) => insert(tree, p))

  step()
}
/* particleStream(vec2(100, 50)) */

window.addEventListener('resize', () => {
  const { innerWidth, innerHeight } = window
  SIZE.x = innerWidth
  SIZE.y = innerHeight
  c.width = SIZE.x
  c.height = SIZE.y
})

let mouseDown = false

window.addEventListener('mousedown', () => {
  mouseDown = true
})

window.addEventListener('mouseup', () => {
  mouseDown = false

  requestAnimationFrame(step)
})

window.addEventListener('mousemove', () => {
  if (!mouseDown) return
  const radius = 300
  const strength = 25
  particles.forEach((p) =>
    applyBehaviorNaive(p, { attractor: mouse, radius, strength }),
  )
})

init()
/* requestAnimationFrame(step) */
