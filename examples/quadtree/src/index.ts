import {
  aabb,
  count,
  insert,
  Quadtree,
  quadtree,
  query,
} from '@geomm/algorithm'
import type { AABB } from '@geomm/api'
import { appendEl, createEl, drawAABB, drawLabel, drawPoint } from '@geomm/dom'
import { contains } from '@geomm/geometry'
import { add, randInt, vec2 } from '@geomm/maths'

const SIZE = vec2(1200, 800)
const c = createEl('canvas', {
  width: SIZE.x,
  height: SIZE.y,
}) as HTMLCanvasElement

appendEl(c)

let shiftDown = false

const ctx = c.getContext('2d') as CanvasRenderingContext2D

const nP = 1000
const data = Array.from({ length: nP }, (_, i) => ({
  pos: vec2(randInt(0, SIZE.x), randInt(0, SIZE.y)),
  color: `hsl(${(i / nP) * 360}, 100%, 50%)`,
}))

const bounds = aabb(vec2(SIZE.x / 2, SIZE.y / 2), SIZE.x / 2, SIZE.y / 2)

const tree = quadtree(bounds)
const ts = performance.now()
data.forEach((p) => insert(tree, p))
const te = performance.now()
console.log(`create tree: ${te - ts}ms`)

let queryRange: AABB | null = null

const colors = ['black', 'red', 'green', 'blue', 'yellow']
const drawQuadtree = (
  ctx: CanvasRenderingContext2D,
  { bounds, nodes }: Quadtree,
  lines = true,
  d = 0,
) => {
  if (lines) {
    const color = colors[d % colors.length]
    drawAABB(ctx, bounds, color)
  }
  if (!nodes) return
  if (!Array.isArray(nodes)) {
    const { pos, color } = nodes
    drawPoint(ctx, pos, { radius: 3, fillStyle: color })
    drawLabel(ctx, `${pos.x}, ${pos.y}`, add(pos, vec2(5, 10)), {
      font: '8px sans-serif',
    })
    return
  }
  nodes.forEach((node) => {
    drawQuadtree(ctx, node, lines, d + 1)
  })
}

const step = () => {
  ctx.clearRect(0, 0, SIZE.x, SIZE.y)
  drawQuadtree(ctx, tree, false)
  if (queryRange) drawAABB(ctx, queryRange, 'green')
  requestAnimationFrame(step)
}

step()

const queryTree = () => {
  if (!queryRange) return []
  return query(tree, queryRange)
}

const naiveQuery = () => {
  if (!queryRange) return
  return data.filter(({ pos }) => queryRange && contains(queryRange, pos))
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
  const result = fn() as unknown as Node[]
  const te = performance.now()
  console.log(`search: ${te - ts}ms`)
  console.log(result)
})

console.log(`Count in tree: ${count(tree)}`)
