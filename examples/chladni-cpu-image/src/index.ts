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

const ctxToGrayscaleArray = (ctx: CanvasRenderingContext2D) => {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
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

const size = vec(512, 512)

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
  vel: { val: 0.003, min: 0.0001, max: 0.1 },
}

const bound = (p: Particle) => {
  if (p.pos.x < 0) p.pos.x = 0
  if (p.pos.x > 1) p.pos.x = 1
  if (p.pos.y < 0) p.pos.y = 0
  if (p.pos.y > 1) p.pos.y = 1
}
const move = (p: Particle, seed: number[] | CanvasRenderingContext2D) => {
  const { vel, minWalk } = settings

  const pos = toScreen(p.pos, size)
  const eq = Array.isArray(seed)
    ? seed[Math.floor(pos.x) + Math.floor(pos.y) * size.x]
    : getPixelFromCtx(seed, pos)

  p.stochasticAmplitude = vel.val * abs(eq)
  if (p.stochasticAmplitude <= minWalk.val) p.stochasticAmplitude = minWalk.val

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
  const imageData = ctx.getImageData(pos.x, pos.y, 1, 1)
  const data = imageData.data
  return data[0] + data[1] + data[2] / 255 / 3
}

const drawParticle = (p: Particle, ctx: CanvasRenderingContext2D) => {
  const { x, y } = toScreen(p.pos, size)
  const { stochasticAmplitude: sa } = p
  ctx.fillStyle = `hsl(${sa * 720 * 2}, 100%, 50%)`
  ctx.fillRect(x, y, 2, 2)
}

const init = (seed: number[]) => {
  const c = canvas(size.x, size.y)
  appendEl(c)

  const testCanvas = canvas(size.x, size.y)
  appendEl(testCanvas)

  const testCtx = testCanvas.getContext('2d') as CanvasRenderingContext2D
  testCtx.fillStyle = 'black'
  testCtx.fillRect(0, 0, testCanvas.width, testCanvas.height)

  window.addEventListener(
    'mousemove',
    (e) => (MOUSE = vec(e.offsetX, e.offsetY)),
  )

  /* const gui = makeGui(settings) */

  const particles = Array.from(
    { length: settings.nParticles.max as number },
    () => ({
      pos: vec(randRange(0, 1), randRange(0, 1)),
      stochasticAmplitude: 0,
    }),
  )

  const draw = (particles: Particle[], ctx: CanvasRenderingContext2D) => {
    /* clearCtx(testCtx) */
    /* drawRadialGradient(testCtx, MOUSE, 100, 'white') */
    /**/
    clearCtx(ctx)
    const slice = particles.slice(0, settings.nParticles.val)
    slice.forEach((p) => move(p, seed))
    slice.forEach((p) => drawParticle(p, ctx))

    requestAnimationFrame(() => draw(particles, ctx))
  }

  draw(particles, c.getContext('2d') as CanvasRenderingContext2D)

  window.addEventListener('click', (e) =>
    draw(particles, c.getContext('2d') as CanvasRenderingContext2D),
  )
}
