import { vec } from '@geomm/geometry'
import type { Vec } from '@geomm/geometry/lib/api'

export const drawPoint = (
  ctx: CanvasRenderingContext2D,
  v: Vec,
  color = 'black',
) => {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(v.x, v.y, 2, 0, 2 * Math.PI)
  ctx.fill()
}

export const drawLine = (
  ctx: CanvasRenderingContext2D,
  v1: Vec,
  v2: Vec,
  color = 'black',
) => {
  ctx.strokeStyle = color
  ctx.beginPath()
  ctx.moveTo(v1.x, v1.y)
  ctx.lineTo(v2.x, v2.y)
  ctx.stroke()
}

export const drawCurve = (
  ctx: CanvasRenderingContext2D,
  start: Vec,
  v2: Vec,
  v3: Vec,
  end: Vec,
  color = 'black',
) => {
  ctx.strokeStyle = color
  ctx.beginPath()
  ctx.moveTo(start.x, start.y)
  ctx.bezierCurveTo(v2.x, v2.y, v3.x, v3.y, end.x, end.y)
  ctx.stroke()
}

export const drawCurveWithControlPoints = (
  ctx: CanvasRenderingContext2D,
  start: Vec,
  v2: Vec,
  v3: Vec,
  end: Vec,
  color = 'black',
) => {
  drawLine(ctx, start, v2, 'grey')
  drawLine(ctx, v3, end, 'grey')

  drawCurve(ctx, start, v2, v3, end, color)
  drawPoint(ctx, start, 'blue')
  drawPoint(ctx, v2, 'red')
  drawPoint(ctx, v3, 'red')
  drawPoint(ctx, end, 'blue')
}

export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  v: Vec,
  r: number,
  color = 'black',
) => {
  ctx.strokeStyle = color
  ctx.beginPath()
  ctx.arc(v.x, v.y, r, 0, 2 * Math.PI)
  ctx.stroke()
}

export const toScreen = (ctx: CanvasRenderingContext2D, v: Vec) => {
  return vec(v.x * ctx.canvas.width, v.y * ctx.canvas.height)
}
