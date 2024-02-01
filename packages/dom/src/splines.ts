import { Vec2 } from '@geomm/api'
import { CurveFn } from '@geomm/geometry'
import { RenderingOpts } from './api'

export const drawSpline = (
  ctx: CanvasRenderingContext2D,
  curveFn: CurveFn,
  points: Vec2[],
  {
    resolution = 0.1,
    close = false,
    fill = false,
    strokeStyle = '#000',
    fillStyle = '#fff',
    lineWidth = 1,
  }: RenderingOpts = {},
) => {
  ctx.strokeStyle = strokeStyle
  ctx.fillStyle = fillStyle
  ctx.lineWidth = lineWidth
  ctx.beginPath()
  const ps = close
    ? [...points.slice(points.length - 2), ...points, ...points.slice(0, 2)]
    : points

  const start = 0
  const stop = close ? points.length : points.length - 3
  for (let i = start; i < stop; i += resolution) {
    const { x, y } = curveFn(ps, i)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  if (close) ctx.closePath()
  if (fill) ctx.fill()
  ctx.stroke()
}
