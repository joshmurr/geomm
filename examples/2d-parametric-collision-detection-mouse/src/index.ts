import type { Vec2 } from '@geomm/api'
import { appendEl, canvas2d } from '@geomm/dom'
import { add, randRange, scale, vec2 } from '@geomm/maths'
import { CollisionResult, testPointLine } from '@geomm/physics'

const SIZE = vec2(512, 512)
const [canvas, ctx] = canvas2d(SIZE.x, SIZE.y)
appendEl(canvas)

const mousePos = vec2(-1, -1)
const prevMousePos = vec2(-1, -1)

const l1 = vec2(100, 100)
const l2 = vec2(100, 400)

type Vert = {
  pos: Vec2
  vel: Vec2
}

type Line = {
  p1: Vert
  p2: Vert
  prevP1: Vert
  prevP2: Vert
}

const line = {
  p1: { pos: l1, vel: vec2(randRange(-500, 500), randRange(-500, 500)) },
  p2: { pos: l2, vel: vec2(randRange(-100, 100), randRange(-100, 100)) },
  prevP1: { pos: l1, vel: vec2(10, 10) },
  prevP2: { pos: l2, vel: vec2(10, 10) },
}

function handleMouseMove(x: number, y: number) {
  const canvasRect = canvas.getBoundingClientRect()
  x *= canvas.width / (canvasRect.right - canvasRect.left)
  y *= canvas.height / (canvasRect.bottom - canvasRect.top)
  const deltaX = x - prevMousePos.x
  const deltaY = y - prevMousePos.y
  prevMousePos.x = x
  prevMousePos.y = y

  mousePos.x += deltaX
  mousePos.y += deltaY
  mousePos.x = Math.min(canvas.width, Math.max(0, mousePos.x))
  mousePos.y = Math.min(canvas.height, Math.max(0, mousePos.y))
}
canvas.addEventListener('mousemove', function(event) {
  const canvasRect = canvas.getBoundingClientRect()
  handleMouseMove(
    event.clientX - canvasRect.left,
    event.clientY - canvasRect.top,
  )
})

const constrainPoint = ({ pos, vel }: Vert) => {
  if (pos.x < 0) {
    pos.x = 0
    vel.x *= -1
  } else if (pos.x > canvas.width) {
    pos.x = canvas.width
    vel.x *= -1
  }
  if (pos.y < 0) {
    pos.y = 0
    vel.y *= -1
  } else if (pos.y > canvas.height) {
    pos.y = canvas.height
    vel.y *= -1
  }
}

const collisions = [] as CollisionResult[]

const updateLine = (line: Line, t: number) => {
  const { p1, p2 } = line

  line.prevP1.pos = p1.pos
  line.prevP2.pos = p2.pos

  line.p1.pos = add(p1.pos, scale(p1.vel, t))
  line.p2.pos = add(p2.pos, scale(p2.vel, t))

  constrainPoint(p1)
  constrainPoint(p2)
}

/**
 * Draw points, lines, and animate the intermedate steps.
 */
let tAnim = 0
let lastTime = new Date().getTime()
const pointDrawRadius = 5
function updateAndDraw() {
  const nowTime = new Date().getTime()
  const deltaTime = (nowTime - lastTime) / 1000
  lastTime = nowTime

  tAnim += (deltaTime * 2) / 3
  if (tAnim > 1) {
    tAnim = 0
  }

  const p1 = prevMousePos
  const p2 = mousePos
  const collisionResult = testPointLine(
    p1,
    p2,
    line.p1.pos,
    line.p2.pos,
    line.prevP1.pos,
    line.prevP2.pos,
  )

  if (collisionResult) collisions.push(collisionResult)

  // Background
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw p1, p2, l1->l2, l3->l4
  ctx.fillStyle = 'white'
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 2
  ctx.font = '20px monospace'
  ctx.textAlign = 'center'

  ctx.beginPath()
  ctx.arc(p2.x, p2.y, pointDrawRadius, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(line.p1.pos.x, line.p1.pos.y)
  ctx.lineTo(line.p2.pos.x, line.p2.pos.y)
  ctx.stroke()

  // Draw intersection, if any
  if (collisionResult !== null) {
    ctx.fillStyle = 'rgb(255, 0, 0)'
    ctx.beginPath()
    ctx.arc(
      collisionResult.pos.x,
      collisionResult.pos.y,
      pointDrawRadius * 1.5,
      0,
      Math.PI * 2,
    )
    ctx.fill()

    ctx.fillStyle = 'white'
    ctx.textAlign = 'left'
    ctx.fillText(
      't1 = ' + collisionResult.t1.toFixed(3),
      canvas.width / 30,
      canvas.height / 15,
    )
  }

  collisions.forEach(({ pos, normal }) => {
    ctx.fillStyle = 'rgb(255, 0, 0)'
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, 1, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = 'green'
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    ctx.lineTo(pos.x + normal.x * 10, pos.y + normal.y * 10)
    ctx.stroke()
  })

  updateLine(line, deltaTime)

  requestAnimationFrame(updateAndDraw)
}
updateAndDraw()
canvas.addEventListener('click', () => requestAnimationFrame(updateAndDraw))
