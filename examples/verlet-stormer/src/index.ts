import type { AABB, Vec2 } from '@geomm/api'
import { appendEl, createEl } from '@geomm/dom'
import {
  PI,
  add,
  copy,
  cos,
  dot,
  normalize,
  randInt,
  scale,
  sin,
  sqrt,
  sub,
  vec2,
} from '@geomm/maths'
import { testPointLine } from '@geomm/physics'

type Node = {
  pos: Vec2
  prevPos: Vec2
  acc: Vec2
  radius: number
}

const SIZE = vec2(window.innerWidth, window.innerHeight)
const GRAVITY = vec2(0, -0.03)
const MAX_NODES = 100
const RADIUS = 10

const c = createEl('canvas', {
  width: SIZE.x,
  height: SIZE.y,
}) as HTMLCanvasElement
appendEl(c)
const ctx = c.getContext('2d') as CanvasRenderingContext2D
ctx.fillStyle = 'black'
ctx.fillRect(0, 0, SIZE.x, SIZE.y)

const reflectionLines = [] as [Vec2, Vec2][]

const randomNode = () => {
  const pos = vec2(randInt(RADIUS, SIZE.x), randInt(RADIUS, SIZE.y / 8))
  return {
    pos,
    prevPos: pos,
    vel: vec2(0, 0),
    acc: vec2(0, 0),
    radius: RADIUS,
  }
}

/* const box = [vec2(120, 200), vec2(200, 200), vec2(200, 300), vec2(120, 300)] */
const centroid = (shape: Vec2[]) =>
  shape.reduce(
    ({ x: cx, y: cy }, { x, y }) =>
      vec2(cx + x / shape.length, cy + y / shape.length),
    vec2(0, 0),
  )

const rotatePoint = (p: Vec2, theta: number) => {
  const { x, y } = p
  const ct = cos(theta)
  const st = sin(theta)
  return vec2(x * ct - y * st, y * ct + x * st)
}

const rotateShape = (shape: Vec2[], theta: number) => {
  const c = centroid(shape)
  return shape.map((p) => rotatePoint(sub(p, c), theta)).map((p) => add(p, c))
}

const generateBox = (pos: Vec2, w: number, h: number, theta: number) => {
  const a = pos
  const b = add(pos, vec2(w, 0))
  const c = add(pos, vec2(w, h))
  const d = add(pos, vec2(0, h))
  return rotateShape([a, b, c, d], theta)
}

const box = generateBox(vec2(200, 300), 400, 500, PI / 3.8)

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

const drawAABBB = (box: AABB) => {
  const { center, halfWidth, halfHeight } = box
  ctx.strokeStyle = 'red'
  ctx.strokeRect(
    center.x - halfWidth,
    center.y - halfHeight,
    halfWidth * 2,
    halfHeight * 2,
  )
}

const drawBox = (box: Vec2[]) => {
  ctx.strokeStyle = 'red'
  ctx.beginPath()
  box.forEach((v, i) => {
    if (i === 0) {
      ctx.moveTo(v.x, v.y)
    } else {
      ctx.lineTo(v.x, v.y)
    }
  })
  ctx.closePath()
  ctx.stroke()
}

const collideWithLine = (node: Node, line: { a: Vec2; b: Vec2 }) => {
  const { pos, prevPos } = node
  const collisionResult = testPointLine(
    pos,
    prevPos,
    line.a,
    line.b,
    line.a,
    line.b,
  )
  if (collisionResult) {
    const { pos: intersection, normal } = collisionResult
    const dir = normalize(sub(prevPos, pos))
    const d = scale(normal, 2 * dot(normal, dir))
    const reflection = sub(dir, d)

    node.pos = sub(intersection, scale(reflection, 0.6))
  }
}

const collideWithShape = (node: Node, shape: Vec2[]) => {
  for (let i = 0; i < shape.length; i++) {
    const a = shape[i]
    const ii = (i + 1) % shape.length
    const b = shape[ii]

    collideWithLine(node, { a, b })
  }
}

const steps = 8
const dt = 1 / steps
const step = (time: number) => {
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, SIZE.x, SIZE.y)
  /* const box = rotateShape(box3, time * 0.0001) */
  for (let sub = 0; sub < steps; sub++) {
    nodes.forEach((n) => updateNode(n, dt))
    nodes.forEach((n1) => {
      nodes.forEach((n2) => {
        if (n1 === n2) return
        collide(n1, n2)
      })
    })
    nodes.forEach((n) => simpleBound(n))
    nodes.forEach((n) => collideWithShape(n, box))
  }

  /* reflectionLines.forEach(([a, b]) => { */
  /*   ctx.strokeStyle = 'blue' */
  /*   ctx.beginPath() */
  /*   ctx.moveTo(a.x, a.y) */
  /*   ctx.lineTo(b.x, b.y) */
  /*   ctx.stroke() */
  /* }) */

  /* drawBox(box) */

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
