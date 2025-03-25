/* 'Verlet Only' method by Florian Boesch:
 * https://web.archive.org/web/20191117195626/http://codeflow.org/entries/2010/nov/29/verlet-collision-with-impulse-preservation/
 */
import { appendEl, createEl } from '@geomm/dom'
import {
  PI,
  abs,
  add,
  cross,
  dot,
  mag,
  normalize,
  randRange,
  scale,
  sqrt,
  sub,
  vec2,
} from '@geomm/maths'
import { getCellPos, drawGridNumbered } from './grid'
import type { Vec2 } from '@geomm/api'

type Particle = {
  pos: Vec2
  prevPos: Vec2
  acc: Vec2
  mass: number
  col: string
}

const settings = {
  N_PARTICLES: 80,
  RADIUS: 16,
}

const { innerWidth, innerHeight } = window
const SIZE = vec2(innerWidth, innerHeight)
const GRAVITY = vec2(0, 0.1)
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
    const initialPos = vec2(
      randRange(mass, SIZE.x - mass),
      randRange(mass, 200),
    )
    const col = '#fff'
    const p = {
      pos: initialPos,
      prevPos: sub(
        initialPos,
        vec2(randRange(-0.1, 0.1), randRange(-0.1, 0.1)),
      ),
      acc: vec2(0, 0),
      mass: settings.RADIUS,
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

const particleStream = (pos: Vec2, dir = vec2(1, 0), n = Infinity) => {
  const mass = settings.RADIUS
  const col = '#fff'
  const p = {
    pos,
    prevPos: sub(pos, vec2(2, 0)),
    acc: vec2(0, 0),
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

const applyForce = (p: Particle, force: Vec2) => {
  const { acc } = p
  p.acc = add(acc, force)
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

const areaOfTriangle = (a: Vec2, b: Vec2, c: Vec2) => {
  const ab = sub(b, a)
  const ac = sub(c, a)
  return cross(ab, ac) / 2
}

const orthognal = (v: Vec2) => {
  return vec2(-v.y, v.x)
}

const epsilon = 1e-5

const collideWithLine = (p: Particle, lines: Vec2[][]) => {
  const { pos, prevPos, mass } = p
  lines.forEach((line) => {
    for (let i = 0; i < line.length - 1; i += 1) {
      const a = line[i]
      const b = line[i + 1]
      const baseDir = sub(b, a)
      const lenBase = mag(baseDir)
      const pointToA = sub(a, pos)
      const pointToB = sub(b, pos)
      const dist = abs((2 * areaOfTriangle(a, b, pos)) / lenBase)
      /* Techically incorrect, it should be mass * 2, but it prevents the
       * particles from getting stuck in the line */
      const combinedDistanceToBothAandB =
        mag(add(pointToA, pointToB)) - mass * 0.5

      if (dist < mass && combinedDistanceToBothAandB < lenBase) {
        const dirToLine = normalize(orthognal(baseDir))
        const vel = sub(pos, prevPos)
        const aligned = abs(dot(normalize(vel), normalize(baseDir)))
        let force = dot(vel, scale(dirToLine, dist)) / (dist * 0.5)
        if (aligned > 1 - epsilon && aligned < 1 + epsilon) {
          p.col = '#f00'
          p.pos = add(pos, scale(dirToLine, 1))
        } else {
          p.col = '#fff'
        }
        const vp = sub(vel, scale(dirToLine, force))

        p.prevPos = sub(pos, vp)
      }
    }
  })
}

const drawLine = (ctx: CanvasRenderingContext2D, line: Vec2[]) => {
  ctx.strokeStyle = '#f00'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(line[0].x, line[0].y)
  for (let i = 1; i < line.length; i++) {
    ctx.lineTo(line[i].x, line[i].y)
  }
  ctx.stroke()
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

const drawDirection = (p: Particle) => {
  const { pos, prevPos } = p
  const dir = normalize(sub(pos, prevPos))
  ctx.strokeStyle = '#f00'
  ctx.beginPath()
  ctx.moveTo(pos.x, pos.y)
  ctx.lineTo(pos.x + dir.x * 32, pos.y + dir.y * 32)
  ctx.stroke()
}

const square = (center: Vec2, size: number) => {
  const halfSize = size / 2
  const topLeft = vec2(center.x - halfSize, center.y - halfSize)
  const topRight = vec2(center.x + halfSize, center.y - halfSize)
  const bottomRight = vec2(center.x + halfSize, center.y + halfSize)
  const bottomLeft = vec2(center.x - halfSize, center.y + halfSize)

  return [topLeft, topRight, bottomRight, bottomLeft, topLeft]
}

const squareWithChamferedCorners = (
  center: Vec2,
  size: number,
  chamfer: number,
) => {
  const halfSize = size / 2
  const topLeftA = vec2(center.x - halfSize, center.y - halfSize + chamfer)
  const topLeftB = vec2(center.x - halfSize + chamfer, center.y - halfSize)
  const topRightA = vec2(center.x + halfSize - chamfer, center.y - halfSize)
  const topRightB = vec2(center.x + halfSize, center.y - halfSize + chamfer)
  const bottomRightA = vec2(center.x + halfSize, center.y + halfSize - chamfer)
  const bottomRightB = vec2(center.x + halfSize - chamfer, center.y + halfSize)
  const bottomLeftA = vec2(center.x - halfSize + chamfer, center.y + halfSize)
  const bottomLeftB = vec2(center.x - halfSize, center.y + halfSize - chamfer)

  return [
    topLeftA,
    topLeftB,
    topRightA,
    topRightB,
    bottomRightA,
    bottomRightB,
    bottomLeftA,
    bottomLeftB,
    topLeftA,
  ]
}

const rotateLine = (line: Vec2[], angle: number) => {
  const center = scale(
    line.reduce((acc, p) => add(acc, p), vec2(0, 0)),
    1 / line.length,
  )
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return line.map((p) => {
    const v = sub(p, center)
    const x = v.x * cos - v.y * sin
    const y = v.x * sin + v.y * cos
    return add(vec2(x, y), center)
  })
}

const lines = [
  rotateLine(square(vec2(250, 600), 200), PI / 3),
  rotateLine(square(vec2(600, 600), 200), PI / 7),
]

const filterStrength = 20
let lastTime = performance.now()
let now = lastTime
let deltaTime = 0
let frameTime = 0

const steps = 2
const dt = 1 / steps
const step = () => {
  now = performance.now()
  deltaTime = (now - lastTime) / filterStrength
  lastTime = now
  /* const thisFrameTime = thisLoop - lastLoop */
  /* deltaTime = (thisFrameTime - deltaTime) / filterStrength */
  /* frameTime += deltaTime */
  /* lastLoop = thisLoop */

  /* const rotatedLine = rotateLine(line, now * 0.001) */

  for (let sub = 0; sub < steps; sub++) {
    particles.forEach((p) => applyForce(p, GRAVITY))
    particles.forEach((p) => accelerate(p, deltaTime / steps))
    /* particles.forEach((p, i) => checkCollisions(p, i)) */
    checkCollisionsGrid(particles, false)
    particles.forEach((p) => simpleConstrain(p))
    particles.forEach((p) => collideWithLine(p, lines))
    particles.forEach((p) => inertia(p))
    checkCollisionsGrid(particles, true)
    particles.forEach((p) => preserveImpulseConstrain(p))
  }

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, SIZE.x, SIZE.y)

  lines.forEach((l) => drawLine(ctx, l))

  particles.forEach((p) => {
    const { pos, col, mass } = p
    ctx.fillStyle = col
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, mass, 0, Math.PI * 2)
    ctx.fill()
    /* drawDirection(p) */
  })

  // drawGridNumbered(ctx, CELL_SIZE, SIZE.x, SIZE.y)

  requestAnimationFrame(step)
}

const fpsOut = document.getElementById('fps') as HTMLPreElement
setInterval(function () {
  fpsOut.innerHTML = `n particles: ${particles.length}
${(1000 / frameTime).toFixed(1)}fps`
}, 1000)

placeParticles()
/* particleStream(vec2(100, 50)) */

window.addEventListener('resize', () => {
  const { innerWidth, innerHeight } = window
  SIZE.x = innerWidth
  SIZE.y = innerHeight
  c.width = SIZE.x
  c.height = SIZE.y
})

/* window.addEventListener(
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
) */

requestAnimationFrame(step)
