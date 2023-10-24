import type { Vec2 } from '@geomm/api'
import { appendEl, canvas2d } from '@geomm/dom'
import { CurveFn, catmullRomSpline } from '@geomm/geometry'
import { vec2 } from '@geomm/maths'

const [c, ctx] = canvas2d(600, 440)
appendEl(c)

const points = [
  vec2(40, 20),
  vec2(100, 300),
  vec2(200, 400),
  vec2(300, 150),
  vec2(350, 99),
  vec2(400, 50),
  vec2(500, 100),
  vec2(550, 300),
]

const drawSpline = (
  ctx: CanvasRenderingContext2D,
  curveFn: CurveFn,
  points: Vec2[],
  resolution = 0.1,
  close = false,
) => {
  ctx.fillStyle = 'lightgrey'
  ctx.fillRect(0, 0, c.width, c.height)
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
  ctx.stroke()
}

drawSpline(ctx, catmullRomSpline, points, 0.1, true)

ctx.fillStyle = 'rgba(0,0,0,0.5)'
points.forEach(({ x, y }) => {
  ctx.beginPath()
  ctx.arc(x, y, 5, 0, Math.PI * 2)
  ctx.fill()
})
