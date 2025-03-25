import type { Vec2 } from '@geomm/api'
import { appendEl, createEl } from '@geomm/dom'
import {
  PI,
  add,
  mag,
  normalize,
  randInt,
  randRange,
  scale,
  sub,
  vec2,
} from '@geomm/maths'

type Node = {
  pos: Vec2
  force: Vec2
  mass: number
  fs: Vec2[]
}

const N_NODES = 100
const N_CONN = 50
const GRAVITY = 1.0
const FORCE = 1000
const START_DIS_MULTIPLIER = 1
const nodes = []
const nodeConnections: Array<[number, number, number]> = []

const SIZE = vec2(window.innerWidth, window.innerHeight)

const c = createEl('canvas', {
  width: SIZE.x,
  height: SIZE.y,
}) as HTMLCanvasElement
const ctx = c.getContext('2d') as CanvasRenderingContext2D
appendEl(c)

const mass = (size: number) => (2 * PI * size) / 1.5

for (let i = 0; i < N_NODES; i++) {
  const x = randRange(0, START_DIS_MULTIPLIER * SIZE.x)
  const y = randRange(0, START_DIS_MULTIPLIER * SIZE.y)
  const node = {
    pos: vec2(x, y),
    force: vec2(0, 0),
    mass: mass(randRange(3, 6)),
    fs: [],
  }
  nodes.push(node)
}

for (let i = 0; i < N_CONN; i++) {
  const a = randInt(0, nodes.length - 1)
  const b = randInt(0, nodes.length - 1)
  const l = randRange(100, 300)
  nodeConnections.push([a, b, l])
}
nodeConnections.push([0, 1, 200])

const connected = new Set()
nodeConnections.forEach((conn) => {
  connected.add(conn[0])
  connected.add(conn[1])
})

for (let n = 0; n < N_NODES; n++) {
  if (!connected.has(n)) {
    nodeConnections.push([n, randInt(0, N_NODES - 1), randInt(100, 300)])
  }
}

const applyForces = (nodes: any[]) => {
  for (const node of nodes) {
    node.force = vec2(0, 0)
    for (const other of nodes) {
      if (node === other) continue
      const dir = sub(node.pos, other.pos)
      const l = mag(dir)
      const f = scale(dir, FORCE / (l * l))
      node.force = add(node.force, f)
      other.force = sub(other.force, f)
    }
  }

  for (const [id1, id2] of nodeConnections) {
    const node1 = nodes[id1]
    const node2 = nodes[id2]
    const dir = sub(node1.pos, node2.pos)
    node1.force = sub(node1.force, dir)
    node2.force = add(node2.force, dir)
  }

  nodes.forEach((node) => {
    const dir = sub(vec2(SIZE.x / 2, SIZE.y / 2), node.pos)
    const l = mag(dir)
    const gravity = scale(normalize(dir), GRAVITY * 200)
    node.force = add(node.force, gravity)
  })
}

const update = (node: Node) => {
  node.pos = add(node.pos, scale(node.force, 1 / node.mass))
}

const draw = (nodes: any[]) => {
  ctx.clearRect(0, 0, SIZE.x, SIZE.y)
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, SIZE.x, SIZE.y)
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = '#fff'

  applyForces(nodes)
  nodes.forEach(update)

  for (const [id1, id2, dist] of nodeConnections) {
    const node1 = nodes[id1]
    const node2 = nodes[id2]
    ctx.beginPath()
    ctx.moveTo(node1.pos.x, node1.pos.y)
    ctx.lineTo(node2.pos.x, node2.pos.y)
    ctx.stroke()
  }

  for (const node of nodes) {
    ctx.beginPath()
    ctx.arc(node.pos.x, node.pos.y, node.mass, 0, 2 * PI)
    /* console.log(node.pos.x, node.pos.y, node.mass) */
    ctx.fill()
  }

  requestAnimationFrame(() => draw(nodes))
}

console.log(nodes)
draw(nodes)
