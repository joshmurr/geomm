import type { AABB, Vec2 } from '@geomm/api'
import { appendEl, createEl, drawPolygon, drawSpline } from '@geomm/dom'
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
import { aabb, areaOfPolygon, boundingBox, catmullRomSpline } from '@geomm/geometry'
import { RigidBodyBase2D, momentOfInertiaOfPolygon, testPolyPoly, updateObject } from '@geomm/physics'
import { randHexString } from '@geomm/color'

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
const N_BODIES = 1

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
      /* Distand to every other node. */
      const d = distance(currentNode.pos, nodes[spring.idx].pos)
      spring.length = d
      /* Stiffness proportional to length */
      spring.stiffness = (spring.stiffness / d) * SQRT2 * size
    }
  }

  return createSoftBody(nodes, color, fixed)
}
export const createSoftBody2D = ({
  pos,
  vel,
  verts,
  density = 1,
  rotation = 0,
  rotationSpeed = 0,
  bc,
}: RigidBodyBase2D) => {
  const area = areaOfPolygon(verts)
  const momentOfInertia = momentOfInertiaOfPolygon(verts, density)
  const obj = {
    pos,
    rotation,
    vel,
    color: randHexString(),
    externalForce: vec2(0, 0),
    rotationSpeed, // angular momentum
    mass: area * density,
    aabb: boundingBox(verts),
    bc: bc || { center: pos, radius: 0 },
    density,
    momentOfInertia,
    prevVerts: verts, // nodes
    currVerts: verts,
    /* radii, */
    /* normals, */
    /* averageDistance, */
  }
  updateObject(obj, 0)
  return obj
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

console.log(bodies)

/* bodies.push(
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
) */

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

const rigidBodyPos = vec2(300, SIZE.y - 200)
const rigidBodySize = vec2(300, 200)

const rigidBody = {
  verts: [
    vec2(rigidBodyPos.x, SIZE.y - rigidBodySize.y),
    vec2(rigidBodyPos.x, SIZE.y),
    vec2(rigidBodyPos.x + rigidBodySize.x, SIZE.y),
    vec2(rigidBodyPos.x + rigidBodySize.x, SIZE.y - rigidBodySize.y),
  ]
}

/* export const impulseResolution = (
  sbA0: Vec2[],
  sbA1: Vec2[],
  sbB0: Vec2[],
  sbB1: Vec2[],
  coefficientOfRestitution = 0.5,
) => {
  const collisionResult = testPolyPoly(
    sbA0,
    sbA1,
    sbB0,
    sbB1,
  )
  if (collisionResult === null) {
    return { J: null, collisionResult: null }
  }

  const nB = collisionResult.normal
  const IA = objA.momentOfInertia
  const IB = objB.momentOfInertia
  const mA = objA.mass
  const mB = objB.mass
  const rA = sub(collisionResult.pos, objA.pos)
  const rB = sub(collisionResult.pos, objB.pos)
  const vA = objA.vel
  const vB = objB.vel
  const omegaA = objA.rotationSpeed
  const omegaB = objB.rotationSpeed

  const C = coefficientOfRestitution
  const j =
    ((-1 - C) *
      (dot(vA, nB) -
        dot(vB, nB) +
        omegaA * cross(rA, nB) -
        omegaB * cross(rB, nB))) /
    (1 / mA +
      1 / mB +
      Math.pow(cross(rA, nB), 2) / IA +
      Math.pow(cross(rB, nB), 2) / IB)
  if (j < 0) {
    return { J: null, collisionResult }
  }
  const J = scale(nB, j)

  return { J, collisionResult }
} */

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

  sb.prevNodes = sb.nodes.map((n) => n.pos)

  const col = testPolyPoly(rigidBody.verts, rigidBody.verts, sb.nodes.map((n) => n.pos), sb.prevNodes)

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

  drawPolygon(ctx, { verts: rigidBody.verts, fill: false, stroke: true })


  bodies.forEach((body) => {
    /* const col = testPolyPoly(rigidBody.verts, body.nodes.map((n) => n.pos)) */
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
