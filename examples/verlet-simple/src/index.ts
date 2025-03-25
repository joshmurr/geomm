import type { Vec2 } from '@geomm/api'
import { appendEl, createEl } from '@geomm/dom'
import {
  add,
  copy,
  distanceSq,
  floor,
  normalize,
  randInt,
  random,
  scale,
  sqrt,
  sub,
  vec2,
} from '@geomm/maths'

const LIFE_SPAN = Infinity

const MAX_NODES = 256
const MAX_LINKS = floor(MAX_NODES / 2)
const LINK_LEN = 60
const LINK_ALPHA = 1e-4
const FRICTION = 0.9
const RADIUS = 6

const CLASSES = ['red', 'green', 'blue', 'yellow', 'purple', 'orange']

const MOUSE_RADIUS = 140

let nodeCounter = 0
let linkCounter = 0

let prevMousePos = vec2(0, 0)

type Node = {
  pos: Vec2
  prevPos: Vec2
  radius: number
  bornAt: number
  alive: boolean
  color: string
}

type Link = {
  source: Node
  target: Node
  active: boolean
}

const nodes: Node[] = []
const links: Link[] = []

const SIZE = vec2(900, 900)

const c = createEl('canvas', {
  width: SIZE.x,
  height: SIZE.y,
}) as HTMLCanvasElement
appendEl(c)
const ctx = c.getContext('2d') as CanvasRenderingContext2D
ctx.fillStyle = 'black'
ctx.fillRect(0, 0, SIZE.x, SIZE.y)

const getRandomLivingNode = () => {
  const livingNodes = nodes.filter((node) => node.alive)
  if (livingNodes.length === 0) return
  return livingNodes[Math.floor(random() * livingNodes.length)]
}

const handleAddNode = ({ x, y }: { x: number; y: number }) => {
  if (nodes.length >= MAX_NODES) return
  const newNode = {
    pos: vec2(x, y),
    prevPos: vec2(x, y),
    radius: RADIUS,
    bornAt: Date.now(),
    alive: true,
    color: CLASSES[Math.floor(random() * CLASSES.length)],
  }
  nodes.push(newNode)

  /* nodes.forEach((otherNode) => { */
  /*   if (otherNode === newNode) return */
  /*   const dist = distanceSq(newNode.pos, otherNode.pos) */
  /*   if (dist < MOUSE_RADIUS * MOUSE_RADIUS) { */
  /*     const link = { */
  /*       source: newNode, */
  /*       target: otherNode, */
  /*       active: true, */
  /*     } */
  /*     links.push(link) */
  /*   } */
  /* }) */
}

const handleUpdateMouse = ({ x, y }: { x: number; y: number }) => {
  prevMousePos = vec2(x, y)
}

const updateNode = (node: Node) => {
  let { pos, prevPos } = node
  node.pos = sub(pos, scale(sub(prevPos, (node.prevPos = copy(pos))), FRICTION))
}

const jiggle = (fn: () => number = random) => {
  return (fn() - 0.5) * 1e-2
}

type Attractor = {
  pos: Vec2
  radius: number
  strength: number
}

const applyBehavior = (node: Node, attractor: Attractor, debug = false) => {
  const { pos, radius, strength } = attractor
  const delta = sub(pos, node.pos)
  let distSq = distanceSq(pos, node.pos)
  const radSq = radius * radius

  if (delta.x === 0) (delta.x = jiggle()), (distSq += delta.x * delta.x)
  if (delta.y === 0) (delta.y = jiggle()), (distSq += delta.y * delta.y)

  if (distSq < radSq) {
    const f = scale(scale(delta, 1.0 - sqrt(distSq) / sqrt(radSq)), strength)
    if (debug) console.log(f)
    else node.pos = add(node.pos, f)
  }
}

const constraint = (source: Node, target: Node) => {
  const x = target.pos.x + target.prevPos.x - source.pos.x - source.prevPos.x
  const y = target.pos.y + target.prevPos.y - source.pos.y - source.prevPos.y
  const len = Math.sqrt(x * x + y * y)
  const diff = ((len - LINK_LEN) / len) * LINK_ALPHA
  source.pos.x += x * diff
  source.pos.y += y * diff
  target.pos.x -= x * diff
  target.pos.y -= y * diff
}

const attractors: Attractor[] = [
  {
    pos: vec2(SIZE.x / 2, SIZE.y / 2),
    radius: SIZE.x,
    strength: 0.0001,
  },
  /* { */
  /*   pos: vec2(SIZE.x / 2, SIZE.y / 2), */
  /*   radius: 100, */
  /*   strength: -0.1, */
  /* }, */
]

const classAttractors = CLASSES.reduce(
  (acc, color, i) => ({
    ...acc,
    [color]: {
      pos: vec2((SIZE.x / CLASSES.length) * i, SIZE.y / 2),
      radius: SIZE.x,
      strength: 0.001,
    },
  }),
  {} as { [key: string]: Attractor },
)

const drawDirection = (node: Node) => {
  const { pos, prevPos } = node
  const dir = normalize(sub(pos, prevPos))
  ctx.strokeStyle = 'white'
  ctx.beginPath()
  ctx.moveTo(pos.x, pos.y)
  ctx.lineTo(pos.x + dir.x * 10, pos.y + dir.y * 10)
  ctx.stroke()
}

const draw = () => {
  const time = Date.now()

  handleAddNode({ x: randInt(0, SIZE.x), y: randInt(0, SIZE.y) })

  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.fillRect(0, 0, SIZE.x, SIZE.y)

  ctx.strokeStyle = 'grey'
  ctx.beginPath()
  ctx.arc(prevMousePos.x, prevMousePos.y, MOUSE_RADIUS, 0, Math.PI * 2)
  ctx.stroke()

  nodes.forEach((node) => {
    ctx.fillStyle = node.color
    const { pos, bornAt, radius } = node
    const age = time - bornAt

    if (age > LIFE_SPAN) {
      node.alive = false
      return
    }

    drawDirection(node)

    nodes.forEach((otherNode) => {
      if (otherNode === node) return
      applyBehavior(node, {
        pos: otherNode.pos,
        radius: 40,
        strength: -0.1,
      })
    })
    attractors.forEach((attractor) => applyBehavior(node, attractor))

    /* applyBehavior(node, classAttractors[node.color]) */

    updateNode(node)

    ctx.strokeStyle = 'white'
    if (links.length > 0) {
      links.forEach((link) => {
        const { source, target } = link
        constraint(source, target)
        if (!source.alive || !target.alive) {
          link.active = false
          return
        }

        ctx.beginPath()
        ctx.moveTo(link.source.pos.x, link.source.pos.y)
        ctx.lineTo(link.target.pos.x, link.target.pos.y)
        ctx.stroke()
      })
    }

    ctx.beginPath()
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
    ctx.fill()
  })

  requestAnimationFrame(draw)
}

/* c.addEventListener('click', handleAddNode) */
c.addEventListener('mousedown', (event) => {
  attractors.push({
    pos: prevMousePos,
    radius: SIZE.x / 2,
    strength: 0.05,
  })
})
c.addEventListener('mouseup', () => {
  attractors.pop()
})
c.addEventListener('mousemove', (event) => {
  /* handleAddNode({ x: event.clientX, y: event.clientY }) */
  handleUpdateMouse({ x: event.clientX, y: event.clientY })
  nodes.forEach((node) => {
    applyBehavior(node, {
      pos: prevMousePos,
      radius: MOUSE_RADIUS,
      strength: 0.01,
    })
  })
})

draw()
