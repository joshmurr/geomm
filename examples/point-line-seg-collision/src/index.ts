import type { Vec2 } from '@geomm/api'
import { appendEl, canvas2d } from '@geomm/dom'
import { abs, add, cross, mag, sub, vec2 } from '@geomm/maths'

const SIZE = vec2(512, 512)
const [c, ctx] = canvas2d(SIZE.x, SIZE.y)
appendEl(c)

const MOUSE = vec2(0, 0)
const RADIUS = 20
const OFFSET = 200
const LINE = [vec2(OFFSET, OFFSET), vec2(SIZE.x - OFFSET, SIZE.y - OFFSET)]
let P_COLOR = 'rgba(0, 0, 0, 0.5)'

const areaOfTriangle = (a: Vec2, b: Vec2, c: Vec2) => {
  const ab = sub(b, a)
  const ac = sub(c, a)
  return cross(ab, ac) / 2
}

const collideWithLine = (pos: Vec2, radius: number, line: Vec2[]) => {
  for (let i = 0; i < line.length - 1; i += 1) {
    const a = line[i]
    const b = line[i + 1]
    const baseDir = sub(b, a)
    const lenBase = mag(baseDir)
    const da = sub(pos, a)
    const db = sub(pos, b)

    const dist = abs((2 * areaOfTriangle(a, b, pos)) / lenBase)
    const d = mag(add(da, db)) - RADIUS * 2

    if (dist < radius && d < lenBase) {
      console.log('collide')
      P_COLOR = 'rgba(255, 0, 0, 0.5)'
    }
  }
}

const draw = () => {
  ctx.fillStyle = 'lightgrey'
  ctx.fillRect(0, 0, c.width, c.height)

  collideWithLine(MOUSE, RADIUS, LINE)

  ctx.fillStyle = P_COLOR
  ctx.beginPath()
  ctx.arc(MOUSE.x, MOUSE.y, RADIUS, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = 'black'
  ctx.beginPath()
  ctx.moveTo(LINE[0].x, LINE[0].y)
  ctx.lineTo(LINE[1].x, LINE[1].y)
  ctx.stroke()

  P_COLOR = 'rgba(0, 0, 0, 0.5)'

  requestAnimationFrame(draw)
}

c.addEventListener('mousemove', (e) => {
  MOUSE.x = e.clientX
  MOUSE.y = e.clientY
})

draw()
