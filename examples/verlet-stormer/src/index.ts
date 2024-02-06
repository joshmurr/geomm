import type { Vec2 } from '@geomm/api'
import { appendEl, createEl } from '@geomm/dom'
import {
  add,
  copy,
  normalize,
  randInt,
  scale,
  sqrt,
  sub,
  vec2,
} from '@geomm/maths'

type Node = {
  pos: Vec2
  prevPos: Vec2
  acc: Vec2
  radius: number
}

const SIZE = vec2(window.innerWidth, window.innerHeight)
const GRAVITY = vec2(0, -0.1)
const MAX_NODES = 300
const RADIUS = 12

const c = createEl('canvas', {
  width: SIZE.x,
  height: SIZE.y,
}) as HTMLCanvasElement
appendEl(c)
const ctx = c.getContext('2d') as CanvasRenderingContext2D
ctx.fillStyle = 'black'
ctx.fillRect(0, 0, SIZE.x, SIZE.y)

const randomNode = () => {
  const pos = vec2(randInt(0, SIZE.x), randInt(0, SIZE.y))
  return {
    pos,
    prevPos: pos,
    vel: vec2(0, 0),
    acc: vec2(0, 0),
    radius: RADIUS,
  }
}

const nodes = Array.from({ length: MAX_NODES }, randomNode)

const applyForce = (node: Node, force: Vec2) => {
  const { acc } = node
  node.acc = add(acc, force)
}

const accelerate = (node: Node, dt: number) => {
  const { prevPos, acc } = node
  node.prevPos = add(prevPos, scale(acc, dt * dt))
  node.acc = vec2(0, 0)
}

const update = (node: Node, dt: number) => {
  let { pos, prevPos } = node
  node.prevPos = copy(pos)
  node.pos = sub(scale(pos, 2), prevPos)
}

const updateNode = (node: Node, dt: number) => {
  applyForce(node, GRAVITY)
  accelerate(node, dt)
  update(node, dt)
}

const simpleBound = (node: Node) => {
  const { pos, radius } = node
  if (pos.x < radius) {
    pos.x = radius
  } else if (pos.x > SIZE.x - radius) {
    pos.x = SIZE.x - radius
  }
  if (pos.y < radius) {
    pos.y = radius
  } else if (pos.y > SIZE.y - radius) {
    pos.y = SIZE.y - radius
  }
}

const collide = (node1: Node, node2: Node) => {
  const { pos, radius } = node1
  const { pos: pos2, radius: radius2 } = node2
  const v = sub(pos, pos2)
  const distSq = v.x * v.x + v.y * v.y
  const minDist = radius + radius2

  if (distSq < minDist * minDist) {
    const dist = sqrt(distSq)
    const factor = (dist - minDist) / dist

    /* Resolve the overlapping bodies */
    const displacement = scale(v, factor * 0.5)
    node1.pos = sub(node1.pos, displacement)
    node2.pos = add(node2.pos, displacement)
  }
}

const steps = 4
const dt = 1 / steps
const step = () => {
  for (let sub = 0; sub < steps; sub++) {
    nodes.forEach((n) => updateNode(n, dt))
    nodes.forEach((n1) => {
      nodes.forEach((n2) => {
        if (n1 === n2) return
        collide(n1, n2)
      })
    })
    nodes.forEach((n) => simpleBound(n))
  }

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, SIZE.x, SIZE.y)

  ctx.fillStyle = '#00f'
  nodes.forEach((n) => {
    const { pos, radius } = n
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
    ctx.fill()
  })

  requestAnimationFrame(step)
}

c.addEventListener('mousemove', (e) => {
  const mouse = vec2(e.clientX, e.clientY)

  nodes.forEach((node) => {
    const dir = normalize(sub(node.pos, mouse))
    applyForce(node, dir)
  })
})

step()
