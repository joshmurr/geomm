import { appendEl, canvas } from '@geomm/dom'
import { type Vec, vec, toScreen } from '@geomm/geometry'
import { abs, PI, randRange, sin } from '@geomm/maths'
import { makeGui } from './gui'

type Particle = {
  pos: Vec
}

type Setting =
  | {
      val: number
      min: number
      max: number
    }
  | {
      val: boolean
    }

export type Settings = {
  [key: string]: Setting
}

let size = [window.innerWidth, window.innerHeight] as const
let aspect = size[0] / size[1]

const settings: Settings = {
  nParticles: {
    val: 2000,
    min: 1000,
    max: 10000,
  },
  drawHeatmap: { val: false },
  minWalk: { val: 0.002, min: 0.0001, max: 0.01 },
  A: { val: 0.02, min: 0.0001, max: 0.1 },
  a: { val: 2, min: 0.1, max: 10 },
  b: { val: 1.2, min: 0.1, max: 10 },
  m: { val: 8, min: 0.1, max: 10 },
  n: { val: 4, min: 0.1, max: 10 },
  vel: { val: 0.01, min: 0.0001, max: 0.1 },
}

makeGui(settings)

const chladni = (v: Vec, a: number, b: number, m: number, n: number) =>
  /* chladni 2D closed-form solution - returns between -1 and 1 */
  a * sin(PI * n * v.x * aspect) * sin(PI * m * v.y) +
  b * sin(PI * m * v.x * aspect) * sin(PI * n * v.y)

const c = canvas(...size)
appendEl(c)

const particles = Array.from(
  { length: settings.nParticles.max as number },
  () => ({
    pos: vec(randRange(0, 1), randRange(0, 1)),
  }),
)

const bound = (p: Particle) => {
  if (p.pos.x < 0) p.pos.x = 0
  if (p.pos.x > 1) p.pos.x = 1
  if (p.pos.y < 0) p.pos.y = 0
  if (p.pos.y > 1) p.pos.y = 1
}

const move = (p: Particle) => {
  // what is our chladni value i.e. how much are we vibrating? (between -1 and 1, zeroes are nodes)
  const { a, b, m, n, vel, minWalk } = settings
  const eq = chladni(p.pos, a.val, b.val, m.val, n.val)

  // set the amplitude of the move -> proportional to the vibration
  const stochasticAmplitude = Math.max(vel.val * abs(eq), minWalk.val)

  // perform one random walk
  p.pos.x += randRange(-stochasticAmplitude * 0.5, stochasticAmplitude * 0.5)
  p.pos.y += randRange(-stochasticAmplitude * 0.5, stochasticAmplitude * 0.5)

  bound(p)
}

const drawParticle = (p: Particle, ctx: CanvasRenderingContext2D) => {
  const { x, y } = toScreen(p.pos, vec(c.width, c.height))
  ctx.fillRect(x, y, 2, 2)
}

const drawHeatmap = (ctx: CanvasRenderingContext2D) => {
  // draw the function heatmap in the background (not working)
  const res = 10
  const dim = {
    width: res * aspect,
    height: res,
  }
  const [width, height] = size
  const { a, b, m, n } = settings
  for (let i = 0; i <= width; i += res) {
    for (let j = 0; j <= height; j += res) {
      const eq = chladni(vec(i / width, j / height), a.val, b.val, m.val, n.val)
      const col = (eq + 1) * 127.5
      ctx.fillStyle = `rgb(${col}, ${col}, ${col})`
      ctx.fillRect(i, j, dim.width, dim.height)
    }
  }
}

const draw = (particles: Particle[], ctx: CanvasRenderingContext2D) => {
  const slice = particles.slice(0, settings.nParticles.val)
  slice.forEach((p) => move(p))
  if (settings.drawHeatmap.val) drawHeatmap(ctx)
  else {
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.fillStyle = 'white'
    slice.forEach((p) => drawParticle(p, ctx))
  }

  requestAnimationFrame(() => draw(slice, ctx))
}

draw(particles, c.getContext('2d') as CanvasRenderingContext2D)

window.addEventListener('click', () =>
  draw(particles, c.getContext('2d') as CanvasRenderingContext2D),
)

window.addEventListener('resize', () => {
  size = [window.innerWidth, window.innerHeight] as const
  aspect = size[0] / size[1]
  c.width = window.innerWidth
  c.height = window.innerHeight
})
