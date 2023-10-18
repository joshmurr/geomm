import { AABB, BC, Polygon, Vec2 } from '@geomm/api'

export type CollisionResult = {
  pos: Vec2
  t1: number
  normal: Vec2
}

export type RigidBodyBase2D = {
  pos: Vec2
  vel: Vec2
  verts: Vec2[]
  rotationSpeed?: number
  rotation?: number
  density?: number
  aabb?: AABB
  bc?: BC
}

export type PhysicsObject2D = Polygon & {
  vel: Vec2
  aabb: AABB
  bc: BC
  pos: Vec2
  rotation: number
  rotationSpeed: number
  mass: number
  momentOfInertia: number
  prevVerts: Vec2[]
  currVerts: Vec2[]
  density: number
}

export type VerletPoint = {
  pos: Vec2
  prevPos: Vec2
  acc: Vec2
  mass: number
  col?: string
}

export type VerletConnection = {
  ids: [number, number]
  len: number
  strength: number
}
