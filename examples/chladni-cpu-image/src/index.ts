import { appendEl, canvas } from '@geomm/dom'
import { type Vec, vec, toScreen } from '@geomm/geometry'
import { abs, PI, randRange, sin } from '@geomm/maths'
import seed from './11.png'
import { makeGui } from './gui'

type Particle = {
  pos: Vec
  stochasticAmplitude: number
}

type Setting = {
  val: number | Vec | boolean | readonly [number, number]
  min?: number | Vec | boolean
  max?: number | Vec | boolean
}

const seedImage = appendEl('img') as HTMLImageElement
seedImage.src = seed

const imageToGrayscaleArray = (img: HTMLImageElement) => {
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  ctx.drawImage(img, 0, 0)
  const imageData = ctx.getImageData(0, 0, img.width, img.height)
  const data = imageData.data
  const grayscale = []
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const avg = (r + g + b) / 3 / 255
    const rescaled = avg // === 0 ? 0 : avg * 2 - 1
    grayscale.push(rescaled)
  }
  return grayscale
}

seedImage.onload = () => {
  const grayscale = imageToGrayscaleArray(seedImage)
  init(grayscale)
}

export type Settings = {
  [key: string]: Setting
}

let size = [512, 512] as const
let aspect = size[0] / size[1]

const settings: Settings = {
  nParticles: {
    val: 2000,
    min: 1000,
    max: 10000,
  },
  drawHeatmap: { val: false, min: false, max: true },
  minWalk: { val: 0.0002, min: 0.0001, max: 0.01 },
  A: { val: 0.02, min: 0.0001, max: 0.1 },
  a: { val: 2, min: 0.1, max: 10 },
  b: { val: 1.2, min: 0.1, max: 10 },
  m: { val: 8, min: 0.1, max: 10 },
  n: { val: 4, min: 0.1, max: 10 },
  vel: { val: 0.03, min: 0.0001, max: 0.1 },
}

const bound = (p: Particle) => {
  if (p.pos.x < 0) p.pos.x = 0
  if (p.pos.x > 1) p.pos.x = 1
  if (p.pos.y < 0) p.pos.y = 0
  if (p.pos.y > 1) p.pos.y = 1
}

const chladni = (v: Vec, a: number, b: number, m: number, n: number) =>
  /* chladni 2D closed-form solution - returns between -1 and 1 */
  a * sin(PI * n * v.x * aspect) * sin(PI * m * v.y) +
  b * sin(PI * m * v.x * aspect) * sin(PI * n * v.y)

const move = (p: Particle, seed: number[]) => {
  // what is our chladni value i.e. how much are we vibrating? (between -1 and 1, zeroes are nodes)
  const { a, b, m, n, vel, minWalk } = settings
  /* const eq = chladni(p.pos, a.val, b.val, m.val, n.val) */

  const pos = toScreen(p.pos, vec(...size))
  const idx = Math.floor(pos.x) + Math.floor(pos.y) * size[0]
  const eq = seed[idx]

  // set the amplitude of the move -> proportional to the vibration
  p.stochasticAmplitude = vel.val * abs(eq)

  if (p.stochasticAmplitude <= minWalk.val) p.stochasticAmplitude = minWalk.val

  // perform one random walk
  p.pos.x += randRange(
    -p.stochasticAmplitude * 0.5,
    p.stochasticAmplitude * 0.5,
  )
  p.pos.y += randRange(
    -p.stochasticAmplitude * 0.5,
    p.stochasticAmplitude * 0.5,
  )

  bound(p)
}

const init = (seed: number[]) => {
  const c = canvas(...size)
  appendEl(c)

  const gui = makeGui(settings)

  console.log(seed)

  window.addEventListener('resize', () => {
    size = [window.innerWidth, window.innerHeight] as const
    aspect = size[0] / size[1]
    c.width = window.innerWidth
    c.height = window.innerHeight
  })

  const drawParticle = (p: Particle, ctx: CanvasRenderingContext2D) => {
    const { x, y } = toScreen(p.pos, vec(c.width, c.height))
    const { stochasticAmplitude: sa } = p
    ctx.fillStyle = `hsl(${sa * 720 * 2}, 100%, 50%)`
    ctx.fillRect(x, y, 2, 2)
  }

  const particles = Array.from(
    { length: settings.nParticles.max as number },
    () => ({
      pos: vec(randRange(0, 1), randRange(0, 1)),
      stochasticAmplitude: 0,
    }),
  )

  const draw = (particles: Particle[], ctx: CanvasRenderingContext2D) => {
    const slice = particles.slice(0, settings.nParticles.val)
    slice.forEach((p) => move(p, seed))
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, c.width, c.height)
    slice.forEach((p) => drawParticle(p, ctx))

    requestAnimationFrame(() => draw(slice, ctx))
  }

  draw(particles, c.getContext('2d') as CanvasRenderingContext2D)
}
