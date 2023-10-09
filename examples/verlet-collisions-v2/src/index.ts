/* 'Verlet Only' method by Florian Boesch:
 * https://web.archive.org/web/20191117195626/http://codeflow.org/entries/2010/nov/29/verlet-collision-with-impulse-preservation/
 */
import { appendEl, createEl } from '@geomm/dom'
import { add, dot, mag, scale, sub, Vec, vec } from '@geomm/geometry'
import { randInt, randRange, sqrt } from '@geomm/maths'
import { getCellPos } from './grid'

type Particle = {
  pos: Vec
  prevPos: Vec
  acc: Vec
  mass: number
  col: string
}

const settings = {
  N_PARTICLES: 500,
  RADIUS: 8,
}

const { innerWidth, innerHeight } = window
const SIZE = vec(innerWidth, innerHeight)
const GRAVITY = vec(0, 0.5)
const DAMPING = 0.5

const CELL_SIZE = settings.RADIUS

/* const N_BUCKETS = ((SIZE.x / CELL_SIZE) * SIZE.y) / CELL_SIZE */

const c = createEl('canvas', {
  width: SIZE.x,
  height: SIZE.y,
}) as HTMLCanvasElement
const ctx = c.getContext('2d') as CanvasRenderingContext2D
appendEl(c)

const particles: Particle[] = []

const placeParticles = () => {
  while (particles.length < settings.N_PARTICLES) {
    const mass = settings.RADIUS
    const initialPos = vec(
      randRange(mass, SIZE.x - mass),
      randRange(mass, SIZE.y - mass),
    )
    const col = '#fff'
    const p = {
      pos: initialPos,
      prevPos: initialPos,
      acc: vec(0, 0),
      mass: randInt(settings.RADIUS, settings.RADIUS),
      col,
    }

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

const particleStream = (pos: Vec, dir = vec(1, 0), n = Infinity) => {
  const mass = settings.RADIUS
  const col = '#fff'
  const p = {
    pos,
    prevPos: sub(pos, vec(2, 0)),
    acc: vec(0, 0),
    mass,
    col,
  }
  particles.push(p)
  if (n > 0) {
    setTimeout(() => {
      particleStream(pos, dir, n - 1)
    }, 50)
  }
}

const accelerate = (p: Particle, dt: number) => {
  const { pos, acc } = p
  p.pos = add(pos, scale(acc, dt * dt))
  p.acc = vec(0, 0)
}

const inertia = (p: Particle) => {
  const { pos, prevPos } = p
  p.prevPos = pos
  p.pos = sub(scale(pos, 2), prevPos)
}

const applyForce = (p: Particle, force: Vec) => {
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
      /* Compute the projected componetn factors */
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

const vecId = (v: Vec) => `${v.x},${v.y}`

const checkCollisionsGrid = (
  particles: Particle[],
  preserveImpulse: boolean,
) => {
  const grid = new Map()
  particles.forEach((p) => {
    const { pos } = p
    const cellPosTopLeft = getCellPos(
      add(pos, vec(-settings.RADIUS, -settings.RADIUS)),
      CELL_SIZE,
    )
    const cellPosBottomRight = getCellPos(
      add(pos, vec(settings.RADIUS, settings.RADIUS)),
      CELL_SIZE,
    )

    for (let i = 0; i <= cellPosBottomRight.x - cellPosTopLeft.x; i++) {
      for (let j = 0; j <= cellPosBottomRight.y - cellPosTopLeft.y; j++) {
        const cellPos = vec(cellPosTopLeft.x + i, cellPosTopLeft.y + j)
        const idx = vecId(cellPos)
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
let lastLoop = performance.now()
let thisLoop = lastLoop
let frameTime = 0

const steps = 8
const dt = 1 / steps
const step = () => {
  ctx.clearRect(0, 0, SIZE.x, SIZE.y)

  for (let sub = 0; sub < steps; sub++) {
    particles.forEach((p) => applyForce(p, GRAVITY))
    particles.forEach((p) => accelerate(p, dt))
    /* particles.forEach((p, i) => checkCollisions(p, i)) */
    checkCollisionsGrid(particles, false)
    particles.forEach((p) => simpleConstrain(p))
    particles.forEach((p) => inertia(p))
    checkCollisionsGrid(particles, true)
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

placeParticles()
/* particleStream(vec(100, 50)) */

window.addEventListener('resize', () => {
  const { innerWidth, innerHeight } = window
  SIZE.x = innerWidth
  SIZE.y = innerHeight
  c.width = SIZE.x
  c.height = SIZE.y
})

window.addEventListener(
  'devicemotion',
  (e) => {
    const accX = -e.accelerationIncludingGravity.x
    const accY = e.accelerationIncludingGravity.y

    const deviceOut = document.getElementById('device') as HTMLPreElement
    deviceOut.innerHTML = `accX: ${accX.toFixed(1)} accY: ${accY.toFixed(1)}`

    GRAVITY.x = accX * 0.1
    GRAVITY.y = accY * 0.1
  },
  true,
)

requestAnimationFrame(step)
