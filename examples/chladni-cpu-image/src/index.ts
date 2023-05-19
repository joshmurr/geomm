import { appendEl, canvas } from '@geomm/dom'
import { type Vec, vec, toScreen } from '@geomm/geometry'
import { abs, PI, randInt, randRange, sin } from '@geomm/maths'
import seed from './09.png'
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
    const rescaled = avg
    grayscale.push(rescaled)
  }
  return grayscale
}

const ctxToGrayscaleArray = (ctx: CanvasRenderingContext2D) => {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
  const data = imageData.data
  const grayscale = []
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const avg = (r + g + b) / 3 / 255
    const rescaled = avg
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

const size = vec(512, 512)

const settings: Settings = {
  nParticles: {
    val: 5000,
    min: 1000,
    max: 10000,
  },
  drawHeatmap: { val: false, min: false, max: true },
  minWalk: { val: 2, min: 1, max: 10 },
  A: { val: 0.02, min: 0.0001, max: 0.1 },
  a: { val: 2, min: 0.1, max: 10 },
  b: { val: 1.2, min: 0.1, max: 10 },
  m: { val: 8, min: 0.1, max: 10 },
  n: { val: 4, min: 0.1, max: 10 },
  vel: { val: 7, min: 1, max: 100 },
}

const bound = (p: Particle) => {
  if (p.pos.x < 0) p.pos.x = randInt(0, size.x)
  if (p.pos.x > size.x) p.pos.x = randInt(0, size.x)
  if (p.pos.y < 0) p.pos.y = randInt(0, size.y)
  if (p.pos.y > size.y) p.pos.y = randInt(0, size.y)
}

const chladni = (v: Vec, a: number, b: number, m: number, n: number) =>
  /* chladni 2D closed-form solution - returns between -1 and 1 */
  a * sin(PI * n * v.x) * sin(PI * m * v.y) +
  b * sin(PI * m * v.x) * sin(PI * n * v.y)

const move = (
  p: Particle,
  seed: number[] | null,
  displace: CanvasRenderingContext2D | null,
) => {
  const { a, b, m, n, vel, minWalk } = settings

  const pos = toScreen(p.pos, size)
  const eq = seed
    ? (1 - seed[Math.floor(pos.x) + Math.floor(pos.y) * size.x]) * 1.8
    : 1
  const di = displace ? getPixelFromCtx(displace, pos) : 1

  const ch = chladni(p.pos, a.val, b.val, m.val, n.val) * 0.45

  p.stochasticAmplitude = (vel.val * 0.001 + di * 0.0001) * abs(eq + ch)
  if (p.stochasticAmplitude <= minWalk.val / 1000)
    p.stochasticAmplitude = minWalk.val / 1000

  p.pos.x += randRange(-p.stochasticAmplitude, p.stochasticAmplitude)
  p.pos.y += randRange(-p.stochasticAmplitude, p.stochasticAmplitude)

  bound(p)
}

const drawRadialGradient = (
  ctx: CanvasRenderingContext2D,
  center: Vec,
  radius: number,
  color: string,
) => {
  const gradient = ctx.createRadialGradient(
    center.x,
    center.y,
    0,
    center.x,
    center.y,
    radius,
  )
  gradient.addColorStop(0, color)
  gradient.addColorStop(1, 'transparent')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

let MOUSE = vec(0, 0)

const clearCtx = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = 'rgba(0,0,0,0.8)'
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

const getPixelFromCtx = (ctx: CanvasRenderingContext2D, pos: Vec) => {
  const imageData = ctx.getImageData(pos.x || 0, pos.y || 0, 1, 1)
  const data = imageData.data
  return data[0] + data[1] + data[2] / 255 / 3
}

const drawParticle = (p: Particle, ctx: CanvasRenderingContext2D) => {
  const { x, y } = toScreen(p.pos, size)
  const { stochasticAmplitude: sa } = p
  ctx.fillStyle = `hsl(${sa * 720 * 2}, 100%, 50%)`
  ctx.fillRect(x, y, 2, 2)
}

makeGui(settings)

const init = (seed: number[]) => {
  const c = canvas(size.x, size.y)
  appendEl(c)

  const testCanvas = canvas(size.x, size.y)
  appendEl(testCanvas)

  const displaceCtx = testCanvas.getContext('2d') as CanvasRenderingContext2D
  displaceCtx.fillStyle = 'black'
  displaceCtx.fillRect(0, 0, testCanvas.width, testCanvas.height)

  window.addEventListener(
    'mousemove',
    (e) => (MOUSE = vec(e.offsetX, e.offsetY)),
  )

  const particles = Array.from(
    { length: settings.nParticles.max as number },
    () => ({
      pos: vec(randRange(0, 1), randRange(0, 1)),
      stochasticAmplitude: 0,
    }),
  )

  const draw = (particles: Particle[], ctx: CanvasRenderingContext2D) => {
    clearCtx(displaceCtx)
    drawRadialGradient(displaceCtx, MOUSE, 100, 'white')
    /**/
    clearCtx(ctx)
    const slice = particles.slice(0, settings.nParticles.val as number)
    slice.forEach((p) => move(p, seed, displaceCtx))
    slice.forEach((p) => drawParticle(p, ctx))

    requestAnimationFrame(() => draw(particles, ctx))
  }

  draw(particles, c.getContext('2d') as CanvasRenderingContext2D)
}
