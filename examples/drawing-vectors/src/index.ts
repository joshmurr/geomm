import type { Vec2 } from '@geomm/api'
import { appendEl, canvas2d } from '@geomm/dom'
import {
  EPSILON,
  dot,
  normalize,
  scale,
  solveQuadratic2d,
  sub,
  vec2,
} from '@geomm/maths'

const SIZE = vec2(512, 512)
const [canvas, ctx] = canvas2d(SIZE.x, SIZE.y)
appendEl(canvas)
ctx.fillStyle = 'black'
ctx.fillRect(0, 0, SIZE.x, SIZE.y)
ctx.strokeStyle = 'white'

const testPointLine = (
  p1: Vec2,
  p2: Vec2,
  l1: Vec2,
  l2: Vec2,
  l3: Vec2,
  l4: Vec2,
) => {
  // Find 0, 1, or 2 candidates for the collision time t1
  const aQuad =
    (l3.y + l2.y - l1.y - l4.y) * (p2.x + l2.x - p1.x - l4.x) -
    (p2.y + l2.y - p1.y - l4.y) * (l3.x + l2.x - l1.x - l4.x)
  const bQuad =
    (l1.y - l2.y) * (p2.x + l2.x - p1.x - l4.x) +
    (p1.x - l2.x) * (l3.y + l2.y - l1.y - l4.y) -
    (p1.y - l2.y) * (l3.x + l2.x - l1.x - l4.x) -
    (l1.x - l2.x) * (p2.y + l2.y - p1.y - l4.y)
  const cQuad = (l1.y - l2.y) * (p1.x - l2.x) - (p1.y - l2.y) * (l1.x - l2.x)
  const t1Candidates = solveQuadratic2d(aQuad, bQuad, cQuad)
  // Test each candidate for being in [0, 1] and if so test t2 for the same.
  // Keep track of minimal t1 that fits the requirements to return
  let result = null
  for (const t1 of t1Candidates) {
    if (t1 < 0 || t1 > 1) {
      continue
    }
    // Calculate a and b, intermediate points of the line segment. Then calculate
    // t2 to test if it's in [0, 1]
    const intersection = {
      x: p1.x + (p2.x - p1.x) * t1,
      y: p1.y + (p2.y - p1.y) * t1,
    }
    const a = {
      x: l1.x + (l3.x - l1.x) * t1,
      y: l1.y + (l3.y - l1.y) * t1,
    }
    const b = {
      x: l2.x + (l4.x - l2.x) * t1,
      y: l2.y + (l4.y - l2.y) * t1,
    }
    // Make sure we're not dividing by zero
    let t2 = null
    if (Math.abs(b.x - a.x) >= EPSILON) {
      t2 = (intersection.x - a.x) / (b.x - a.x)
    } else if (Math.abs(b.y - a.y) >= EPSILON) {
      t2 = (intersection.y - a.y) / (b.y - a.y)
    } else {
      // a and b are too close together, cannot calculate t2 so assume it's not
      // in [0, 1]
    }
    if (t2 !== null && t2 >= 0 && t2 <= 1) {
      if (result === null || t1 < result.t1) {
        /* Normal of the line segment */
        const normal = {
          x: b.y - a.y,
          y: a.x - b.x,
        }
        const dist = Math.sqrt(normal.x * normal.x + normal.y * normal.y)
        normal.x /= dist
        normal.y /= dist

        // https://math.stackexchange.com/questions/13261/how-to-get-a-reflection-vector
        // 𝑟=𝑑−2(𝑑⋅𝑛)𝑛
        const dir = normalize(sub(p2, p1))
        const d = scale(normal, 2 * dot(normal, dir))
        const reflection = sub(dir, d)

        result = {
          p: intersection,
          t1: t1,
          normal: normal,
          reflection,
        }
      }
    }
  }
  return result
}

