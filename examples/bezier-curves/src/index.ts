import { add, canvas } from '@geomm/dom'
import { vec } from '@geomm/geometry'
import type { Vec } from '@geomm/geometry/lib/api'

const drawPoint = (ctx: CanvasRenderingContext2D, v: Vec, color = 'black') => {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(v.x, v.y, 2, 0, 2 * Math.PI)
  ctx.fill()
}

const drawCurve = (
  ctx: CanvasRenderingContext2D,
  v1: Vec,
  v2: Vec,
  v3: Vec,
  v4: Vec,
  color = 'black',
) => {
  ctx.strokeStyle = color
  ctx.beginPath()
  ctx.moveTo(v1.x, v1.y)
  ctx.bezierCurveTo(v2.x, v2.y, v3.x, v3.y, v4.x, v4.y)
  ctx.stroke()
}

const drawCurveWithControlPoints = (
  ctx: CanvasRenderingContext2D,
  start: Vec,
  v2: Vec,
  v3: Vec,
  end: Vec,
  color = 'black',
) => {
  drawCurve(ctx, start, v2, v3, end, color)
  drawPoint(ctx, start, 'blue')
  drawPoint(ctx, v2, 'red')
  drawPoint(ctx, v3, 'red')
  drawPoint(ctx, end, 'blue')
}

const toScreen = (ctx: CanvasRenderingContext2D, v: Vec) => {
  return vec(v.x * ctx.canvas.width, v.y * ctx.canvas.height)
}

const normSin = (t: number) => Math.sin(t) * 0.5 + 0.5
const normCos = (t: number) => Math.cos(t) * 0.5 + 0.5

const c = canvas(512, 512)
add(c)

const ctx = c.getContext('2d') as CanvasRenderingContext2D

const SCALE = 256
const OFFSET = 20
const s = 0.55228474983079

const draw = (time: number) => {
  ctx.fillStyle = 'lightgrey'
  ctx.fillRect(0, 0, 512, 512)

  const t = Math.sin(time / 1000)

  const start = toScreen(ctx, vec(0, normCos(t)))
  const cp1 = toScreen(ctx, vec(normSin(t), normCos(t)))
  const cp2 = toScreen(ctx, vec(normCos(Math.sin(t)), normSin(t)))
  const end = toScreen(ctx, vec(normSin(t), 0))

  drawCurveWithControlPoints(ctx, start, cp1, cp2, end)

  requestAnimationFrame(draw)
}

requestAnimationFrame(draw)
