/* 'Verlet Only' method by Florian Boesch:
 * https://web.archive.org/web/20191117195626/http://codeflow.org/entries/2010/nov/29/verlet-collision-with-impulse-preservation/
 */
import { appendEl, createEl } from '@geomm/dom'
import { add, distance, mag, mul, scale, sub, Vec, vec } from '@geomm/geometry'
import { randInt, randRange, sqrt } from '@geomm/maths'
import {
  drawGrid,
  drawGridCell,
  drawGridNumbered,
  getCellPos,
  getHashBucketIndex,
} from './grid'

type Particle = {
  pos: Vec
  prevPos: Vec
  acc: Vec
  mass: number
  col: string
}

const settings = {
  N_PARTICLES: 1,
  RADIUS: 8,
}

const SIZE = vec(1000, 1000)
const GRAVITY = vec(0, 0.01)

const CELL_SIZE = settings.RADIUS

const N_BUCKETS = ((SIZE.x / CELL_SIZE) * SIZE.y) / CELL_SIZE

console.log('BUCKETS', N_BUCKETS)

const c = createEl('canvas', {
  width: SIZE.x,
  height: SIZE.y,
}) as HTMLCanvasElement
const ctx = c.getContext('2d') as CanvasRenderingContext2D
appendEl(c)

const particles: Particle[] = []

const useMyParticles = () => {
  particles.push({
    pos: vec(100, 100),
    prevPos: vec(100, 100),
    acc: vec(0, 0),
    mass: settings.RADIUS,
    col: '#fff',
  })

  particles.push({
    pos: vec(200, 200),
    prevPos: vec(200, 200),
    acc: vec(0, 0),
    mass: settings.RADIUS,
    col: '#fff',
  })
}

const placeParticles = () => {
  while (particles.length < settings.N_PARTICLES) {
    const mass = settings.RADIUS // randInt(5, 8)
    const initialPos = vec(
      randRange(mass, SIZE.x - mass),
      randRange(mass, SIZE.y - mass),
    )
    const col = '#fff'
    const p = {
      pos: initialPos,
      prevPos: initialPos,
      acc: vec(0, 0),
      mass,
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

const accelerate = (p: Particle, dt: number) => {
  const { pos, acc } = p
  p.pos = add(pos, scale(acc, dt * dt))
  p.acc = vec(0, 0)
}

const inertia = (p: Particle) => {
  const { pos, prevPos } = p
  const vel = distance(pos, prevPos)
  p.col = `hsl(${vel * 360}, 100%, 50%)`
  p.prevPos = pos
  p.pos = sub(scale(pos, 2), prevPos)
}

const applyForce = (p: Particle, force: Vec) => {
  const { acc } = p
  p.acc = add(acc, force)
}

const simpleConstrain = (p: Particle) => {
  const { pos, prevPos, mass } = p
  const diff = sub(pos, prevPos)
  if (pos.x < mass) {
    pos.x = mass
    // this.old_x = this.x + vel_x;
    prevPos.x = pos.x + diff.x
  } else if (pos.x > SIZE.x - mass) {
    pos.x = SIZE.x - mass
  }
  if (pos.y < mass) {
    pos.y = mass
  } else if (pos.y > SIZE.y - mass) {
    pos.y = SIZE.y - mass
  }
}

const checkCollisions = (p: Particle, idx: number, preserveImpulse = false) => {
  const { pos, mass } = p

  for (let i = idx + 1; i < particles.length; i++) {
    const p2 = particles[i]
    const { pos: pos2, mass: mass2 } = p2
    const v = sub(pos, pos2)
    const distSq = v.x * v.x + v.y * v.y
    const minDist = mass + mass2

    if (distSq < minDist * minDist) {
      const dist = sqrt(distSq)
      const factor = (dist - minDist) / dist

      const displacement = scale(v, factor * 0.5)

      p.pos = sub(p.pos, displacement)
      p2.pos = add(p2.pos, displacement)

      /* if(preserveImpulse) { */
      /*   const damping = 0.5 */
      /*   const { prevPos } = p */
      /*   const { prevPos: prevPos2 } = p2 */
      /*   const v1 = sub(pos, prevPos) */
      /*   const v2 = sub(pos2, prevPos2) */
      /*   const f1 = scale(scale(mul(v, v1), damping), 1 / distSq) */
      /*   const f2 = scale(scale(mul(v, v2), damping), 1 / distSq) */
      /**/
      /* } */
    }
  }
}

const vecId = (v: Vec) => `${v.x},${v.y}`

const checkCollisionsGrid = (particles: Particle[]) => {
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
      const { pos, mass } = p
      for (let j = i + 1; j < bucket.length; j++) {
        const p2 = bucket[j]
        const { pos: pos2, mass: mass2 } = p2
        const v = sub(pos, pos2)
        const distSq = v.x * v.x + v.y * v.y
        const minDist = mass + mass2

        if (distSq < minDist * minDist) {
          const dist = sqrt(distSq)
          const factor = (dist - minDist) / dist

          const displacement = scale(v, factor * 0.5)

          p.pos = sub(p.pos, displacement)
          p2.pos = add(p2.pos, displacement)
        }
      }
    }
  }
}

const filterStrength = 20
let lastLoop = performance.now()
let thisLoop = lastLoop
let frameTime = 0

const steps = 1
const dt = 1 / steps
const step = () => {
  ctx.clearRect(0, 0, SIZE.x, SIZE.y)

  for (let sub = 0; sub < steps; sub++) {
    particles.forEach((p) => applyForce(p, GRAVITY))
    particles.forEach((p) => accelerate(p, dt))
    /* particles.forEach((p, i) => checkCollisions(p, i)) */
    checkCollisionsGrid(particles)
    particles.forEach((p) => simpleConstrain(p))
    particles.forEach((p) => inertia(p))
  }

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, SIZE.x, SIZE.y)

  particles.forEach((p) => {
    const { pos, col, mass } = p
    ctx.fillStyle = col
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, mass, 0, Math.PI * 2)
    ctx.fill()

    /* ctx.fillStyle = '#fff' */
    /* ctx.beginPath() */
    /* ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2) */
    /* ctx.fill() */
  })

  /* drawGridNumbered(ctx, CELL_SIZE, SIZE.x, SIZE.y) */

  thisLoop = performance.now()
  const thisFrameTime = thisLoop - lastLoop
  frameTime += (thisFrameTime - frameTime) / filterStrength
  lastLoop = thisLoop

  requestAnimationFrame(step)
}

const fpsOut = document.getElementById('fps') as HTMLPreElement
setInterval(function() {
  fpsOut.innerHTML = `n particles: ${settings.N_PARTICLES}
${(1000 / frameTime).toFixed(1)}fps`
}, 1000)

placeParticles()
/* useMyParticles() */

window.addEventListener('click', () => {
  for (let i = 0; i < 5; i++) requestAnimationFrame(step)
})
requestAnimationFrame(step)
