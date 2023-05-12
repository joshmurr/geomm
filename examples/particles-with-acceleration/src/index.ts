import { appendEl, createEl } from '@geomm/dom'
import {
  add,
  distance,
  limit,
  normalize,
  scale,
  sub,
  toScreen,
  type Vec,
  vec,
} from '@geomm/geometry'
import { randRange } from '@geomm/maths'

type Particle = {
  pos: Vec
  prevPos: Vec
  vel: Vec
  mass: number
}

const settings = {
  N_PARTICLES: 100,
  N_ATTRACTORS: 2,
}

const SIZE = vec(768, 512)

const c = createEl('canvas', {
  width: SIZE.x,
  height: SIZE.y,
}) as HTMLCanvasElement
appendEl(c)

const particles = Array.from({ length: settings.N_PARTICLES }).map(() => {
  const initialPos = vec(randRange(0, 1), randRange(0, 1))
  return {
    pos: initialPos,
    prevPos: initialPos,
    vel: vec(0, 0),
    mass: randRange(0.1, 0.5),
  }
})

const attractors = Array.from({ length: settings.N_ATTRACTORS }).map(() => {
  const initialPos = vec(randRange(0, 1), randRange(0, 1))
  return {
    pos: initialPos,
  }
})

const drawParticle = (
  v: Vec,
  ctx: CanvasRenderingContext2D,
  color = 'white',
) => {
  const { x, y } = toScreen(v, SIZE)
  ctx.fillStyle = color
  ctx.fillRect(x, y, 2, 2)
}

const verlet = (pos: Vec, prevPos: Vec, acc: Vec, dt: number) => {
  const displacement = sub(pos, prevPos)
  const acceleration = scale(acc, dt * dt)
  const newPos = add(pos, add(displacement, acceleration))

  return newPos
}

const applyForce = (p: Particle, force: Vec, dt: number) => {
  const { pos, prevPos } = p
  const acc = scale(force, p.mass)
  const newPos = verlet(pos, prevPos, acc, dt)

  p.pos = newPos
  p.prevPos = pos
}

const addAttractor = (e: MouseEvent) => {
  const { clientX, clientY } = e
  const x = clientX / SIZE.x
  const y = clientY / SIZE.y
  attractors.push({ pos: vec(x, y) })
}

const bound = (p: Particle) => {
  const { pos, prevPos } = p
  const { x, y } = pos
  const { x: prevX, y: prevY } = prevPos

  if (x < 0 || x > 1) {
    p.pos = vec(prevX, y)
    p.prevPos = vec(prevX, prevY)
  }

  if (y < 0 || y > 1) {
    p.pos = vec(x, prevY)
    p.prevPos = vec(prevX, prevY)
  }
}

let prevTime = Date.now()
const draw = (particles: Particle[], ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fillRect(0, 0, SIZE.x, SIZE.y)
  ctx.fillStyle = 'white'
  const now = Date.now()
  const dt = (prevTime - now) / 1000

  attractors.forEach((a) => {
    particles.forEach((p) => {
      const dist = distance(a.pos, p.pos)
      const dir = normalize(sub(a.pos, p.pos))
      const force = limit(scale(dir, dist * dist), 0.11)

      applyForce(p, force, dt)
      bound(p)
      drawParticle(p.pos, ctx)
    })
    drawParticle(a.pos, ctx, 'red')
  })

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

c.addEventListener('click', addAttractor)