const dragRadius = 20
const draggablePoints = [
  { x: SIZE.x / 6, y: SIZE.y / 2 }, // p1
  { x: (SIZE.x * 5) / 6, y: SIZE.y / 2 }, // p2
  { x: (SIZE.x * 3) / 4, y: SIZE.y / 4 }, // l1
  { x: (SIZE.x * 3) / 4, y: (SIZE.y * 3) / 4 }, // l2
  { x: SIZE.x / 4, y: SIZE.y / 4 }, // l3
  { x: SIZE.x / 4, y: (SIZE.y * 3) / 4 }, // l4
]
let draggingIndex = -1
const prevMousePos = vec2(0, 0)
function handleMouseDown(x: number, y: number) {
  const canvasRect = canvas.getBoundingClientRect()
  x *= canvas.width / (canvasRect.right - canvasRect.left)
  y *= canvas.height / (canvasRect.bottom - canvasRect.top)
  draggingIndex = -1
  prevMousePos.x = x
  prevMousePos.y = y
  for (const index in draggablePoints) {
    const p = draggablePoints[index]
    const dist = Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2))
    if (dist < dragRadius) {
      draggingIndex = index
      break
    }
  }
}
canvas.addEventListener('mousedown', function (event) {
  const canvasRect = canvas.getBoundingClientRect()
  handleMouseDown(
    event.clientX - canvasRect.left,
    event.clientY - canvasRect.top,
  )
})

function handleMouseMove(x: number, y: number) {
  const canvasRect = canvas.getBoundingClientRect()
  x *= canvas.width / (canvasRect.right - canvasRect.left)
  y *= canvas.height / (canvasRect.bottom - canvasRect.top)
  const deltaX = x - prevMousePos.x
  const deltaY = y - prevMousePos.y
  prevMousePos.x = x
  prevMousePos.y = y
  if (draggingIndex !== -1) {
    const p = draggablePoints[draggingIndex]
    p.x += deltaX
    p.y += deltaY
    p.x = Math.min(canvas.width, Math.max(0, p.x))
    p.y = Math.min(canvas.height, Math.max(0, p.y))
  }
}
canvas.addEventListener('mousemove', function (event) {
  const canvasRect = canvas.getBoundingClientRect()
  handleMouseMove(
    event.clientX - canvasRect.left,
    event.clientY - canvasRect.top,
  )
})

canvas.addEventListener('mouseup', function (event) {
  draggingIndex = -1
})

const draw = () => {
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, SIZE.x, SIZE.y)
  ctx.fillStyle = 'white'
  ctx.lineWidth = 2

  const p1 = draggablePoints[0]
  const p2 = draggablePoints[1]
  const l1 = draggablePoints[2]
  const l2 = draggablePoints[3]
  const l3 = draggablePoints[4]
  const l4 = draggablePoints[5]

  const { p: intersection, reflection } = testPointLine(p1, p2, l1, l2, l1, l2)

  ctx.beginPath()
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(intersection.x, intersection.y)
  ctx.stroke()

  ctx.beginPath()
  ctx.setLineDash([5, 5])
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.beginPath()
  ctx.moveTo(intersection.x, intersection.y)
  ctx.lineTo(
    intersection.x + reflection.x * 200,
    intersection.y + reflection.y * 200,
  )
  ctx.stroke()

  ctx.strokeStyle = 'green'
  ctx.beginPath()
  ctx.moveTo(l1.x, l1.y)
  ctx.lineTo(l2.x, l2.y)
  ctx.stroke()

  ctx.fillStyle = 'green'
  ctx.beginPath()
  ctx.arc(l1.x, l1.y, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(l2.x, l2.y, 5, 0, Math.PI * 2)
  ctx.fill()

  /* ctx.strokeStyle = 'red' */

  /* ctx.beginPath() */
  /* ctx.moveTo(l3.x, l3.y) */
  /* ctx.lineTo(l4.x, l4.y) */
  /* ctx.stroke() */

  ctx.strokeStyle = 'white'
  ctx.beginPath()
  ctx.arc(prevMousePos.x, prevMousePos.y, dragRadius, 0, Math.PI * 2)
  ctx.stroke()
  requestAnimationFrame(draw)
}

draw()
