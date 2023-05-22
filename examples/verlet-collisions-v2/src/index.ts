/* 'Verlet Only' method by Florian Boesch:
 * https://web.archive.org/web/20191117195626/http://codeflow.org/entries/2010/nov/29/verlet-collision-with-impulse-preservation/
 */
import { appendEl, createEl } from '@geomm/dom'
import { add, distance, mag, scale, sub, Vec, vec } from '@geomm/geometry'
import { randInt, randRange, sqrt } from '@geomm/maths'

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

const SIZE = vec(300, 600)
const GRAVITY = vec(0, 0.01)

const c = createEl('canvas', {
  width: SIZE.x,
  height: SIZE.y,
}) as HTMLCanvasElement
const ctx = c.getContext('2d') as CanvasRenderingContext2D
appendEl(c)

const particles: Particle[] = []

while (particles.length < settings.N_PARTICLES) {
  const mass = randInt(5, 8)
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

const checkCollisions = (p: Particle, idx: number) => {
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
    }
  }
}

const steps = 4
const dt = 1
const step = () => {
  ctx.clearRect(0, 0, SIZE.x, SIZE.y)

  for (let sub = 0; sub < steps; sub++) {
    particles.forEach((p) => applyForce(p, GRAVITY))
    particles.forEach((p) => accelerate(p, dt / steps))
    particles.forEach((p, i) => checkCollisions(p, i))
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
  })

  requestAnimationFrame(step)
}

/* window.addEventListener('click', () => requestAnimationFrame(step)) */
requestAnimationFrame(step)
