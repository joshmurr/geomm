import { AABB, BC, Vec2 } from '@geomm/api'

export type CollisionResult = {
  pos: Vec2
  t1: number
  normal: Vec2
  vert?: Vec2
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

export type SoftBodyBase2D = {
  pos: Vec2
  vel: Vec2
  verts: VerletPoint[]
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

export type SoftBody = {
  verts: VerletPoint[]
  connections: VerletConnection[]
}
