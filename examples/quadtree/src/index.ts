import {
  aabb,
  count,
  insert,
  Quadtree,
  quadtree,
  query,
} from '@geomm/algorithm'
import type { AABB, Vec2 } from '@geomm/api'
import { appendEl, createEl, drawLabel, drawPoint } from '@geomm/dom'
import { contains } from '@geomm/geometry'
import { add, randInt, vec2 } from '@geomm/maths'

const SIZE = vec2(512, 512)
const c = createEl('canvas', {
  width: SIZE.x,
  height: SIZE.y,
}) as HTMLCanvasElement

appendEl(c)

let shiftDown = false

const ctx = c.getContext('2d') as CanvasRenderingContext2D

const nP = 1000
const data = Array.from({ length: nP }, (_, i) =>
  vec2(randInt(0, SIZE.x), randInt(0, SIZE.y)),
)

const bounds = aabb(vec2(SIZE.x / 2, SIZE.y / 2), SIZE.x / 2, SIZE.y / 2)

const tree = quadtree(bounds)
data.forEach((p) => insert(tree, p))

let queryRange: AABB | null = null

const drawRect = (
  ctx: CanvasRenderingContext2D,
  { center, halfWidth, halfHeight }: AABB,
  color = 'black',
) => {
  const { x, y } = center
  ctx.strokeStyle = color
  ctx.beginPath()
  ctx.moveTo(x - halfWidth, y + halfHeight)
  ctx.lineTo(x - halfWidth, y - halfHeight)
  ctx.lineTo(x + halfWidth, y - halfHeight)
  ctx.lineTo(x + halfWidth, y + halfHeight)
  ctx.lineTo(x - halfWidth, y + halfHeight)
  ctx.stroke()
}

const drawQuadtree = (
  ctx: CanvasRenderingContext2D,
  { bounds, nodes }: Quadtree,
  d = 0,
) => {
  const colors = ['black', 'red', 'green', 'blue', 'yellow']
  const { center, halfWidth, halfHeight } = bounds
  const { x, y } = center
  ctx.strokeStyle = colors[d % colors.length]
  ctx.beginPath()
  ctx.moveTo(x - halfWidth, y + halfHeight)
  ctx.lineTo(x - halfWidth, y - halfHeight)
  ctx.lineTo(x + halfWidth, y - halfHeight)
  ctx.lineTo(x + halfWidth, y + halfHeight)
  ctx.stroke()
  if (!nodes) return
  if (!Array.isArray(nodes)) {
    drawPoint(ctx, nodes, { radius: 1, fillStyle: 'red' })
    drawLabel(ctx, `${nodes.x}, ${nodes.y}`, add(nodes, vec2(5, 10)), {
      font: '10px sans-serif',
    })
    return
  }
  nodes.forEach((node) => {
    drawQuadtree(ctx, node, d + 1)
  })
}

const step = () => {
  ctx.clearRect(0, 0, SIZE.x, SIZE.y)
  /* drawQuadtree(ctx, tree) */
  data.forEach((p) => {
    drawPoint(ctx, p, { radius: 1, fillStyle: 'blue' })
    /* drawLabel(ctx, `${p.x}, ${p.y}`, add(p, vec2(5, 10)), { */
    /*   font: '10px sans-serif', */
  })
  /* }) */
  if (queryRange) drawRect(ctx, queryRange, 'green')
  /* requestAnimationFrame(step) */
}

step()

const queryTree = () => {
  if (!queryRange) return []
  return query(tree, queryRange)
}

const naiveQuery = () => {
  if (!queryRange) return
  return data.filter((p) => queryRange && contains(queryRange, p))
}

const sz = 50
window.addEventListener('mousemove', (e) => {
  queryRange = aabb(vec2(e.clientX, e.clientY), sz, sz)
})

window.addEventListener('keydown', (e) => {
  if (e.key === 'Shift') shiftDown = true
})

window.addEventListener('keyup', (e) => {
  if (e.key === 'Shift') shiftDown = false
})

window.addEventListener('click', () => {
  console.log(`Running ${shiftDown ? 'naive' : 'quadtree'} query...`)
  const fn = shiftDown ? naiveQuery : queryTree
  const ts = performance.now()
  const result = fn() as Vec2[]
  const te = performance.now()
  console.log(`search: ${te - ts}ms`)
  console.log(result)
})

console.log(`Count in tree: ${count(tree)}`)
