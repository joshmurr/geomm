import { Vec2 } from '@geomm/api'
import { appendEl, canvas2d, createEl, drawSpline } from '@geomm/dom'
import { catmullRomSpline } from '@geomm/geometry'
import { distance } from '@geomm/maths'

const radius = 11

type CurveNode = Vec2 & {
  selected: boolean
  selectable: boolean
}

const [c, ctx] = canvas2d(512, 512)
appendEl(c)

const clearBtn = createEl('button', {
  innerText: 'Clear',
  onclick: () => (points.length = 0),
})
const closeCurveBtn = createEl('button', {
  innerText: 'Close',
  onclick: () => (closeCurve = !closeCurve),
})

appendEl(clearBtn)
appendEl(closeCurveBtn)
const output = createEl('pre', {
  id: 'output',
  innerText: '',
}) as HTMLPreElement
appendEl(output)

const mousePos: Vec2 = { x: 0, y: 0 }
const points: CurveNode[] = []
let closeCurve = false
let SHIFT_DOWN = false

const clearScreen = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = '#ddd'
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

const drawPoint = (ctx: CanvasRenderingContext2D) => (p: CurveNode) => {
  ctx.beginPath()
  ctx.arc(p.x, p.y, 5, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.fill()

  ctx.lineWidth = 3
  if (p.selectable) {
    ctx.beginPath()
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)'
    ctx.stroke()
  }

  if (p.selected) {
    ctx.beginPath()
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'
    ctx.stroke()
  }
}

const labelPoint =
  (ctx: CanvasRenderingContext2D) => (p: CurveNode, i: number) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillText(`(${i})`, p.x + 10, p.y + 10)
  }

const selectPoint = (p: CurveNode) => {
  if (p.selectable) {
    p.selected = true
  }
}

const deletePoint = (p: CurveNode) => {
  if (!SHIFT_DOWN) return
  if (p.selectable && p.selected) {
    const idx = points.findIndex((p) => p.selectable)
    points.splice(idx, 1)
  }
}

const movePoint = (p: CurveNode) => {
  if (p.selected) {
    p.x = mousePos.x
    p.y = mousePos.y
  }
}

const measureDistanceToMouse = (p: CurveNode) => {
  const d = distance(p, mousePos)
  p.selectable = d < radius
}

const draw = (ctx: CanvasRenderingContext2D) => {
  clearScreen(ctx)

  points.forEach(measureDistanceToMouse)
  points.forEach(deletePoint)
  points.forEach(drawPoint(ctx))
  points.forEach(labelPoint(ctx))
  drawSpline(ctx, catmullRomSpline, points, {
    close: closeCurve,
  })

  updateOutput(output, points)

  requestAnimationFrame(() => draw(ctx))
}

c.addEventListener('mousedown', () => {
  points.forEach(selectPoint)
})
c.addEventListener('mouseup', (e) => {
  const { clientX: x, clientY: y } = e
  const selectedIdx = points.findIndex((p) => p.selected)
  if (!SHIFT_DOWN && selectedIdx < 0) {
    points.push({ x, y, selected: false, selectable: false })
  } else if (selectedIdx >= 0) {
    points[selectedIdx].selected = false
  }
})
c.addEventListener('mousemove', (e) => {
  const { clientX: x, clientY: y } = e
  mousePos.x = x
  mousePos.y = y
  points.forEach(movePoint)
})

const updateOutput = (out: HTMLPreElement, points: CurveNode[]) => {
  out.innerText = JSON.stringify(points, null, 2)
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Shift') {
    SHIFT_DOWN = true
  }
})
document.addEventListener('keyup', (e) => {
  if (e.key === 'Shift') {
    SHIFT_DOWN = false
  }
})

draw(ctx)
