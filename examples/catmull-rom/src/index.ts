import { appendEl, canvas2d } from '@geomm/dom'
import { catmullRomSpline, normalizeCurve } from '@geomm/geometry'
import { vec2 } from '@geomm/maths'

const [c, ctx] = canvas2d(1000, 1000)
appendEl(c)

const alpha = 0.01

const points = [
  vec2(500, 100),
  vec2(550, 300),

  vec2(20, 20),
  vec2(100, 300),
  vec2(200, 400),
  vec2(300, 150),
  vec2(350, 99),
  vec2(400, 50),
  vec2(500, 100),
  vec2(550, 300),

  vec2(20, 20),
  vec2(100, 300),
]

const normalCurve = normalizeCurve(
  catmullRomSpline,
  points,
  points.length - 3,
  alpha,
)

ctx.fillStyle = 'lightgrey'
ctx.fillRect(0, 0, c.width, c.height)
ctx.beginPath()
const start = (1 / points.length) * 1.5
for (let i = start; i < 1 - start; i += 0.001) {
  const { x, y } = normalCurve(i)
  if (i === 0) ctx.moveTo(x, y)
  else ctx.lineTo(x, y)
}
ctx.stroke()

ctx.fillStyle = 'rgba(0,0,0,0.5)'
points.forEach(({ x, y }) => {
  ctx.beginPath()
  ctx.arc(x, y, 5, 0, Math.PI * 2)
  ctx.fill()
})
