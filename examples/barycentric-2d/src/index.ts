import type { Vec2 } from '@geomm/api'
import { appendEl, canvas2d } from '@geomm/dom'
import { barycentric } from '@geomm/geometry'
import { vec2 } from '@geomm/maths'

const SIZE = vec2(512, 512)
const [canvas, ctx] = canvas2d(SIZE.x, SIZE.y)
appendEl(canvas)

const triangle = [vec2(100, 100), vec2(300, 100), vec2(200, 300)]
const p = vec2(180, 180)

const inTriangle = (p: Vec2) => {
  const { x: u, y: v } = p
  return u >= 0 && v >= 0 && u + v < 1
}

const draw = () => {
  const uv = barycentric(triangle[0], triangle[1], triangle[2], p)

  ctx.clearRect(0, 0, SIZE.x, SIZE.y)

  ctx.beginPath()
  ctx.moveTo(triangle[0].x, triangle[0].y)
  ctx.lineTo(triangle[1].x, triangle[1].y)
  ctx.lineTo(triangle[2].x, triangle[2].y)
  ctx.closePath()
  ctx.stroke()

  ctx.fillStyle = inTriangle(uv) ? 'green' : 'red'

  ctx.beginPath()
  ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI)
  ctx.fill()
}

canvas.addEventListener('mousemove', (e) => {
  p.x = e.offsetX
  p.y = e.offsetY

  requestAnimationFrame(draw)
})

requestAnimationFrame(draw)
