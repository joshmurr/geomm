import { appendEl, canvas2d, drawPolygon } from '@geomm/dom'
import { vec2 } from '@geomm/maths'
import { boundingBox, boundingCircle, intersectsBC } from '@geomm/geometry'
import {
  type PhysicsObject2D,
  applyImpulse,
  impulseResolution,
  updateObject,
  createRigidBody2D,
} from '@geomm/physics'

const letterJPoints = [
  vec2(0, 0),
  vec2(120, 0),
  vec2(120, 20),
  vec2(80, 20),
  vec2(80, 200),
  vec2(0, 200),
  vec2(0, 180),
  vec2(60, 180),
  vec2(60, 20),
  vec2(0, 20),
]

const SIZE = vec2(1024, 512)
const [canvas, ctx] = canvas2d(SIZE.x, SIZE.y)
appendEl(canvas)

let lastTime = new Date().getTime()
let objects: PhysicsObject2D[] = []

function init() {
  objects = []
  const NUM_OBJECTS = 4
  for (let i = 0; i < NUM_OBJECTS; i++) {
    let wellPlaced = false
    let attempts = 0
    const maxAttempts = 50
    const verts = letterJPoints
    const aabb = boundingBox(verts)
    const bc = boundingCircle(verts)
    let pos = vec2(
      bc.center.x + (Math.random() * SIZE.x) / 2,
      bc.center.y + (Math.random() * SIZE.y) / 2,
    )
    const obj = {
      pos,
      verts,
      aabb,
      bc,
      density: 0.1,
      vel: vec2(-100 + Math.random() * 200, -100 + Math.random() * 200),
      rotationSpeed: Math.random() * 2 - 1,
    } as PhysicsObject2D

    /* Place */
    do {
      attempts++
      pos = vec2(
        bc.center.x + (Math.random() * SIZE.x) / 2,
        bc.center.y + (Math.random() * SIZE.y) / 2,
      )
      obj.pos = pos
      wellPlaced = true
      for (const other of objects) {
        if (intersectsBC(obj, other)) {
          wellPlaced = false
        }
      }
    } while (!wellPlaced && attempts < maxAttempts)

    if (wellPlaced) {
      objects.push(createRigidBody2D(obj))
    }
  }

  objects.push(
    createRigidBody2D({
      pos: { x: 0, y: 0 },
      density: 100,
      vel: { x: 0, y: 0 },
      rotationSpeed: 0,
      verts: [
        vec2(0, 0),
        vec2(0, canvas.height),
        vec2(canvas.width, canvas.height),
        vec2(canvas.width, 0),
      ],
    }),
  )
}

function updateAndDraw() {
  const nowTime = new Date().getTime()
  const deltaTime = (nowTime - lastTime) / 1000
  lastTime = nowTime

  for (let i = 0; i < 2; i++) {
    for (const obj of objects) {
      updateObject(obj, deltaTime)
    }

    for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        const objA = objects[i]
        const objB = objects[j]
        const { J: J1, collisionResult: cr1 } = impulseResolution(objA, objB, 1)
        if (J1) {
          applyImpulse(objA, objB, J1, cr1, deltaTime)
        }
        const { J: J2, collisionResult: cr2 } = impulseResolution(objB, objA, 1)
        if (J2) {
          applyImpulse(objB, objA, J2, cr2, deltaTime)
        }
      }
    }
  }

  ctx.fillStyle = 'rgb(0, 0, 0)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  for (let i = 0; i < objects.length - 1; i++) {
    drawPolygon(ctx, objects[i])
    /* drawBC(ctx, objects[i]) */
  }

  requestAnimationFrame(updateAndDraw)
}
init()
updateAndDraw()
