import { PhysicsObject2D, RigidBodyBase2D } from './api'
import { momentOfInertiaOfPolygon } from './inertia'
import { areaOfPolygon, boundingBox } from '@geomm/geometry'

export const createRigidBody2D = ({
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
    verts,
    rotation,
    vel,
    rotationSpeed,
    mass: area * density,
    aabb: boundingBox(verts),
    bc: bc || { center: pos, radius: 0 },
    density,
    momentOfInertia,
    prevVerts: [],
    currVerts: [],
  }
  updateObject(obj, 0)
  return obj
}

export const updateObject = (obj: PhysicsObject2D, delta: number) => {
  obj.pos.x += obj.vel.x * delta
  obj.pos.y += obj.vel.y * delta
  obj.rotation += obj.rotationSpeed * delta
  obj.prevVerts = obj.currVerts
  obj.currVerts = []
  for (const p of obj.verts) {
    const cos = Math.cos(obj.rotation)
    const sin = Math.sin(obj.rotation)
    obj.currVerts.push({
      x: p.x * cos - p.y * sin + obj.pos.x,
      y: p.x * sin + p.y * cos + obj.pos.y,
    })
  }
}
