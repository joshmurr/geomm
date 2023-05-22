import { AABB, aabb, insert, Quadtree, quadtree, query } from '@geomm/algorithm'
import { appendEl, createEl } from '@geomm/dom'
import { Vec, vec } from '@geomm/geometry'
import { randInt } from '@geomm/maths'

const SIZE = vec(1024, 512)
const c = createEl('canvas', {
  width: SIZE.x,
  height: SIZE.y,
}) as HTMLCanvasElement

appendEl(c)

const ctx = c.getContext('2d') as CanvasRenderingContext2D

const nP = 1800
const data = Array.from({ length: nP }, () =>
  vec(randInt(0, SIZE.x), randInt(0, SIZE.y)),
)
const bounds = aabb(vec(SIZE.x / 2, SIZE.y / 2), SIZE.x / 2)

const tree = quadtree(bounds)
data.forEach((p) => insert(tree, p))

let queryRange: AABB | null = null

const drawPoint = (
  ctx: CanvasRenderingContext2D,
  { x, y }: Vec,
  color = 'red',
) => {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, 2, 0, 2 * Math.PI)
  ctx.fill()
}

const drawRect = (
  ctx: CanvasRenderingContext2D,
  { center, half }: AABB,
  color = 'black',
) => {
  const { x, y } = center
  ctx.strokeStyle = color
  ctx.beginPath()
  ctx.rect(x - half, y - half, half * 2, half * 2)
  ctx.stroke()
}

const drawQuadtree = (
  ctx: CanvasRenderingContext2D,
  { bounds, nodes }: Quadtree,
) => {
  const { center, half } = bounds
  const { x, y } = center
  ctx.strokeStyle = 'black'
  ctx.beginPath()
  ctx.moveTo(x - half, y + half)
  ctx.lineTo(x - half, y - half)
  ctx.lineTo(x + half, y - half)
  ctx.stroke()
  if (!nodes) return
  if (!Array.isArray(nodes)) {
    drawPoint(ctx, nodes, nodes.selected ? 'green' : 'red')
    return
  }
  nodes.forEach((node) => {
    drawQuadtree(ctx, node)
  })
}

const step = () => {
  ctx.clearRect(0, 0, SIZE.x, SIZE.y)
  drawQuadtree(ctx, tree)
  if (queryRange) drawRect(ctx, queryRange, 'green')
  requestAnimationFrame(step)
}

step()

window.addEventListener('mousemove', (e) => {
  queryRange = aabb(vec(e.clientX, e.clientY), 20)
  const result = query(tree, queryRange)
  result.forEach((p) => (p.selected = true))
})
