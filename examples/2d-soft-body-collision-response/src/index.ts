import type { AABB, Vec2 } from '@geomm/api'
import { appendEl, createEl, drawSpline } from '@geomm/dom'
import {
  PI,
  SQRT2,
  TWO_PI,
  add,
  distance,
  floor,
  random,
  rotate,
  scale,
  sub,
  vec2,
} from '@geomm/maths'
import { createNode, type Spring } from './node'
import {
  SoftBody,
  calculateAttributes,
  calculateSurface,
  collideObject,
  createSoftBody,
  dampUpdateBoundary,
  integrateForces,
  resetAttributes,
} from './softbody'
import { aabb, catmullRomSpline } from '@geomm/geometry'

const { innerWidth, innerHeight } = window
const SIZE = vec2(innerWidth, innerHeight)
const GRAVITY = vec2(0, 0.1)
const BOUNDARY_FRICTION = 0.6 // Damping of momentum on collision with boundary.
const COLLISON_DAMPING = 0.7 // Damping of momentum on collision with object.
const COLLISION_FORCE = 400 // Magnitude of force repeling softbody nodes on collision.
const MOUSE_PULL = 0.001 // Strength of mouse force.
const DAMP = 0.3 // SOFtbody node damping.
const STIFF = 0.01 // Softbody spring stiffness.
const MASS = 3 // SOFTBody node mass.
const N_BODIES = 6

let mousePos = vec2(0, 0)
let mouseDown = false

export type SolidBody = AABB & {
  internal?: boolean
}

let bounds: SolidBody = {
  ...aabb(vec2(SIZE.x / 2, SIZE.y / 2), SIZE.x / 2, SIZE.y / 2),
  internal: true,
}

const c = createEl('canvas', {
  width: SIZE.x,
  height: SIZE.y,
}) as HTMLCanvasElement
const ctx = c.getContext('2d') as CanvasRenderingContext2D
appendEl(c)

// Function to create a square softbody.
const createSquare = (
  damping: number,
  mass: number,
  stiffness: number,
  node_count: number,
  size: number,
  position: Vec2,
  rotation: number,
  color: string,
  fixed = false,
) => {
  // Create empty array for the nodes.
  const nodes = new Array(node_count)
  for (let i = 0; i < nodes.length; i++) {
    const springs: Spring[] = []
    for (let j = 0; j < nodes.length; j++) {
      if (i != j) {
        // Create a spring from each node to every other node.
        springs.push({ idx: j, length: 0, stiffness })
      }
    }

    /* Create a vector based on the size of the square,
    move it up or down to generate points on a side of the square,
    and rotate it when generating a different side. */
    const normal = vec2(size / 2, 0)
    const scalar = (4 * i) / nodes.length
    const y = (scalar % 1) * size - size / 2
    const side = (PI / 2) * floor(scalar % 4)
    const p = add(rotate(add(normal, vec2(0, y)), side + rotation), position)

    // Create and add a node to the softbody nodes array.
    nodes[i] = createNode({ pos: p, mass, damping, springs })
  }

  /* return nodes */

  /* Loop over springs and alter stiffness and
  length based on the points they're attached to.

  Implementing softbody goals would be a better approach,
  but is beyond the scope of this project. */
  for (let i = 0; i < nodes.length; i++) {
    const currentNode = nodes[i]
    const springs = currentNode.springs
    for (let j = 0; j < springs.length; j++) {
      const spring = springs[j]
      const d = distance(currentNode.pos, nodes[spring.idx].pos)
      spring.length = d
      spring.stiffness = (spring.stiffness / d) * SQRT2 * size
    }
  }

  return createSoftBody(nodes, color, fixed)
}

const bodies: SoftBody[] = []
for (let i = 0; i < N_BODIES; i++) {
  const body = createSquare(
    DAMP,
    MASS,
    STIFF,
    32,
    200,
    vec2(random() * SIZE.x, random() * SIZE.y),
    random() * TWO_PI,
    `#${floor(random() * 16777215).toString(16)}`,
  )

  bodies.push(body)
}

bodies.push(
  createSquare(
    DAMP,
    MASS,
    STIFF,
    64,
    400,
    vec2(SIZE.x / 2, SIZE.y / 2),
    random() * TWO_PI,
    `#${floor(random() * 16777215).toString(16)}`,
    true,
  ),
)

const drawBody = (
  ctx: CanvasRenderingContext2D,
  sb: SoftBody,
  {
    fill = true,
    points = false,
    normals = false,
  }: { fill?: boolean; points?: boolean; normals?: boolean } = {},
) => {
  ctx.fillStyle = sb.color
  if (fill) {
    drawSpline(
      ctx,
      catmullRomSpline,
      sb.nodes.map((n) => n.pos),
      {
        strokeStyle: 'white',
        resolution: 0.1,
        close: true,
      },
    )
  }
  if (points) {
    for (let i = 0; i < sb.nodes.length; i++) {
      const node = sb.nodes[i]
      ctx.beginPath()
      ctx.arc(node.pos.x, node.pos.y, 2, 0, PI * 2)
      ctx.closePath()
      ctx.fill()
    }
  }
  if (normals) {
    for (let i = 0; i < sb.nodes.length; i++) {
      const { pos } = sb.nodes[i]
      const radius = sb.radii[i]
      const normal = add(pos, scale(sb.normals[i], radius / 4))
      ctx.strokeStyle = '#f00'
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(normal.x, normal.y)
      ctx.closePath()
      ctx.stroke()
    }
  }
}

const updateBody = (sb: SoftBody, bodies: SoftBody[]) => {
  const mouseForce = mouseDown
    ? scale(sub(mousePos, sb.pos), MOUSE_PULL)
    : vec2(0, 0)

  sb.externalForce = add(sb.externalForce, GRAVITY)
  sb.externalForce = add(sb.externalForce, mouseForce)

  integrateForces(sb)
  resetAttributes(sb)
  calculateAttributes(sb)
  calculateSurface(sb)
  if (!sb?.fixed) dampUpdateBoundary(sb, BOUNDARY_FRICTION, [bounds])

  for (let i = 0; i < bodies.length; i++) {
    const other = bodies[i]
    if (other != sb) {
      collideObject(sb, other, COLLISON_DAMPING, COLLISION_FORCE)
    }
  }
}
const step = () => {
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, SIZE.x, SIZE.y)

  bodies.forEach((body) => {
    updateBody(body, bodies)
    drawBody(ctx, body, { fill: true, points: false, normals: true })
  })

  requestAnimationFrame(step)
}

window.addEventListener('resize', () => {
  const { innerWidth, innerHeight } = window
  SIZE.x = innerWidth
  SIZE.y = innerHeight
  c.width = SIZE.x
  c.height = SIZE.y
})

window.addEventListener('click', () => requestAnimationFrame(step))

window.addEventListener('mousemove', (e) => {
  mousePos = vec2(e.clientX, e.clientY)
})

window.addEventListener('mousedown', () => {
  mouseDown = true
})

window.addEventListener('mouseup', () => {
  mouseDown = false
})

window.addEventListener('resize', () => {
  const { innerWidth, innerHeight } = window
  SIZE.x = innerWidth
  SIZE.y = innerHeight
  bounds = aabb(vec2(SIZE.x / 2, SIZE.y / 2), SIZE.x / 2, SIZE.y / 2)
})

requestAnimationFrame(step)
